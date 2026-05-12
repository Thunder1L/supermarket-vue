<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import Sidebar from "@/components/Sidebar.vue";
import AdminHeader from "@/components/AdminHeader.vue";
import ChatBox from "@/components/ChatBox.vue"; 

const route = useRoute();

// 根据路由的 meta.layout 判断当前显示模式
const layout = computed(() => route.meta.layout || 'client'); // 默认 client

const showChat = computed(() => layout.value === 'client' && localStorage.getItem('token'));

</script>

<template>
  <div id="app">
    
    <!-- 1. 客户端布局：Navbar + 内容 + Footer -->
    <div v-if="layout === 'client'" class="client-layout">
      <Navbar />
      <div class="client-content">
        <router-view />
      </div>
      <Footer />
    </div>

    <!-- 2. 管理员布局：Sidebar(左) + 内容(右) -->
    <div v-else-if="layout === 'admin'" class="admin-layout">
       <Sidebar />
      <div class="admin-main">
        <!-- 【新增】顶部栏 -->
        <AdminHeader />
        
        <!-- 内容区 -->
        <div class="admin-content">
          <router-view v-slot="{ Component }">
             <!-- 增加过渡动画，减少卡顿感 -->
             <transition name="fade" mode="out-in">
                <component :is="Component" />
             </transition>
          </router-view>
        </div>
      </div>
    </div>

    <!-- 3. 空白布局 -->
    <div v-else class="blank-layout">
      <router-view />
    </div>

    <ChatBox v-if="showChat" />

  </div>
</template>

<style>
/* 全局重置 */
body { margin: 0; padding: 0; font-family: "Microsoft YaHei", sans-serif; height: 100%; background: #f5f5f5; }

/* 客户端布局样式 */
.client-layout { display: flex; flex-direction: column; min-height: 100vh; }
.client-content { flex: 1; /* 撑开内容区 */ }

/* 管理员布局样式 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px; /* Sidebar宽度 */
  background: #f0f2f5;
  min-height: 100vh;
  min-width: 0;
}

.admin-content { 
  padding: 20px; 
  flex: 1; /* 占满剩余高度 */
}

/* 简单的淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.admin-layout { display: flex; min-height: 100vh; }
.admin-view-wrapper { background: #fff; padding: 20px; border-radius: 8px; min-height: calc(100vh - 40px); }

/* 空白布局 */
.blank-layout { width: 100%; height: 100%; }
</style>