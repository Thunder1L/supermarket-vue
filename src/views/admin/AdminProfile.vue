<template>
  <div class="admin-profile">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <el-row :gutter="40">
        <!-- 左侧：头像展示 -->
        <el-col :span="8" class="profile-left">
          <el-avatar :size="120" :src="form.avatar" class="avatar-lg">
            {{ form.username ? form.username.charAt(0).toUpperCase() : 'A' }}
          </el-avatar>
          <h3>{{ form.username }}</h3>
          <el-tag type="danger">超级管理员</el-tag>
          <div class="meta-info">
            <p><el-icon><Phone /></el-icon> {{ form.phone || '未绑定手机号' }}</p>
          </div>
        </el-col>

        <!-- 右侧：表单编辑 -->
        <el-col :span="16">
          <el-tabs v-model="activeTab">
            
            <!-- Tab 1: 资料修改 -->
            <el-tab-pane label="基本资料" name="info">
              <el-form :model="form" label-width="80px" style="max-width: 500px; margin-top: 20px;">
                <el-form-item label="管理员名">
                  <el-input v-model="form.username" />
                </el-form-item>
                
                <el-form-item label="头像URL">
                  <el-input v-model="form.avatar" placeholder="请输入图片链接" />
                  <div class="avatar-tips">推荐头像：</div>
                  <div class="avatar-list">
                    <img 
                      v-for="(img, i) in presetAvatars" 
                      :key="i" 
                      :src="img" 
                      class="mini-avatar" 
                      @click="form.avatar = img"
                    />
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleUpdate">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- Tab 2: 修改密码 -->
            <el-tab-pane label="修改密码" name="password">
              <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="100px" style="max-width: 500px; margin-top: 20px;">
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input v-model="pwdForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="pwdForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="danger" @click="handleChangePwd">确认修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Phone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import adminApi from '@/api/adminUser'

const activeTab = ref('info')
const pwdFormRef = ref(null)

const presetAvatars = [
  'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
]

const form = reactive({
  id: '',
  username: '',
  phone: '',
  avatar: ''
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value !== pwdForm.newPassword) callback(new Error('两次密码不一致'))
  else callback()
}
const pwdRules = {
  oldPassword: [{ required: true, message: '必填', trigger: 'blur' }],
  newPassword: [{ required: true, message: '必填', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

onMounted(() => {
  form.id = localStorage.getItem('adminId')
  form.username = localStorage.getItem('username')
  form.avatar = localStorage.getItem('avatar')
  form.phone = localStorage.getItem('phone')
})

const handleUpdate = async () => {
  try {
    const res = await adminApi.updateInfo({
      id: form.id,
      username: form.username,
      avatar: form.avatar
    })
    if (res.code === 0) {
      ElMessage.success('更新成功')
      localStorage.setItem('username', res.data.username)
      localStorage.setItem('avatar', res.data.avatar)
      setTimeout(() => location.reload(), 800)
    } else {
      ElMessage.error(res.msg)
    }
  } catch(e) {}
}

const handleChangePwd = async () => {
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await adminApi.changePassword({
          userId: form.id,
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
        if (res.code === 0) {
          ElMessage.success('密码已修改，请重新登录')
          localStorage.clear()
          setTimeout(() => location.href = '/admin/login', 1000)
        } else {
          ElMessage.error(res.msg)
        }
      } catch(e) {}
    }
  })
}
</script>

<style scoped>
.admin-profile { padding: 20px; }
.card-header { font-weight: bold; }
.profile-left { text-align: center; border-right: 1px solid #eee; padding-top: 20px; }
.avatar-lg { margin-bottom: 15px; border: 4px solid #f0f2f5; }
.meta-info { margin-top: 20px; color: #666; font-size: 14px; }
.avatar-list { display: flex; gap: 10px; margin-top: 10px; }
.mini-avatar { width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
.mini-avatar:hover { border-color: #409eff; }
.avatar-tips { font-size: 12px; color: #999; margin-top: 5px; }
</style>