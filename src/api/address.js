import request from '@/utils/request'

// 获取地址列表
export function getAddressList() {
  return request({
    url: '/api/address/list',
    method: 'get'
  })
}

// 新增地址
export function addAddress(data) {
  return request({
    url: '/api/address/add',
    method: 'post',
    data
  })
}

// 删除地址
export function deleteAddress(id) {
  return request({
    url: `/api/address/delete/${id}`,
    method: 'delete'
  })
}