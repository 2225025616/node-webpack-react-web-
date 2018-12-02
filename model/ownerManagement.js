//Owner 对 Token 的管理
//包括 Token 的发行，分发

const config = require('../config');
const web3 = require('../lib/web3');
const db = require('../lib/db');
const integralToken = require('../model/integralToken');
const BigNumber = require('bignumber.js');
const log = require('../lib/log');
const common = require('../lib/common.js');

//Owner 发行 Token (增加 owner 账户的 token 余额)
let mintToken = async (transId, amount) => {
    try {
        if (!(amount > 0)) {
            throw new Error('mint amount invalid')
        }
        //UserID 0 for Owner
        let record = await db.query("INSERT INTO transactions(`transId`,`toUserId`,`amount`,`type`) VALUES(?,0,?,1)", [transId, amount]);
        if (record < 1) {
            return {
                status: 1004,
                error: 'transactions exist, transID =' + transId,
            }
        }
        let TXobject = {
            to: config.contractAddress,
            value: 0,
            data: integralToken.token.methods.mintToken(config.owner.address, BigNumber(amount * (10 ** config.contractDecimal))).encodeABI(),
        };
        log.info("mintToken ", amount);
        let rs = await integralToken.transaction(config.owner.address, TXobject, config.owner.privateKey);

        let affectedRows = await db.query("UPDATE transactions SET `transHash` = ? WHERE `transId` = ?", [rs, transId])
        if (affectedRows === 1) {
            log.info("Token minted with transHash: ", rs);
        } else {
            return {
                status: 1004,
                error: 'mintToken failed, transHash not available or not inserted, transID =' + transId,
            }
        }
        return {
            status: 0,
            data: {
                transactionHash: rs,
            }
        }
    } catch (e) {
        return {
            status: 9001,
            error: e.stack,
        }
    }
};

//tested
let testMintToken = async () => {
    let TXobject = {
        to: config.contractAddress,
        data: integralToken.token.methods.mintToken(config.owner.address, 5000).encodeABI(),
    };
    return await integralToken.transaction(config.owner.address, TXobject, config.owner.privateKey);
};

//Owner 分发 Token (从 owner 账户转账 token 至 to 账户)
//{"transId":6297102,"userName":1,"amount":10,"subType":1}
//subType 对应登录APP/签到等
let distribute = async (trans) => {
    try {
        log.info("distribute:" + JSON.stringify(trans))
        let rows = await db.getRows("select `public`, `userId` from addresses where userName = ? limit 1", [trans.userName])
        let toAddress
        if (rows.length == 1) {
            toAddress = rows[0].public
        } else {
            return {
                status: 1001,
                error: "userName not exist:",
                param: {
                    name: "userName",
                    value: trans.userName
                }
            }
        }
        if (!web3.utils.isAddress(toAddress)) {
            return {
                status: 1002,
                error: 'distribute address invalid',
            }
        }
        if (!(trans.amount > 0)) {
            return {
                status: 1003,
                error: 'distribute amount invalid',
            }
        }
        let record = await db.query("INSERT INTO transactions(`transId`,`toUserId`,`amount`,`type`,`subType`,`status`) VALUES(?,?,?,0,?,-1)", [trans.transId, rows[0].userId, trans.amount, trans.subType])
        //log.debug(record)
        return {
            status: 0,
        }
    } catch (e) {
        //log.error(e)
        if (e.stack.indexOf("key 'transId'") > 0) {
            let rows = await db.getRows("SELECT * from `transactions` WHERE `transId`= ? ", [trans.transId])
            return {
                status: 1005,
                error: "known transaction",
                data: rows[0]
            }
        } else if (e.stack.indexOf("db") > 0) {
            return {
                status: 1006,
                error: "db error",
                param: {
                    name: "transId",
                    value: trans.transId,
                }
            }
        }
        return {
            status: 9001,
            error: e.stack,
        }
    }
}

//异步提交交易
let asyncDistribute = async () => {
    let nonce = undefined
    let trans = 0
    let sqlTrans
    while (1) {
        sqlTrans = undefined
        try {
            if (isNaN(nonce)) {
                nonce = await web3.eth.getTransactionCount(config.owner.address)
                log.debug("config.owner.address:" + nonce)
            }
            //事务 只用于防止单节点多处理进程，多处理进程需用多个账户 或者共享nonce
            sqlTrans = await db.startTransaction()
            rows = await sqlTrans.query("select `t`.*, `a`.`public` from transactions as `t`,addresses as `a` where `t`.`type`= 0 AND `t`.`status`= -1 AND `t`.`toUserID`=`a`.`userId` limit 1 FOR UPDATE", [])
            if (rows.length > 0) {
                let record = rows[0]
                let TXobject = {
                    to: config.contractAddress,
                    value: 0,
                    data: integralToken.token.methods.transfer(record.public, BigNumber(record.amount * (10 ** config.contractDecimal))).encodeABI(), //erc20 transfer data,value wei
                };
                let transHash = await integralToken.transaction(config.owner.address, TXobject, config.owner.privateKey, nonce);
                if (!isNaN(transHash)) {
                    log.info("asyncDistribute, transId:" + record.transId + ",transHash:" + transHash)
                    record = sqlTrans.query("UPDATE transactions SET `transHash` = ?,`status` = 0 WHERE `transId` = ? AND `status` = -1", [transHash, record.transId,])
                    nonce = nonce + 1
                    sqlTrans.commit()
                    trans++
                }
                //释放事务连接
                await sqlTrans.release()
                if (trans % 10 == 0) {
                    await common.sleep(5000)
                }
            } else {
                //log.debug("asyncDistribute no new trasaction")
                await sqlTrans.release()
                await common.sleep(10000)
            }
        } catch (e) {
            if (e.stack.indexOf("known transaction")) {
                nonce = undefined
            }
            if (sqlTrans !== undefined) {
                await sqlTrans.release()
            }
            log.error(e)
            await common.sleep(5000)
        }
    }
}



let getEvents = async (event) => {
    let rs = await integralToken.token.getPastEvents(
        event, {
            fromBlock: 0,
            toBlock: "latest"
        }
    );
    return rs;
};


//查询log 更新确认交易状态 0->1
let transactionConfirm = (fromBlock, endBlock, update) => {
    integralToken.watchAllTransactions(fromBlock, endBlock, function (events) {
        events.forEach(function (event) {
            log.info("AllEventWatch, event=" + event.event + "; hash=" + event.transactionHash);
            log.debug(event)
            //log.debug(JSON.stringify(event.returnValues))
            let rs = db.query("UPDATE transactions SET `status` = 1, `transData` = ? WHERE `transHash` = ? AND `status` = 0", [JSON.stringify(event.returnValues), event.transactionHash,])
            //log.info(rs)
        })
    }, update)
}

//交易确认
let transactionConfirmProgress = async () => {
    let start = undefined
    log.info("transaction confirm process start")
    while (1) {
        try {
            // block = await web3.eth.getBlockNumber()
            // log.info("recentBlockNum="+block)
            if (start === undefined) {
                let rows = await db.getRows("select * from transactions where `status` = 1 ORDER BY `id` DESC limit 1", [])
                if (rows.length !== 1) {
                    rows = await db.getRows("select count(*) as`count` from transactions", [])
                    if (rows.length === 1) {
                        //log.debug(rows[0].count)
                        if (rows[0].count < 100) {
                            start = 0
                        }
                    } else {
                        log.info("db error")
                        await common.sleep(10000)
                        continue
                    }
                } else {
                    let transInfo = await web3.eth.getTransaction(rows[0].transHash)
                    if (transInfo) {
                        start = transInfo.blockNumber
                    } else {
                        log.error("transactionConfirmProgress getBlock error")
                        await common.sleep(5000)
                        continue
                    }
                }
            }
            let end = await web3.eth.getBlockNumber()
            if (!end) {
                log.error("transactionConfirmProgress getBlockNumber error")
                continue
            }
            if (config.confirmBlockNum == undefined) {
                log.error("config.confirmBlockNum not set")
                await common.sleep(10000)
                continue
            }
            end = end - config.confirmBlockNum > 0 ? end - config.confirmBlockNum : 1
            if (start <= end) {
                log.debug("transactionConfirm,from=" + start + ",to=" + end)
                await transactionConfirm(start, end, function () {
                    start = end + 1
                    log.debug("trans start changed", start)
                })
                if (start != end + 1){
                    await common.sleep(5000)
                }
            } else {
                //log.info("transactionConfirmProgress no new block")
                await common.sleep(10000)
            }
        } catch (e) {
            log.error(e)
            await common.sleep(5000)
            continue
        }
    }

}

let getTransactions = async (start, limit, days, type, userId) => {
    try {
        if (isNaN(start) || start < 0) {
            start = 0
        }
        if (isNaN(limit) || limit < 0) {
            limit = 20
        }
        //log.debug(start, limit, days, type)
        //console.log(userId)
        let rows
        let count
        if (isNaN(userId) || userId <= 0) {
            if (isNaN(days) || days <= 0) {
                if (isNaN(type)) {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions order by createdAt desc LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId` order by t.createdAt", [start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions")
                } else {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions order by createdAt desc WHERE `type`= ? LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId`", [type, start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions WHERE `type`= ?", [type])
                }
            } else {
                //creatAt = Date.now() / 1000 - 84600 * days
                if (isNaN(type)) {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ? order by createdAt desc LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId`", [days, start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ?", [days])
                } else {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ? AND `type`= ? order by createdAt desc LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId`", [days, type, start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ? AND `type`= ?", [days, type])
                }
            }
        } else {
            if (isNaN(days) || days <= 0) {
                if (isNaN(type)) {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions WHERE `toUserId`= ? OR `fromUserId`= ? order by createdAt desc LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId`", [userId, userId, start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions WHERE `toUserId`= ? OR `fromUserId`= ?", [userId, userId])
                } else {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions WHERE `type`= ? AND ( `toUserId`= ? OR `fromUserId`= ?) order by createdAt desc LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId`", [type, userId, userId, start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions WHERE `type`= ? AND ( `toUserId`= ? OR `fromUserId`= ?)", [type, userId, userId])
                }
            } else {
                //creatAt = Date.now() / 1000 - 84600 * days
                if (isNaN(type)) {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ? AND ( `toUserId`= ? OR `fromUserId`= ? ) order by createdAt desc LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId`", [days, userId, userId, start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ? AND ( `toUserId`= ? OR `fromUserId`= ? ) ", [days, userId, userId])
                } else {
                    rows = await db.getRows("SELECT `t`.*, `addresses`.`userName` AS `toUserName` FROM (SELECT * FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ? AND `type`= ? AND ( `toUserId`= ? OR `fromUserId`= ? ) order by createdAt desc LIMIT ?,?) AS `t` LEFT JOIN addresses ON `t`.`toUserId` = `addresses`.`userId`", [days, type, userId, userId, start, limit])
                    count = await db.getRows("SELECT count(*) AS count FROM transactions WHERE DATEDIFF(CURDATE(),DATE_FORMAT(`createdAt`,'%Y-%m-%d')) < ? AND `type`= ? AND ( `toUserId`= ? OR `fromUserId`= ? ) ", [days, type, userId, userId])
                }
            }
        }

        //log.debug(rows)
        return {
            status: 0,
            data: rows,
            count: count[0].count,
        }
    } catch (e) {
        log.error(e)
        return {
            status: 9001,
            error: e.stack,
        }
    }
}

module.exports = {
    mintToken,
    testMintToken,
    distribute,
    transactionConfirmProgress,
    getEvents,
    getTransactions,
    asyncDistribute
};
