<template>
  <div class="product-page">
    <div class="container">
      
      <!-- 顶部搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="queryParams.keyword" 
          placeholder="搜索商品名称..." 
          class="search-input"
          clearable
          aria-label="搜索商品" 
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <div class="main-layout">
        <!-- 左侧分类 -->
        <div class="category-sidebar">
          <div 
            class="cat-item" 
            :class="{ active: queryParams.categoryId === null }"
            @click="selectCategory(null)"
          >
            全部商品
          </div>
          <div 
            v-for="cat in categoryList" 
            :key="cat.id" 
            class="cat-item"
            :class="{ active: queryParams.categoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </div>
        </div>

        <!-- 右侧商品列表 -->
        <div class="product-list-container" v-loading="loading">
          <!-- 有数据时显示网格 -->
          <el-row :gutter="20" v-if="productList.length > 0">
            <el-col 
              v-for="item in productList" 
              :key="item.id" 
              :xs="12" :sm="8" :md="6" :lg="6"
            >
              <el-card class="product-card" shadow="hover" :body-style="{ padding: '0px' }">
                <!-- 商品图片 -->
                <div class="img-wrapper">
                  <el-image :src="item.imgUrl" fit="cover" class="product-img">
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
                
                <!-- 商品信息 -->
                <div class="card-body">
                  <h3 class="product-name" :title="item.name">{{ item.name }}</h3>
                  <p class="product-desc">{{ item.description || '暂无描述' }}</p>
                  
                  <div class="price-row">
                    <span class="price">¥ {{ item.price.toFixed(2) }}</span>
                    <span class="sales">销量 {{ item.sales }}</span>
                  </div>

                  <!-- 加入购物车按钮 -->
                  <el-button 
                    type="primary" 
                    class="add-btn" 
                    :icon="ShoppingCart" 
                    @click="addToCart(item)"
                  >
                    加入购物车
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 无数据缺省页 -->
          <el-empty v-else description="暂无相关商品" />

          <!-- 分页器 -->
          <div class="pagination-box" v-if="total > 0">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="total"
              :page-size="queryParams.size"
              v-model:current-page="queryParams.page"
              @current-change="loadProducts"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, ShoppingCart, Picture } from '@element-plus/icons-vue'
import { getProductList, getCategoryList } from '@/api/product'
import { addToCart as apiAddToCart } from '@/api/cart'
import { ElMessage } from 'element-plus'

// 数据状态
const loading = ref(false)
const categoryList = ref([])
const productList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 8, // 每页显示8个
  keyword: '',
  categoryId: null
})

// 初始化
onMounted(async () => {
  await loadCategories()
  loadProducts()
})

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 0) {
      categoryList.value = res.data
    }
  } catch (e) {
    // 忽略错误，防止影响页面加载
  }
}

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    // 这里的 queryParams 包含了 page 和 size，会自动传给后端
    const res = await getProductList(queryParams)
    if (res.code === 0) {
      productList.value = res.data.records // 当前页的数据
      total.value = res.data.total         // 总条数 (后端查出来的)
    }
  } finally {
    loading.value = false
  }
}

// 【关键】处理页码改变
const handlePageChange = (newPage) => {
  queryParams.page = newPage
  loadProducts()
  // 建议回到顶部，提升体验
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 【关键】搜索或切换分类时，必须重置到第一页
const selectCategory = (id) => {
  queryParams.categoryId = id
  queryParams.page = 1 // 重置
  loadProducts()
}

const handleSearch = () => {
  queryParams.page = 1 // 重置
  loadProducts()
}

// 加入购物车
const addToCart = async (product) => {
  // 1. 检查是否登录
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    return
  }

  // 2. 调用API
  try {
    const res = await apiAddToCart(product.id)
    if (res.code === 0) {
      ElMessage.success(`已将 ${product.name} 加入购物车`)
    } else {
      ElMessage.error(res.msg)
    }
  } catch(e) {}
}

</script>

<style scoped>
.product-page {
  padding: 20px 0;
  min-height: 80vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 搜索栏 */
.search-bar {
  max-width: 600px;
  margin: 0 auto 30px;
}

/* 主布局 */
.main-layout {
  display: flex;
  gap: 20px;
}

/* 左侧分类导航 */
.category-sidebar {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 0;
  height: fit-content;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.cat-item {
  padding: 12px 20px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: 0.2s;
  border-left: 3px solid transparent;
}
.cat-item:hover {
  background: #f5f7fa;
  color: #409eff;
}
.cat-item.active {
  background: #ecf5ff;
  color: #409eff;
  border-left-color: #409eff;
  font-weight: bold;
}

/* 右侧列表容器 */
.product-list-container {
  flex: 1;
}

/* 商品卡片 */
.product-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  border: none;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.img-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-img {
  width: 100%;
  height: 100%;
}
.image-slot {
  font-size: 30px;
  color: #ddd;
}

.card-body {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin: 0 0 5px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.sales {
  font-size: 12px;
  color: #999;
}

.add-btn {
  width: 100%;
}

/* 分页器 */
.pagination-box {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-layout { flex-direction: column; }
  .category-sidebar { width: 100%; display: flex; overflow-x: auto; }
  .cat-item { flex-shrink: 0; border-left: none; border-bottom: 3px solid transparent; }
  .cat-item.active { border-bottom-color: #409eff; border-left-color: transparent; }
}
</style>