<template>
  <div class="payment-page">
    <div class="pay-card">
      
      <!-- 支付中状态 -->
      <div v-if="!isSuccess">
        <div class="pay-header">
          <div class="title">收银台</div>
          <div class="subtitle">订单有效期 <span class="timer">{{ countdown }}s</span></div>
        </div>

        <div class="amount-box">
          <span class="symbol">¥</span>
          <span class="num">{{ amount }}</span>
        </div>

        <div class="qr-container">
          <div class="qr-box">
            <!-- 模拟二维码 -->
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SupermarketPay" />
            <div class="qr-tip">扫码支付，安全快捷</div>
          </div>
        </div>

        <div class="pay-methods">
          <div 
            v-for="m in methods" :key="m.key" 
            class="method-item" 
            :class="{ active: payMethod === m.key }"
            @click="payMethod = m.key"
          >
            <el-icon :color="m.color" size="24"><component :is="m.icon" /></el-icon>
            <span class="name">{{ m.name }}</span>
            <el-icon class="check" v-if="payMethod === m.key"><Select /></el-icon>
          </div>
        </div>

        <el-button type="primary" class="pay-btn" :loading="paying" @click="handlePay">
          确认支付 ¥{{ amount }}
        </el-button>
      </div>

      <!-- 支付成功状态 -->
      <div v-else class="success-box">
        <el-icon class="success-icon" color="#67c23a"><CircleCheckFilled /></el-icon>
        <h2>支付成功</h2>
        <p>您的余额已更新</p>
        <el-button type="primary" @click="$router.replace('/profile')">返回个人中心</el-button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { topUp } from '@/api/user'
import { ElMessage } from 'element-plus'
import { Wallet, Select, CircleCheckFilled, ChatDotRound, Platform } from '@element-plus/icons-vue'
import { getCardList, addCard } from '@/api/card' // 引用 card.js

const route = useRoute()
const router = useRouter()
const amount = ref(0)
const payMethod = ref('alipay')
const paying = ref(false)
const isSuccess = ref(false)
const countdown = ref(300) // 5分钟倒计时
let timer = null

const methods = [
  { key: 'alipay', name: '支付宝', icon: Platform, color: '#1677ff' }, // 暂用 Platform 图标代替
  { key: 'wechat', name: '微信支付', icon: ChatDotRound, color: '#07c160' },
  { key: 'card', name: '银行卡', icon: Wallet, color: '#ff9c6e' }
]

onMounted(() => {
  amount.value = route.query.amount || 0
  startTimer()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const startTimer = () => {
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
  }, 1000)
}

const handlePay = async () => {
  paying.value = true
  // 模拟网络延迟
  setTimeout(async () => {
    try {
      const res = await topUp(Number(amount.value))
      if (res.code === 0) {
        isSuccess.value = true
      } else {
        ElMessage.error(res.msg)
        paying.value = false
      }
    } catch (e) {
      paying.value = false
    }
  }, 1500)
}
</script>

<style scoped>
.payment-page { min-height: 100vh; background: #f0f2f5; display: flex; justify-content: center; padding-top: 50px; }
.pay-card { width: 420px; background: #fff; padding: 30px; border-radius: 12px; height: fit-content; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; }

.pay-header .title { font-size: 18px; font-weight: bold; }
.pay-header .subtitle { font-size: 13px; color: #999; margin-top: 5px; }
.timer { color: #f56c6c; font-weight: bold; }

.amount-box { margin: 30px 0; }
.symbol { font-size: 20px; font-weight: bold; }
.num { font-size: 40px; font-weight: bold; }

.qr-box { background: #f8f9fa; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 20px; }
.qr-box img { width: 120px; height: 120px; display: block; margin: 0 auto; }
.qr-tip { font-size: 12px; color: #999; margin-top: 8px; }

.method-item { display: flex; align-items: center; padding: 12px 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 12px; cursor: pointer; transition: 0.2s; }
.method-item:hover { border-color: #409eff; }
.method-item.active { border-color: #409eff; background: #ecf5ff; }
.method-item .name { margin-left: 10px; font-weight: 500; flex: 1; text-align: left; }

.pay-btn { width: 100%; height: 44px; font-size: 16px; margin-top: 10px; }

.success-box { padding: 40px 0; }
.success-icon { font-size: 70px; margin-bottom: 20px; }
.success-box h2 { color: #333; margin-bottom: 10px; }
.success-box p { color: #999; margin-bottom: 30px; }
</style>