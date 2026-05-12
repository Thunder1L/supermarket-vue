<template>
  <div class="admin-header">
    <div class="left-panel">
      <!-- 简单的面包屑，增加层级感 -->
      <span class="system-title">SuperMarket 后台管理系统</span>
    </div>

    <div class="right-panel">
      <!-- 下拉菜单 -->
      <el-dropdown trigger="click" @command="handleCommand" class="dropdown-link">
        <div class="avatar-wrapper">
          <el-avatar 
            :size="36" 
            :src="avatar" 
            class="user-avatar"
          >
            {{ username ? username.charAt(0).toUpperCase() : 'A' }}
          </el-avatar>
          <span class="username">{{ username }}</span>
          <el-icon class="icon-caret"><CaretBottom /></el-icon>
        </div>
        
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人设置
            </el-dropdown-item>
            <el-dropdown-item command="dashboard">
              <el-icon><Odometer /></el-icon>控制台首页
            </el-dropdown-item>
            <el-dropdown-item divided command="logout" class="logout-item">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CaretBottom, User, Odometer, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const username = ref('')
const avatar = ref('')

onMounted(() => {
  username.value = localStorage.getItem('username') || 'Admin'
  avatar.value = localStorage.getItem('avatar') || ''
})

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.clear()
    ElMessage.success('已安全退出')
    router.push('/admin/login')
  } else if (command === 'profile') {
    // 【修正】跳转到管理员个人中心
    router.push('/admin/profile')
  } else if (command === 'dashboard') {
    // 【修正】跳转到管理员仪表盘 (而不是普通用户首页)
    router.push('/admin/dashboard')
  }
}
</script>

<style scoped>
.admin-header {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 99;
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.right-panel {
  display: flex;
  align-items: center;
}

/* 优化下拉触发区域样式 */
.dropdown-link {
  cursor: pointer;
  outline: none; /* 去除点击后的黑框 */
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: .3s;
  padding: 4px 8px;
  border-radius: 4px;
}

.avatar-wrapper:hover {
  background: rgba(0,0,0,0.025);
}

.user-avatar {
  background: #409eff;
  font-size: 16px;
}

.username {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.icon-caret {
  font-size: 12px;
  color: #909399;
}

/* 下拉菜单样式修正 (虽然写在这里不生效，但推荐用popper-class) */
.logout-item {
  color: #f56c6c;
}
.logout-item:hover {
  background-color: #fef0f0 !important;
  color: #f56c6c !important;
}
</style>