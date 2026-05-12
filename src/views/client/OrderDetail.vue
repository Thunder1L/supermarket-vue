<!-- <template>
  <div class="order-detail">
    <h2>订单详情</h2>

    <el-card>
      <div>
        <p><strong>订单编号：</strong>{{ order.id }}</p>
        <p><strong>用户编号：</strong>{{ order.userId }}</p>
        <p><strong>订单金额：</strong>{{ order.totalAmount }} 元</p>
        <p><strong>订单状态：</strong>{{ order.status }}</p>
      </div>
    </el-card>

    <h3 style="margin-top: 20px">商品列表</h3>

    <el-table :data="items" border>
      <el-table-column prop="productId" label="商品ID" width="120"></el-table-column>
      <el-table-column prop="quantity" label="数量" width="120"></el-table-column>
      <el-table-column prop="price" label="价格"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrderDetail, getOrderItems } from '@/api/order'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = route.query.orderId // 从 URL 获取 orderId

const order = ref({})
const items = ref([])

onMounted(() => {
  loadDetail()
  loadItems()
})

const loadDetail = async () => {
  const res = await getOrderDetail(orderId)
  if (res.code === 200) {
    order.value = res.data
  }
}

const loadItems = async () => {
  const res = await getOrderItems(orderId)
  if (res.code === 200) {
    items.value = res.data
  }
}
</script>

<style scoped>
.order-detail {
  padding: 20px;
}
</style> -->
