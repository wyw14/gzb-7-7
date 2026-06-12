<template>
  <div class="buddy-card card">
    <div class="buddy-header">
      <router-link :to="`/buddies/${user.id}`" class="avatar-wrap">
        <img :src="user.avatar" class="avatar-lg" />
        <span v-if="showScore && user.score" class="match-score">
          {{ user.score }}分
        </span>
      </router-link>
      <div class="buddy-basic">
        <router-link :to="`/buddies/${user.id}`" class="username">
          {{ user.username }}
        </router-link>
        <div class="level-row">
          <span class="badge badge-primary">{{ user.skillLevel }}</span>
          <span class="rating">
            <el-icon><Star /></el-icon>
            {{ user.rating || 5.0 }}
          </span>
          <span class="review-count">({{ user.reviewCount || 0 }}评价)</span>
        </div>
      </div>
    </div>
    
    <p class="bio">{{ user.bio }}</p>
    
    <div class="section-block">
      <div class="label"><el-icon><MagicStick /></el-icon> 擅长乐器</div>
      <div class="tags">
        <span v-for="inst in user.instruments" :key="inst" class="tag tag-inst">{{ inst }}</span>
        <span v-if="user.sharedInstruments && user.sharedInstruments.length" class="tag tag-shared">
          共同: {{ user.sharedInstruments.join('、') }}
        </span>
      </div>
    </div>
    
    <div class="section-block">
      <div class="label"><el-icon><Notebook /></el-icon> 喜欢的曲子</div>
      <div class="tags">
        <span v-for="p in user.favoritePieces.slice(0,3)" :key="p" class="tag tag-piece">{{ p }}</span>
        <span v-if="user.commonPieces && user.commonPieces.length" class="tag tag-shared">
          共爱: {{ user.commonPieces.join('、') }}
        </span>
      </div>
    </div>
    
    <div class="section-block">
      <div class="label"><el-icon><Clock /></el-icon> 空闲时间</div>
      <div class="tags">
        <span v-for="t in user.freeTimes" :key="t" class="tag tag-time">{{ t }}</span>
        <span v-if="user.sharedTimes && user.sharedTimes.length" class="tag tag-shared">
          同时间: {{ user.sharedTimes.join('、') }}
        </span>
      </div>
    </div>
    
    <div class="location" v-if="user.distance !== undefined || user.district">
      <el-icon><Location /></el-icon>
      {{ user.district || user.city }}
      <span v-if="user.distance !== undefined" class="distance">· 距你 {{ user.distance }}km</span>
    </div>
    
    <div class="buddy-actions" v-if="showActions">
      <el-button type="primary" size="small" @click="$emit('invite', user)">
        <el-icon><ChatDotRound /></el-icon>
        邀约练琴
      </el-button>
      <router-link :to="`/buddies/${user.id}`">
        <el-button size="small">查看主页</el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Star, MagicStick, Notebook, Clock, Location, ChatDotRound } from '@element-plus/icons-vue'

defineProps({
  user: { type: Object, required: true },
  showScore: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true }
})

defineEmits(['invite'])
</script>

<style scoped>
.buddy-card {
  height: 100%;
}

.buddy-header {
  display: flex;
  gap: 14px;
  margin-bottom: 12px;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid #e0e7ff;
}

.match-score {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.buddy-basic {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 6px;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #f59e0b;
  font-weight: 500;
}

.review-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.bio {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--border-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.section-block {
  margin-bottom: 10px;
}

.label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  background: var(--bg-light);
  color: var(--text-secondary);
}

.tag-inst {
  background: #eef2ff;
  color: var(--primary-dark);
  font-weight: 500;
}

.tag-piece {
  background: #fdf2f8;
  color: #be185d;
}

.tag-time {
  background: #ecfeff;
  color: #0e7490;
}

.tag-shared {
  background: #d1fae5;
  color: #059669;
  font-weight: 500;
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

.distance {
  color: #059669;
  font-weight: 500;
}

.buddy-actions {
  display: flex;
  gap: 10px;
}
</style>
