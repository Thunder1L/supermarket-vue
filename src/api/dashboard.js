import request from '@/utils/request'

export function getStats() {
  return request({
    url: '/api/admin/stats',
    method: 'get'
  })
}