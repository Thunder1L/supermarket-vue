<template>
  <div class="checkout-page">
    <div class="container">
      <div class="header">
        <h2>确认订单</h2>
      </div>

      <el-row :gutter="20">
        <el-col :span="16">
          
          <el-card shadow="never" class="section-card delivery-section">
            <template #header><span class="card-title">📦 配送方式</span></template>
            <el-radio-group v-model="deliveryType" size="large">
              <el-radio :label="1" border>🏪 门店自提 (免运费)</el-radio>
              <el-radio :label="2" border>🛵 外送上门 (专人配送)</el-radio>
            </el-radio-group>
          </el-card>

          <el-card v-if="deliveryType === 2" shadow="never" class="section-card">
            <template #header>
              <div class="card-header-row">
                <span class="card-title">收货地址</span>
                <el-button link type="primary" @click="openAddrDialog">+ 新增地址</el-button>
              </div>
            </template>
            
            <div v-if="addressList.length === 0" class="empty-addr">
              暂无地址，请先添加收货地址
            </div>
            
            <div class="address-grid">
              <div 
                v-for="addr in addressList" 
                :key="addr.id" 
                class="addr-item"
                :class="{ active: selectedAddressId === addr.id }"
                @click="selectedAddressId = addr.id"
              >
                <div class="name">
                  {{ addr.receiverName }} 
                  <span class="phone">{{ addr.phone }}</span>
                  <el-tag v-if="addr.isDefault" size="small" type="danger" effect="dark" class="tag">默认</el-tag>
                </div>
                <div class="detail">{{ addr.region }} {{ addr.detailAddress }}</div>
                <el-icon v-if="selectedAddressId === addr.id" class="check-icon"><Select /></el-icon>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header><span class="card-title">商品清单</span></template>
            <el-table :data="cartItems" :show-header="false">
              <el-table-column width="80">
                <template #default="{ row }">
                  <el-image :src="row.productImg" style="width: 60px; height: 60px; border-radius: 4px" />
                </template>
              </el-table-column>
              <el-table-column prop="productName" />
              <el-table-column align="right">
                <template #default="{ row }">
                  x {{ row.count }} <span class="item-price">¥{{ row.price }}</span>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="remark-box">
              <el-input v-model="remark" placeholder="订单备注 (选填，如：请放丰巢柜)" />
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="always" class="checkout-panel">
            <div class="summary-row">
              <span>商品总价</span>
              <span>¥ {{ goodsTotal }}</span>
            </div>
            
            <div class="summary-row">
              <span>运费</span>
              <span>{{ deliveryType === 2 ? '¥ 5.00 (或免邮)' : '¥ 0.00' }}</span> 
            </div>

            <div class="summary-row">
              <span>优惠券</span>
              <el-select v-model="selectedCouponId" placeholder="不使用" clearable size="small" style="width: 140px">
                <el-option 
                  v-for="c in validCoupons" 
                  :key="c.id" 
                  :label="`${c.name} (-${c.amount})`" 
                  :value="c.id" 
                />
              </el-select>
            </div>
            
            <el-divider />
            
            <div class="final-row">
              <span class="label">应付总额:</span>
              <span class="price">¥ {{ finalPrice }}</span>
            </div>

            <div class="pay-methods">
              <div 
                class="pay-item" :class="{ active: payMethod === 1 }" 
                @click="payMethod = 1"
              >
                <el-icon color="#09bb07"><ChatDotRound /></el-icon> 微信/支付宝
              </div>
              <div 
                class="pay-item" :class="{ active: payMethod === 2 }" 
                @click="payMethod = 2"
              >
                <el-icon color="#f56c6c"><Wallet /></el-icon> 余额支付
                <span class="balance-text">(¥{{ userBalance }})</span>
              </div>
            </div>

            <el-button type="danger" size="large" class="pay-btn" :loading="submitting" @click="handlePay">
              提交订单
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="addrDialogVisible" title="新增收货地址" width="450px">
      <el-form :model="addrForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addrForm.receiverName" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addrForm.phone" placeholder="手机号码" />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="addrForm.region" placeholder="省/市/区" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addrForm.detailAddress" type="textarea" placeholder="街道门牌号" />
        </el-form-item>
        <el-form-item label="默认">
          <el-switch v-model="addrForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addrDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="payDialogVisible" title="微信 / 支付宝扫码支付" width="350px" center :close-on-click-modal="false" :show-close="false">
      <div style="text-align: center;">
        <h3 style="color: #f56c6c; margin-bottom: 20px;">需支付: ¥ {{ finalPrice }}</h3>
        <el-image 
          style="width: 200px; height: 200px; border: 1px solid #eee; border-radius: 8px;" 
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MockPayment" 
        />
        <p style="color: #666; font-size: 14px; margin-top: 15px;">请使用手机扫码完成支付</p>
      </div>
      <template #footer>
        <span class="dialog-footer" style="display: flex; justify-content: space-between;">
          <el-button @click="handleCancelPay">稍后支付</el-button>
          <el-button type="success" :loading="paying" @click="handleConfirmPay">我已完成支付</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Select, ChatDotRound, Wallet } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAddressList, addAddress } from '@/api/address'
import { getMyCoupons } from '@/api/coupon'
import { getCartList, checkout } from '@/api/cart'
import { getUserInfo } from '@/api/user' 
// 🚨 引入模拟支付接口，请确保 src/api/order.js 里有这个方法
import { mockPay } from '@/api/order' 

const router = useRouter()
const route = useRoute()

const addressList = ref([])
const selectedAddressId = ref(null)
const cartItems = ref([])
const couponList = ref([])
const selectedCouponId = ref(null)
const remark = ref('')

const deliveryType = ref(2) 
const payMethod = ref(1)    
const userBalance = ref('0.00') 
const submitting = ref(false)

const addrDialogVisible = ref(false)
const addrForm = reactive({
  receiverName: '', phone: '', region: '', detailAddress: '', isDefault: 0
})

// 🚨 模拟收银台专属状态
const payDialogVisible = ref(false)
const paying = ref(false)
const createdOrderId = ref(null)

const cartIdsStr = route.query.cartIds
const targetCartIds = cartIdsStr ? cartIdsStr.split(',').map(Number) : []

onMounted(async () => {
  if (targetCartIds.length === 0) {
    ElMessage.warning('没有选择商品')
    router.push('/cart')
    return
  }
  await Promise.all([loadAddress(), loadCart(), loadCoupons(), loadUserBalance()])
})

// --- 加载数据 ---
const loadUserBalance = async () => {
  try {
    const res = await getUserInfo()
    if (res.code === 0 || res.code === 200) {
      userBalance.value = res.data.balance || '0.00'
    }
  } catch (e) {
    console.warn('获取用户余额失败，请确保后端的 getUserInfo 接口正常工作')
  }
}

const loadAddress = async () => {
  const res = await getAddressList()
  if (res.code === 0 || res.code === 200) {
    addressList.value = res.data
    if (!selectedAddressId.value && addressList.value.length > 0) {
      const def = addressList.value.find(a => a.isDefault)
      selectedAddressId.value = def ? def.id : addressList.value[0].id
    }
  }
}

const loadCart = async () => {
  const res = await getCartList()
  if (res.code === 0 || res.code === 200) {
    cartItems.value = res.data.filter(item => targetCartIds.includes(item.id))
  }
}

const loadCoupons = async () => {
  const res = await getMyCoupons()
  if (res.code === 0 || res.code === 200) couponList.value = res.data
}

// --- 计算逻辑 ---
const goodsTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(2)
})

const validCoupons = computed(() => {
  return couponList.value.filter(c => parseFloat(goodsTotal.value) >= c.minSpend)
})

const finalPrice = computed(() => {
  let total = parseFloat(goodsTotal.value)
  if (selectedCouponId.value) {
    const coupon = couponList.value.find(c => c.id === selectedCouponId.value)
    if (coupon) total -= coupon.amount
  }
  return total < 0 ? '0.00' : total.toFixed(2)
})

// --- 地址操作 ---
const openAddrDialog = () => {
  addrDialogVisible.value = true
  Object.assign(addrForm, { receiverName: '', phone: '', region: '', detailAddress: '', isDefault: 0 })
}

const saveAddress = async () => {
  if(!addrForm.receiverName || !addrForm.phone) return ElMessage.warning('请填写完整信息')
  const res = await addAddress(addrForm)
  if(res.code === 0 || res.code === 200) {
    ElMessage.success('地址添加成功')
    addrDialogVisible.value = false
    await loadAddress() 
    if(addressList.value.length === 1) {
      selectedAddressId.value = addressList.value[0].id
    }
  } else {
    ElMessage.error(res.msg)
  }
}

// --- 🚨 核心提交订单逻辑 ---
const handlePay = async () => {
  if (deliveryType.value === 2 && !selectedAddressId.value) {
    return ElMessage.warning('请选择外送收货地址')
  }

  if (payMethod.value === 2 && parseFloat(finalPrice.value) > parseFloat(userBalance.value)) {
    return ElMessage.error(`您的余额不足 (仅剩 ¥${userBalance.value})，请充值或更换支付方式`)
  }
  
  submitting.value = true
  try {
    const payload = {
      cartIds: targetCartIds,
      addressId: deliveryType.value === 2 ? selectedAddressId.value : null,
      remark: remark.value,
      couponId: selectedCouponId.value,
      deliveryType: deliveryType.value,
      payMethod: payMethod.value
    }
    
    const res = await checkout(payload)
    if (res.code === 0 || res.code === 200) {
      // 获取后端刚生成的订单ID
      createdOrderId.value = res.data.orderId || res.data 
      
      if (payMethod.value === 1) {
        // 如果是微信/支付宝，呼出收银台弹窗！
        payDialogVisible.value = true
      } else {
        // 如果是余额支付，直接扣款成功跳走
        ElMessage.success('余额支付成功！订单已生成')
        router.push('/orders') 
      }
    } else {
      ElMessage.error(res.msg || '结算失败')
    }
  } finally {
    submitting.value = false
  }
}

// --- 🚨 模拟收银台交互事件 ---
const handleConfirmPay = async () => {
  if (!createdOrderId.value) return ElMessage.error('订单异常，缺失ID')
  paying.value = true
  try {
    // 调后端的 mockPay 接口把状态从 0 改为 1
    const res = await mockPay({ orderId: createdOrderId.value })
    if (res.code === 0 || res.code === 200) {
      ElMessage.success('扫码支付成功！')
      payDialogVisible.value = false
      router.push('/orders')
    } else {
      ElMessage.error(res.msg || '支付状态确认失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    paying.value = false
  }
}

const handleCancelPay = () => {
  payDialogVisible.value = false
  ElMessage.warning('已取消支付，订单已生成，请尽快付款')
  router.push('/orders')
}
</script>

<style scoped>
/* 保持原本的优秀样式 */
.checkout-page { padding: 20px 0; background: #f5f7fa; min-height: 100vh; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 10px; }
.header h2 { margin-bottom: 20px; color: #333; }

.section-card { margin-bottom: 20px; }
.delivery-section { border-left: 4px solid #409eff; }
.card-header-row { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-weight: bold; }

.address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
.addr-item { 
  border: 1px solid #dcdfe6; border-radius: 4px; padding: 15px; cursor: pointer; position: relative;
  transition: all 0.3s; background: #fff;
}
.addr-item:hover { border-color: #c0c4cc; }
.addr-item.active { border-color: #f56c6c; background: #fffcfc; }
.check-icon { position: absolute; right: 0; bottom: 0; background: #f56c6c; color: #fff; padding: 2px; border-top-left-radius: 4px; }
.name { font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; }
.tag { margin-left: 8px; transform: scale(0.9); }
.phone { font-weight: normal; color: #666; margin-left: 8px; }
.detail { color: #666; font-size: 13px; line-height: 1.4; }
.empty-addr { text-align: center; color: #999; padding: 20px; }

.checkout-panel { position: sticky; top: 80px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #666; font-size: 14px; align-items: center; }
.final-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; }
.final-row .label { font-weight: bold; font-size: 16px; }
.final-row .price { color: #f56c6c; font-size: 28px; font-weight: bold; }

.pay-methods { display: flex; gap: 10px; margin: 20px 0; }
.pay-item { 
  flex: 1; border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px; 
  display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: 0.2s;
}
.pay-item.active { border-color: #f56c6c; color: #f56c6c; background: #fffcfc; font-weight: bold; }
.balance-text { font-size: 12px; color: #999; font-weight: normal; margin-left: 5px; }

.pay-btn { width: 100%; font-weight: bold; }
.remark-box { margin-top: 20px; }
</style>