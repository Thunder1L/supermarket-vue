<template>
  <div class="bg">
    <div class="register-box">
      <h2>{{ isEmployee ? '门店员工注册' : '管理员注册' }}</h2>
      
      <el-form :model="form" :rules="rules" ref="regFormRef" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入姓名/昵称" :prefix-icon="User" />
        </el-form-item>
        
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone" />
        </el-form-item>

        <el-form-item prop="code">
          <div style="display: flex; width: 100%; gap: 10px;">
            <el-input v-model="form.code" placeholder="请输入验证码" />
            <el-button type="primary" plain @click="sendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        
        <el-form-item prop="storeCode" v-if="isEmployee">
          <el-input v-model="form.storeCode" placeholder="请输入门店授权码" :prefix-icon="Key" />
        </el-form-item>
        <el-form-item prop="adminSecret" v-else>
          <el-input v-model="form.adminSecret" type="password" placeholder="请输入管理员注册口令" :prefix-icon="Key" />
        </el-form-item>

      </el-form>

      <el-button type="primary" class="full-btn" :loading="loading" @click="handleRegister">
        立即注册
      </el-button>

      <div class="bottom-links">
        <span>已有账号？</span>
        <router-link :to="isEmployee ? '/admin/login?type=employee' : '/admin/login'">
          去登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Iphone, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import adminApi from '@/api/adminUser' 

const router = useRouter()
const route = useRoute()

const isEmployee = computed(() => route.query.type === 'employee')
const regFormRef = ref(null)
const loading = ref(false)

// 【新增】倒计时状态
const countdown = ref(0)

const form = reactive({
  username: '',
  phone: '',
  password: '',
  code: '',         // 新增验证码
  storeCode: '',
  adminSecret: ''   // 新增管理员口令
})

const rules = {
  username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  storeCode: [{ required: isEmployee.value, message: '请输入门店授权码', trigger: 'blur' }],
  adminSecret: [{ required: !isEmployee.value, message: '请输入管理员注册口令', trigger: 'blur' }]
}

// 【新增】发送验证码方法
const sendCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    return ElMessage.warning('请先输入正确的手机号')
  }
  try {
    const res = await adminApi.sendCode({ phone: form.phone }) // 注意确认你的 api 调用传参格式
    if (res.code === 200 || res.code === 0) {
      ElMessage.success('验证码发送成功，有效时间5分钟')
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (error) {
    ElMessage.error('网络异常')
  }
}

const handleRegister = async () => {
  await regFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const payload = {
          username: form.username,
          phone: form.phone,
          password: form.password,
          code: form.code, // 【新增】加入验证码
          role: isEmployee.value ? 'EMPLOYEE' : 'ADMIN',
          // 【新增】动态加入口令或授权码
          storeCode: isEmployee.value ? form.storeCode : undefined,
          adminSecret: !isEmployee.value ? form.adminSecret : undefined
        }

        const res = await adminApi.register(payload)
        
        if (res.code === 200 || res.code === 0) {
          ElMessage.success('注册成功，请登录')
          router.push(isEmployee.value ? '/admin/login?type=employee' : '/admin/login')
        } else {
          ElMessage.error(res.msg || '注册失败')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.bg { width: 100%; height: 100vh; background: linear-gradient(135deg, #f56c6c, #fbb034); display: flex; justify-content: center; align-items: center; }
.register-box { width: 360px; background: rgba(255, 255, 255, 0.95); padding: 40px 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); text-align: center; }
h2 { margin-bottom: 25px; color: #333; }
.full-btn { width: 100%; margin-top: 10px; padding: 20px; font-size: 16px; background: linear-gradient(90deg, #f56c6c, #fbb034); border: none; }
.bottom-links { margin-top: 20px; font-size: 14px; }
.bottom-links a { color: #f56c6c; text-decoration: none; margin-left: 5px; font-weight: bold; }
</style>