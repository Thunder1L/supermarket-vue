<template>
  <div class="home-container">
    <!-- 轮播图区域 -->
    <div class="banner-section">
      <el-carousel trigger="click" height="400px" class="banner-carousel">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <img :src="item.img" class="banner-img" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 快捷入口 -->
    <div class="section-container">
      <h2 class="section-title">热门分类</h2>
      <div class="category-grid">
        <div class="cat-card" @click="goProducts">
          <el-icon :size="40" color="#409eff"><Food /></el-icon>
          <span>新鲜果蔬</span>
        </div>
        <div class="cat-card" @click="goProducts">
          <el-icon :size="40" color="#e6a23c"><IceDrink /></el-icon>
          <span>饮料酒水</span>
        </div>
        <div class="cat-card" @click="goProducts">
          <el-icon :size="40" color="#f56c6c"><Chicken /></el-icon>
          <span>肉禽蛋品</span>
        </div>
        <div class="cat-card" @click="goProducts">
          <el-icon :size="40" color="#67c23a"><Goods /></el-icon>
          <span>日用百货</span>
        </div>
      </div>
    </div>

    <!-- 欢迎语/行动点 -->
    <div class="action-section">
      <h1>欢迎来到 SuperMarket</h1>
      <p>为您提供最新鲜的食材和最优质的服务</p>
      <el-button type="primary" size="large" round @click="goProducts">立即购物</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入图标
import { Food, IceDrink, Chicken, Goods } from '@element-plus/icons-vue'

const router = useRouter()

// 模拟轮播图数据 (你可以换成真实的图片URL)
const banners = ref([
  { id: 1, img: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg' },
  { id: 2, img: 'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg' },
  { id: 3, img: 'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg' }
])

const goProducts = () => {
  router.push('/products')
}
</script>

<style scoped>
.home-container {
  min-height: 80vh;
}

/* 轮播图样式 */
.banner-section {
  width: 100%;
  margin-bottom: 40px;
}
.banner-carousel {
  width: 100%;
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片填满不拉伸 */
  filter: brightness(0.9);
}

/* 内容区通用容器 */
.section-container {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
  text-align: center;
}
.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}

/* 分类卡片网格 */
.category-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}
.cat-card {
  width: 150px;
  height: 150px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s;
}
.cat-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
.cat-card span {
  font-size: 16px;
  color: #555;
  font-weight: 500;
}

/* 底部行动呼吁 */
.action-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
}
.action-section h1 { margin-bottom: 10px; color: #333; }
.action-section p { margin-bottom: 30px; color: #666; font-size: 18px; }
</style>