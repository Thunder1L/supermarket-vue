<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="data-board">
      <el-col :span="12">
        <el-card shadow="never" class="data-card">
          <div class="data-title">今日核销单量</div>
          <div class="data-value">128 <span class="unit">单</span></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="data-card">
          <div class="data-title">今日盘点商品</div>
          <div class="data-value">45 <span class="unit">件</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="action-card verify-card" @click="$router.push('/employee/scan-verify')">
          <div class="card-content">
            <el-icon class="card-icon"><FullScreen /></el-icon>
            <h3>分拣与核销</h3>
            <p>处理自提订单</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="action-card inventory-card" @click="$router.push('/employee/inventory')">
          <div class="card-content">
            <el-icon class="card-icon"><Box /></el-icon>
            <h3>货架盘点</h3>
            <p>查价与库存上报</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="action-card delivery-card" @click="$router.push('/employee/delivery')">
          <div class="card-content">
            <el-icon class="card-icon"><Van /></el-icon>
            <h3>外送配送</h3>
            <p>抢单与送货上门</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// 引入完整图标，新增了小货车 Van
import { FullScreen, Box, Van } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-container { max-width: 900px; margin: 20px auto; } /* 稍微加宽一点以适应3个卡片 */
.data-board { margin-bottom: 20px; }
.data-card { text-align: center; border-radius: 12px; background: rgba(255,255,255,0.8); }
.data-title { font-size: 14px; color: #666; margin-bottom: 10px; }
.data-value { font-size: 28px; font-weight: bold; color: #5B86E5; }
.unit { font-size: 14px; font-weight: normal; color: #999; }

.action-card { cursor: pointer; border-radius: 12px; text-align: center; transition: all 0.3s; height: 200px; display: flex; justify-content: center; align-items: center; border: none; }
.action-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
.card-content { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.card-icon { font-size: 48px; color: #fff; }
h3 { margin: 0; font-size: 22px; color: #fff; }
p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.8); }

.verify-card { background: linear-gradient(135deg, #11998e, #38ef7d); }
.inventory-card { background: linear-gradient(135deg, #FFB75E, #ED8F03); }
/* 新增配送卡片的渐变色（紫色系） */
.delivery-card { background: linear-gradient(135deg, #8E2DE2, #4A00E0); }
</style>