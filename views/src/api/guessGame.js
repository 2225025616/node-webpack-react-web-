import api from './index'

export default class GuessGame {
  //创建游戏
  static createGame({start, end, max}) {
    return api.get('game/createGame', {params: {start, end, max}})
  }

  // 下注
  static guessGame({gameValue, amount, gameId}) {
    return api.get('game/guessGame', {params: {gameValue, amount, gameId}})
  }

  // 游戏结束
  static endGame({gameId, gameValue}) {
    return api.get('/game/endGame', {params: {gameId, gameValue}})
  }

  // 领取奖励
  static getCandy({gameId}) {
    return api.get('/game/getCandy', {params: {gameId}})
  }

  // 获取最新游戏信息
  static latestGame() {
    return api.get('/game/latestGame')
  }

  // 用户授权
  static approveGame({value}) {
    return api.get('/game/approve', {params: {value}})
  }

  // 查询授权
  static getApprove() {
    return api.get('/game/getApprove')
  }

  // 查询中奖
  static isGuessSuccess({gameId}) {
    return api.get('/game/isGuessSuccess', {params: {gameId}})
  }
}