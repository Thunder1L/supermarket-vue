import request from '@/utils/request'

// 加入购物车
export function addToCart(productId) {
  return request({
    url: '/api/cart/add',
    method: 'post',
    data: { productId }
  })
}

// 获取列表
export function getCartList() {
  return request({
    url: '/api/cart/list',
    method: 'get'
  })
}

// 更新数量
export function updateCartCount(id, count) {
  return request({
    url: `/api/cart/update/${id}/${count}`,
    method: 'post'
  })
}

// 删除
export function deleteCart(id) {
  return request({
    url: `/api/cart/delete/${id}`,
    method: 'delete'
  })
}

// 提交订单 / 结算
export function checkout(data) {
  return request({
    url: '/api/cart/checkout',
    method: 'post',
    data // 直接传 data 对象
  })
}