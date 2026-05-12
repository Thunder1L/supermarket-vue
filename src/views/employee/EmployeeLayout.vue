<template>
  <div class="pda-layout">
    <header class="pda-header">
      <div class="left-action">
        <el-icon v-if="$route.path !== '/employee/dashboard'" @click="$router.back()">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="pda-title">{{ $route.meta.title || '门店履约端' }}</div>
      <div class="right-action" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
      </div>
    </header>

    <main class="pda-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ArrowLeft, SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

const handleLogout = () => {
  ElMessageBox.confirm('确定退出当前员工账号吗？', '提示', { type: 'warning' }).then(() => {
    localStorage.clear()
    router.push('/choice')
  })
}
</script>

<style scoped>
.pda-layout { height: 100vh; display: flex; flex-direction: column; background: #f0f2f5; }
.pda-header { 
  height: 50px; background: #409eff; color: white; 
  display: flex; align-items: center; justify-content: space-between; 
  padding: 0 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}
.pda-title { font-weight: bold; font-size: 18px; }
.pda-content { flex: 1; overflow-y: auto; padding: 10px; }
.left-action, .right-action { font-size: 20px; cursor: pointer; width: 30px; }
</style>