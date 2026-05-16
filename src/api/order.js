import request from '@/utils/request'

// 获取订单列表
export function getOrderList(status) {
  return request({
    url: '/api/order/list',
    method: 'get',
    params: { status }
  })
}

// 模拟支付
export function payOrder(id) {
  return request({
    url: `/api/order/pay/${id}`,
    method: 'post'
  })
}

// 取消订单
export function cancelOrder(id) {
  return request({
    url: `/api/order/cancel/${id}`,
    method: 'post'
  })
}

// 确认收货
export function confirmOrder(id) {
  return request({
    url: `/api/order/confirm/${id}`,
    method: 'post'
  })
}

// 申请售后
export function applyAfterSales(data) {
  return request({
    url: '/order/afterSales',
    method: 'post',
    data // { orderId, reason }
  })
}

// src/api/order.js
export function mockPay(data) {
  return request({
    url: '/api/order/mockPay', // 🚨 强行统一暗号：必须是 /mockPay
    method: 'post',
    data: data // 把包含 orderId 的对象放进请求体里传给后端
  })
}