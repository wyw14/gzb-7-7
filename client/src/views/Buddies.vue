<template>
  <div class="buddies-page">
    <div class="page-header">
      <div class="container">
        <h1>👥 寻找练习搭子</h1>
        <p>按乐器、水平、时间和距离智能匹配，找到最适合你的练琴伙伴</p>
      </div>
    </div>
    
    <div class="container">
      <div class="filter-bar card mb-20" v-if="userStore.isLoggedIn">
        <div class="filter-row">
          <div class="filter-group">
            <label>共同乐器</label>
            <el-select v-model="filters.instrument" placeholder="全部" clearable style="width: 160px">
              <el-option v-for="inst in instrumentOptions" :key="inst" :label="inst" :value="inst" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>水平匹配</label>
            <el-select v-model="filters.skillLevel" placeholder="全部" clearable style="width: 140px">
              <el-option label="初级" value="初级" />
              <el-option label="中级" value="中级" />
              <el-option label="高级" value="高级" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>最大距离</label>
            <el-select v-model="filters.maxDistance" placeholder="20km" style="width: 120px">
              <el-option label="5公里" :value="5" />
              <el-option label="10公里" :value="10" />
              <el-option label="20公里" :value="20" />
              <el-option label="50公里" :value="50" />
              <el-option label="不限" :value="100" />
            </el-select>
          </div>
          <el-button type="primary" @click="loadRecommendations">
            <el-icon><Refresh /></el-icon>
            智能匹配
          </el-button>
        </div>
      </div>
      
      <div class="result-info mb-20" v-if="userStore.isLoggedIn && recommendationData">
        <div class="match-summary card">
          <div class="summary-stat">
            <span class="stat-num highlight">{{ recommendationData.totalMatches }}</span>
            <span class="stat-label">高度匹配搭子</span>
          </div>
          <div class="summary-stat">
            <span class="stat-num">{{ recommendationData.recommendations.length }}</span>
            <span class="stat-label">推荐列表</span>
          </div>
          <div class="summary-action">
            <el-button type="primary" size="large" @click="loadRecommendations">
              <el-icon><Refresh /></el-icon>
              重新匹配
            </el-button>
          </div>
        </div>
      </div>
      
      <div v-if="sortedBuddies.length" class="grid grid-3 gap-20">
        <BuddyCard v-for="b in sortedBuddies" :key="b.id" :user="b" :showScore="true" @invite="openInviteDialog" />
      </div>
      <div v-else class="empty-state">
        <el-icon><User /></el-icon>
        <p v-if="!userStore.isLoggedIn">请先登录以查看练习搭子推荐</p>
        <p v-else>暂无匹配的搭子，试试调整筛选条件</p>
      </div>
    </div>
    
    <el-dialog v-model="showInvite" title="发送练琴邀约" width="500px">
      <el-form :model="inviteForm" label-width="100px">
        <el-form-item label="邀约对象">
          <span>{{ currentBuddy?.username }}</span>
        </el-form-item>
        <el-form-item label="乐器" prop="instrument">
          <el-select v-model="inviteForm.instrument" placeholder="选择乐器" style="width: 100%">
            <el-option v-for="inst in sharedInstruments" :key="inst" :label="inst" :value="inst" />
          </el-select>
        </el-form-item>
        <el-form-item label="想练曲目">
          <el-input v-model="inviteForm.piece" placeholder="如：爱的罗曼史二重奏" />
        </el-form-item>
        <el-form-item label="约练时间" prop="meetTime">
          <el-date-picker
            v-model="inviteForm.meetTime"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="约练地点" prop="location">
          <el-input v-model="inviteForm.location" placeholder="建议选择公共空间" />
        </el-form-item>
        <el-form-item label="留言">
          <el-input v-model="inviteForm.message" type="textarea" :rows="3" placeholder="给TA留个言..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInvite = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitInvite">发送邀约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { recommendApi, userApi, invitationApi } from '../api'
import BuddyCard from '../components/BuddyCard.vue'
import { ElMessage } from 'element-plus'
import { Refresh, User } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const requireLogin = inject('requireLogin', () => router.push('/login'))

const filters = reactive({
  instrument: '',
  skillLevel: '',
  maxDistance: 20
})

const allBuddies = ref([])
const recommendationData = ref(null)
const currentBuddy = ref(null)
const showInvite = ref(false)
const submitting = ref(false)

const inviteForm = reactive({
  instrument: '',
  piece: '',
  meetTime: null,
  location: '',
  message: ''
})

const instrumentOptions = computed(() => {
  const set = new Set()
  allBuddies.value.forEach(b => b.instruments?.forEach(i => set.add(i)))
  return Array.from(set)
})

const sharedInstruments = computed(() => {
  if (!currentBuddy.value) return []
  const userInsts = userStore.currentUser?.instruments || []
  const buddyInsts = currentBuddy.value.instruments || []
  const shared = userInsts.filter(i => buddyInsts.includes(i))
  return shared.length ? shared : buddyInsts
})

const sortedBuddies = computed(() => {
  let arr = [...allBuddies.value]
  if (filters.skillLevel) {
    arr = arr.filter(b => b.skillLevel === filters.skillLevel)
  }
  arr.sort((a, b) => (b.score || 0) - (a.score || 0))
  return arr
})

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await loadRecommendations()
  } else {
    try {
      allBuddies.value = await userApi.list()
    } catch (e) {}
  }
})

const loadRecommendations = async () => {
  if (!userStore.isLoggedIn) {
    requireLogin()
    return
  }
  try {
    const params = {
      instrument: filters.instrument || undefined,
      maxDistance: filters.maxDistance
    }
    const result = await recommendApi.buddies(userStore.userId, params)
    recommendationData.value = result
    allBuddies.value = result.recommendations
  } catch (e) {
    ElMessage.error('加载推荐失败')
  }
}

const openInviteDialog = (buddy) => {
  if (!userStore.isLoggedIn) {
    requireLogin()
    return
  }
  currentBuddy.value = buddy
  inviteForm.instrument = sharedInstruments.value[0] || ''
  inviteForm.piece = buddy.commonPieces?.[0] || ''
  showInvite.value = true
}

const submitInvite = async () => {
  if (!inviteForm.instrument || !inviteForm.meetTime || !inviteForm.location) {
    ElMessage.warning('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    await invitationApi.create({
      inviterId: userStore.userId,
      inviteeId: currentBuddy.value.id,
      instrument: inviteForm.instrument,
      piece: inviteForm.piece,
      skillLevelMatch: `${userStore.currentUser.skillLevel}-${currentBuddy.value.skillLevel}`,
      meetTime: new Date(inviteForm.meetTime).toLocaleString('zh-CN', { hour12: false }),
      location: inviteForm.location,
      latitude: currentBuddy.value.latitude,
      longitude: currentBuddy.value.longitude,
      message: inviteForm.message
    })
    ElMessage.success('邀约已发送！')
    showInvite.value = false
  } catch (e) {
    ElMessage.error('发送失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.filter-bar {
  padding: 20px 24px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.match-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-num.highlight {
  color: var(--primary-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
