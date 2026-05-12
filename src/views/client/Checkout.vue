<template>
  <div class="checkout-page">
    <div class="container">
      <div class="header">
        <h2>确认订单</h2>
      </div>

      <el-row :gutter="20">
        <el-col :span="16">
          <!-- 1. 收货地址 -->
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="card-header-row">
                <span class="card-title">收货地址</span>
                <!-- 这里点击直接弹出 Dialog，而不是跳转 -->
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
                
                <!-- 选中图标 -->
                <el-icon v-if="selectedAddressId === addr.id" class="check-icon"><Select /></el-icon>
              </div>
            </div>
          </el-card>

          <!-- 2. 商品清单 -->
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
          <!-- 3. 结算面板 -->
          <el-card shadow="always" class="checkout-panel">
            <div class="summary-row">
              <span>商品总价</span>
              <span>¥ {{ goodsTotal }}</span>
            </div>
            
            <div class="summary-row">
              <span>运费</span>
              <span>¥ 0.00</span>
            </div>

            <!-- 优惠券选择 -->
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

            <!-- 支付方式 -->
            <div class="pay-methods">
              <div 
                class="pay-item" :class="{ active: payType === 1 }" 
                @click="payType = 1"
              >
                <el-icon color="#09bb07"><ChatDotRound /></el-icon> 微信
              </div>
              <div 
                class="pay-item" :class="{ active: payType === 2 }" 
                @click="payType = 2"
              >
                <el-icon color="#1677ff"><Wallet /></el-icon> 支付宝
              </div>
            </div>

            <el-button type="danger" size="large" class="pay-btn" :loading="submitting" @click="handlePay">
              提交订单
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 4. 新增地址弹窗 -->
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Select, ChatDotRound, Wallet } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// API 引入
import { getAddressList, addAddress } from '@/api/address'
import { getMyCoupons } from '@/api/coupon'
import { getCartList, checkout } from '@/api/cart' // 注意：提交订单用 checkout

const router = useRouter()
const route = useRoute()

const addressList = ref([])
const selectedAddressId = ref(null)
const cartItems = ref([])
const couponList = ref([])
const selectedCouponId = ref(null)
const payType = ref(1) 
const submitting = ref(false)
const remark = ref('')

// 地址弹窗相关
const addrDialogVisible = ref(false)
const addrForm = reactive({
  receiverName: '', phone: '', region: '', detailAddress: '', isDefault: 0
})

// 解析 URL 参数 cartIds=1,2,3
const cartIdsStr = route.query.cartIds
const targetCartIds = cartIdsStr ? cartIdsStr.split(',').map(Number) : []

onMounted(async () => {
  if (targetCartIds.length === 0) {
    ElMessage.warning('没有选择商品')
    router.push('/cart')
    return
  }
  await Promise.all([loadAddress(), loadCart(), loadCoupons()])
})

// --- 加载数据 ---
const loadAddress = async () => {
  const res = await getAddressList()
  if (res.code === 0) {
    addressList.value = res.data
    // 默认选中
    if (!selectedAddressId.value && addressList.value.length > 0) {
      const def = addressList.value.find(a => a.isDefault)
      selectedAddressId.value = def ? def.id : addressList.value[0].id
    }
  }
}

const loadCart = async () => {
  const res = await getCartList()
  if (res.code === 0) {
    // 过滤出用户勾选的商品
    cartItems.value = res.data.filter(item => targetCartIds.includes(item.id))
  }
}

const loadCoupons = async () => {
  const res = await getMyCoupons()
  if (res.code === 0) couponList.value = res.data
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
  if(res.code === 0) {
    ElMessage.success('地址添加成功')
    addrDialogVisible.value = false
    await loadAddress() // 刷新列表
    // 如果是第一个地址，自动选中
    if(addressList.value.length === 1) {
      selectedAddressId.value = addressList.value[0].id
    }
  } else {
    ElMessage.error(res.msg)
  }
}

// --- 提交订单 ---
const handlePay = async () => {
  if (!selectedAddressId.value) return ElMessage.warning('请选择收货地址')
  
  submitting.value = true
  try {
    const payload = {
      cartIds: targetCartIds,
      addressId: selectedAddressId.value,
      remark: remark.value
      // 如果后端支持优惠券和支付方式，这里可以加上:
      // couponId: selectedCouponId.value,
      // payType: payType.value
    }
    
    // 调用后端的 checkout 接口
    const res = await checkout(payload)
    if (res.code === 0) {
      ElMessage.success('下单成功！')
      router.push('/orders')
    } else {
      ElMessage.error(res.msg)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page { padding: 20px 0; background: #f5f7fa; min-height: 100vh; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 10px; }
.header h2 { margin-bottom: 20px; color: #333; }

.section-card { margin-bottom: 20px; }
.card-header-row { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-weight: bold; }

/* 地址网格 */
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

/* 结算面板 */
.checkout-panel { position: sticky; top: 80px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #666; font-size: 14px; align-items: center; }
.final-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; }
.final-row .label { font-weight: bold; font-size: 16px; }
.final-row .price { color: #f56c6c; font-size: 28px; font-weight: bold; }

/* 支付方式 */
.pay-methods { display: flex; gap: 10px; margin: 20px 0; }
.pay-item { 
  flex: 1; border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px; 
  display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer;
}
.pay-item.active { border-color: #409eff; color: #409eff; background: #ecf5ff; }

.pay-btn { width: 100%; font-weight: bold; }
.remark-box { margin-top: 20px; }
</style>