<template>
  <div class="bg">
    <div class="top-bar">
      <div class="nav-item" @click="$router.push('/')">
        <el-icon><House /></el-icon> 返回首页
      </div>
      <div class="nav-item" @click="$router.push('/choice')">
        <el-icon><Switch /></el-icon> 切换身份
      </div>
    </div>

    <div class="login-box">
      <h2>管理员登录</h2>
      
      <el-tabs v-model="loginType" stretch>
        <el-tab-pane label="密码登录" name="password">
          <el-form :model="form" :rules="rules" ref="pwdFormRef" size="large" class="login-form">
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请输入密码" 
                :prefix-icon="Lock" 
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="验证码登录" name="code">
          <el-form :model="form" :rules="rules" ref="codeFormRef" size="large" class="login-form">
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone" />
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-row">
                <el-input v-model="form.code" placeholder="验证码" :prefix-icon="Message" />
                <el-button type="primary" plain :disabled="counting" @click="sendCode" class="send-btn">
                  {{ counting ? `${counter}s` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <el-button type="primary" class="full-btn" :loading="loading" @click="handleLogin">
        立即登录
      </el-button>

      <div class="bottom-links">
        <router-link to="/admin/register">注册管理员</router-link>
        <el-divider direction="vertical" />
        <router-link to="/admin/forget">忘记密码</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
// 增加 Switch 图标
import { Iphone, Lock, Message, House, Switch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import adminApi from '@/api/adminUser'

const router = useRouter()
const loginType = ref('password')
const pwdFormRef = ref(null)
const codeFormRef = ref(null)
const loading = ref(false)

const counting = ref(false)
const counter = ref(60)
let timer = null

const form = reactive({
  phone: '',
  password: '',
  code: ''
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const sendCode = async () => {
  if(!form.phone) return ElMessage.warning('请先输入手机号')
  try {
    const res = await adminApi.sendCode(form.phone)
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
  } catch(e) {}
}

const handleLogin = async () => {
  const currentForm = loginType.value === 'password' ? pwdFormRef.value : codeFormRef.value
  await currentForm.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const payload = { 
          phone: form.phone,
          loginType: loginType.value
        }
        if(loginType.value === 'password') payload.password = form.password
        else payload.code = form.code

        const res = await adminApi.login(payload)
         if (res.code === 0) {
          // 【关键修改】处理返回的对象
          const data = res.data
          localStorage.setItem('token', data.token)
          localStorage.setItem('username', data.username)
          localStorage.setItem('role', 'ADMIN')
          
          // 管理员头像 (如果有)
          if(data.avatar) localStorage.setItem('avatar', data.avatar)
          ElMessage.success('登录成功')
          router.push('/admin/dashboard')
        } else {
          ElMessage.error(res.msg || '登录失败')
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
.bg { width: 100%; height: 100vh; background: linear-gradient(135deg, #f56c6c, #fbb034); display: flex; justify-content: center; align-items: center; position: relative; }

/* 顶部操作栏样式 - 统一风格 */
.top-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 20px;
}

.nav-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  font-size: 14px;
  /* 增加文字阴影，保证在深色背景下可见 */
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: 0.3s;
  padding: 5px 10px;
  border-radius: 20px;
}

.nav-item:hover { 
  background: rgba(255,255,255,0.2); 
}

.login-box { width: 360px; background: rgba(255, 255, 255, 0.95); padding: 40px 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); text-align: center; }
.login-form { margin-top: 20px; }
.code-row { display: flex; gap: 10px; }
.send-btn { width: 120px; }
h2 { margin-bottom: 25px; color: #333; }
.full-btn { width: 100%; margin-top: 10px; padding: 20px; font-size: 16px; background: linear-gradient(90deg, #f56c6c, #fbb034); border: none; }
.full-btn:hover { opacity: 0.9; }
.bottom-links { margin-top: 15px; font-size: 14px; }
.bottom-links a { color: #666; text-decoration: none; }
.bottom-links a:hover { color: #f56c6c; }
</style>