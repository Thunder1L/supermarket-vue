<template>
  <el-menu
    :default-active="activeMenu"
    class="admin-menu"
    router
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409eff"
  >
    <!-- 顶部标题 -->
    <div class="sidebar-title">后台管理系统</div>

    <el-menu-item index="/admin/dashboard">
      <el-icon><Odometer /></el-icon>
      <span>控制台</span>
    </el-menu-item>

    <el-sub-menu index="product">
      <template #title>
        <el-icon><Goods /></el-icon>
        <span>商品管理</span>
      </template>
      <el-menu-item index="/admin/product">商品列表</el-menu-item>
      <el-menu-item index="/admin/category">分类管理</el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/admin/order">
      <el-icon><List /></el-icon>
      <span>订单管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
// 必须先安装 @element-plus/icons-vue
import { Odometer, Goods, List } from '@element-plus/icons-vue';

const route = useRoute();
// 保持菜单高亮状态与当前路由一致
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.admin-menu {
  width: 220px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  border-right: none;
  /* 改为深色侧边栏更显专业 */
  background-color: #304156;
  flex-shrink: 0;
}

.sidebar-title {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  background-color: #2b3649;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}
</style>