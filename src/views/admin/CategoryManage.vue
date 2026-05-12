<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>商品分类管理</span>
          <el-button type="primary" :icon="Plus" @click="openAddDialog">新增分类</el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column prop="name" label="分类名称" align="center">
          <template #default="scope">
             <el-tag size="large">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sort" label="排序权重" align="center" />

        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(scope.row, val)"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" align="center" width="180" />

        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="400px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getCategoryList, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  updateCategoryStatus 
} from '@/api/product'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  sort: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    if (res.code === 0) {
      tableData.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  dialogTitle.value = '新增分类'
  dialogVisible.value = true
  Object.assign(form, { id: null, name: '', sort: 0, status: 1 })
  if(formRef.value) formRef.value.clearValidate()
}

const openEditDialog = (row) => {
  dialogTitle.value = '编辑分类'
  dialogVisible.value = true
  Object.assign(form, row)
}

const submitForm = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const api = form.id ? updateCategory : addCategory
      const res = await api(form)
      if (res.code === 0) {
        ElMessage.success('操作成功')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.msg)
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除 "${row.name}" 吗?`, '警告', {
    type: 'warning'
  }).then(async () => {
    const res = await deleteCategory(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

const handleStatusChange = async (row, newVal) => {
  try {
    const res = await updateCategoryStatus(row.id, newVal)
    if (res.code === 0) {
      ElMessage.success('状态已更新')
    } else {
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
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>