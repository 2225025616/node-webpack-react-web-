var url = require('url');
let owner = require('../model/ownerManagement');

let register = (router) => {
    //铸币
    router.get('/owner/mintToken', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;
            let transId = gets.tid || Math.ceil(Math.random()*10000000);
            res.end(JSON.stringify(await owner.mintToken(transId, gets.amount)))
        } catch (e) {
            res.end(JSON.stringify({status:1,error:e.message}))
        }
    });

    //获取 event 记录
    router.get('/owner/getEvents', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;
            let event = gets.event || undefined; // get all events if undefined
            res.end(JSON.stringify(await owner.getEvents(event), null, 2))
        } catch (e) {
            res.end(JSON.stringify({status:1,error:e.message}))
        }
    });

    //发币
    //{"transId":6297102,"userName":1,"amount":10,"subType":1}
    router.get('/owner/distribute', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;
            //todo for test
            let trans = {}
            trans.transId = gets.transId || Math.ceil(Math.random() * 10000000);
            trans.userName = gets.userName;
            trans.amount = gets.amount || 10;
            trans.subType = gets.subtype ||Math.ceil(Math.random() * 4);
            res.end(JSON.stringify(await owner.distribute(trans)))
        } catch (e) {
            res.end(JSON.stringify({status: 1, error: e.message}))
        }
    });

    //获取交易记录
    //page：第几页
    //rows：每页条数
    //type：类型；0为distribute交易
    //days：多少天内的数据
    //userId：指定用户id
    router.get('/owner/transactions', async function (req, res) {
        let gets = url.parse(req.url, true).query;
        var rows;
        if(gets.rows == undefined || gets.rows < 0){
             rows = 20
        }else{
             rows = parseInt(gets.rows)
        }
        let start = gets.page * rows || 0;
        let type = parseInt(gets.type);
        let days = parseInt(gets.days);
        let userId = parseInt(gets.userId);
        res.end(JSON.stringify(await owner.getTransactions(start, rows, days, type,userId)))
    });
};
module.exports = {register};