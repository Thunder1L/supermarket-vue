import request from '@/utils/request'

// 获取订单列表
export function getOrderList(params) {
  return request({
    url: '/api/admin/order/list',
    method: 'get',
    params // { page, size, status, orderNo }
  })
}

// 发货
export function shipOrder(id) {
  return request({
    url: `/api/admin/order/ship/${id}`,
    method: 'post'
  })
}

// 删除
export function deleteOrder(id) {
  return request({
    url: `/api/admin/order/delete/${id}`,
    method: 'delete'
  })
}