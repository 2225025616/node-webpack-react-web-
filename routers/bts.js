let url = require('url');
let bts = require('../model/bts');
let config = require('../config');


let register = (router) => {
    //生成以太坊账户
    router.get('/bts/getTicker', async function (req, res) {
        res.end(JSON.stringify(await bts.getTicker(config.bts.asset.main, config.bts.asset.cicit)));
    });

    //获取bts账户信息
    router.get('/bts/getAccount', async function (req, res) {
        let gets = url.parse(req.url, true).query;
        try {
            let account = await bts.getAccount(gets.name);
            res.end(JSON.stringify({info: account}));
        } catch (e) {
            res.end(e.message)
        }
    });

    //BTS资产发行
    // /bts/assetIssue?name=moro2014&amount=1
    router.get('/bts/assetIssue', async function (req, res) {
        let gets = url.parse(req.url, true).query;
        try {
            let blocknum = await bts.assetIssue(
                config.bts.account,
                gets.name,
                gets.amount * config.bts.asset.precision,
                config.bts.asset.cicit
            );
            res.end(JSON.stringify(blocknum));
        } catch (e) {
            res.end(e.message)
        }
    });

};
module.exports = {register};
