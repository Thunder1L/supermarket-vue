<template>
  <div class="page-container">
    <el-card shadow="never" class="chat-card">
      <div slot="header">用户消息中心 (所有记录)</div>
      
      <div class="msg-list" ref="adminMsgList">
        <div v-for="msg in list" :key="msg.id" 
             class="msg-item" 
             :class="{ 'admin-side': msg.senderRole === 'ADMIN' }">
          
          <div class="meta" v-if="msg.senderRole === 'USER'">
            <el-tag size="small">用户ID: {{ msg.senderId }}</el-tag>
          </div>
          
          <div class="bubble">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <div class="reply-area">
        <el-input v-model="targetUserId" placeholder="回复给用户ID" style="width: 120px; margin-right: 10px;" />
        <el-input v-model="replyContent" placeholder="回复内容..." style="flex:1; margin-right: 10px;" />
        <el-button type="primary" @click="sendReply">发送回复</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getAdminMessageList, sendMessage } from '@/api/message'
import { ElMessage } from 'element-plus'

const list = ref([])
const replyContent = ref('')
const targetUserId = ref('')
let timer = null

const loadMsgs = async () => {
  const res = await getAdminMessageList()
  if(res.code === 0) list.value = res.data
}

const sendReply = async () => {
  if(!targetUserId.value || !replyContent.value) return ElMessage.warning('ID和内容必填')
  
  await sendMessage({
    content: replyContent.value,
    receiverId: targetUserId.value // 发给谁
  })
  ElMessage.success('已回复')
  replyContent.value = ''
  loadMsgs()
}

onMounted(() => {
  loadMsgs()
  timer = setInterval(loadMsgs, 3000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.page-container { padding: 20px; height: 85vh; }
.chat-card { height: 100%; display: flex; flex-direction: column; }
/* ... 简单样式，参考 ChatBox ... */
</style>