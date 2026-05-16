<template>
  <div class="verify-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>📦 订单分拣与核销</span>
          <el-button type="primary" plain @click="$router.push('/employee/dashboard')">返回工作台</el-button>
        </div>
      </template>
      
      <div class="input-area">
        <el-input
          v-model="orderNo"
          size="large"
          placeholder="请使用扫码枪扫描订单条码，或手动输入订单号"
          class="scan-input"
          clearable
          @keyup.enter="handleVerify"
        >
          <template #prefix>
            <el-icon><FullScreen /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleVerify" :loading="loading">
              立即核销
            </el-button>
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import employeeApi from '@/api/employee' // 我们接下来要建的API文件

const orderNo = ref('')
const loading = ref(false)

const handleVerify = async () => {
  if (!orderNo.value.trim()) {
    return ElMessage.warning('订单号不能为空！')
  }
  
  loading.value = true
  try {
    const res = await employeeApi.verifyOrder(orderNo.value.trim())
    // 兼容 0 和 200 状态码
    if (res.code === 0 || res.code === 200) {
      ElMessageBox.alert(`订单号：${orderNo.value}<br/>状态：已成功核销出库！`, '✅ 核销成功', {
        dangerouslyUseHTMLString: true,
        type: 'success'
      })
      orderNo.value = '' // 清空输入框，准备扫下一个
    } else {
      ElMessage.error(res.msg || '核销失败，请检查订单状态')
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.verify-container { max-width: 800px; margin: 20px auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; }
.input-area { margin: 40px 0; text-align: center; }
.scan-input { width: 100%; max-width: 600px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
:deep(.el-input-group__append) { background-color: #38ef7d; color: white; border: none; font-weight: bold; }
:deep(.el-input-group__append:hover) { background-color: #11998e; }
</style>