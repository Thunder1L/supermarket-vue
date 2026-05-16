import request from '@/utils/request'

export default {
  // 员工核销订单
  verifyOrder(orderNo) {
    return request({
      url: '/api/employee/order/verify', // 我们马上要在后端写的接口
      method: 'post',
      // 将单参数用 params 或表单形式传给后端
      params: { orderNo } 
    })
  },
  // 新增：查询商品信息
  getProductInfo(id) {
    return request({ url: `/api/employee/product/info`, method: 'get', params: { id } })
  },
  // 新增：上报更新库存
  updateStock(data) {
    return request({ url: '/api/employee/product/updateStock', method: 'post', data })
  },
  // 获取待配送订单（外送单）
  getDeliveryOrders() {
    return request({ url: '/api/employee/delivery/list', method: 'get' })
  },
  // 确认送达
  completeDelivery(data) {
    return request({ url: '/api/employee/delivery/complete', method: 'post', data })
  },
}