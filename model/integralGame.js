const config = require("../config");

const web3 = require('../lib/web3');
const log = require('../lib/log');

const Tx = require('ethereumjs-tx');
const abi = require('../abi/guessGame.js');

const db = require('../lib/db');
const gameAddress = config.gameAddress;
const game = new web3.eth.Contract(abi, gameAddress);

const BigNumber = require('bignumber.js');
const common = require('../lib/common.js');


const {getAddress} = require('../model/userManagement');
const {approve,transaction} = require('../model/integralToken');

const {abiDecoder,decodeEvent} = require('../lib/abiDecoder');
abiDecoder.addABI(abi);

//创建游戏
const createGame = async (start, end, max) => {
    try {
        // let address = await getAddress(userId);
        // let from = address.public;
        // let fromPrivateKey = address.private;

        if (!(start > 0)) throw new Error('start time wrong or undefined');
        if (!(end > 0)) throw new Error('end time wrong or undefined');
        if (!(max > 0)) max = config.defaultGameMax;

        let id = await db.queryWithID("INSERT INTO guess_games(`startTime`,`endTime`,`amount`) VALUES(?,?,?)", [start, end, max]);


        let TXobject = {
            to: gameAddress,
            value: 0,
            data: game.methods.createGame(id, start, end, BigNumber(max * 10 ** config.contractDecimal)).encodeABI(),
        };
        //log.debug(TXobject)

        let transHash = await transaction(config.owner.address, TXobject, config.owner.privateKey);
        if (!isNaN(transHash)) {
            return {
                status: 0,
                data: {
                    transactionHash: transHash,
                    id: id,
                }
            }
        } else {
            return {
                status: 3001,
                error: 'create game failed ',
            }
        }
    } catch (e) {
        return {
            status: 1005,
            error: e.message,
        }
    }
};

//竞猜
let guessGame = async (transId,userId, gameId, guessValue, amount) => {

    try {
        let address = await getAddress(userId);
        let from = address.public;
        let fromPrivateKey = address.private;

        let TXobject = {
            to: gameAddress,
            value: 0,
            data: game.methods.guess(gameId, guessValue, BigNumber(amount * 10 ** config.contractDecimal)).encodeABI(),
        };

        let transHash = await transaction(from, TXobject, fromPrivateKey);

        if (!isNaN(transHash)) {
            await db.query("INSERT INTO guess_logs(`userId`,`gameId`,`value`,`amount`) VALUES(?,?,?,?)", [userId, gameId, guessValue, amount]);
            await db.query("INSERT INTO transactions(`transId`,`fromUserId`,`toUserId`,`amount`,`type`,`transHash`) VALUES(?,?,?,?,5,?)", [transId, userId,0,amount,transHash]);

            return {
                status: 0,
                data: {
                    transactionHash: transHash,
                }
            }
        } else {
            return {
                status: 3002,
                error: 'guess game failed',
            }
        }
    } catch (e) {
        // throw e;
        return{
            status:1005,
            error:e.message,
        }
    }
};

//结束
let endGame = async (gameId, guessValue) => {
    try {
        // let address = await getAddress(userId);
        // let from = address.public;
        // let fromPrivateKey = address.private;

        let TXobject = {
            to: gameAddress,
            value: 0,
            data: game.methods.endGame(gameId, guessValue).encodeABI(),
        };

        let transHash = await transaction(config.owner.address, TXobject, config.owner.privateKey);

        if (!isNaN(transHash)) {
            await db.query("update guess_games set result=?,updatedAt=now() where id=?", [guessValue, gameId]);
            return {
                status: 0,
                data: {
                    transactionHash: transHash,
                }
            }
        } else {
            return {
                status: 3003,
                error: 'game end failed',
            }
        }
    } catch (e) {
        return {
            status: 1005,
            error: e.message,
        }
    }

};

//中奖领取
let getCandy = async (transId, userId, gameId) => {
    try {
        log.debug("params:",transId, userId, gameId);
        let address = await getAddress(userId);
        let from = address.public;
        let fromPrivateKey = address.private;

        let TXobject = {
            to: gameAddress,
            value: 0,
            data: game.methods.getCandy(gameId).encodeABI(),
        };

        let transHash = await transaction(from, TXobject, fromPrivateKey);

        if (!isNaN(transHash)) {
            await db.query("UPDATE guess_logs SET getAt=now() WHERE userId=? AND gameId=?", [userId, gameId]);
            await db.query("INSERT INTO transactions(`transId`,`fromUserId`,`toUserId`,`amount`,`type`,`transHash`) VALUES(?,?,?,?,6,?)", [transId, 0,userId,0,transHash]);

            return {
                status: 0,
                data: {
                    transactionHash: transHash,
                }
            }
        } else {
            return {
                status: 3004,
                error: 'get candy failed',
            }
        }

    } catch (e) {
        return {
            status: 1005,
            error: e.message,
        }
    }
};

let isGuessSuccess = async(userId,gameId) => {
   let _value = await db.getRows("select value,getAt from guess_logs where userId=? and gameId=? limit 0,1",[userId,gameId]);
   let _result = await db.getRows("select result from guess_games where id=?",[gameId]);

   if(_value.length === 0){
       return false;
   }

   if(!(_value[0].getAt === null)){
       //已领奖
        return false;
   }

   let value = _value[0].value;
   let result= _result[0].result;

   log.debug("success:",value,result,value==result);

   return value == result;
}



let getLatestGame = async () => {
    try {
        let result = await db.getRows("SELECT * FROM guess_games WHERE id=(SELECT max(id) FROM guess_games)");
        if (result.length !== 1){
            throw new Error("Error when getting latest game from db");
        }
        return {
            status: 0,
            data: {
                result: result,
            }
        }
    } catch (e) {
        return {
            status: 1005,
            error: e.message,
        }
    }

};


//查询log 更新确认交易状态 0->1
let gameConfirm = (fromBlock, endBlock, update) => {
    try {
        game.getPastEvents("allEvents", {
            fromBlock: fromBlock,
            toBlock: endBlock
        }, function (err, events) {
            if (err) {
                log.error(err)
                return
            }
            if (events && events.length > 0) {
                log.debug(decodeEvent(events));

                events.forEach(function (event) {
                    log.debug(event)

                    if(event.event == "GetCandy"){
                        let amount = BigNumber(event.returnValues._amount) / (10 ** config.contractDecimal)
                        let rs = db.query("UPDATE transactions SET `status` = 1, `amount` = ?, `transData` = ? WHERE `transHash` = ? AND `status` = 0", [amount, JSON.stringify(event.returnValues), event.transactionHash])
                    }else if(event.event == "Guess"){
                        //amount = BigNumber(event.returnValues._amount)
                        let rs = db.query("UPDATE transactions SET `status` = 1, `transData` = ? WHERE `transHash` = ? AND `status` = 0", [ JSON.stringify(event.returnValues), event.transactionHash])
                    }
                })
            }
            update()
        })
    } catch (e) {
        log.error(e)
    }
}

//game交易确认
let gameConfirmProgress = async () => {
    //let start = await web3.eth.getBlockNumber()
    //start = start - config.confirmBlockNum > 0 ? start - config.confirmBlockNum : 1
    let start = undefined
    log.info("game confirm process start")
    while (1) {
        try {
            //get latest confirmed block
            if (start === undefined) {
                let rows = await db.getRows("select * from transactions where `status` = 1 AND `type` = 6 ORDER BY `id` DESC limit 1", [])
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
                log.error("gameConfirmProgress getBlockNumber error")
                continue
            }
            if (config.confirmBlockNum == undefined) {
                log.error("config.confirmBlockNum not set")
                await common.sleep(10000)
                continue
            }
            end = end - config.confirmBlockNum > 0 ? end - config.confirmBlockNum : 1
            //get block event
            if (start <= end) {
                log.debug("gameConfirm, from=" + start + ", to=" + end)
                await gameConfirm(start, end, function () {
                    //callback
                    start = end + 1
                    log.debug("game start changed", start)
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


module.exports = {
    createGame,
    guessGame,
    endGame,
    getCandy,
    isGuessSuccess,
    getLatestGame,
    gameConfirmProgress
};
