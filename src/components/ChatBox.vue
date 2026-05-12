<template>
  <div class="chat-container">
    <!-- 悬浮球 -->
    <div class="chat-ball" @click="toggleChat" v-if="!isOpen">
      <el-badge :value="unreadCount" :hidden="unreadCount===0" class="badge">
        <el-icon :size="24"><Service /></el-icon>
      </el-badge>
      <span class="text">客服</span>
    </div>

    <!-- 聊天窗口 -->
    <div class="chat-window" v-if="isOpen">
      <div class="header">
        <span>在线客服 (人工)</span>
        <el-icon class="close-btn" @click="isOpen = false"><Close /></el-icon>
      </div>
      
      <div class="msg-list" ref="msgListRef">
        <div v-for="msg in list" :key="msg.id" 
             class="msg-item" 
             :class="{ 'self': msg.senderRole === 'USER' }">
          <el-avatar :size="30" :src="msg.senderRole === 'USER' ? userAvatar : adminAvatar" />
          <div class="content">{{ msg.content }}</div>
        </div>
      </div>

      <div class="input-area">
        <el-input v-model="inputContent" placeholder="请输入..." @keyup.enter="handleSend" />
        <el-button type="primary" size="small" @click="handleSend" :disabled="!inputContent">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { Service, Close } from '@element-plus/icons-vue'
import { sendMessage, getMessageList } from '@/api/message'

const isOpen = ref(false)
const inputContent = ref('')
const list = ref([])
const msgListRef = ref(null)
const unreadCount = ref(0)
let timer = null

const userAvatar = localStorage.getItem('avatar') || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const adminAvatar = 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'

// 轮询获取消息
const fetchMessages = async () => {
  if(!localStorage.getItem('token')) return // 未登录不轮询
  
  try {
    const res = await getMessageList()
    if (res.code === 0) {
      // 简单判断是否有新消息
      if (res.data.length > list.value.length) {
        list.value = res.data
        scrollToBottom()
        if (!isOpen.value) unreadCount.value += 1
      }
    }
  } catch(e) {}
}

const handleSend = async () => {
  if (!inputContent.value.trim()) return
  
  const msg = { content: inputContent.value }
  // 乐观更新
  list.value.push({ 
    senderRole: 'USER', 
    content: inputContent.value, 
    id: Date.now() 
  })
  const temp = inputContent.value
  inputContent.value = ''
  scrollToBottom()

  await sendMessage(msg)
  fetchMessages() // 立即刷新一次
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight
    }
  })
}

const toggleChat = () => {
  isOpen.value = true
  unreadCount.value = 0
  scrollToBottom()
}

onMounted(() => {
  fetchMessages()
  timer = setInterval(fetchMessages, 3000) // 3秒轮询一次
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.chat-container { position: fixed; right: 30px; bottom: 30px; z-index: 999; }

/* 悬浮球 */
.chat-ball {
  width: 60px; height: 60px; background: #409eff; border-radius: 50%;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  color: #fff; cursor: pointer; box-shadow: 0 4px 12px rgba(64,158,255,0.4);
  transition: transform 0.3s;
}
.chat-ball:hover { transform: scale(1.1); }
.chat-ball .text { font-size: 12px; margin-top: 2px; }

/* 聊天窗口 */
.chat-window {
  width: 350px; height: 500px; background: #fff; border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column;
  overflow: hidden; animation: slideUp 0.3s;
}
.header {
  height: 50px; background: #409eff; color: #fff; display: flex; 
  align-items: center; justify-content: space-between; padding: 0 15px; font-weight: bold;
}
.close-btn { cursor: pointer; }

.msg-list { flex: 1; padding: 15px; overflow-y: auto; background: #f5f7fa; }
.msg-item { display: flex; gap: 10px; margin-bottom: 15px; }
.msg-item.self { flex-direction: row-reverse; }
.content {
  background: #fff; padding: 8px 12px; border-radius: 8px; font-size: 14px; line-height: 1.4;
  max-width: 70%; word-break: break-all; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.self .content { background: #95ec69; color: #000; }

.input-area {
  padding: 10px; border-top: 1px solid #eee; display: flex; gap: 10px; background: #fff;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>