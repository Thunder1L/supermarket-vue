import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router' // 引入路由以便跳转

const service = axios.create({
  baseURL: 'https://supermarket-server-production-cd4d.up.railway.app', 
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 如果后端返回的 code 不是 0，说明业务逻辑出错
    if (res.code !== 0) {
      // 【修改】优先显示后端返回的 msg，如果没有才显示 '系统未知错误'
      const errorMsg = res.msg || '系统未知错误'
      ElMessage.error(errorMsg)
      // 可以选择抛出错误，中断后续逻辑
      return Promise.reject(new Error(errorMsg))
    }
    return res // 也就是 res.data
  },
  error => {
    console.log('err' + error) // for debug
    let message = '请求失败'
    
    if (error.response) {
      // 根据状态码判断
      switch (error.response.status) {
        case 401: message = '登录过期，请重新登录'; break;
        case 403: message = '拒绝访问 (403)'; break;
        case 404: message = '请求地址出错 (404)'; break;
        case 500: message = '服务器内部错误 (500)'; break;
        default: message = `连接错误 (${error.response.status})`;
      }
    } else {
      // 网络断开等情况
      message = error.message === 'Network Error' ? '网络连接异常' : error.message
    }
    
    // 【修改】避免弹出空的 'Error'
    if (message === 'Error') message = '未知网络错误'
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)
export default service