//token示例
const config = require("../config");

const web3 = require('../lib/web3');
const log = require('../lib/log');

const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const abi = require('../abi/integralToken.js');
const tokenAddress = config.contractAddress;
const token = new web3.eth.Contract(abi, tokenAddress);

const {abiDecoder, decodeEvent} = require('../lib/abiDecoder');
abiDecoder.addABI(abi);

//获取属性...
let name = async () => {
    return await token.methods.name().call();
};

let decimals = async () => {
    return await token.methods.decimals().call();
};

//wei
let balanceOf = async (address) => {
    let _balance = await token.methods.balanceOf(address).call();
    let balance = BigNumber(_balance).div(10 ** config.contractDecimal);
    return  BigNumber(balance).toString(10);
};

//获取属性...
let totalSupply = async () => {
    let _total = await token.methods.totalSupply().call();
    let total = BigNumber(_total).div(10 ** config.contractDecimal);
    return BigNumber(total).toString(10);
};

//
// { logIndex: 0,
//     transactionIndex: 0,
//     transactionHash: '0x7ddb22c2bed50e9166000fae25c8a5ef28a3806798397e92341556389d926a71',
//     blockHash: '0x2a608ba6292e567c613e0fff77c158036c604e65dadfeb74002fa3e4d8b646ec',
//     blockNumber: 6,
//     address: '0xA4e6FAf2A5f481E6729f76CcB1db12F92e2DcF11',
//     type: 'mined',
//     id: 'log_2d1aa3be',
//     returnValues:
//     Result {
//     '0': '0x78D315314b851a504faCB42e75E6E6CB52C6FdC2',
//         '1': '0x19bEDca6d0893F83333280F62Aa67B4017b6cF22',
//         '2': '10',
//         from: '0x78D315314b851a504faCB42e75E6E6CB52C6FdC2',
//         to: '0x19bEDca6d0893F83333280F62Aa67B4017b6cF22',
//         value: '10' },
//     event: 'Transfer',
//         signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     raw:
//     { data: '0x000000000000000000000000000000000000000000000000000000000000000a',
//         topics:
//         [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//             '0x00000000000000000000000078d315314b851a504facb42e75e6e6cb52c6fdc2',
//             '0x00000000000000000000000019bedca6d0893f83333280f62aa67b4017b6cf22' ] } }
let watchAllTransactions = (fromBlock, endBlock, recall, update) => {
    try {
        token.getPastEvents("allEvents", {
            fromBlock: fromBlock,
            toBlock: endBlock
        }, function (err, events) {
            if (err) {
                log.error(err)
                return
            }
            if (events && events.length > 0) {
                recall(events, decodeEvent(events))
            }
            update()
        })
    } catch (e) {
        log.error(e)
    }

};

//离线签名 transaction
//privateKey 0x...
//return transactionHash
let transaction = async (fromAddress, transactionObject, privateKey, nonce) => {
    try {
        if (typeof transactionObject.gasPrice === "undefined" || transactionObject.gasPrice === 0) {
            transactionObject.gasPrice = await web3.eth.getGasPrice();
        }

        if (typeof nonce === "undefined") {
            transactionObject.nonce = await web3.eth.getTransactionCount(fromAddress);
        } else {
            transactionObject.nonce = nonce
        }

        transactionObject.from = fromAddress;

        log.info("transactionObject", transactionObject);

        transactionObject.gasLimit = await web3.eth.estimateGas(transactionObject)

        if (typeof transactionObject.to === "undefined") {
            transactionObject.to = '0x0000000000000000000000000000000000000000';
        }

        //log.info("transactionObject", transactionObject);

        let tx = new Tx(transactionObject);
        tx.sign(new Buffer(privateKey.slice(2), 'hex'));

        let serializedTx = tx.serialize();

        //POA模式只要1个块确认就可以。
        return new Promise((resolve, reject) => {
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                .once('transactionHash', r => resolve(r))
                .catch(e => reject(e));
        });

    } catch (e) {
        log.info("transaction:", e)
    }
};

//转账 代币
let transfer = async (from, fromPrivateKey, to, quantity) => {
    let TXobject = {
        to: tokenAddress,
        value: 0,
        data: token.methods.transfer(to, BigNumber(quantity * 10 ** config.contractDecimal)).encodeABI(), //erc20 transfer data,value wei
    };

    return await transaction(from, TXobject, fromPrivateKey);
};

//转账 以太
let transferEther = async (from, fromPrivateKey, to, quantity) => {
    let TXobject = {
        to: to,
        value: BigNumber(quantity * 10 ** 18),
        data: "0x",
        // data: token.methods.transfer(to, quantity).encodeABI(), //erc20 transfer data,value wei
    };

    return await transaction(from, TXobject, fromPrivateKey);
};

//列出事件
//eventName 为空，列出所有类型
let getPastEvents = async (eventName) => {
    let r = await token.getPastEvents(eventName, {fromBlock: 0, toBlock: 'latest'});

    decodeEvent(r);
    return JSON.stringify(r, null, 2);
};

module.exports = {
    token,
    tokenAddress,
    balanceOf,
    name,
    transfer,
    transaction,
    getPastEvents,
    watchAllTransactions,
    transferEther,
    totalSupply
};
