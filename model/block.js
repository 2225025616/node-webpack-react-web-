const config = require('../config');
const web3 = require('../lib/web3');
const abi = require('../lib/abiDecoder');

let getTransaction = (transHash)=>{
    return web3.eth.getTransactionReceipt(transHash)
        .then(function(trans){
            console.log(trans)
            trans.decoded = abi.abiDecoder.decodeLogs(trans.logs)
            return trans
        });
}


module.exports = {getTransaction}