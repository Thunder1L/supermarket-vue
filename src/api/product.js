import request from '@/utils/request'

// 获取分类列表
// 注意：如果你的 request.js 中 baseURL 设为了空字符串 ''，这里必须带上 /api 前缀
export function getCategoryList() {
  return request({
    url: '/api/product/category/list',
    method: 'get'
  })
}

// 获取商品列表 (分页 + 搜索)
export function getProductList(data) {
  return request({
    url: '/api/product/list',
    method: 'post',
    data
  })
}

// 新增商品
export function addProduct(data) {
  return request({
    url: '/api/product/add',
    method: 'post',
    data
  })
}

// 修改商品
export function updateProduct(data) {
  return request({
    url: '/api/product/update',
    method: 'post',
    data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/api/product/delete/${id}`,
    method: 'delete'
  })
}

// 修改状态 (status: 1上架 0下架)
export function updateProductStatus(id, status) {
  return request({
    url: `/api/product/status/${id}/${status}`,
    method: 'post'
  })
}

// --- 分类管理 API ---

export function addCategory(data) {
  return request({
    url: '/api/product/category/add',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: '/api/product/category/update',
    method: 'post',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/api/product/category/delete/${id}`,
    method: 'delete'
  })
}

export function updateCategoryStatus(id, status) {
  return request({
    url: `/api/product/category/status/${id}/${status}`,
    method: 'post'
  })
}