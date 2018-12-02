var url = require('url');
let game = require('../model/integralGame');
let {guessGame,approve,getApprove} = require('../model/userManagement');
const config = require("../config");
let token = require('../model/integralToken');

let register = (router) => {

    // 创建游戏
    router.get('/game/createGame', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            //let gameId = gets.gameId || Math.ceil(Math.random()*10000000);
            let start = gets.start;
            let end = gets.end;
            let max = gets.max;
            //start: 开始时间; end: 结束时间; max: 单人最多筹码数量

            console.log('xxx');

            res.end(JSON.stringify(await game.createGame(start, end, max)));
        } catch (e) {
            res.end(e.message)
        }
    });

    // 下注
    router.get('/game/guessGame', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            let userId = gets.userId;
            let amount = gets.amount;
            let transId = gets.tid || Math.ceil(Math.random()*10000000);
            //userId: 发起人; gameId: 游戏ID; gameValue: 竞猜值（1或2）; amount: 竞猜金额
            res.end(JSON.stringify(await game.guessGame(transId,userId, gets.gameId, gets.gameValue, amount)));
        } catch (e) {
            throw e;
            // res.end(e.message)
        }
    });

    // 最新的游戏
    router.get('/game/latestGame', async function (req, res) {
        try {
            res.end(JSON.stringify(await game.getLatestGame()));
        } catch (e) {
            throw e;
            // res.end(e.message)
        }
    });

    // 游戏结束
    router.get('/game/endGame', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            //gameId: 游戏ID; gameValue: 竞猜值;
            res.end(JSON.stringify(await game.endGame(gets.gameId, gets.gameValue)));
        } catch (e) {
            res.end(e.message)
        }
    });

    // 领取奖励
    router.get('/game/getCandy', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            let transId = gets.tid || Math.ceil(Math.random()*10000000);
            //userId: 发起人; gameId: 游戏ID;
            res.end(JSON.stringify(await game.getCandy(transId, gets.userId, gets.gameId)));
        } catch (e) {
            res.end(e.message)
        }
    });

    // 授权额度
    router.get('/game/approve', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            //userId: 发起人; value: 授权额度;
            res.end(JSON.stringify({hash: await approve(gets.userId, gets.value)}));
        } catch (e) {
            res.end(e.message)
        }
    });

    // 查询授权额度
    router.get('/game/getApprove', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            //userId: 发起人; gameAddress: 授权地址;
            res.end(JSON.stringify({amount: await getApprove(gets.userId, config.gameAddress)}));
        } catch (e) {
            res.end(e.message)
        }
    });

    //判断用户是否中奖
    router.get('/game/isGuessSuccess', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            //userId: 发起人; gameId: 游戏ID;
            res.end(JSON.stringify(await game.isGuessSuccess(gets.userId, gets.gameId)));
        } catch (e) {
            res.end(e.message)
        }
    });

    router.get('/game/getContractBlance', async function (req, res) {
        try {
            res.end(JSON.stringify(await token.balanceOf(config.gameAddress)));
        } catch (e) {
            throw e;
            // res.end(e.message)
        }
    });

};
module.exports = {register};
