<template>
  <router-link :to="`/instruments/${instrument.id}`" class="instrument-card card">
    <div class="instrument-image">
      <img :src="instrument.image || defaultImage" :alt="instrument.name" />
      <span class="condition-badge" :class="conditionClass">{{ instrument.condition }}</span>
      <span v-if="instrument.status !== 'available'" class="status-badge borrowed">
        {{ instrument.status === 'borrowed' ? '借用中' : instrument.status === 'pending' ? '审核中' : '已下架' }}
      </span>
    </div>
    <div class="instrument-info">
      <h3 class="instrument-name" :title="instrument.name">{{ instrument.name }}</h3>
      <div class="instrument-tags">
        <span class="tag tag-category">{{ instrument.category }}</span>
        <span class="tag tag-level">{{ instrument.level }}</span>
        <span v-if="instrument.distance !== undefined" class="tag tag-distance">
          {{ instrument.distance }}km
        </span>
      </div>
      <div class="instrument-desc" :title="instrument.description">
        {{ instrument.description }}
      </div>
      <div class="instrument-footer">
        <div class="owner-info" v-if="instrument.owner">
          <img :src="instrument.owner.avatar" class="avatar-sm" />
          <span class="owner-name">{{ instrument.owner.username }}</span>
        </div>
        <div class="price-info">
          <span class="fee">¥{{ instrument.dailyFee }}<small>/天</small></span>
        </div>
      </div>
      <div class="location-row">
        <el-icon><Location /></el-icon>
        <span>{{ instrument.location }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { Location } from '@element-plus/icons-vue'

const props = defineProps({
  instrument: {
    type: Object,
    required: true
  }
})

const defaultImage = 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400'

const conditionClass = computed(() => {
  const map = {
    '九五新': 'excellent',
    '九成新': 'good',
    '八五新': 'normal',
    '八成新': 'fair'
  }
  return map[props.instrument.condition] || 'normal'
})
</script>

<style scoped>
.instrument-card {
  display: block;
  overflow: hidden;
  padding: 0;
}

.instrument-image {
  position: relative;
  width: 100%;
  padding-top: 70%;
  overflow: hidden;
}

.instrument-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.instrument-card:hover .instrument-image img {
  transform: scale(1.05);
}

.condition-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.condition-badge.excellent { background: #10b981; }
.condition-badge.good { background: #3b82f6; }
.condition-badge.normal { background: #f59e0b; }
.condition-badge.fair { background: #ef4444; }

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.borrowed {
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.instrument-info {
  padding: 16px;
}

.instrument-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instrument-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: var(--bg-light);
}

.tag-category {
  background: #eef2ff;
  color: var(--primary-dark);
}

.tag-level {
  background: #fef3c7;
  color: #b45309;
}

.tag-distance {
  background: #d1fae5;
  color: #059669;
}

.instrument-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.instrument-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.owner-name {
  font-size: 13px;
  color: var(--text-secondary);
}

.fee {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.fee small {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
}

.location-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
