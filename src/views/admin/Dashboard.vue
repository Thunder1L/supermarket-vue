<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 1. 欢迎语 -->
    <div class="welcome-section">
      <h2>早安，管理员！👋</h2>
      <p>今天是 {{ currentDate }}，祝你工作愉快。</p>
    </div>

    <!-- 2. 数据统计卡片 -->
    <el-row :gutter="20" class="data-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">今日销售额</div>
              <div class="value">¥ {{ stats.todaySales }}</div>
            </div>
            <el-icon class="icon-box blue"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">累计订单</div>
              <div class="value">{{ stats.totalOrders }}</div>
            </div>
            <el-icon class="icon-box green"><List /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">在售商品</div>
              <div class="value">{{ stats.totalProducts }}</div>
            </div>
            <el-icon class="icon-box orange"><Goods /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">注册用户</div>
              <div class="value">{{ stats.totalUsers }}</div>
            </div>
            <el-icon class="icon-box purple"><User /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 3. 图表与最新订单 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>近七日销售趋势</span>
            </div>
          </template>
          <div id="salesChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>最新订单</span>
              <el-button link type="primary" @click="$router.push('/admin/order')">全部</el-button>
            </div>
          </template>
          
          <el-table :data="recentOrders" style="width: 100%" size="small">
            <el-table-column prop="orderNo" label="单号" width="130" show-overflow-tooltip />

            <!-- 【修正 3】这里改成了 totalAmount -->
            <el-table-column prop="totalAmount" label="金额">
              <template #default="scope">
                <span style="color: #f56c6c">¥{{ scope.row.totalAmount }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag size="small" :type="scope.row.status === '3' ? 'success' : 'warning'">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// 【修正 1】引入 nextTick
import { ref, onMounted, reactive, onBeforeUnmount, nextTick } from 'vue'
import { Money, List, Goods, User } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getStats } from '@/api/dashboard'
import { ElMessage } from 'element-plus'

const currentDate = dayjs().format('YYYY年MM月DD日')

const stats = reactive({
  todaySales: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalUsers: 0
})

const loading = ref(true)
const recentOrders = ref([])
let myChart = null

onMounted(() => {
  // 【修正 2】这里必须调用 loadData，而不是 initChart
  loadData()
  window.addEventListener('resize', handleResize)
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStats()
    if (res.code === 0) {
      const data = res.data
      
      // 赋值数据
      stats.todaySales = data.todaySales
      stats.totalOrders = data.totalOrders
      stats.totalProducts = data.totalProducts
      stats.totalUsers = data.totalUsers
      
      recentOrders.value = data.recentOrders

      // 处理图表数据
      const dates = data.dateList && data.dateList.length > 0 ? data.dateList : ['暂无数据']
      const sales = data.salesList && data.salesList.length > 0 ? data.salesList : [0]

      // 渲染图表
      nextTick(() => {
         initChart(dates, sales)
      })
    }
  } catch (error) {
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const initChart = (dates, sales) => {
  const chartDom = document.getElementById('salesChart')
  if (!chartDom) return
  
  if (myChart != null) {
      myChart.dispose();
  }
  
  myChart = echarts.init(chartDom)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.5)' },
            { offset: 1, color: 'rgba(64,158,255,0.01)' }
          ])
        },
        data: sales
      }
    ]
  }
  myChart.setOption(option)
}

const handleResize = () => {
  myChart && myChart.resize()
}

// 辅助函数：状态翻译
const getStatusText = (status) => {
  // 你的后端返回的是 Integer (0,1,2,3)，这里需要转义一下
  const map = { 0: '待付款', 1: '待发货', 2: '已发货', 3: '已完成', 4: '已取消' }
  return map[status] || status
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) myChart.dispose()
})
</script>

<style scoped>
.dashboard-container { padding: 20px; } /* 稍微加点内边距 */
.welcome-section { margin-bottom: 20px; }
.welcome-section h2 { margin-bottom: 5px; color: #333; }
.welcome-section p { color: #666; font-size: 14px; }

.data-row { margin-bottom: 20px; }
.data-card { border: none; border-radius: 8px; cursor: pointer; transition: transform 0.3s; }
.data-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

.card-content { display: flex; justify-content: space-between; align-items: center; }
.text-area .label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.text-area .value { font-size: 24px; font-weight: bold; color: #303133; }

.icon-box { width: 50px; height: 50px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 24px; }
.blue { background: #ecf5ff; color: #409eff; }
.green { background: #f0f9eb; color: #67c23a; }
.orange { background: #fdf6ec; color: #e6a23c; }
.purple { background: #f4f4f5; color: #909399; }

.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>