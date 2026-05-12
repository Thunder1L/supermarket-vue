<template>
  <div class="cart-page">
    <div class="container">
      <h2>我的购物车</h2>
      
      <el-card shadow="never" class="cart-card">
        <el-table 
          v-loading="loading"
          :data="cartList" 
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <!-- 多选框 -->
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="商品信息" min-width="300">
            <template #default="scope">
              <div class="product-info">
                <el-image :src="scope.row.productImg" class="p-img">
                  <template #error><el-icon><Picture /></el-icon></template>
                </el-image>
                <div class="p-text">
                  <div class="p-name">{{ scope.row.productName }}</div>
                  <div class="p-stock">剩余库存: {{ scope.row.stock }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="单价" width="120" align="center">
            <template #default="scope">¥ {{ scope.row.price }}</template>
          </el-table-column>
          
          <el-table-column label="数量" width="180" align="center">
            <template #default="scope">
              <el-input-number 
                v-model="scope.row.count" 
                :min="1" 
                :max="scope.row.stock" 
                size="small"
                @change="(val) => handleCountChange(scope.row, val)"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="小计" width="120" align="center">
            <template #default="scope">
              <span style="color: #f56c6c; font-weight: bold;">
                ¥ {{ (scope.row.price * scope.row.count).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部结算栏 -->
        <div class="cart-footer">
          <div class="left">
            已选择 <span class="num">{{ selection.length }}</span> 件商品
          </div>
          <div class="right">
            <div class="total-text">
              合计：<span class="total-price">¥ {{ totalPrice }}</span>
            </div>
            <el-button type="primary" size="large" :disabled="selection.length === 0" @click="handleCheckout">
              去结算
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { getCartList, updateCartCount, deleteCart } from '@/api/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const cartList = ref([])
const selection = ref([])

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCartList()
    if (res.code === 0) {
      cartList.value = res.data
    }
  } finally {
    loading.value = false
  }
}

// 计算总价
const totalPrice = computed(() => {
  let sum = 0
  selection.value.forEach(item => {
    sum += item.price * item.count
  })
  return sum.toFixed(2)
})

const handleSelectionChange = (val) => {
  selection.value = val
}

const handleCountChange = async (row, val) => {
  try {
    await updateCartCount(row.id, val)
  } catch(e) {
    row.count = 1 
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定移除该商品吗?', '提示', { type: 'warning' })
    .then(async () => {
      const res = await deleteCart(row.id)
      if (res.code === 0) {
        ElMessage.success('已移除')
        loadData()
      }
    })
}

// 【关键修改】跳转到 Checkout，带上选中的 ID
const handleCheckout = () => {
  const ids = selection.value.map(item => item.id)
  if (ids.length === 0) {
    return ElMessage.warning('请至少选择一件商品')
  }
  
  // 使用路由 Query 参数传递 ID
  router.push({
    path: '/checkout',
    query: { cartIds: ids.join(',') }
  })
}
</script>

<style scoped>
.cart-page { padding: 20px 0; min-height: 80vh; background: #f5f7fa; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
h2 { margin-bottom: 20px; color: #333; }

.product-info { display: flex; align-items: center; gap: 15px; }
.p-img { width: 80px; height: 80px; border-radius: 4px; border: 1px solid #eee; }
.p-name { font-size: 14px; font-weight: 500; color: #333; margin-bottom: 5px; }
.p-stock { font-size: 12px; color: #999; }

.cart-footer {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.num { color: #409eff; font-weight: bold; margin: 0 4px; }
.right { display: flex; align-items: center; gap: 20px; }
.total-price { color: #f56c6c; font-size: 24px; font-weight: bold; margin-left: 10px; }
</style>