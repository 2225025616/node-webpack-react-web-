let {totalSupply} = require('../model/integralToken');
let block = require('../model/block');
let url = require('url');

let register = (router) => {
    router.get('/contract/getTotalSupply', async function (req, res) {
        try {
            res.end(JSON.stringify({total: await totalSupply()}));
        } catch (e) {
            res.end(e.message)
        }
    });

    router.get('/contract/getTransaction', async function (req, res) {
        try {
            let gets = url.parse(req.url, true).query;
            res.end(JSON.stringify(await block.getTransaction(gets.hash)))
        } catch (e) {
            res.end(e.message)
        }
    });
};

module.exports = {register};
