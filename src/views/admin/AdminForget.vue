<template>
  <div class="bg">
    <div class="box">
      <h2>重置密码</h2>
      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        
        <!-- 改为手机号 -->
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone" />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="验证码" :prefix-icon="Message" />
            <el-button type="primary" :disabled="counting" @click="sendCode" class="send-btn">
              {{ counting ? `${counter}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="新密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认新密码" :prefix-icon="Lock" show-password />
        </el-form-item>

        <!-- 管理员口令 -->
        <el-form-item prop="adminSecret">
          <el-input v-model="form.adminSecret" type="password" placeholder="管理员验证口令" :prefix-icon="Key" show-password />
        </el-form-item>

        <el-button type="warning" class="full-btn" @click="handleReset">立即重置</el-button>
        <div class="link"><router-link to="/admin/login">返回登录</router-link></div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { Iphone, Message, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import adminApi from '@/api/adminUser'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref(null)
const form = reactive({ 
  phone: '', 
  code: '', 
  newPassword: '',
  confirmPassword: '',
  adminSecret: ''
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
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }],
  adminSecret: [{ required: true, message: '请输入管理员验证口令', trigger: 'blur' }]
}

const sendCode = async () => {
  if (!form.phone) return ElMessage.warning('请先输入手机号')
  try {
    const res = await adminApi.sendCode(form.phone)
    if (res.code === 0) {
      ElMessage.success('验证码已发送')
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
  } catch(e) {}
}

const handleReset = async () => {
  await formRef.value.validate(async valid => {
    if (valid) {
      const res = await adminApi.resetPassword(form)
      if (res.code === 0) {
        ElMessage.success('重置成功')
        router.push('/admin/login')
      } else {
        ElMessage.error(res.msg)
      }
    }
  })
}

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.bg { width: 100%; height: 100vh; background: linear-gradient(135deg, #f56c6c, #fbb034); display: flex; justify-content: center; align-items: center; }
.box { width: 380px; background: rgba(255,255,255,0.95); padding: 40px 30px; border-radius: 12px; text-align: center; }
.code-row { display: flex; gap: 10px; width: 100%; }
.send-btn { width: 120px; }
.full-btn { width: 100%; margin-top: 10px; }
.link { margin-top: 15px; font-size: 14px; }
.link a { color: #666; text-decoration: none; }
</style>