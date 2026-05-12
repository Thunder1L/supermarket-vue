<template>
  <div class="scan-verify-container">
    <div class="header">当前订单核销</div>
    
    <div class="status-box" :class="scanStatus">
      {{ statusText }}
    </div>

    <audio ref="successAudio" src="/audio/success.mp3" preload="auto"></audio>
    <audio ref="errorAudio" src="/audio/error.mp3" preload="auto"></audio>

    <div class="product-list">
      <div v-for="item in orderItems" :key="item.id" class="item">
        <p>{{ item.productName }}</p>
        <p>需核销: {{ item.quantity }} | 已核销: <span style="color: green">{{ item.scanned }}</span></p>
      </div>
    </div>
    
    <button class="submit-btn" :disabled="isSubmitting" @click="handleManualSubmit">
      {{ isSubmitting ? '处理中...' : '手动确认核销' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import request from '@/utils/request'; // 复用你现有的 axios 封装

// 状态变量
const orderItems = ref([ /* 从后端拉取的订单明细列表 */ ]);
const scanStatus = ref('idle'); // idle, success, error
const statusText = ref('请使用 PDA 扫描商品条码');
const isSubmitting = ref(false);

const successAudio = ref(null);
const errorAudio = ref(null);

// 扫码枪拦截逻辑
let barcode = '';
let lastTime = 0;

const handleScanEvent = (e) => {
  const nextTime = new Date().getTime();
  
  // 如果是回车键，且按键间隔非常短（PDA扫码通常在几十毫秒内完成一串字符，手动打字没这么快）
  if (e.key === 'Enter' && barcode !== '') {
    if (nextTime - lastTime < 500) {
      processBarcode(barcode);
    }
    barcode = ''; // 清空准备下一次扫码
  } else {
    // 限制只能录入英文和数字，排除其他功能键
    if (/^[a-zA-Z0-9]$/.test(e.key)) {
      barcode += e.key;
    }
    lastTime = nextTime;
  }
};

onMounted(() => {
  // 挂载全局键盘监听，实现“盲扫”
  window.addEventListener('keydown', handleScanEvent);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleScanEvent);
});

// 处理扫到的条形码
const processBarcode = async (code) => {
  // 1. 在当前订单中查找该商品
  const item = orderItems.value.find(i => i.barcode === code);
  
  if (item) {
    if (item.scanned < item.quantity) {
      item.scanned++;
      scanStatus.value = 'success';
      statusText.value = `扫码成功: ${item.productName}`;
      playFeedback(true);
      
      // 可以在这里触发单件商品的异步扣减/核销接口...
    } else {
      triggerError('该商品已全部核销，请勿多扫！');
    }
  } else {
    triggerError('条码不匹配，非本单商品！');
  }
};

// 硬件反馈：声音与震动
const playFeedback = (isSuccess) => {
  if (isSuccess) {
    successAudio.value?.play();
  } else {
    errorAudio.value?.play();
    // 调用 H5 震动 API (PDA 浏览器通常支持)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // 震动-停-震动
    }
  }
};

const triggerError = (msg) => {
  scanStatus.value = 'error';
  statusText.value = msg;
  playFeedback(false);
};

// 手动兜底提交 (防抖)
const handleManualSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await request.post('/api/employee/order/verify', { /* 提交数据 */ });
    alert('核销成功');
  } catch (error) {
    // 错误统一由 request.js 拦截
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 针对线下 PDA 的粗犷 UI：字要大，对比度要高，按钮要好点 */
.scan-verify-container { padding: 10px; font-size: 18px; }
.status-box { padding: 20px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 8px;}
.status-box.idle { background: #f0f2f5; color: #333; }
.status-box.success { background: #e1f3d8; color: #67c23a; }
.status-box.error { background: #fde2e2; color: #f56c6c; }
.submit-btn { width: 100%; padding: 15px; font-size: 20px; background-color: #409eff; color: white; border: none; border-radius: 8px; margin-top: 20px;}
.submit-btn:disabled { background-color: #a0cfff; }
</style>