<template>
  <div class="page-container">
    <!-- 1. 顶部搜索与操作栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.keyword" placeholder="输入名称搜索" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryParams.categoryId" placeholder="全部分类" clearable @change="handleSearch">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button type="success" :icon="Plus" @click="openAddDialog">新增商品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="scope">
            <el-image 
              style="width: 60px; height: 60px; border-radius: 4px"
              :src="scope.row.imgUrl" 
              :preview-src-list="[scope.row.imgUrl]"
              fit="cover"
              preview-teleported
            >
              <template #error><el-icon><Picture /></el-icon></template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
        
        <el-table-column label="分类" width="120" align="center">
          <template #default="scope">
            <el-tag effect="plain">{{ scope.row.categoryName || '无分类' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="库存" width="100" align="center" />
        
        <el-table-column prop="sales" label="销量" width="100" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(val) => handleStatusChange(scope.row, val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="queryParams.size"
          v-model:current-page="queryParams.page"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 3. 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="商品库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="图片URL" prop="imgUrl">
          <el-input v-model="form.imgUrl" placeholder="输入图片网络地址" />
        </el-form-item>
        
        <el-form-item label="商品简介">
          <el-input v-model="form.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Edit, Delete, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getProductList, 
  getCategoryList, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  updateProductStatus 
} from '@/api/product'

// 数据定义
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const categories = ref([])

const queryParams = reactive({
  page: 1,
  size: 10,
  keyword: '',
  categoryId: null
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const form = reactive({
  id: null,
  name: '',
  categoryId: null,
  price: 0,
  stock: 0,
  imgUrl: '',
  description: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

// 初始化
onMounted(async () => {
  await loadCategories()
  loadData()
})

// 加载分类
const loadCategories = async () => {
  const res = await getCategoryList()
  if (res.code === 0) categories.value = res.data
}

// 加载列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getProductList(queryParams)
    if (res.code === 0) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

// 打开新增
const openAddDialog = () => {
  dialogTitle.value = '新增商品'
  dialogVisible.value = true
  // 重置表单
  Object.assign(form, {
    id: null, name: '', categoryId: null, price: 0, stock: 100, 
    imgUrl: '', description: '', status: 1
  })
  // 清除校验
  if(formRef.value) formRef.value.clearValidate()
}

// 打开编辑
const openEditDialog = (row) => {
  dialogTitle.value = '编辑商品'
  dialogVisible.value = true
  // 复制数据 (注意深拷贝)
  Object.assign(form, row)
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const api = form.id ? updateProduct : addProduct
        const res = await api(form)
        if (res.code === 0) {
          ElMessage.success('操作成功')
          dialogVisible.value = false
          loadData()
        } else {
          ElMessage.error(res.msg)
        }
      } catch (e) {}
    }
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteProduct(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadData()
    }
  })
}

// 切换状态
const handleStatusChange = async (row, newVal) => {
  try {
    const res = await updateProductStatus(row.id, newVal)
    if (res.code === 0) {
      ElMessage.success(newVal === 1 ? '已上架' : '已下架')
    } else {
      // 失败了改回去
      row.status = newVal === 1 ? 0 : 1
      ElMessage.error(res.msg)
    }
  } catch(e) {
    row.status = newVal === 1 ? 0 : 1
  }
}
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-bottom: 20px; }
.pagination-box { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>