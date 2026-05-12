import request from '@/utils/request'

// 登录
// data: { phone, password/code, loginType }
export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

// 注册
// data: { username, phone, code, password }
export function register(data) {
  return request({
    url: '/api/user/register',
    method: 'post',
    data
  })
}

// 发送验证码
// params: { phone }
export function sendCode(phone) {
  return request({
    url: '/api/user/sendCode',
    method: 'get',
    params: { phone }
  })
}

// 忘记密码 - 重置密码
// data: { phone, code, newPassword }
export function resetPassword(data) {
  return request({
    url: '/api/user/resetPassword',
    method: 'post',
    data
  })
}

// 获取完整用户信息
export function getUserInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

// 更新个人信息 (头像、昵称、生日等)
export function updateInfo(data) {
  return request({
    url: '/api/user/updateInfo',
    method: 'post',
    data
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/api/user/changePassword',
    method: 'post',
    data
  })
}

// 充值
export function topUp(amount) {
  return request({
    url: '/api/user/topUp',
    method: 'post',
    data: { amount }
  })
}

// 提现
export function withdraw(amount) {
  return request({
    url: '/api/user/withdraw',
    method: 'post',
    data: { amount }
  })
}

// 激活会员
export function activateMember() {
  return request({
    url: '/api/user/activateMember',
    method: 'post'
  })
}

// 默认导出 (兼容性写法)
export default {
  login,
  register,
  sendCode,
  resetPassword,
  getUserInfo,
  updateInfo,
  changePassword,
  topUp,
  withdraw,
  activateMember
}