import api from './index'

export default class wallet {
  // 获取新的以太坊账户
  static getNewAccount() {
    return api.get('account/generate')
  }

  // 生成以太坊账户并保存到数据库中
  static generateAndSave({isUpdate}) {
    return api.get('account/generateAndSave', {params: {isUpdate}})
  }

  // 获取Token余额
  static getBalance({address}) {
    return api.get('user/getTokenBalance', {params: {address}})
  }

  // 获取以太坊地址余额
  static getETHBalance({address}) {
    return api.get('user/getTokenBalance', {params: {address}})
  }

  // 获取BTS账户
  static getBtsAccount() {
    return api.get('user/getBtsAccount')
  }

  // 中信积分换BTS
  static exchangeBTS({quantity}) {
    return api.get('user/exchangeBTS', {params: {quantity}})
  }

  // 消费Token
  static consumeToken(quantity) {
    return api.get('user/consumeToken', {params: {quantity}})
  }

  // 绑定BTS钱包
  static relateBTS({btsAccount}) {
    return api.get('user/relateBTS', {params: {btsAccount}})
  }

  // 转账
  static transformToken({address, quantity}) {
    return api.get('user/transferToken', {params: {address, quantity}})
  }

  // 获取User信息
  static getUser() {
    return api.get('user/getUser')
  }

  // 查询BTS账户信息
  static getBtsInfo({name}) {
    return api.get('bts/getAccount', {params: {name}})
  }

  // 获取奖池余额
  static getContractBalance() {
    return api.get('game/getContractBlance')
  }
}