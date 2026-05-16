<template>
  <div class="page-container">
    <el-card shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="queryParams.orderNo" placeholder="输入订单号" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable @change="handleSearch" style="width: 120px">
            <el-option label="待付款" :value="0" />
            <el-option label="待发货" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 订单表格 -->
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <!-- 展开行：显示商品详情 -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="expand-wrapper">
              <h4>订单商品明细：</h4>
              <el-table :data="props.row.items" size="small" border>
                <el-table-column label="商品图" width="80" align="center">
                  <template #default="scope">
                    <el-image :src="scope.row.productImg" style="width: 40px; height: 40px" />
                  </template>
                </el-table-column>
                <el-table-column prop="productName" label="商品名称" />
                <el-table-column prop="price" label="单价" width="100" />
                <el-table-column prop="count" label="数量" width="80" />
                <el-table-column prop="totalPrice" label="小计" width="100" />
              </el-table>
              <div class="receiver-info" style="margin-top: 10px; color: #666; font-size: 13px;">
                收货信息：
                {{ props.row.receiverName || '未录入姓名' }} ，
                {{ props.row.receiverPhone || '未录入手机号' }} ，
                {{ props.row.receiverAddress || '未录入地址' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="orderNo" label="订单号" min-width="150" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="scope">
            <span style="color: #f56c6c">¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="下单时间" width="180" />

        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 1" 
              type="success" 
              size="small" 
              @click="handleShip(scope.row)"
            >
              发货
            </el-button>
            
            <el-button 
              v-if="scope.row.status === 3 || scope.row.status === 4" 
              type="danger" 
              link 
              size="small" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="queryParams.size"
          v-model:current-page="queryParams.page"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 【修正】引用正确的 API 文件
import { getOrderList, shipOrder, deleteOrder } from '@/api/adminOrder'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  size: 10,
  orderNo: '',
  status: null
})

onMounted(() => {
  loadData()
})

// const loadData = async () => {
//   loading.value = true
//   try {
//     const res = await getOrderList(queryParams)
//     if (res.code === 0) {
//       // 格式化一下时间
//       res.data.records.forEach(item => {
//         item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
//       })
//       tableData.value = res.data.records
//       total.value = res.data.total
//     }
//   } finally {
//     loading.value = false
//   }
// }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrderList(queryParams)
    
    // 【修复1】兼容判断：200 或者 0 都认为是成功
    if (res.code === 200 || res.code === 0) {
      // 格式化一下时间
      if (res.data && res.data.records) {
        res.data.records.forEach(item => {
          // 如果后端返回的时间格式本就是正确的，这步其实可以省略
          if(item.createTime) {
              item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
          }
        })
        tableData.value = res.data.records
        total.value = res.data.total
      } else {
        tableData.value = []
        total.value = 0
      }
    } else {
      // 【修复2】增加静默失败的兜底提示，以后再出 Bug 一眼就能看出来！
      ElMessage.error(res.msg || '获取数据失败，状态码错误：' + res.code)
    }
  } catch (error) {
    console.error('获取订单列表出错:', error)
    ElMessage.error('网络或接口请求异常，请按 F12 查看控制台')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

// 发货
const handleShip = (row) => {
  ElMessageBox.confirm(`确认对订单 ${row.orderNo} 进行发货?`, '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await shipOrder(row.id)
    if (res.code === 200 || res.code === 0) {
      ElMessage.success('发货成功')
      loadData()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该订单记录吗?', '警告', { type: 'warning' })
    .then(async () => {
      const res = await deleteOrder(row.id)
      if (res.code === 200 || res.code === 0) {
        ElMessage.success('删除成功')
        loadData()
      }
    })
}

// 辅助函数
const getStatusText = (s) => {
  const map = { 0: '待付款', 1: '待发货', 2: '已发货', 3: '已完成', 4: '已取消' }
  return map[s] || '未知'
}
const getStatusType = (s) => {
  if (s === 0) return 'danger'
  if (s === 1) return 'warning'
  if (s === 2) return 'primary'
  if (s === 3) return 'success'
  return 'info'
}
</script>

<style scoped>
.page-container { padding: 20px; }
.pagination-box { margin-top: 20px; display: flex; justify-content: flex-end; }
.expand-wrapper { padding: 10px 20px; background: #f8f9fa; }
h4 { margin: 0 0 10px; color: #333; }
</style>