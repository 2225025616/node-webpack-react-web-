
var url = require('url');
let {balanceOf} = require('../model/integralToken');
let {relateBTS, btsAccount, transferToken, consumeToken, exchangeBTS, getAddress} = require('../model/userManagement');
let config = require('../config');

let register = (router) => {

    router.get('/user/relateBTS', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;

            var userId = gets.userId;
            var btsAccount = gets.btsAccount;

            let result = await relateBTS(userId, btsAccount);

            res.end(JSON.stringify(result));
        } catch (e) {
            res.end(e.message)
        }
    });

    router.get('/user/getBtsAccount', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            res.end(JSON.stringify({btsAccount: await btsAccount(gets.userId)}));
        } catch (e) {
            res.end(e.message)
        }
    });

    router.get('/user/transferToken', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;

            var transId = gets.tid || Math.ceil(Math.random()*10000000);
            var userId = gets.userId;
            var address = gets.address;
            var quantity = gets.quantity;

            let result = await transferToken(transId,userId,address,quantity);
            res.end(JSON.stringify(result));
        } catch (e) {
            res.end(e.message)
        }
    });

    router.get('/user/consumeToken', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;
            var transId = gets.tid || Math.ceil(Math.random()*10000000);
            var userId = gets.userId;
            var quantity = gets.quantity;

            let result = await consumeToken(transId,userId,quantity);
            res.end(JSON.stringify(result));
        } catch (e) {
            res.end(e.message)
        }
    });

    router.get('/user/exchangeBTS', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;
            let userId = gets.userId;
            let quantity = gets.quantity;
            let transId = gets.tid || Math.ceil(Math.random()*10000000);

            let result = await exchangeBTS(transId,userId,quantity);
            res.end(JSON.stringify(result));
        } catch (e) {
            res.end(e.xmessage)
        }
    });

    router.get('/user/getTokenBalance', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            res.end(JSON.stringify(await balanceOf(gets.address)));
        } catch (e) {
            res.end(e.message)
        }
    });

    router.get('/user/getUser', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            res.end(JSON.stringify(await getAddress(gets.userId)));
        } catch (e) {
            res.end(e.message)
        }
    });


};

module.exports = {register};
