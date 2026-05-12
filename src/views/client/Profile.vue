<template>
  <div class="profile-page">
    <div class="container">
      <el-row :gutter="20">
        
        <!-- 左侧：个人概览 -->
        <el-col :span="6">
          <el-card class="user-card" shadow="hover">
            <div class="avatar-wrapper">
              <el-upload
                class="avatar-uploader"
                action="/api/file/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                :headers="uploadHeaders"
              >
                <div class="mask"><el-icon><Camera /></el-icon></div>
                <el-avatar :size="100" :src="form.avatar" class="real-avatar">
                  {{ form.username ? form.username.charAt(0).toUpperCase() : 'U' }}
                </el-avatar>
              </el-upload>
            </div>
            
            <h3 class="username">{{ form.username || '用户' }}</h3>
            <div class="wallet-tag">
              余额: <span class="money">¥ {{ Number(form.balance).toFixed(2) }}</span>
            </div>
            
            <div class="info-list">
              <div class="item"><el-icon><Iphone /></el-icon> {{ form.phone || '未绑定' }}</div>
              <div class="item"><el-icon><Calendar /></el-icon> 注册于 {{ formatDate(form.createTime) }}</div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：功能区 -->
        <el-col :span="18">
          <el-card shadow="hover">
            <el-tabs v-model="activeTab">
              
              <!-- Tab 1: 个人资料 -->
              <el-tab-pane label="个人资料" name="info">
                <el-form label-width="80px" style="max-width: 500px; margin-top: 20px">
                  <el-form-item label="昵称">
                    <el-input v-model="form.username" />
                  </el-form-item>
                  
                  <el-form-item label="生日">
                    <el-date-picker 
                      v-model="birthdayDate" 
                      type="date" 
                      placeholder="设置生日 (有惊喜)" 
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                    <div class="tips">设置生日后，每年生日当天我们会自动发送大额优惠券！🎂</div>
                  </el-form-item>

                  <el-form-item label="预设头像">
                    <div class="preset-list">
                      <el-avatar 
                        v-for="img in presets" :key="img" :src="img" 
                        :size="40" 
                        class="preset-item"
                        @click="updateAvatar(img)"
                      />
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="saveInfo">保存修改</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- Tab 2: 我的钱包 -->
              <el-tab-pane label="我的钱包" name="wallet">
              <div class="wallet-container">
                
                <!-- 1. 余额 & 提现 -->
                <div class="balance-section">
                  <div class="balance-card">
                    <div class="card-title">账户余额 (CNY)</div>
                    <div class="card-amount">{{ form.balance || '0.00' }}</div>
                    <div class="card-actions">
                      <el-button class="action-btn" @click="openTopUpDialog">充值</el-button>
                      <el-button class="action-btn outline" @click="openWithdrawDialog">提现</el-button>
                    </div>
                  </div>
                </div>

                <!-- 2. 会员卡 (独立区域) -->
                <div class="cards-section">
                  <div class="sec-header">
                    <h3>会员权益</h3>
                    <span class="pts" v-if="form.memberNo">当前积分: {{ form.points || 0 }}</span>
                  </div>
                  
                  <!-- 已激活 -->
                  <div v-if="form.memberNo" class="bank-card member-card">
                    <div class="card-icon"><el-icon><Trophy /></el-icon></div>
                    <div class="card-info">
                      <div class="bank-name">SuperMarket 尊享会员</div>
                      <div class="card-type">全场商品 9.8 折</div>
                      <div class="card-num">NO. {{ form.memberNo }}</div>
                    </div>
                    <div class="watermark">VIP</div>
                  </div>

                  <!-- 未激活 -->
                  <div v-else class="activate-box">
                    <div class="txt">
                      <h4>开通会员，立享特权</h4>
                      <p>送100积分 · 专属折扣 · 生日礼包</p>
                    </div>
                    <el-button type="warning" round @click="handleActivateMember">立即免费激活</el-button>
                  </div>
                </div>

                <!-- 3. 银行卡管理 (独立区域) -->
                <div class="cards-section">
                  <h3>我的银行卡</h3>
                  <el-row :gutter="15">
                    <el-col :span="12" v-for="card in bankCards" :key="card.id">
                      <div class="bank-card blue-card">
                        <div class="card-icon"><el-icon><CreditCard /></el-icon></div>
                        <div class="card-info">
                          <div class="bank-name">{{ card.bankName }}</div>
                          <div class="card-type">{{ card.cardType }}</div>
                          <div class="card-num">**** **** **** {{ card.cardNo.slice(-4) }}</div>
                        </div>
                        <el-icon class="del-icon" @click.stop="handleDelCard(card.id)"><Delete /></el-icon>
                      </div>
                    </el-col>
                    
                    <el-col :span="12">
                      <div class="add-card-btn" @click="addCardVisible = true">
                        <el-icon><Plus /></el-icon> 添加银行卡
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>

              <!-- 充值弹窗 (保持原样) -->
              <el-dialog v-model="topUpVisible" title="账户充值" width="450px" append-to-body>
                <!-- ...省略重复代码，保持之前的... -->
                <div class="topup-options">
                    <div class="options-grid">
                      <div v-for="amt in amountPresets" :key="amt" class="option-item" 
                          :class="{ active: selectedAmount === amt && !isCustom }"
                          @click="selectPreset(amt)">{{ amt }}元</div>
                    </div>
                    <p style="margin:15px 0 5px">自定义金额</p>
                    <el-input-number v-model="customAmount" :min="1" style="width:100%" @focus="isCustom=true"/>
                </div>
                <template #footer>
                  <el-button type="primary" @click="goToPayment">去支付</el-button>
                </template>
              </el-dialog>

              <!-- 提现弹窗 -->
              <el-dialog v-model="withdrawVisible" title="余额提现" width="400px" append-to-body>
                <el-form label-width="80px">
                  <el-form-item label="提现金额">
                    <el-input v-model="withdrawAmount" type="number" placeholder="请输入金额">
                      <template #prefix>¥</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="到账银行">
                    <el-select v-model="withdrawCard" placeholder="选择银行卡" style="width: 100%">
                      <el-option v-for="c in bankCards" :key="c.id" :label="`${c.bankName} (${c.cardNo.slice(-4)})`" :value="c.id" />
                    </el-select>
                  </el-form-item>
                </el-form>
                <div class="dialog-tips">预计 2 小时内到账</div>
                <template #footer>
                  <el-button @click="withdrawVisible = false">取消</el-button>
                  <el-button type="primary" @click="submitWithdraw">确认提现</el-button>
                </template>
              </el-dialog>

              <!-- 添加银行卡弹窗 -->
              <el-dialog v-model="addCardVisible" title="绑定银行卡" width="400px" append-to-body>
                <el-form :model="cardForm" label-width="80px">
                  <el-form-item label="银行名称">
                    <el-select v-model="cardForm.bankName" placeholder="请选择" style="width:100%">
                      <el-option value="招商银行" label="招商银行" />
                      <el-option value="建设银行" label="建设银行" />
                      <el-option value="工商银行" label="工商银行" />
                      <el-option value="中国银行" label="中国银行" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="银行卡号">
                    <el-input v-model="cardForm.cardNo" placeholder="请输入卡号" />
                  </el-form-item>
                </el-form>
                <template #footer>
                  <el-button type="primary" @click="submitAddCard">绑定</el-button>
                </template>
              </el-dialog>
            </el-tab-pane>

              <!-- Tab 3: 收货地址 -->
              <el-tab-pane label="收货地址" name="address">
                <div class="tab-header">
                  <el-button type="primary" size="small" @click="openAddAddress">新增地址</el-button>
                </div>
                <el-table :data="addressList" stripe style="margin-top: 10px">
                  <el-table-column prop="receiverName" label="收货人" width="120" />
                  <el-table-column prop="phone" label="手机号" width="140" />
                  <el-table-column label="地址">
                    <template #default="scope">
                      {{ scope.row.region }} {{ scope.row.detailAddress }}
                      <el-tag size="small" type="danger" v-if="scope.row.isDefault">默认</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="scope">
                      <el-button link type="danger" @click="handleDelAddr(scope.row.id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- Tab 4: 优惠券 -->
              <el-tab-pane label="优惠券" name="coupon">
                <div class="coupon-list">
                  <div class="coupon-item" v-for="c in couponList" :key="c.id">
                    <div class="c-left">
                      <div class="price">¥<span>{{ c.amount }}</span></div>
                      <div class="cond">满{{ c.minSpend }}可用</div>
                    </div>
                    <div class="c-right">
                      <div class="name">{{ c.name }}</div>
                      <div class="type-tag">{{ getCouponType(c.type) }}</div>
                    </div>
                  </div>
                  <el-empty v-if="couponList.length === 0" description="暂无可用优惠券" />
                </div>
              </el-tab-pane>

            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 地址弹窗 -->
    <el-dialog v-model="addrDialogVisible" title="新增地址" width="400px">
      <el-form :model="addrForm" label-width="70px">
        <el-form-item label="收货人"><el-input v-model="addrForm.receiverName" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="addrForm.phone" /></el-form-item>
        <el-form-item label="地区"><el-input v-model="addrForm.region" placeholder="如：北京市朝阳区" /></el-form-item>
        <el-form-item label="详细"><el-input v-model="addrForm.detailAddress" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addrDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Iphone, Calendar, Camera } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { Trophy, CreditCard, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getCardList, addCard, deleteCard } from '@/api/card'
import { withdraw, activateMember } from '@/api/user'
import { Delete } from '@element-plus/icons-vue' 
// API 引入
import { getUserInfo, updateInfo } from '@/api/user'
import { getAddressList, addAddress, deleteAddress } from '@/api/address'
import { getMyCoupons } from '@/api/coupon'


const activeTab = ref('info')


// 【修复】初始化给默认值，防止页面渲染报错
const form = reactive({
  id: '',
  username: '',
  phone: '',
  avatar: '',
  balance: 0,
  createTime: ''
})

const birthdayDate = ref('') 
const addressList = ref([])
const couponList = ref([])

// 地址表单
const addrDialogVisible = ref(false)
const addrForm = reactive({ receiverName: '', phone: '', region: '', detailAddress: '' })

const presets = [
  'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
]

// 上传 Header
const uploadHeaders = { Authorization: localStorage.getItem('token') }

onMounted(async () => {
  await loadData()
  loadAddress()
  loadCoupons()
})

// 1. 加载用户信息
const loadData = async () => {
  try {
    const res = await getUserInfo()
    if (res.code === 0) {
      Object.assign(form, res.data)
      birthdayDate.value = res.data.birthday // 回显生日
    }
  } catch(e) {
    console.error("加载用户信息失败", e)
  }
}

// 2. 资料修改
const saveInfo = async () => {
  const data = {
    id: form.id,
    username: form.username,
    avatar: form.avatar,
    // 【修复】必须把 birthdayDate 传给后端
    // 注意：请确保后端 DTO (UpdateUserRequest) 已经加了 birthday 字段
    birthday: birthdayDate.value 
  }
  
  try {
    const res = await updateInfo(data)
    if(res.code === 0) {
      ElMessage.success('保存成功')
      // 更新本地缓存
      localStorage.setItem('username', form.username)
      localStorage.setItem('avatar', form.avatar)
      // 刷新数据
      loadData()
    } else {
      ElMessage.error(res.msg)
    }
  } catch(e) {}
}

// 3. 头像上传
const handleAvatarSuccess = (res) => {
  if (res.code === 0) {
    form.avatar = res.data
    ElMessage.success('上传成功，请点击保存修改')
  } else {
    ElMessage.error(res.msg)
  }
}
const beforeAvatarUpload = (file) => {
  const isImg = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isImg) ElMessage.error('只能上传 JPG/PNG 文件');
  return isImg;
}
// 预设头像
const updateAvatar = (url) => {
  form.avatar = url
}

// 4. 地址管理
const loadAddress = async () => {
  try {
    const res = await getAddressList()
    if(res.code === 0) addressList.value = res.data
  } catch(e) {}
}

// 【修复】打开弹窗时清空表单
const openAddAddress = () => {
  Object.assign(addrForm, { receiverName: '', phone: '', region: '', detailAddress: '' })
  addrDialogVisible.value = true
}

const submitAddress = async () => {
  // 简单校验
  if(!addrForm.receiverName || !addrForm.phone) return ElMessage.warning('请填写完整')
  
  try {
    const res = await addAddress(addrForm)
    if(res.code === 0) {
      ElMessage.success('添加成功')
      addrDialogVisible.value = false
      loadAddress()
    } else {
      ElMessage.error(res.msg)
    }
  } catch(e) {}
}

const handleDelAddr = async (id) => {
  ElMessageBox.confirm('确定删除该地址吗?', '提示', { type: 'warning' }).then(async () => {
    await deleteAddress(id)
    ElMessage.success('删除成功')
    loadAddress()
  })
}

// 5. 优惠券
const loadCoupons = async () => {
  try {
    const res = await getMyCoupons()
    if(res.code === 0) couponList.value = res.data
  } catch(e) {}
}
const getCouponType = (type) => {
  return {1:'注册礼', 2:'生日礼', 3:'通用券'}[type] || '优惠券'
}


// 6. 充值 (模拟)
const router = useRouter()


// 充值弹窗逻辑
const topUpVisible = ref(false)
const amountPresets = [10, 20, 50, 100, 200, 500, 1000]
const selectedAmount = ref(100)
const customAmount = ref(undefined)
const isCustom = ref(false)

// 计算最终金额
const finalAmount = computed(() => {
  if (isCustom.value) return customAmount.value || 0
  return selectedAmount.value
})

const openTopUpDialog = () => {
  topUpVisible.value = true
  selectedAmount.value = 100
  customAmount.value = undefined
  isCustom.value = false
}

const selectPreset = (val) => {
  selectedAmount.value = val
  isCustom.value = false
  customAmount.value = undefined
}


const goToPayment = () => {
  if (finalAmount.value < 1) {
    ElMessage.warning('充值金额最少为 1 元')
    return
  }
  // 关闭弹窗
  topUpVisible.value = false
  // 跳转支付页
  router.push(`/payment?amount=${finalAmount.value}`)

}

// 银行卡相关
const bankCards = ref([])
const addCardVisible = ref(false)
const cardForm = reactive({ bankName: '', cardNo: '' })

// 提现相关
const withdrawVisible = ref(false)
const withdrawAmount = ref('')
const withdrawCard = ref('')

// 1. 初始化时加载银行卡
onMounted(() => {
  // ... 其他 load ...
  loadBankCards()
})

const loadBankCards = async () => {
  const res = await getCardList()
  if(res.code === 0) bankCards.value = res.data
}

// 2. 添加银行卡
const submitAddCard = async () => {
  if(!cardForm.bankName || !cardForm.cardNo) return ElMessage.warning('请填写完整')
  const res = await addCard(cardForm)
  if(res.code === 0) {
    ElMessage.success('绑定成功')
    addCardVisible.value = false
    loadBankCards()
    cardForm.cardNo = '' // 重置
  }
}

// 3. 删除银行卡
const handleDelCard = (id) => {
  ElMessageBox.confirm('确定解绑该卡吗?', '提示').then(async () => {
    await deleteCard(id)
    loadBankCards()
    ElMessage.success('已解绑')
  })
}

// 4. 激活会员
const handleActivateMember = async () => {
  const res = await activateMember()
  if(res.code === 0) {
    ElMessage.success('激活成功！')
    form.memberNo = res.data
    form.points = 100
  } else {
    ElMessage.error(res.msg)
  }
}

// 5. 提现逻辑
const openWithdrawDialog = () => {
  withdrawVisible.value = true
}
const submitWithdraw = async () => {
  if(!withdrawAmount.value || withdrawAmount.value < 1) return ElMessage.warning('金额不合法')
  if(!withdrawCard.value) return ElMessage.warning('请选择提现到哪张卡')
  
  try {
    const res = await withdraw(Number(withdrawAmount.value))
    if(res.code === 0) {
      ElMessage.success('提现申请提交成功')
      form.balance = res.data // 更新显示余额
      withdrawVisible.value = false
    } else {
      ElMessage.error(res.msg)
    }
  } catch(e) {}
}

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD') : '-'
</script>

<style scoped>
.profile-page { padding: 20px; background: #f5f7fa; min-height: 85vh; }
.container { max-width: 1100px; margin: 0 auto; }

/* 左侧样式 */
.user-card { text-align: center; padding: 20px 0; }
.avatar-wrapper {
  position: relative; width: 100px; height: 100px; margin: 0 auto 15px;
  border-radius: 50%; overflow: hidden; cursor: pointer; border: 2px solid #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.mask {
  position: absolute; width: 100%; height: 100%; background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; color: #fff;
  opacity: 0; transition: 0.3s; font-size: 24px; z-index: 2; top: 0; left: 0;
}
.avatar-wrapper:hover .mask { opacity: 1; }

.username { margin: 10px 0; color: #333; }
.wallet-tag { background: #ecf5ff; color: #409eff; padding: 4px 12px; border-radius: 12px; display: inline-block; font-size: 13px; }
.money { font-weight: bold; font-size: 15px; }
.info-list { margin-top: 30px; text-align: left; padding: 0 20px; }
.info-list .item { display: flex; align-items: center; gap: 8px; color: #666; font-size: 14px; margin-bottom: 12px; }

.preset-list { display: flex; gap: 10px; }
.preset-item { cursor: pointer; border: 2px solid transparent; }
.preset-item:hover { border-color: #409eff; }

.tips { font-size: 12px; color: #909399; margin-top: 5px; }
.tab-header { margin-bottom: 10px; text-align: right; }

/* 钱包整体布局 */
.wallet-container { padding: 10px; }

/* 余额卡片 */
.balance-section { margin-bottom: 30px; }
.balance-card {
  background: linear-gradient(135deg, #3a7bd5, #3a6073); /* 深蓝渐变 */
  border-radius: 12px;
  padding: 30px;
  color: white;
  box-shadow: 0 8px 20px rgba(58, 96, 115, 0.3);
  position: relative;
  overflow: hidden;
}
.balance-card::after {
  content: "¥"; position: absolute; right: -20px; top: -30px;
  font-size: 150px; opacity: 0.1; font-weight: bold; pointer-events: none;
}
.card-title { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
.card-amount { font-size: 40px; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px; }
.card-actions .action-btn {
  background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 10px 25px;
}
.card-actions .action-btn:hover { background: rgba(255,255,255,0.3); }
.card-actions .action-btn.outline { background: transparent; border: 1px solid rgba(255,255,255,0.5); }

/* 卡包区域 */
.cards-section h3 { margin-bottom: 15px; color: #333; }
.bank-card {
  height: 100px; border-radius: 10px; color: #fff; padding: 15px;
  display: flex; align-items: center; gap: 15px; margin-bottom: 15px;
  position: relative; overflow: hidden; cursor: pointer; transition: transform 0.2s;
}
.bank-card:hover { transform: translateY(-3px); }
.member-card { background: linear-gradient(135deg, #e6b980, #eacda3); color: #5c4018; }
.red-card { background: linear-gradient(135deg, #ff6b6b, #ee5253); }
.blue-card { background: linear-gradient(135deg, #48dbfb, #2e86de); }

.card-icon { font-size: 32px; background: rgba(255,255,255,0.2); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.card-info { flex: 1; }
.bank-name { font-weight: bold; font-size: 16px; }
.card-type { font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
.card-num { font-family: monospace; font-size: 16px; letter-spacing: 1px; }

.add-card-btn {
  height: 100px; border: 1px dashed #dcdfe6; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #909399; cursor: pointer; transition: 0.2s; gap: 5px;
}
.add-card-btn:hover { border-color: #409eff; color: #409eff; background: #f0f9eb; }

/* 充值弹窗 */
.section-label { font-size: 14px; color: #606266; margin-bottom: 10px; font-weight: bold; }
.options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.option-item {
  width: 80px; height: 40px; border: 1px solid #dcdfe6; border-radius: 6px;
  display: flex; justify-content: center; align-items: center; cursor: pointer;
  color: #606266; transition: 0.2s;
}
.option-item:hover { border-color: #409eff; color: #409eff; }
.option-item.active { background: #409eff; color: #fff; border-color: #409eff; }

.dialog-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.total-text { font-size: 16px; color: #333; }
.highlight { color: #f56c6c; font-size: 20px; font-weight: bold; margin-left: 5px; }

/* 会员卡激活框 */
.activate-box {
  height: 90px; border: 1px solid #e6b980; background: #fffcf5;
  border-radius: 10px; display: flex; align-items: center; padding: 0 20px;
  justify-content: space-between; margin-bottom: 20px;
}
.activate-box h4 { margin: 0 0 5px; color: #8a6d3b; }
.activate-box p { margin: 0; font-size: 12px; color: #bfa57d; }

.sec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.pts { font-size: 13px; color: #666; font-weight: bold; }

.watermark { 
  position: absolute; right: -10px; bottom: -20px; font-size: 80px; 
  font-weight: bold; color: rgba(255,255,255,0.2); font-style: italic; pointer-events: none;
}

/* 银行卡删除按钮 */
.del-icon { 
  position: absolute; top: 10px; right: 10px; color: rgba(255,255,255,0.7); 
  cursor: pointer; display: none; 
}
.bank-card:hover .del-icon { display: block; }
.del-icon:hover { color: #fff; }

.dialog-tips { font-size: 12px; color: #999; text-align: center; margin-top: 10px; }

/* 优惠券样式 */
.coupon-list { display: flex; flex-wrap: wrap; gap: 15px; padding: 10px; }
.coupon-item {
  width: 240px; height: 90px; background: #fff; border-radius: 8px;
  display: flex; overflow: hidden; border: 1px solid #eee; position: relative;
}
.coupon-item::after {
  content: ""; position: absolute; left: 84px; top: -6px; width: 12px; height: 12px;
  border-radius: 50%; background: #fff; border-bottom: 1px solid #eee;
}
.c-left { width: 90px; background: #ff6b6b; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.c-left .price { font-size: 24px; font-weight: bold; }
.c-left .cond { font-size: 12px; opacity: 0.9; }
.c-right { flex: 1; padding: 10px 15px; display: flex; flex-direction: column; justify-content: center; }
.c-right .name { font-weight: bold; color: #333; margin-bottom: 5px; font-size: 14px; }
.c-right .type-tag { font-size: 12px; color: #ff6b6b; border: 1px solid #ff6b6b; width: fit-content; padding: 0 4px; border-radius: 4px; }
</style>