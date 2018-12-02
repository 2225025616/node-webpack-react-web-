import api from './index'

export default class Common {
  // 登录
  static login({username, password}) {
    return api.get('/account/login', {params: {username, password}})
  }
}