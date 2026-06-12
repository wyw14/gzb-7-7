<template>
  <div class="checkin-card card">
    <div class="checkin-header">
      <router-link :to="checkin.userId ? `/buddies/${checkin.userId}` : '#'" class="user-row">
        <img v-if="checkin.user" :src="checkin.user.avatar" class="avatar-md" />
        <div class="user-info">
          <span class="username">{{ checkin.user?.username || '匿名用户' }}</span>
          <span class="level-badge">{{ checkin.user?.skillLevel }}</span>
        </div>
      </router-link>
      <span class="checkin-time">{{ formatTime(checkin.createdAt) }}</span>
    </div>
    
    <div class="checkin-content">
      <div class="checkin-meta">
        <span class="meta-item">
          <el-icon><MagicStick /></el-icon>
          {{ checkin.instrument }}
        </span>
        <span class="meta-item">
          <el-icon><Notebook /></el-icon>
          {{ checkin.piece || '自由练习' }}
        </span>
        <span class="meta-item">
          <el-icon><Timer /></el-icon>
          {{ checkin.duration }} 分钟
        </span>
      </div>
      
      <p class="notes">{{ checkin.notes }}</p>
    </div>
    
    <div v-if="checkin.photo" class="checkin-photo">
      <img :src="checkin.photo" />
    </div>
  </div>
</template>

<script setup>
import { MagicStick, Notebook, Timer } from '@element-plus/icons-vue'

defineProps({
  checkin: { type: Object, required: true }
})

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.checkin-card {
  padding: 16px;
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.level-badge {
  font-size: 11px;
  padding: 1px 6px;
  background: #eef2ff;
  color: var(--primary-dark);
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.checkin-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.checkin-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 10px;
  background: var(--bg-light);
  border-radius: 6px;
}

.notes {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.checkin-photo {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.checkin-photo img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}
</style>
