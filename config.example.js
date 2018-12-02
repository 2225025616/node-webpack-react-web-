module.exports = {
    listen: {
        host: '0.0.0.0',
        port: 3000,
    },
    mysql: {
        host: "192.168.3.116",
        port: "3306",
        user: "root",
        password: "root",
        database: "citic"
    },
    geth: 'http://192.168.3.124:8545',
    reconnect: 1000,
    contractAddress: "0x8cdaf0cd259887258bc13a92c0a6da92698644c0",
    gameAddress: "0x8cdaf0cd259887258bc13a92c0a6da92698644c0",
    contractDecimal: 18,
    defaultGameMax: 100,
    owner: {
        address: "0x78d315314b851a504facb42e75e6e6cb52c6fdc2",
        privateKey: "0xa83db78111109ead12b3f0e4b5277103dd699bcd8a5021c3f99e46df5c0b987d",
    },
    confirmBlockNum: 10,
    asyncDistribute: false,
    explorer: "http://192.168.3.167:8000/",
    logLevel: 'debug',

    bts: {
        wss: "wss://node.testnet.bitshares.eu",
        account: "moro2015",
        privateKey: "5J97UgCMMFUBDTMyf5MPGWnhn5CcneGC6opbyZWcLzR9iqxiHJx",
        asset: {
            main: "TEST",
            cicit: "MOROO",
            precision: 10000,
        }
    }
};
