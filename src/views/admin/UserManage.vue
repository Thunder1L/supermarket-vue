<template>
  <div style="padding:20px">
    <h2>用户管理</h2>
    <el-input v-model="q" placeholder="搜索手机号或ID" style="width:300px; margin-bottom:12px" @keyup.enter="loadList" />
    <el-button @click="loadList">搜索</el-button>

    <el-table :data="users" style="width:100%; margin-top:12px">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="createTime" label="创建时间" width="200" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="mini" type="danger" @click="deleteUser(row.id)">删除</el-button>
          <el-button size="mini" @click="banUser(row.id)">封禁</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../api/adminUser";
import { ElMessage } from "element-plus";

const users = ref([]);
const q = ref('');
const token = localStorage.getItem('adminToken') || '';

const loadList = async () => {
  try {
    const res = await api.list(token);
    if (res.data && res.data.code === 0) {
      users.value = res.data.data;
    } else {
      ElMessage.error(res.data.msg || '加载失败');
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('请求出错');
  }
};

const deleteUser = async (id) => {
  if (!confirm('确定删除用户？')) return;
  const res = await api.delete(id, token);
  if (res.data && res.data.code === 0) {
    ElMessage.success('删除成功');
    loadList();
  } else {
    ElMessage.error(res.data.msg || '删除失败');
  }
};

const banUser = async (id) => {
  const res = await api.ban(id, token);
  if (res.data && res.data.code === 0) {
    ElMessage.success('已封禁');
    loadList();
  } else {
    ElMessage.error(res.data.msg || '操作失败');
  }
};

onMounted(loadList);
</script>
