var url = require('url');
let account = require('../model/account');

let register = (router) => {
    //生成以太坊账户
    router.get('/account/generate', function (req, res) {
        res.end(JSON.stringify(account.generate()));
    });

    //生成以太坊账户并保存到数据库中
    //isUpdate === 'true' 更新地址
    router.get('/account/generateAndSave', async function (req, res) {
        let gets = url.parse(req.url, true).query;
        try {
            let ret = await account.generateAndSave(gets.userId, gets.isUpdate)
            res.end(JSON.stringify(ret));
        } catch (e) {
            res.end(e.message)
        }
    });

    //用户登录
    router.get('/account/login', async function (req, res) {
        try {
            //获取get参数
            let gets = url.parse(req.url, true).query;
            res.end(JSON.stringify(await account.login(req, res, gets.username, gets.password), null, 4));
        } catch (e) {
            res.end(e.message)
        }
    });

    //获取用户登录信息
    router.get('/account/getLoginUser', async function (req, res) {
        try {
            res.end(JSON.stringify(await account.getLoginUser(req, res), null, 4));
        } catch (e) {
            res.end(e.message)
        }
    });

    //退出登录
    router.get('/account/logout', async function (req, res) {
        try {
            account.logout(req, res);
            res.end('ok');
        } catch (e) {
            res.end(e.message)
        }
    });
};
module.exports = {register};
