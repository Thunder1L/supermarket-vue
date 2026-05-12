<template>
  <div class="bg">
    <div class="forget-box">
      <h2>重置密码</h2>

      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone" />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="验证码" :prefix-icon="Message" />
            <el-button type="primary" :disabled="counting" @click="sendCode" class="send-btn">
              {{ counting ? `${counter}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="设置新密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        
        <!-- 新增：确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入新密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-button type="primary" class="full-btn" @click="handleReset">立即重置</el-button>
        <div class="link">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Iphone, Message, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import userApi from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const form = reactive({ 
  phone: '', 
  code: '', 
  newPassword: '',
  confirmPassword: '' // 新增
})
const counting = ref(false)
const counter = ref(60)
let timer = null

const validatePass2 = (rule, value, callback) => {
  if (value !== form.newPassword) callback(new Error('两次密码不一致'))
  else callback()
}

const rules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

const sendCode = () => {
  formRef.value.validateField('phone', async (valid) => {
    if (valid) {
      try {
        const res = await userApi.sendCode(form.phone)
        if (res.code === 0) {
          ElMessage.success('验证码发送成功')
          counting.value = true
          counter.value = 60
          timer = setInterval(() => {
            counter.value--
            if (counter.value <= 0) {
              clearInterval(timer)
              counting.value = false
            }
          }, 1000)
        } else {
          ElMessage.error(res.msg)
        }
      } catch (e) {}
    }
  })
}

const handleReset = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const res = await userApi.resetPassword(form)
      if (res.code === 0) {
        ElMessage.success('重置成功，请登录')
        router.push('/login')
      } else {
        ElMessage.error(res.msg)
      }
    }
  })
}

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.bg { width: 100%; height: 100vh; background: linear-gradient(135deg, #a1ffce, #faffd1); display: flex; justify-content: center; align-items: center; }
.forget-box { width: 360px; background: rgba(255,255,255,0.9); padding: 40px 30px; border-radius: 16px; text-align: center; }
.code-row { display: flex; gap: 10px; width: 100%; }
.send-btn { width: 120px; }
.full-btn { width: 100%; margin-top: 10px; font-size: 16px; padding: 20px 0; }
.link { margin-top: 15px; font-size: 14px; }
.link a { color: #666; text-decoration: none; }
</style>