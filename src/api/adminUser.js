import request from '@/utils/request'

/* =========================================================
   管理员认证相关
   ========================================================= */

// 管理员登录
// data 包含: { phone, password, loginType: 'password'|'code', code? }
export function login(data) {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data
  })
}

// 管理员注册
// data 包含: { username, phone, code, password, adminSecret }
export function register(data) {
  return request({
    url: '/api/admin/register',
    method: 'post',
    data
  })
}

// 管理员发送验证码
// 【注意】UI中现在使用的是手机号发送，所以这里参数名为 phone
export function sendCode(phone) {
  return request({
    url: '/api/admin/sendCode',
    method: 'get',
    params: { phone } 
  })
}

// 管理员重置密码
// data 包含: { phone, code, newPassword, adminSecret }
export function resetPassword(data) {
  return request({
    url: '/api/admin/resetPassword',
    method: 'post',
    data
  })
}

/* =========================================================
   管理员管理用户相关
   ========================================================= */

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/api/admin/user/list',
    method: 'get',
    params
  })
}

// 删除用户
export function deleteUser(userId) {
  return request({
    url: `/api/admin/user/delete/${userId}`,
    method: 'delete'
  })
}

// 封禁用户
export function banUser(userId) {
  return request({
    url: `/api/admin/user/ban/${userId}`,
    method: 'post'
  })
}

export default {
  login,
  register,
  sendCode,
  resetPassword,
  getUserList,
  deleteUser,
  banUser
}