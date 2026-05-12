<template>
  <div class="bg">
    <div class="register-box">
      <h2>注册新用户</h2>

      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        <!-- 新增：用户名 -->
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="设置用户名" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" :prefix-icon="Iphone" />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="短信验证码" :prefix-icon="Message" />
            <el-button type="success" plain :disabled="counting" @click="sendCode" class="send-btn">
              {{ counting ? `${counter}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="设置密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-button type="success" class="full-btn" :loading="loading" @click="handleRegister">立即注册</el-button>
        <div class="link">
          <router-link to="/login">已有账号？去登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Iphone, Message, Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import userApi from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const counting = ref(false)
const counter = ref(60)
let timer = null

const form = reactive({
  username: '', // 新增
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value !== form.password) callback(new Error('两次密码不一致'))
  else callback()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

const sendCode = () => {
  formRef.value.validateField('phone', async (valid) => {
    if (valid) {
      try {
        const res = await userApi.sendCode(form.phone)
        if (res.code === 0) {
          ElMessage.success('验证码发送成功')
          startTimer()
        } else {
          ElMessage.error(res.msg)
        }
      } catch (e) {}
    }
  })
}

const startTimer = () => {
  counting.value = true
  counter.value = 60
  timer = setInterval(() => {
    counter.value--
    if (counter.value <= 0) {
      clearInterval(timer)
      counting.value = false
    }
  }, 1000)
}

const handleRegister = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userApi.register(form)
        if (res.code === 0) {
          ElMessage.success('注册成功')
          router.push('/login')
        } else {
          ElMessage.error(res.msg)
        }
      } finally {
        loading.value = false
      }
    }
  })
}

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.bg { width: 100%; height: 100vh; background: linear-gradient(135deg, #a1ffce, #faffd1); display: flex; justify-content: center; align-items: center; }
.register-box { 
  width: 380px; background: rgba(255,255,255,0.9); 
  padding: 40px 30px; border-radius: 16px; text-align: center; 
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
}
.code-row { display: flex; gap: 10px; width: 100%; }
.send-btn { width: 130px; }
.full-btn { width: 100%; margin-top: 10px; font-size: 16px; padding: 20px 0; }
.link { margin-top: 15px; font-size: 14px; }
.link a { color: #666; text-decoration: none; }
</style>