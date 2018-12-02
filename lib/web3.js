const config = require('../config');
const Web3 = require('web3');
//const web3 = new Web3(new Web3.providers.WebsocketProvider(config.geth));
const web3 = new Web3(new Web3.providers.HttpProvider(config.geth));

setInterval(
    () => {
        web3.eth.net.isListening().then()
            .catch(() => {
                console.log('[ - ] Lost connection to the node, reconnecting');
                web3.setProvider(config.geth);
            })
    },
    config.reconnect);

module.exports = web3;
