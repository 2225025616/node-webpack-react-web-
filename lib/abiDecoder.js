const log = require('./log');
const abiDecoder = require('abi-decoder');

let decodeEvent = (events) => {
    for (let o in events) {
        events[o]['data'] = events[o]['raw']['data'];
        events[o]['topics'] = events[o]['raw']['topics'];
    }

    const ret = abiDecoder.decodeLogs(events);
    //单个解析失败返回示例
    //[undefined]

    log.debug(JSON.stringify(ret, null, 2));
    return ret;
};


module.exports = {abiDecoder, decodeEvent};
