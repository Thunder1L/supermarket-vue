<template>
  <div class="choice-container">
    <!-- 返回首页按钮 -->
    <div class="back-home" @click="goHome">
      <el-icon><House /></el-icon> 返回首页
    </div>

    <div class="choice-box">
      <h2>欢迎来到 SuperMarket</h2>
      <p class="subtitle">请选择您的登录身份</p>
      
      <div class="card-group">
        <div class="role-card user" @click="go('USER')">
          <el-icon :size="40"><User /></el-icon>
          <span>普通用户入口</span>
        </div>
        
        <div class="role-card admin" @click="go('ADMIN')">
          <el-icon :size="40"><Monitor /></el-icon>
          <span>管理员入口</span>
        </div>

        <div class="role-card employee" @click="go('EMPLOYEE')">
          <el-icon :size="40"><Shop /></el-icon>
          <span>员工入口</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { User, Monitor, House, Shop  } from '@element-plus/icons-vue'

const router = useRouter()

const go = (role) => {
  if (role === 'USER') router.push('/login')
  else if(role === 'ADMIN') router.push('/admin/login')
  else router.push('/admin/login?type=employee')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.choice-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #74ebd5, #ACB6E5);
  position: relative;
}

.back-home {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: 0.3s;
}
.back-home:hover { opacity: 0.8; transform: translateX(-3px); }

.choice-box {
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  text-align: center;
  width: 450px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

h2 { margin: 0 0 10px; color: #333; }
.subtitle { margin-bottom: 30px; color: #666; }

.card-group { display: flex; gap: 20px; justify-content: center; }

.role-card {
  flex: 1;
  height: 140px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
  gap: 10px;
}

.role-card.user { background: linear-gradient(135deg, #42d392, #647eff); }
.role-card.admin { background: linear-gradient(135deg, #ff9a9e, #fecfef); color: #fff; }
.role-card.employee { background: linear-gradient(135deg, #ddc694, #deffaf); color: #fff; }

.role-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
</style>