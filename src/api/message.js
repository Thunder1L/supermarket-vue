import request from '@/utils/request'

export function sendMessage(data) {
  // 必须加上 /api 前缀
  return request({ url: '/api/message/send', method: 'post', data })
}

export function getMessageList() {
  return request({ url: '/api/message/list', method: 'get' })
}

// 管理员用
export function getAdminMessageList() {
  return request({ url: '/api/message/admin/list', method: 'get' })
}