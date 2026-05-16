<template>
  <div :class="['bg', isEmployee ? 'employee-theme' : 'admin-theme']">
  
    <div class="top-bar">
      <div class="nav-item" @click="$router.push('/')">
        <el-icon><House /></el-icon> 返回首页
      </div>
      <div class="nav-item" @click="$router.push('/choice')">
        <el-icon><Switch /></el-icon> 切换身份
      </div>
    </div>

    <div class="login-box">
      <!-- <h2>管理员登录</h2> -->
      <h2>{{ isEmployee ? '🏪 门店员工工作台' : '⚙️ 超市管理后台' }}</h2>
      
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
        <!-- 立即登录 -->
        {{ isEmployee ? '员工登录' : '管理员登录' }}
      </el-button>

      <!-- <div class="bottom-links">
        <router-link to="/admin/register">注册管理员</router-link>
        <el-divider direction="vertical" />
        <router-link to="/admin/forget">忘记密码</router-link>
      </div> -->

      <div class="bottom-links">
        <router-link :to="isEmployee ? '/admin/register?type=employee' : '/admin/register'">
          注册账号
        </router-link>
        <el-divider direction="vertical" />
        <a href="javascript:void(0)" class="switch-link" @click="toggleLoginType">
          {{ isEmployee ? '切换至管理员入口' : '切换至门店员工入口' }}
        </a>
      </div>

      
    </div>
  </div>
</template>

<script setup>
// import { ref, reactive, onBeforeUnmount } from 'vue'
// import { useRouter } from 'vue-router'
import { ref, reactive, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 增加 Switch 图标
import { Iphone, Lock, Message, House, Switch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import adminApi from '@/api/adminUser'

const router = useRouter()

const route = useRoute()

// 监听 URL，判断当前是否为员工模式 (地址栏带有 ?type=employee)
const isEmployee = computed(() => route.query.type === 'employee')

// 切换身份模式
const toggleLoginType = () => {
  if (isEmployee.value) {
    router.push('/admin/login') // 切回管理员
  } else {
    router.push('/admin/login?type=employee') // 切换到员工
  }
}

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
    // const res = await adminApi.sendCode(form.phone)
    const res = await adminApi.sendCode({ phone: form.phone })
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
  // const currentForm = loginType.value === 'password' ? pwdFormRef.value : codeFormRef.value
  
  const currentForm = loginType.value === 'password' ? pwdFormRef.value : codeFormRef.value
  // 【新增防空拦截】如果表单还没渲染出来，直接拦截，防止底层报错
  if (!currentForm) {
    return ElMessage.warning('表单尚未加载完成，请稍后再试')
  }
  
  
  
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

        //  if (res.code === 0) {
        //   // 【关键修改】处理返回的对象
        //   const data = res.data
        //   localStorage.setItem('token', data.token)
        //   localStorage.setItem('username', data.username)
        //   localStorage.setItem('role', 'ADMIN')
          
        //   // 管理员头像 (如果有)
        //   if(data.avatar) localStorage.setItem('avatar', data.avatar)
        //   ElMessage.success('登录成功')
        //   router.push('/admin/dashboard')
        // } else {
        //   ElMessage.error(res.msg || '登录失败')
        // }

        // 兼容两种成功状态码
        // if (res.code === 0 || res.code === 200) {
        //   const data = res.data
        //   const role = data.role // 🚨 后端必须在登录时返回 role 字段！(1:管理员, 2:员工)

        //   // 【安全拦截】交叉权限校验：防止用管理员账号登员工端，反之亦然
        //   if (isEmployee.value && role !== 2) {
        //     return ElMessage.error('权限不符：您不是门店员工！')
        //   }
        //   if (!isEmployee.value && role !== 1) {
        //     return ElMessage.error('权限不符：您不是超级管理员！')
        //   }

        //   // 存储 Token 和真实 Role，不再写死 'ADMIN'
        //   localStorage.setItem('token', data.token)
        //   localStorage.setItem('username', data.username)
        //   localStorage.setItem('role', role) 

        //   if(data.avatar) localStorage.setItem('avatar', data.avatar)

        //   ElMessage.success('登录成功，欢迎回来！')

        //   // 【核心路由分流】
        //   if (role === 1) {
        //     router.push('/admin/dashboard') // 管理员去总后台
        //   } else if (role === 2) {
        //     router.push('/employee/dashboard') // 员工去门店工作台
        //   }
        // } else {
        //   ElMessage.error(res.msg || '登录失败')
        // }

        // 兼容两种成功状态码
        if (res.code === 0 || res.code === 200) {
          const data = res.data
          const rawRole = data.role // 拿到的是字符串，例如 "ADMIN" 或 "EMPLOYEE"

          // // 【安全拦截】交叉权限校验
          // // 假设你员工端的角色标识是 'EMPLOYEE' (如果后端返回其他的，请自行对照修改)
          // if (isEmployee.value && role !== 'EMPLOYEE') {
          //   return ElMessage.error('权限不符：您不是门店员工！')
          // }
          // if (!isEmployee.value && role !== 'ADMIN') {
          //   return ElMessage.error('权限不符：您不是超级管理员！')
          // }


          // const isAdmin = rawRole === 1 || String(rawRole).toUpperCase() === 'ADMIN'
          // const isEmp = rawRole === 2 || String(rawRole).toUpperCase() === 'EMPLOYEE'


          // 🚨 终极修复：使用 Number() 强制转换 rawRole，彻底粉碎后端传字符串带来的类型不匹配问题！
          const isAdmin = Number(rawRole) === 1 || String(rawRole).toUpperCase() === 'ADMIN'
          const isEmp = Number(rawRole) === 2 || String(rawRole).toUpperCase() === 'EMPLOYEE'

          // 【安全拦截】交叉权限校验
          if (isEmployee.value && !isEmp) {
            return ElMessage.error('权限不符：您不是门店员工！')
          }
          if (!isEmployee.value && !isAdmin) {
            return ElMessage.error('权限不符：您不是超级管理员！')
          }

          // 存储 Token 和真实 Role
          localStorage.setItem('token', data.token)
          localStorage.setItem('username', data.username)
          localStorage.setItem('role', rawRole) 
          
          if(data.avatar) localStorage.setItem('avatar', data.avatar)
          
          ElMessage.success('登录成功，欢迎回来！')
          
          // 【核心路由分流】
          if (isAdmin) {
            router.push('/admin/dashboard') // 管理员去总后台
          } else if (isEmp) {
            router.push('/employee/dashboard') // 员工去门店工作台
          }
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

<!-- <style scoped>
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
</style> -->

<style scoped>
/* =========================================
   1. 基础布局与默认兜底主题 (管理员红橙色)
   ========================================= */
.bg { 
  width: 100%; 
  height: 100vh; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  position: relative; 
  /* 🚨 严谨修复：把默认的红橙底色补回来，作为绝对不会白屏的兜底保障 */
  background: linear-gradient(135deg, #f56c6c, #fbb034); 
  transition: background 0.5s; /* 保留平滑过渡效果 */
}

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
  color: #fff;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: 0.3s;
  padding: 5px 10px;
  border-radius: 20px;
}

.nav-item:hover { 
  background: rgba(255,255,255,0.2); 
}

/* 登录框主体样式 */
.login-box { 
  width: 360px; 
  background: rgba(255, 255, 255, 0.95); 
  padding: 40px 30px; 
  border-radius: 12px; 
  box-shadow: 0 8px 20px rgba(0,0,0,0.15); 
  text-align: center; 
}

.login-form { margin-top: 20px; }
.code-row { display: flex; gap: 10px; }
.send-btn { width: 120px; }
h2 { margin-bottom: 25px; color: #333; }

/* 登录按钮基础样式（🚨 同理：保留默认红橙色兜底） */
.full-btn { 
  width: 100%; 
  margin-top: 10px; 
  padding: 20px; 
  font-size: 16px; 
  border: none; 
  background: linear-gradient(90deg, #f56c6c, #fbb034);
  transition: background 0.5s; 
}
.full-btn:hover { opacity: 0.9; }

/* 底部链接样式 */
.bottom-links { margin-top: 15px; font-size: 14px; }
.bottom-links a { color: #666; text-decoration: none; }
.bottom-links a:hover { color: #f56c6c; }

/* =========================================
   2. 动态主题覆盖区 (当处于员工模式时生效)
   ========================================= */

/* 门店员工主题 (蓝绿色调) - 利用 CSS 特异性强行覆盖默认背景 */
.employee-theme.bg { 
  background: linear-gradient(135deg, #36D1DC, #5B86E5) !important; 
}

.employee-theme .full-btn { 
  background: linear-gradient(90deg, #36D1DC, #5B86E5) !important; 
}

/* 底部切换身份链接专属高亮 */
.switch-link { color: #409EFF !important; font-weight: bold; }
.switch-link:hover { opacity: 0.8; }
</style>