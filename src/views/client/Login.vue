<template>
  <div class="bg">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="nav-item" @click="$router.push('/')">
        <el-icon><House /></el-icon> 返回首页
      </div>
      <div class="nav-item" @click="$router.push('/choice')">
        <el-icon><Switch /></el-icon> 切换身份
      </div>
    </div>

    <div class="login-box">
      <h2>用户登录</h2>
      
      <el-tabs v-model="loginType" stretch class="custom-tabs">
        <!-- 1. 密码登录 -->
        <el-tab-pane label="密码登录" name="password">
          <el-form :model="form" :rules="rules" ref="pwdFormRef" size="large" class="login-form">
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone"  aria-label="手机号"/>
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请输入密码" 
                :prefix-icon="Lock" 
                aria-label="密码"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 2. 验证码登录 -->
        <el-tab-pane label="验证码登录" name="code">
          <el-form :model="form" :rules="rules" ref="codeFormRef" size="large" class="login-form">
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone" aria-label="手机号" />
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-row">
                <el-input v-model="form.code" placeholder="验证码" :prefix-icon="Message" />
                <el-button type="success" plain :disabled="counting" @click="sendCode" class="send-btn">
                  {{ counting ? `${counter}s` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 3. 微信登录 (新增) -->
        <el-tab-pane label="微信扫码" name="wechat">
          <div class="wechat-box">
            <div class="qr-placeholder">
              <!-- 这里模拟二维码，实际开发中替换为真实二维码图片 -->
              <el-icon :size="60" color="#67c23a"><ChatDotRound /></el-icon>
            </div>
            <p class="qr-text">请使用微信扫描二维码登录</p>
            <p class="qr-sub-text">安全 · 快捷 · 免输入</p>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 只有非微信登录时才显示登录按钮 -->
      <el-button 
        v-if="loginType !== 'wechat'"
        type="success" 
        class="full-btn" 
        :loading="loading" 
        @click="handleLogin"
      >
        登 录
      </el-button>

      <div class="bottom-links">
        <span>还没有账号？<router-link to="/register" class="hl">立即注册</router-link></span>
        <router-link to="/forget">忘记密码?</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
// 引入需要的图标，需确保安装 @element-plus/icons-vue
import { Iphone, Lock, Message, House, Switch, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import userApi from '@/api/user'

const router = useRouter()
const loginType = ref('password') // password | code | wechat
const pwdFormRef = ref(null)
const codeFormRef = ref(null)
const loading = ref(false)

// 倒计时逻辑
const counting = ref(false)
const counter = ref(60)
let timer = null

const form = reactive({ 
  phone: '', 
  password: '', 
  code: '' 
})

// 校验规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 发送验证码
const sendCode = async () => {
  if(!form.phone) return ElMessage.warning('请先输入手机号')
  if(!/^1[3-9]\d{9}$/.test(form.phone)) return ElMessage.warning('手机号格式错误')

  try {
    const res = await userApi.sendCode(form.phone)
    if (res.code === 0) {
      ElMessage.success('发送成功')
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
  // 如果是微信登录，走单独逻辑（通常是轮询后端扫码状态，这里仅做展示）
  if (loginType.value === 'wechat') return

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

        const res = await userApi.login(payload)
        
        if (res.code === 0) {
          // 后端现在返回的是对象 { token, username, avatar, role }
          const data = res.data; 
          localStorage.setItem('token', data.token)
          localStorage.setItem('username', data.username || form.phone)
          localStorage.setItem('role', 'USER')

           // 【新增】存储 ID 和 手机号
          localStorage.setItem('userId', data.id)
          localStorage.setItem('phone', form.phone) // 注意：这里用 form.phone
          
          if (data.avatar) {
             localStorage.setItem('avatar', data.avatar)
          } else {
             localStorage.removeItem('avatar') // 清除旧头像
          }

          ElMessage.success('欢迎回来, ' + (data.username || '用户'))
          router.push('/')
        } else {
          // 如果 Result code 不为 0，错误信息会在 request.js 拦截器或这里处理
          ElMessage.error(res.msg || '登录失败')
        }
      } catch (error) {
         // request.js 可能会 reject error
      } finally {
        loading.value = false
      }
    }
  })
}

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.bg { width: 100%; height: 100vh; background: linear-gradient(135deg, #a1ffce, #faffd1); display: flex; justify-content: center; align-items: center; position: relative; }

/* 顶部操作栏样式 */
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
  color: #555;
  font-size: 14px;
  transition: 0.3s;
  padding: 5px 10px;
  background: rgba(255,255,255,0.6);
  border-radius: 20px;
}

.nav-item:hover { color: #67c23a; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

/* 登录框样式 */
.login-box { 
  width: 380px; background: rgba(255,255,255,0.9);
  padding: 30px; border-radius: 16px; text-align: center; 
  backdrop-filter: blur(5px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); 
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  }
h2 { color: #333; margin-bottom: 20px; }
.login-form { margin-top: 20px; }

.code-row { display: flex; gap: 10px; }
.send-btn { width: 120px; }
.full-btn { width: 100%; margin-top: 10px; font-size: 16px; padding: 20px 0; }

.bottom-links { margin-top: 20px; display: flex; justify-content: space-between; font-size: 14px; color: #666; }
.bottom-links a { text-decoration: none; color: #666; }
.hl { color: #67c23a !important; font-weight: bold; }

/* 微信登录样式 */
.wechat-box { padding: 20px 0; animation: fadeIn 0.5s; }
.qr-placeholder {
  width: 160px; height: 160px; background: #f0f2f5;
  margin: 0 auto 15px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #e0e0e0;
}
.qr-text { font-size: 15px; color: #333; font-weight: 500; margin-bottom: 5px; }
.qr-sub-text { font-size: 12px; color: #999; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>