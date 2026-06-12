<template>
  <div class="checkin-page">
    <div class="page-header">
      <div class="container">
        <h1>🎯 练琴打卡</h1>
        <p>记录每一次进步，和搭子互相督促</p>
      </div>
    </div>
    
    <div class="container">
      <div class="checkin-grid">
        <div class="left-col">
          <div class="stats-card card mb-20">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="icon-wrap streak"><el-icon><Trophy /></el-icon></div>
                <div>
                  <span class="num">{{ stats?.currentStreak || 0 }}</span>
                  <span class="label">连续天数</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="icon-wrap count"><el-icon><Document /></el-icon></div>
                <div>
                  <span class="num">{{ stats?.totalCount || 0 }}</span>
                  <span class="label">总打卡</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="icon-wrap hours"><el-icon><Timer /></el-icon></div>
                <div>
                  <span class="num">{{ stats?.totalHours || 0 }}</span>
                  <span class="label">总小时</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-20" v-if="stats?.instrumentStats && Object.keys(stats.instrumentStats).length">
            <h3><el-icon><PieChart /></el-icon> 按乐器统计</h3>
            <div class="inst-stats">
              <div class="inst-stat" v-for="(v, k) in stats.instrumentStats" :key="k">
                <div class="inst-stat-header">
                  <span class="inst-name">{{ k }}</span>
                  <span class="inst-hours">{{ Math.round(v.minutes/60*10)/10 }}小时 / {{ v.count }}次</span>
                </div>
                <el-progress :percentage="Math.min(100, v.minutes / maxMinutes * 100)" :stroke-width="8" />
              </div>
            </div>
          </div>
          
          <div class="checkin-form card">
            <h3><el-icon><Edit /></el-icon> 今日打卡</h3>
            <el-form :model="form" label-width="80px" @submit.prevent>
              <el-form-item label="练习乐器" required>
                <el-select v-model="form.instrument" placeholder="选择乐器" style="width: 100%">
                  <el-option v-for="inst in instrumentOptions" :key="inst" :label="inst" :value="inst" />
                </el-select>
              </el-form-item>
              <el-form-item label="练习曲目">
                <el-select v-model="form.piece" filterable allow-create default-first-option placeholder="选择或输入曲目" style="width: 100%">
                  <el-option v-for="p in pieceOptions" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item>
              <el-form-item label="练习时长" required>
                <el-input-number v-model="form.duration" :min="5" :max="600" :step="10" />
                <span style="margin-left: 12px; color: var(--text-secondary)">分钟</span>
              </el-form-item>
              <el-form-item label="练习笔记">
                <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="今天练了什么？有什么心得？" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" :loading="submitting" @click="submit">
                  <el-icon><SuccessFilled /></el-icon>
                  打卡
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
        
        <div class="right-col">
          <div class="card" style="min-height: 600px">
            <div class="feed-header">
              <h3><el-icon><Promotion /></el-icon> 打卡动态</h3>
              <el-radio-group v-model="feedFilter" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="mine">我的</el-radio-button>
              </el-radio-group>
            </div>
            <div v-if="filteredFeed.length" class="checkin-feed">
              <CheckinCard v-for="c in filteredFeed" :key="c.id" :checkin="c" />
            </div>
            <div v-else class="empty-state">
              <el-icon><Document /></el-icon>
              <p>暂无打卡记录，去完成今天的第一次打卡吧！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { checkinApi, recommendApi } from '../api'
import CheckinCard from '../components/CheckinCard.vue'
import { ElMessage } from 'element-plus'
import { Trophy, Document, Timer, PieChart, Edit, SuccessFilled, Promotion } from '@element-plus/icons-vue'

const userStore = useUserStore()

const stats = ref(null)
const feedFilter = ref('all')
const myCheckins = ref([])
const allCheckins = ref([])
const submitting = ref(false)

const form = reactive({
  userId: userStore.userId,
  instrument: '',
  piece: '',
  duration: 60,
  notes: '',
  photo: ''
})

const instrumentOptions = computed(() => {
  const base = userStore.currentUser?.instruments || ['古典吉他', '钢琴', '小提琴', '尤克里里']
  return [...new Set([...base, '古典吉他', '钢琴', '小提琴', '尤克里里', '架子鼓', '竹笛'])]
})

const pieceOptions = ref([])

const maxMinutes = computed(() => {
  if (!stats.value?.instrumentStats) return 1
  return Math.max(1, ...Object.values(stats.value.instrumentStats).map(v => v.minutes))
})

const filteredFeed = computed(() => {
  if (feedFilter.value === 'mine') return myCheckins.value
  return allCheckins.value
})

onMounted(async () => {
  await loadData()
  try {
    const result = await recommendApi.pieces(userStore.userId)
    pieceOptions.value = result.recommendations.map(r => r.piece).slice(0, 20)
  } catch (e) {}
  form.instrument = userStore.currentUser?.instruments?.[0] || instrumentOptions.value[0]
})

const loadData = async () => {
  try {
    stats.value = await checkinApi.stats(userStore.userId)
  } catch (e) {}
  try {
    myCheckins.value = await checkinApi.list({ userId: userStore.userId })
  } catch (e) {}
  try {
    allCheckins.value = await checkinApi.list()
  } catch (e) {}
}

const submit = async () => {
  if (!form.instrument || !form.duration) {
    ElMessage.warning('请填写乐器和时长')
    return
  }
  submitting.value = true
  try {
    const result = await checkinApi.create({ ...form })
    if (result.success) {
      ElMessage.success('打卡成功！继续加油 🎉')
      form.notes = ''
      form.piece = ''
      form.duration = 60
      await loadData()
    }
  } catch (e) {
    ElMessage.error('打卡失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkin-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
}

.stats-card .stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.icon-wrap.streak { background: linear-gradient(135deg, #f59e0b, #d97706); }
.icon-wrap.count { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.icon-wrap.hours { background: linear-gradient(135deg, #10b981, #059669); }

.stat-item .num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-item .label {
  font-size: 12px;
  color: var(--text-secondary);
}

.card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-bottom: 16px;
}

.inst-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inst-stat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.inst-name {
  font-weight: 500;
}

.inst-hours {
  color: var(--text-secondary);
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.checkin-feed {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: 900px) {
  .checkin-grid {
    grid-template-columns: 1fr;
  }
}
</style>
