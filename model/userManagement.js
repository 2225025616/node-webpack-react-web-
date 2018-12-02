
let {token,tokenAddress, transaction} = require('../model/integralToken');
const config = require('../config');
const db = require('../lib/db');
const log = require('../lib/log');
const BigNumber = require('bignumber.js');
let bts = require('../model/bts');
let getAddress = async (userId) => {

    if (userId === "" || userId === undefined){
        throw new Error('userId cant`b null !');
    }

    let rows = await db.getRows("select * from addresses where userId = ?", [userId]);

    if (rows === undefined || rows.length === 0) {
        throw new Error("userId not exist:"+userId);
    }

    if (rows.length > 1 ) {
        throw new Error("userId has many account:"+userId);
    }

    return rows[0];
}

let getAddressByName = async (userName) => {

    if (userName === "" || userName === undefined){
        throw new Error('userName cant`b null !');
    }

    let rows = await db.getRows("select `id`,`public`,`private` from addresses where userName = ?", [userName]);

    if (rows === undefined || rows.length === 0) {
        throw new Error("userId not exist:"+userName);
    }

    if (rows.length > 1 ) {
        throw new Error("userName has many account:"+userName);
    }

    return rows[0];
}

let getUserByAddress = async (address) => {

    if (address === "" || address === undefined){
        throw new Error('address cant`b null !');
    }

    let rows = await db.getRows("select * from addresses where public = ?", [address]);

    if (rows === undefined || rows.length === 0) {
        throw new Error("address not exist:"+address);
    }

    if (rows.length > 1 ) {
        throw new Error("address has many account:"+address);
    }

    return rows[0];
}

//客户绑定bts账户
let relateBTS = async (userId, btsAccount) => {
    try {

        if (btsAccount === "" || btsAccount === undefined){
            throw new Error('btsAccount cant`b set null !');
        }

        let address = await getAddress(userId);
        let from = address.public;
        let fromPrivateKey = address.private;

        let TXobject = {
            to: tokenAddress,
            value: 0,
            data: token.methods.relateBTS(btsAccount).encodeABI(),
        };

        let transHash = await transaction(from, TXobject, fromPrivateKey);

        let record = await db.query("update addresses set btsAccount=?,updatedAt=now() where userId=?", [btsAccount, userId]);

        if (record < 1) {
            return {
                status: 2003,
                error: 'modify user btsAccount faild :',
                param:{
                    name:"userId",
                    value:userId
                }
            }
        } else {
            return {
                status: 0,
                data: {
                    transactionHash: transHash,
                }
            }
        }
    } catch(e){
        return{
            status:1005,
            error:e.message,
        }
    }
};

//查询客户bts账户
let btsAccount = async (userId) => {
    let address = await getAddress(userId);
    let from = address.public;

    return await token.methods.btsAccount(from).call();
};

//客户积分转帐，对应token转帐
let transferToken = async (transId, userId, toAddress, quantity) => {
    try {
        let address = await getAddress(userId);
        let from = address.public;
        let fromPrivateKey = address.private;

        let toUser = await getUserByAddress(toAddress);
        // let toAddress = toUser.public;

        if (from === toAddress){
            throw new Error('Can`t transfer to self !');
        }

        if (Number.isNaN(quantity) || quantity <= 0) {
            throw new Error('quantity must be greater than zero !');
        }

        let record = await db.query("INSERT INTO transactions(`transId`,`fromUserId`,`toUserId`,`amount`,`type`) VALUES(?,?,?,?,2)", [transId, userId, toUser.id,quantity]);

        if (record < 1) {
            let transInfo = await db.getRows("SELECT * from transactions WHERE `transId` = ?", [transId])
            if (transInfo.length > 0) {
                return {
                    status: 1004,
                    error: 'transactions exist, transID =' + transId,
                    data: transInfo[0]
                }
            } else {
                return {
                    status: 1004,
                    error: 'db:transactions insert error,transID =' + transId,
                }
            }
        }


    	let TXobject = {
            to: tokenAddress,
            value: 0,
            data: token.methods.transfer(toAddress , BigNumber(quantity * 10 ** config.contractDecimal)).encodeABI(),
        };

        let transHash = await transaction(from, TXobject, fromPrivateKey);
        // if(!isNaN(transHash)){
            await db.query("UPDATE transactions SET `transHash` = ? WHERE `transId` = ?", [transHash, transId])
            return {
                status: 0,
                data: {
                    transactionHash: transHash,
                }
            }
        // }else{
        //     return {
        //         status: 1006,
        //         error: "",
        //     }
        // }
    }catch(e){
        return{
            status:1005,
            error:e.message,
        }
    }
}

//客户消费积分，扣除token
let consumeToken = async (transId, userId, quantity) => {
    try{
        let address = await getAddress(userId);
        let from = address.public;
        let fromPrivateKey = address.private;

        if (config.owner.address === from){
            throw new Error('from address shoud`t be owner !');
        }

        if (Number.isNaN(quantity) || quantity <= 0) {
            throw new Error('quantity must be greater than zero !');
        }


        let record = await db.query("INSERT INTO transactions(`transId`,`fromUserId`,`toUserId`,`amount`,`type`) VALUES(?,?,?,?,3)", [transId, userId, 0, quantity]);

        if (record < 1) {
            let transInfo = await db.getRows("SELECT * from transactions WHERE `transId` = ?", [transId])
            if (transInfo.length > 0) {
                return {
                    status: 1004,
                    error: 'transactions exist, transID =' + transId,
                    data: transInfo[0]
                }
            } else {
                return {
                    status: 1004,
                    error: 'db:transactions insert error, transID =' + transId,
                }
            }
        }

        let TXobject = {
            to: tokenAddress,
            value: 0,
            data: token.methods.consumeToken(BigNumber(quantity * 10 ** config.contractDecimal)).encodeABI(),
        };

        let transHash =  await transaction(from, TXobject, fromPrivateKey);

        await db.query("UPDATE transactions SET `transHash` = ? WHERE `transId` = ?", [transHash, transId])
        return {
            status: 0,
            data: {
                transactionHash: transHash,
            }
        }
    }catch(e){
        return{
            status:1005,
            error:e.message,
        }
    }
}

//客户token 转换为 bts 资产
let exchangeBTS = async (transId, userId, quantity) => {
    try{
        let address = await getAddress(userId);
        let from = address.public;
        let fromPrivateKey = address.private;

        // if (config.owner.address === from){
        //     throw new Error('from address shoud`t be owner !');
        // }

        if (Number.isNaN(quantity) || quantity <= 0) {
            throw new Error('quantity must be greater than zero !');
        }

        let record = await db.query("INSERT INTO transactions(`transId`,`fromUserId`,`toUserId`,`amount`,`type`) VALUES(?,?,?,?,4)", [transId, userId,0,quantity]);

        if (record < 1) {
            let transInfo = await db.getRows("SELECT * from transactions WHERE `transId` = ?", [transId])
            if (transInfo.length > 0) {
                return {
                    status: 1004,
                    error: 'transactions exist, transID =' + transId,
                    data: transInfo[0]
                }
            } else {
                return {
                    status: 1004,
                    error: 'db:transactions insert error,transID =' + transId,
                }
            }
        }

        let TXobject = {
            to: tokenAddress,
            value: 0,
            data: token.methods.exchange(BigNumber(quantity * 10 ** config.contractDecimal)).encodeABI(),
        };
        let transHash = await transaction(from, TXobject, fromPrivateKey);

        if(!isNaN(transHash)){
             //BTS资产转换
             let toAccount = await btsAccount(userId);
             await bts.assetIssue(
                 config.bts.account,
                 toAccount,
                 quantity * config.bts.asset.precision,
                 config.bts.asset.cicit
             );
             await db.query("UPDATE transactions SET `transHash` = ? WHERE `transId` = ?", [transHash, transId]);
        }

        return {
            status: 0,
            data: {
                transactionHash: transHash,
            }
        }
    }catch(e){
        return{
            status:1005,
            error:e.message,
        }
    }
}

let approve = async (userId, value) => {
    let address = await getAddress(userId);
    let from = address.public;
    let fromPrivateKey = address.private;

    let TXobject = {
        to: tokenAddress,
        value: 0,
        data: token.methods.approve(config.gameAddress, BigNumber(value * 10 ** config.contractDecimal)).encodeABI(),
    };

    let transHash = await transaction(from, TXobject, fromPrivateKey);
    return transHash;
}

//查询授权额度userId:用户ID，spender：授权地址
let getApprove = async (userId, spender) => {
    
    let address = await getAddress(userId);
    let from = address.public;
    let _approve = await token.methods.allowance(from,spender).call();
    let approve =  BigNumber(_approve).div(10 ** config.contractDecimal);
    return BigNumber(approve).toString(10);
}

module.exports = {relateBTS, btsAccount, transferToken,consumeToken,exchangeBTS,getAddress,approve,getApprove};
