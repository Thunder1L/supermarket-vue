<template>
  <nav class="nav">
    <div class="nav-left">
      <router-link to="/" class="logo">SuperMarket</router-link>
      <div class="links">
        <router-link to="/">首页</router-link>
        <router-link to="/products">商品</router-link>
        <router-link to="/cart">购物车</router-link>
        <router-link to="/orders">订单查询</router-link>
      </div>
    </div>

    <div class="nav-right">
      <!-- 登录状态 -->
      <div v-if="isLoggedIn" class="user-container">
        
        <!-- 头像和名字 -->
        <div class="user-profile" @click="goToProfile">
          <el-avatar 
            :size="34" 
            :src="userInfo.avatar" 
            class="user-avatar"
          >
            <!-- 如果没有图片，显示默认文字或图标 -->
            {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
          </el-avatar>
          <span class="username">{{ userInfo.username || '用户' }}</span>
        </div>

        <!-- 设置下拉菜单 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="settings-btn">
            <el-icon :size="20"><Setting /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided style="color: #f56c6c;">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 未登录状态 -->
      <router-link v-else to="/choice" class="login-btn">登录</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Setting } from '@element-plus/icons-vue' // 确保安装了图标库
import { ElMessage } from 'element-plus'

const router = useRouter();
const route = useRoute();

const isLoggedIn = ref(false);
const userInfo = reactive({
  username: '',
  avatar: ''
});

// 从 LocalStorage 加载用户信息
const loadUserInfo = () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (token && token !== 'undefined' && token !== 'null') {
    isLoggedIn.value = true;
    userInfo.username = localStorage.getItem("username") || "用户";
    userInfo.avatar = localStorage.getItem("avatar") || "";
  } else {
    // 如果 token 不合法，强制执行登出清理逻辑
    handleLogoutClean();
  }
};

// 监听路由变化，实时更新 Navbar 状态
watch(() => route.path, () => {
  loadUserInfo();
});

onMounted(() => {
  loadUserInfo();
});

const goToProfile = () => {
  router.push('/profile'); 
};

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout();
  } else if (command === 'profile') {
    goToProfile();
  }
};

// 抽取一个清理函数
const handleLogoutClean = () => {
  isLoggedIn.value = false;
  userInfo.username = "";
  userInfo.avatar = "";
  // 彻底清除脏数据
  localStorage.clear(); 
  // 或者只清除特定的：
  // localStorage.removeItem("token");
  // localStorage.removeItem("username");
  // localStorage.removeItem("avatar");
  // localStorage.removeItem("role");
};


const handleLogout = () => {
  handleLogoutClean();
  ElMessage.success("已退出登录");
  router.push('/');
};

</script>

<style scoped>
.nav {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.nav-left { display: flex; align-items: center; }
.logo { font-size: 22px; font-weight: bold; color: #409eff; margin-right: 40px; text-decoration: none; }
.links a { margin-right: 20px; text-decoration: none; color: #555; font-weight: 500; transition: color 0.3s; }
.links a:hover, .links a.router-link-active { color: #409eff; }

.user-container { display: flex; align-items: center; gap: 15px; }

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  transition: background 0.3s;
}
.user-profile:hover { background: #f5f7fa; }

.username { font-size: 14px; color: #333; font-weight: 500; }

.settings-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #909399;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.3s;
}
.settings-btn:hover { background: #f0f2f5; color: #409eff; }

.login-btn { padding: 8px 20px; border: 1px solid #409eff; color: #409eff; border-radius: 4px; text-decoration: none; transition: 0.3s; }
.login-btn:hover { background: #409eff; color: white; }
</style>