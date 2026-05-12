<template>
  <div class="order-page">
    <div class="container">
      <h2>我的订单</h2>

      <!-- 1. 状态切换 Tabs -->
      <el-tabs v-model="activeStatus" class="custom-tabs" @tab-change="loadData">
        <el-tab-pane label="全部" name="-1"></el-tab-pane>
        <el-tab-pane label="待付款" name="0"></el-tab-pane>
        <el-tab-pane label="待发货" name="1"></el-tab-pane>
        <el-tab-pane label="待收货" name="2"></el-tab-pane>
        <el-tab-pane label="已完成" name="3"></el-tab-pane>
      </el-tabs>

      <!-- 2. 订单列表 -->
      <div v-loading="loading" class="order-list">
        
        <el-empty v-if="!loading && orderList.length === 0" description="暂无相关订单" />

        <div v-else v-for="order in orderList" :key="order.id" class="order-card">
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="header-left">
              <span class="time">{{ formatDate(order.createTime) }}</span>
              <span class="order-no">订单号：{{ order.orderNo }}</span>
            </div>
            <div class="header-right">
              <el-tag :type="getStatusTag(order.status)" effect="light">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
          </div>

          <!-- 商品区域 -->
          <div class="card-body">
            <div v-for="item in order.items" :key="item.id" class="item-row">
              <el-image :src="item.productImg" class="thumb">
                <template #error><el-icon><Picture /></el-icon></template>
              </el-image>
              <div class="info">
                <div class="name">{{ item.productName }}</div>
                <div class="spec">数量: x{{ item.count }}</div>
              </div>
              <div class="price">¥ {{ item.price }}</div>
            </div>
          </div>

          <!-- 地址快照展示 -->
          <div class="address-snapshot">
            <el-icon><Location /></el-icon> 
            <span class="addr-text">
              {{ order.receiverName }} {{ order.receiverPhone }} ({{ order.receiverAddress }})
            </span>
          </div>

          <!-- 底部结算与操作 -->
          <div class="card-footer">
            <div class="total">
              实付：<span class="amount">¥ {{ order.totalAmount }}</span>
            </div>
            
            <div class="actions">
              <!-- 【修复点 1】常驻按钮 -->
              <el-button :icon="Service" size="small" @click="handleContact">联系客服</el-button>
              <el-button size="small" @click="handleAfterSales(order)">申请售后</el-button>

              <!-- 待付款 (0) -->
              <template v-if="order.status === 0">
                <el-button size="small" @click="handleCancel(order)">取消订单</el-button>
                <el-button type="danger" size="small" @click="handlePay(order)">立即支付</el-button>
              </template>

              <!-- 待发货 (1) -->
              <template v-if="order.status === 1">
                <el-button size="small" disabled>等待商家发货</el-button>
              </template>

              <!-- 已发货 (2) -->
              <template v-if="order.status === 2">
                <el-button type="primary" size="small" @click="handleConfirm(order)">确认收货</el-button>
              </template>

              <!-- 已完成 (3) / 已取消 (4) -->
              <template v-if="order.status === 3 || order.status === 4">
                <el-button size="small" @click="handleDelete(order)" disabled>删除记录</el-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Picture, Location, Service } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 引入 API
import { getOrderList, payOrder, cancelOrder, confirmOrder, applyAfterSales } from '@/api/order'
import dayjs from 'dayjs'

const loading = ref(false)
const orderList = ref([])
const activeStatus = ref("-1")

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const statusParam = activeStatus.value === '-1' ? null : Number(activeStatus.value)
    const res = await getOrderList(statusParam)
    if (res.code === 0) {
      orderList.value = res.data
    }
  } finally {
    loading.value = false
  }
}

// --- 操作逻辑 ---

// 联系客服
const handleContact = () => {
  ElMessageBox.alert('客服热线：400-123-4567\n工作时间：9:00 - 18:00', '联系客服', {
    confirmButtonText: '知道了',
    center: true
  })
}

// 申请售后
const handleAfterSales = (order) => {
  if (order.status === 0) return ElMessage.warning('未支付订单无法申请售后')
  if (order.status === 5) return ElMessage.warning('售后正在处理中')

  ElMessageBox.prompt('请输入申请原因', '申请售后', {
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputPattern: /\S/,
    inputErrorMessage: '原因不能为空'
  }).then(async ({ value }) => {
    try {
      const res = await applyAfterSales({ orderId: order.id, reason: value })
      if (res.code === 0) {
        ElMessage.success('申请已提交')
        loadData() // 刷新列表
      } else {
        ElMessage.error(res.msg)
      }
    } catch(e) {}
  })
}

// 支付
const handlePay = (order) => {
  ElMessageBox.confirm(`确认支付 ¥${order.totalAmount}?`, '支付', {
    confirmButtonText: '支付',
    type: 'success'
  }).then(async () => {
    const res = await payOrder(order.id)
    if (res.code === 0) {
      ElMessage.success('支付成功')
      loadData()
    }
  })
}

// 取消
const handleCancel = (order) => {
  ElMessageBox.confirm('确定取消该订单吗?', '提示', { type: 'warning' })
    .then(async () => {
      const res = await cancelOrder(order.id)
      if (res.code === 0) {
        ElMessage.success('订单已取消')
        loadData()
      }
    })
}

// 确认收货
const handleConfirm = (order) => {
  ElMessageBox.confirm('确认收到商品了吗?', '提示', { type: 'info' })
    .then(async () => {
      const res = await confirmOrder(order.id)
      if (res.code === 0) {
        ElMessage.success('交易完成！')
        loadData()
      }
    })
}

const handleDelete = () => {
  ElMessage.info('暂不支持删除订单记录')
}

// --- 工具函数 (这里整合了所有状态) ---

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm')

// 【关键修复】只保留这一个 getStatusText 函数，包含了状态 5
const getStatusText = (s) => {
  const map = { 
    0: '待付款', 
    1: '待发货', 
    2: '已发货', 
    3: '已完成', 
    4: '已取消',
    5: '售后中' // 新增状态
  }
  return map[s] || '未知'
}

const getStatusTag = (s) => {
  if(s===0) return 'danger'
  if(s===1) return 'warning'
  if(s===2) return 'primary'
  if(s===3) return 'success'
  if(s===5) return 'danger' // 售后红色警告
  return 'info'
}
</script>

<style scoped>
.order-page { padding: 20px 0; background: #f5f7fa; min-height: 85vh; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 10px; }
h2 { margin-bottom: 20px; color: #333; }

.custom-tabs { background: #fff; padding: 5px 20px; border-radius: 8px 8px 0 0; }

.order-list { min-height: 300px; }
.order-card {
  background: #fff; margin-top: 15px; border-radius: 8px; padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03); transition: all 0.3s;
}
.order-card:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.08); }

.card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;
}
.time { color: #999; margin-right: 15px; }
.order-no { color: #333; }

.card-body { padding: 15px 0; }
.item-row { display: flex; align-items: center; margin-bottom: 15px; }
.item-row:last-child { margin-bottom: 0; }
.thumb { width: 60px; height: 60px; border-radius: 4px; border: 1px solid #eee; margin-right: 15px; }
.info { flex: 1; }
.name { font-size: 14px; color: #333; margin-bottom: 5px; }
.spec { font-size: 12px; color: #999; }
.price { font-weight: bold; color: #333; }

.address-snapshot {
  font-size: 12px; color: #666; background: #f9f9f9; padding: 8px 10px; border-radius: 4px;
  display: flex; align-items: center; gap: 5px; margin-bottom: 10px;
}

.card-footer {
  padding: 15px 0; border-top: 1px solid #f0f0f0;
  display: flex; justify-content: space-between; align-items: center;
}
.amount { color: #f56c6c; font-size: 18px; font-weight: bold; }
.actions { 
  display: flex; 
  gap: 10px; 
  flex-wrap: wrap; 
  justify-content: flex-end;
}
</style>