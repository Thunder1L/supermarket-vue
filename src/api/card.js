import request from '@/utils/request'

// 获取我的银行卡列表
export function getCardList() {
  return request({
    url: '/api/card/list',
    method: 'get'
  })
}

// 添加银行卡
export function addCard(data) {
  return request({
    url: '/api/card/add',
    method: 'post',
    data
  })
}

// 删除银行卡
export function deleteCard(id) {
  return request({
    url: `/api/card/delete/${id}`,
    method: 'delete'
  })
}