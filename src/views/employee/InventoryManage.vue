<template>
  <div class="inventory-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>📦 货架商品盘点</span>
          <el-button type="warning" plain @click="$router.push('/employee/dashboard')">返回工作台</el-button>
        </div>
      </template>

      <div class="input-area">
        <el-input
          v-model="productId"
          size="large"
          placeholder="请扫描商品条码或输入商品ID"
          clearable
          @keyup.enter="searchProduct"
        >
          <template #prefix><el-icon><FullScreen /></el-icon></template>
          <template #append>
            <el-button type="warning" @click="searchProduct" :loading="loading">查询</el-button>
          </template>
        </el-input>
      </div>

      <div v-if="productInfo" class="product-info-card">
        <el-descriptions title="商品当前信息" :column="1" border>
          <el-descriptions-item label="商品名称">{{ productInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="当前售价">¥ {{ productInfo.price }}</el-descriptions-item>
          <el-descriptions-item label="系统账面库存">
            <el-tag type="info" size="large">{{ productInfo.stock }} 件</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="update-section">
          <h3>实际盘点库存：</h3>
          <el-input-number v-model="newStock" :min="0" size="large" />
          <el-button type="primary" size="large" class="update-btn" @click="handleUpdateStock">
            确认上报
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import employeeApi from '@/api/employee'

const productId = ref('')
const loading = ref(false)
const productInfo = ref(null)
const newStock = ref(0)

// 查询商品信息
const searchProduct = async () => {
  if (!productId.value) return ElMessage.warning('请输入商品条码')
  loading.value = true
  try {
    const res = await employeeApi.getProductInfo(productId.value)
    if (res.code === 0 || res.code === 200) {
      productInfo.value = res.data
      newStock.value = res.data.stock // 默认填入当前库存
      ElMessage.success('查询成功')
    } else {
      productInfo.value = null
      ElMessage.error(res.msg || '未查到该商品')
    }
  } finally {
    loading.value = false
  }
}

// 提交库存更新
const handleUpdateStock = async () => {
  if (newStock.value === productInfo.value.stock) {
    return ElMessage.info('库存未发生变化，无需上报')
  }
  try {
    const res = await employeeApi.updateStock({
      id: productInfo.value.id,
      stock: newStock.value
    })
    if (res.code === 0 || res.code === 200) {
      ElMessage.success('库存更新成功！')
      productInfo.value.stock = newStock.value // 更新本地视图
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  } catch (error) {}
}
</script>

<style scoped>
.inventory-container { max-width: 800px; margin: 20px auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; }
.input-area { margin: 20px 0; }
:deep(.el-input-group__append) { background-color: #ED8F03; color: white; border: none; }
:deep(.el-input-group__append:hover) { background-color: #d67f02; }
.product-info-card { margin-top: 30px; padding-top: 20px; border-top: 1px dashed #eee; }
.update-section { margin-top: 20px; display: flex; align-items: center; gap: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
.update-btn { flex-grow: 1; }
</style>