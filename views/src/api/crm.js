import api from './index'

export default class Crm {
  //获取交易记录
    //page：第几页
    //rows：每页条数
    //type：类型；0：系统发放 1:铸币 2：token转账 3：消费 4：转换BTS
    //days：多少天内的数据
  static getOwnTrans({page=0, rows=10, type, days=7, userId=null}) {
    return api.get('owner/transactions', {params: {page, rows, type, days, userId}})
  }

  // 发币
  static distribute({userName, amount}) {
    return api.get('owner/distribute', {params: {userName, amount}})
  }

  // 铸币
  static mintToken({amount}) {
    return api.get('/owner/mintToken', {params: {amount}})
  }

  // eth/bts比例
  static getTicker() {
    return api.get('/bts/getTicker')
  }

  // 总铸币
  static getTotalSupply() {
    return api.get('/contract/getTotalSupply')
  }
}