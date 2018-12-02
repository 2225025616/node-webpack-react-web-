import axios from 'axios'
import Config from '../../../config'
import { message } from 'antd';

let api = axios.create({
  baseURL: `http://localhost:${Config.listen.port}`,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  responseType: 'json'
})

// 修改返回数据格式
api.defaults.transformResponse = (res) => {
  if (typeof res === 'string') {
    res = JSON.parse(res)
  }
  if (Object.keys(res).includes('status')) {
  // if ('status' in res) {
    if (!res.status) {
      return res
    } else {
      message.error(res.error);
      throw 'error'
    }
  }
  return res
}

api.defaults.validateStatus = (status) => {
  return (status >= 200 && status < 300) || (status >= 400) // 处理服务器返回的错误信息
}

api.interceptors.response.use(
  res => {
    if (api.defaults.validateStatus) {
      return res.data
    }
    return Promise.reject(res)
  },
  error => {
    return Promise.reject(error)
  }
)

// 请求数据前对参数进行处理
api.interceptors.request.use(config => {
  if (localStorage.getItem('userInfo') && !config.url.includes('owner')) {
    const id = JSON.parse(localStorage.getItem('userInfo')).userId
    config.params = Object.assign({}, config.params, {userId: id})
  }

  return config
}, error => {
  return Promise.reject(error)
})

export default api
