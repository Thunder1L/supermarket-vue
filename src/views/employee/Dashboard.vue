<template>
  <div class="employee-dashboard">
    <div class="user-info-card">
      <div class="avatar">👨‍🔧</div>
      <div class="details">
        <h3>{{ username }}</h3>
        <p>所属门店：城南店</p>
      </div>
    </div>

    <div class="task-stats">
      <div class="stat-item orange">
        <span class="num">8</span>
        <span class="label">待核销</span>
      </div>
      <div class="stat-item blue">
        <span class="num">3</span>
        <span class="label">配送中</span>
      </div>
    </div>

    <div class="function-grid">
      <div class="grid-item pick" @click="$router.push('/employee/scan-verify')">
        <el-icon><Box /></el-icon>
        <span>分拣核销</span>
      </div>
      <div class="grid-item inventory" @click="notOpen">
        <el-icon><Tickets /></el-icon>
        <span>库存盘点</span>
      </div>
      <div class="grid-item deliver" @click="notOpen">
        <el-icon><Van /></el-icon>
        <span>交接单</span>
      </div>
      <div class="grid-item profile" @click="notOpen">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Box, Tickets, Van, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const username = ref(localStorage.getItem('username') || '门店员工')

const notOpen = () => {
  ElMessage.info('功能模块正在集成中')
}
</script>

<style scoped>
.user-info-card { 
  background: white; padding: 20px; border-radius: 12px; 
  display: flex; align-items: center; gap: 15px; margin-bottom: 15px; 
}
.avatar { font-size: 40px; background: #eef5fe; padding: 10px; border-radius: 50%; }
.user-info-card h3 { margin: 0; color: #333; }
.user-info-card p { margin: 5px 0 0; color: #999; font-size: 14px; }

.task-stats { display: flex; gap: 10px; margin-bottom: 20px; }
.stat-item { 
  flex: 1; padding: 15px; border-radius: 12px; color: white;
  display: flex; flex-direction: column; align-items: center;
}
.stat-item.orange { background: linear-gradient(135deg, #ff9d6c, #f46b45); }
.stat-item.blue { background: linear-gradient(135deg, #57c1eb, #246fa1); }
.stat-item .num { font-size: 24px; font-weight: bold; }

.function-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.grid-item { 
  background: white; border-radius: 12px; height: 120px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; font-weight: bold; color: #606266;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.grid-item:active { background: #f9f9f9; transform: scale(0.98); }
.grid-item .el-icon { font-size: 32px; color: #409eff; }

/* 不同图标颜色区分 */
.pick .el-icon { color: #67c23a; }
.inventory .el-icon { color: #e6a23c; }
.deliver .el-icon { color: #f56c6c; }
</style>