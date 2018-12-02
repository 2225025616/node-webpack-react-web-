const Apis = require('bitsharesjs-ws').Apis;

const {ChainStore, FetchChain, PrivateKey, TransactionHelper, Aes, TransactionBuilder} = require('bitsharesjs');
const config = require('../config');

let pKey = PrivateKey.fromWif(config.bts.privateKey);

let isInited = false;

//需要加锁
const init = async () => {
    if (isInited === false) {
        let res = await Apis.instance(config.bts.wss, true).init_promise;
        console.log("connected to:", res[0].network_name, "network");

        await ChainStore.init();
    }
    isInited = true;
};

//资产发行
//asset 资产名称
const assetIssue = async (fromAccount, toAccount, amount, _asset, memo) => {
    if (toAccount === undefined) {
        throw new Error('toAccount invalid');
    }

    if (amount === undefined) {
        throw new Error('amount invalid');
    }

    //账号错误将会超时抛出异常
    let from = await FetchChain("getAccount", fromAccount);
    console.log(JSON.stringify(from, null, 4));

    let to = await FetchChain("getAccount", toAccount);

    //获取公钥
    let fromPubKey = from.getIn(["options", "memo_key"]);
    let toPubKey = to.getIn(["options", "memo_key"]);

    //获取nonce
    let nonce = TransactionHelper.unique_nonce_uint64();

    //获取资产数据
    let asset = await FetchChain("getAsset", _asset);
    if (asset == null) {
        throw new Error(`asset '${_asset}' not found.`);
    }

    let assetData = await getObject(asset.get('dynamic_asset_data_id'));
    if (assetData === undefined || assetData.length <= 0) {
        throw new Error(`asset '${_asset}' data not found.`);
    }

    let maxSupply = parseInt(asset.get('options').get('max_supply'));
    let currentSupply = parseInt(assetData[0]['current_supply']);

    if (maxSupply - currentSupply < parseInt(amount)) {
        throw new Error(`insufficient supply '${_asset}' ${maxSupply - currentSupply}  < ${amount}.`);
    }

    //需要判断手续费是否足够

    //reset memo
    if (memo === undefined) {
        memo = "";
    }

    let memoObject = {
        from: fromPubKey,
        to: toPubKey,
        nonce,
        message: Aes.encrypt_with_checksum(
            pKey,
            toPubKey,
            nonce,
            memo
        )
    };

    let tr = new TransactionBuilder();

    tr.add_type_operation("asset_issue", {
        issuer: from.get("id"),
        asset_to_issue: {
            amount: amount,
            asset_id: asset.get('id'),
        },
        issue_to_account: to.get('id'),
        memo: memoObject
    });

    await tr.set_required_fees();

    tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());

    let ret = await tr.broadcast(() => {
    });

    if (ret.length <= 0) {
        throw new Error("transaction broadcast error");
    }

    return ret[0]['block_num'];
};

const getObject = async (name) => {
    let db_api = Apis.instance().db_api();
    if (!db_api) {
        throw new Error("Api not found, please initialize the api instance before calling the ChainStore");
    }

    return await db_api.exec("get_objects", [[name]]);
};

//latest
//base_volume: '223.123' 成交量
const getTicker = async (_asset1, _asset2) => {
    let db_api = Apis.instance().db_api();
    if (!db_api) {
        throw new Error("Api not found, please initialize the api instance before calling the ChainStore");
    }

    //获取id
    let asset1 = await FetchChain("getAsset", _asset1);
    let asset2 = await FetchChain("getAsset", _asset2);

    if (asset1 == null || asset2 == null) {
        throw new Error("asset error")
    }


    return await db_api.exec("get_ticker", [asset1.get('id'), asset2.get('id')]);
};

//找不到将超时
const getAccount = async (name) => {
    if (name === undefined) {
        throw new Error("name invalid");
    }
    return await FetchChain("getAccount", name);
};

init();

module.exports = {assetIssue, getTicker, getAccount};



