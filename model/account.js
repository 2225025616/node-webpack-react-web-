const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

const db = require('../lib/db');
const {transferEther} = require('../model/integralToken');

const web3 = require('../lib/web3');
const log = require('../lib/log');
const cookie = require('cookie');
const url = require('url');

const sqlInsert = 'insert into addresses set public=? ,private=? , userId=?';
const sqlUpdate = 'update addresses set public=? ,private=? where userId=?';

const sqlLogin = 'select * from addresses where userName=? and passwd=?';
const sqlUserInfo = 'select * from addresses where userId=?';

let userId = 0;

let generate = () => {
    let mnemonic = bip39.generateMnemonic();
    let hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
    let path = "m/44'/60'/0'/0/0";
    let wallet = hdwallet.derivePath(path).getWallet();
    let address = `0x${wallet.getAddress().toString('hex')}`;
    let privateKey = `0x${wallet.getPrivateKey().toString('hex')}`;

    return {"address": address, "private": privateKey};
};

//userId orm系统的用户id
//外部调用需要捕获异常
//replace true 替换地址
let generateAndSave = async (userId, isUpdate) => {
    if (typeof userId === 'undefined') {
        throw new Error('userId invalid');
    }

    let account = generate();
    let sql = sqlInsert;
    if (isUpdate === 'true') {
        sql = sqlUpdate;
    }

    await db.query(sql, [account.address, account.private, userId]);
    account["userId"] = userId;

    //为新账户转入小额ether，不会被消耗，维持交易
    let mainAccount = "0xf4af3f8dc3e742f3c26ed1d9fe1b997b6ed1992a";
    let mainAccountKey = '0xefd2c2fd3d55654535cc531cc9c0f60bd3d7963688fe21f2db1c98f18533cad6';

    let result = await transferEther(mainAccount, mainAccountKey, account.address, 1);
    log.info("result", result);

    return account;
};

//查询ether余额
let getBalance = async (address) => {
    if (typeof address === 'undefined') {
        throw new Error("address invalid");
    }
    return await web3.eth.getBalance(address);
};

//用户登录
//仅使用cookie记录用户数据，测试使用
let login = async (req, res, userName, password) => {
    let rows = await db.getRows(sqlLogin, [userName, password]);
    if (rows.length === 0) {
        return false;
    } else {
        //设置cookie
        res.setHeader('Set-Cookie', cookie.serialize('userId', String(rows[0].id), {
            httpOnly: true,
            path : '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        }));

        return rows[0];
    }
};

//获取登录用户信息
let getLoginUser = async (req, res) => {
    //从cookie中读取
    let cookies = cookie.parse(req.headers.cookie || '');

    let userId = cookies.userId;
    if (userId === undefined && isNaN(userId)) {
        return {};
    }

    let rows = await db.getRows(sqlUserInfo, userId);
    if (rows.length === 0) {
        return {};
    }

    return rows[0];
};

let logout = (req, res) => {
    res.setHeader('Set-Cookie', cookie.serialize('userId', String(0), {
        httpOnly: true,
        path : '/',
        maxAge: -1
    }));
};

module.exports = {generate, generateAndSave, getBalance, login, getLoginUser, logout};
