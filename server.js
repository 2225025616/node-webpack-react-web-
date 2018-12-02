let finalhandler = require('finalhandler');
let http = require('http');
let router = require('./lib/router');
let config = require('./config');
const log = require('./lib/log');
let {transactionConfirmProgress, asyncDistribute} = require('./model/ownerManagement');
let game = require('./model/integralGame');

require('fs').readdirSync(__dirname + '/routers').forEach(file => {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
        let name = file.replace('.js', '');
        log.info("load router", name);
        require('./routers/' + file).register(router);
    }
});

let server = http.createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    router(req, res, finalhandler(req, res))
});

if (server.listen(config.listen.port, config.listen.host)) {
    //交易确认 后台运行
    transactionConfirmProgress()
    game.gameConfirmProgress()
    if (config.asyncDistribute) {
        asyncDistribute()
    }
    log.info(`listening ${config.listen.host}:${config.listen.port}`);
}

