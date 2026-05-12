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
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="storeCode" v-if="isEmployee">
          <el-input v-model="form.storeCode" placeholder="请输入门店授权码" :prefix-icon="Key" />
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
import adminApi from '@/api/adminUser' // 复用你的后台API文件

const router = useRouter()
const route = useRoute()

// 核心：判断当前是否处于员工注册模式
const isEmployee = computed(() => route.query.type === 'employee')

const regFormRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  phone: '',
  password: '',
  storeCode: ''
})

const rules = {
  username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  storeCode: [{ required: isEmployee.value, message: '请输入门店授权码', trigger: 'blur' }]
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
          // 3. 极度关键：告诉后端这个账号注册为什么角色！
          role: isEmployee.value ? 'EMPLOYEE' : 'ADMIN' 
        }

        const res = await adminApi.register(payload)
        
        if (res.code === 0) {
          ElMessage.success('注册成功，请登录')
          // 注册成功后，带着参数跳回正确的登录页
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
/* 样式与你的 AdminLogin.vue 保持统一风格即可 */
.bg { width: 100%; height: 100vh; background: linear-gradient(135deg, #f56c6c, #fbb034); display: flex; justify-content: center; align-items: center; }
.register-box { width: 360px; background: rgba(255, 255, 255, 0.95); padding: 40px 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); text-align: center; }
h2 { margin-bottom: 25px; color: #333; }
.full-btn { width: 100%; margin-top: 10px; padding: 20px; font-size: 16px; background: linear-gradient(90deg, #f56c6c, #fbb034); border: none; }
.bottom-links { margin-top: 20px; font-size: 14px; }
.bottom-links a { color: #f56c6c; text-decoration: none; margin-left: 5px; font-weight: bold; }
</style>