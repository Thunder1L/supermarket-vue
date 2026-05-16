<template>
  <div class="delivery-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>🛵 待配送外送单</span>
          <el-button type="primary" plain @click="$router.push('/employee/dashboard')">返回</el-button>
        </div>
      </template>

      <el-table :data="deliveryList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="收件信息" min-width="250">
          <template #default="scope">
            <div class="address-box">
              <strong>{{ scope.row.receiverName }}</strong> ({{ scope.row.receiverPhone }})
              <p class="address-text">📍 {{ scope.row.receiverAddress }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button 
              type="success" 
              size="large" 
              @click="handleCompleteDelivery(scope.row.id)"
            >
              确认送达
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import employeeApi from '@/api/employee'

const deliveryList = ref([])
const loading = ref(false)

const loadDeliveryOrders = async () => {
  loading.value = true
  try {
    const res = await employeeApi.getDeliveryOrders()
    if (res.code === 0 || res.code === 200) {
      // 假设后端返回纯数组列表
      deliveryList.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

const handleCompleteDelivery = (id) => {
  ElMessageBox.confirm('确认已将商品亲手交给客户？', '送达确认', {
    confirmButtonText: '已送达',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    const res = await employeeApi.completeDelivery({ id })
    if (res.code === 0 || res.code === 200) {
      ElMessage.success('配送完成！辛苦了！')
      loadDeliveryOrders() // 刷新列表
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  })
}

onMounted(() => {
  loadDeliveryOrders()
})
</script>

<style scoped>
.delivery-container { max-width: 1000px; margin: 20px auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; }
.address-box { line-height: 1.6; }
.address-text { color: #E6A23C; font-weight: bold; font-size: 16px; margin: 5px 0 0 0; }
</style>