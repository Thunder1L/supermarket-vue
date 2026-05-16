<template>
  <el-container class="employee-layout">
    <el-header class="header">
      <div class="logo" @click="$router.push('/employee/dashboard')">
        🏪 超市门店工作台
      </div>
      <div class="right-menu">
        <span class="welcome-text">Hi, {{ username }}</span>
        <el-button type="danger" plain size="small" @click="handleLogout">
          退出交接
        </el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const username = ref(localStorage.getItem('username') || '门店员工')

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出当前工作台吗？', '下班交接', {
    confirmButtonText: '确定退出',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.clear()
    ElMessage.success('已安全退出')
    router.push('/admin/login?type=employee') // 退回到员工专属登录页
  })
}
</script>

<style scoped>
.employee-layout { height: 100vh; background-color: #f0f2f5; }
.header { 
  background: linear-gradient(90deg, #36D1DC, #5B86E5); 
  color: white; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 0 30px;
}
.logo { font-size: 20px; font-weight: bold; cursor: pointer; }
.right-menu { display: flex; align-items: center; gap: 15px; }
.welcome-text { font-size: 14px; opacity: 0.9; }
.main-content { padding: 20px; box-sizing: border-box; }

/* 路由动画 */
.fade-transform-leave-active, .fade-transform-enter-active { transition: all 0.3s; }
.fade-transform-enter-from { opacity: 0; transform: translateX(-30px); }
.fade-transform-leave-to { opacity: 0; transform: translateX(30px); }
</style>