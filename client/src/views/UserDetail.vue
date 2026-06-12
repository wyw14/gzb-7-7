<template>
  <div class="user-detail" v-if="user">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/buddies' }">练习搭子</el-breadcrumb-item>
        <el-breadcrumb-item>{{ user.username }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="profile-header card mb-20">
        <div class="avatar-wrap">
          <img :src="user.avatar" class="avatar-xl" />
        </div>
        <div class="profile-info">
          <h1>{{ user.username }}</h1>
          <div class="meta-row">
            <span class="badge badge-primary">{{ user.skillLevel }}</span>
            <span class="rating">
              <el-rate v-model="user.rating" disabled size="small" />
              <span class="rating-num">{{ user.rating }} ({{ user.reviewCount }}评价)</span>
            </span>
            <span class="location">
              <el-icon><Location /></el-icon>
              {{ user.city }} {{ user.district }}
            </span>
          </div>
          <p class="bio">{{ user.bio }}</p>
          <div class="action-row" v-if="userStore.isLoggedIn && user.id !== userStore.userId">
            <el-button type="primary" size="large" @click="showInvite = true">
              <el-icon><ChatDotRound /></el-icon>
              邀约练琴
            </el-button>
            <router-link :to="{ path: '/instruments', query: { owner: user.id } }">
              <el-button size="large">
                <el-icon><Goods /></el-icon>
                TA的闲置乐器 ({{ userInstruments.length }})
              </el-button>
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="content-grid">
        <div class="left-col">
          <div class="card mb-20">
            <h3><el-icon><MagicStick /></el-icon> 擅长乐器</h3>
            <div class="tags">
              <span class="tag tag-inst" v-for="i in user.instruments" :key="i">{{ i }}</span>
            </div>
          </div>
          
          <div class="card mb-20">
            <h3><el-icon><Notebook /></el-icon> 喜欢的曲目</h3>
            <div class="tags">
              <span class="tag tag-piece" v-for="p in user.favoritePieces" :key="p">{{ p }}</span>
            </div>
            <div v-if="user.id !== userStore.userId && commonPieces.length" class="common-items mt-10">
              <span class="badge badge-success">你们有 {{ commonPieces.length }} 首共同喜欢的曲子</span>
            </div>
          </div>
          
          <div class="card mb-20">
            <h3><el-icon><Clock /></el-icon> 空闲时间</h3>
            <div class="tags">
              <span class="tag tag-time" v-for="t in user.freeTimes" :key="t">{{ t }}</span>
            </div>
            <div v-if="user.id !== userStore.userId && sharedTimes.length" class="common-items mt-10">
              <span class="badge badge-success">共同可约时间：{{ sharedTimes.join('、') }}</span>
            </div>
          </div>
          
          <div class="card mb-20" v-if="userInstruments.length">
            <h3><el-icon><Goods /></el-icon> TA发布的乐器</h3>
            <div class="mini-inst-list">
              <router-link v-for="inst in userInstruments" :key="inst.id" :to="`/instruments/${inst.id}`" class="mini-inst">
                <img :src="inst.image" />
                <div class="mini-info">
                  <div class="name">{{ inst.name }}</div>
                  <div class="price">¥{{ inst.dailyFee }}/天</div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
        
        <div class="right-col">
          <div class="card mb-20" v-if="stats">
            <h3><el-icon><DataLine /></el-icon> 练琴数据</h3>
            <div class="stats-grid">
              <div class="stat">
                <span class="num">{{ stats.totalCount }}</span>
                <span class="label">打卡次数</span>
              </div>
              <div class="stat">
                <span class="num">{{ stats.totalHours }}</span>
                <span class="label">总时长(小时)</span>
              </div>
              <div class="stat">
                <span class="num highlight">{{ stats.currentStreak }}</span>
                <span class="label">连续天数</span>
              </div>
            </div>
          </div>
          
          <div class="card mb-20">
            <h3>
              <el-icon><Document /></el-icon> 最新打卡
              <router-link v-if="userCheckins.length" :to="`/checkin`" class="more-link">更多</router-link>
            </h3>
            <div v-if="userCheckins.length" class="checkin-list">
              <CheckinCard v-for="c in userCheckins" :key="c.id" :checkin="c" />
            </div>
            <div v-else class="empty-state small">
              <el-icon><Document /></el-icon>
              <p>暂无打卡记录</p>
            </div>
          </div>
          
          <div class="card">
            <h3><el-icon><ChatLineSquare /></el-icon> 对TA的评价 ({{ reviews.length }})</h3>
            <div v-if="reviews.length" class="review-list">
              <div class="review-item" v-for="r in reviews" :key="r.id">
                <img :src="r.reviewer?.avatar" class="avatar-sm" />
                <div class="review-content">
                  <div class="review-header">
                    <span class="reviewer">{{ r.reviewer?.username }}</span>
                    <el-rate v-model="r.rating" disabled size="small" />
                    <span class="badge badge-primary">{{ r.context }}</span>
                  </div>
                  <p>{{ r.content }}</p>
                  <span class="time">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state small">
              <el-icon><ChatLineSquare /></el-icon>
              <p>暂无评价</p>
            </div>
            
            <div class="mt-20" v-if="canReview">
              <el-button type="primary" @click="showReview = true">
                <el-icon><Edit /></el-icon>
                评价TA
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showInvite" title="发送练琴邀约" width="500px">
      <el-form :model="inviteForm" label-width="100px">
        <el-form-item label="邀约对象"><span>{{ user.username }}</span></el-form-item>
        <el-form-item label="乐器">
          <el-select v-model="inviteForm.instrument" style="width: 100%">
            <el-option v-for="inst in sharedInstruments" :key="inst" :label="inst" :value="inst" />
          </el-select>
        </el-form-item>
        <el-form-item label="想练曲目">
          <el-input v-model="inviteForm.piece" placeholder="如：爱的罗曼史" />
        </el-form-item>
        <el-form-item label="约练时间">
          <el-date-picker v-model="inviteForm.meetTime" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item label="约练地点">
          <el-input v-model="inviteForm.location" placeholder="建议公共空间" />
        </el-form-item>
        <el-form-item label="留言">
          <el-input v-model="inviteForm.message" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInvite = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitInvite">发送邀约</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showReview" title="评价用户" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="reviewForm.rating" show-score text-color="#ff9900" />
        </el-form-item>
        <el-form-item label="评价场景">
          <el-select v-model="reviewForm.context" style="width: 100%">
            <el-option label="陪练邀约" value="陪练邀约" />
            <el-option label="乐器借用" value="乐器借用" />
            <el-option label="其他互动" value="其他互动" />
          </el-select>
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="reviewForm.content" type="textarea" :rows="4" placeholder="说说你的感受..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReview = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReview">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { userApi, instrumentApi, checkinApi, reviewApi, invitationApi, borrowApi } from '../api'
import CheckinCard from '../components/CheckinCard.vue'
import { ElMessage } from 'element-plus'
import { Location, ChatDotRound, Goods, MagicStick, Notebook, Clock, DataLine, Document, ChatLineSquare, Edit } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const requireLogin = inject('requireLogin', () => router.push('/login'))

const user = ref(null)
const stats = ref(null)
const userCheckins = ref([])
const userInstruments = ref([])
const reviews = ref([])
const canReview = ref(false)
const showInvite = ref(false)
const showReview = ref(false)
const submitting = ref(false)

const inviteForm = reactive({
  instrument: '',
  piece: '',
  meetTime: null,
  location: '',
  message: ''
})

const reviewForm = reactive({
  rating: 5,
  context: '陪练邀约',
  content: ''
})

const sharedInstruments = computed(() => {
  if (!user.value) return []
  const mine = userStore.currentUser?.instruments || []
  const theirs = user.value.instruments || []
  const shared = mine.filter(i => theirs.includes(i))
  return shared.length ? shared : theirs
})

const commonPieces = computed(() => {
  if (!user.value) return []
  const mine = userStore.currentUser?.favoritePieces || []
  return user.value.favoritePieces.filter(p => mine.includes(p))
})

const sharedTimes = computed(() => {
  if (!user.value) return []
  const mine = userStore.currentUser?.freeTimes || []
  return user.value.freeTimes.filter(t => mine.includes(t))
})

onMounted(async () => {
  try {
    user.value = await userApi.getUser(route.params.id)
    
    const [cks, insts, revs] = await Promise.all([
      checkinApi.list({ userId: user.value.id }),
      instrumentApi.list({ ownerId: user.value.id }),
      reviewApi.list({ revieweeId: user.value.id, targetType: 'user' })
    ])
    userCheckins.value = cks.slice(0, 5)
    userInstruments.value = insts
    reviews.value = revs
    
    try {
      stats.value = await checkinApi.stats(user.value.id)
    } catch (e) {}
    
    if (userStore.isLoggedIn && userStore.userId !== user.value.id) {
      const borrows = await borrowApi.list({
        borrowerId: userStore.userId,
        ownerId: user.value.id
      })
      const invs = await invitationApi.listByUser(userStore.userId)
      const hasInteracted = borrows.some(b => b.status === 'returned') || 
                            invs.some(i => i.status === 'accepted')
      const reviewed = revs.some(r => r.reviewerId === userStore.userId)
      canReview.value = hasInteracted && !reviewed
    }
    
    inviteForm.instrument = sharedInstruments.value[0] || ''
    inviteForm.piece = commonPieces.value[0] || ''
  } catch (e) {
    ElMessage.error('加载失败')
  }
})

const submitInvite = async () => {
  if (!userStore.isLoggedIn) {
    showInvite.value = false
    requireLogin()
    return
  }
  if (!inviteForm.instrument || !inviteForm.meetTime || !inviteForm.location) {
    ElMessage.warning('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    await invitationApi.create({
      inviterId: userStore.userId,
      inviteeId: user.value.id,
      instrument: inviteForm.instrument,
      piece: inviteForm.piece,
      skillLevelMatch: `${userStore.currentUser.skillLevel}-${user.value.skillLevel}`,
      meetTime: new Date(inviteForm.meetTime).toLocaleString('zh-CN', { hour12: false }),
      location: inviteForm.location,
      latitude: user.value.latitude,
      longitude: user.value.longitude,
      message: inviteForm.message
    })
    ElMessage.success('邀约已发送！')
    showInvite.value = false
    router.push('/messages')
  } catch (e) {
    ElMessage.error('发送失败')
  } finally {
    submitting.value = false
  }
}

const submitReview = async () => {
  if (!reviewForm.content) {
    ElMessage.warning('请填写评价内容')
    return
  }
  submitting.value = true
  try {
    await reviewApi.create({
      reviewerId: userStore.userId,
      revieweeId: user.value.id,
      targetType: 'user',
      targetId: user.value.id,
      rating: reviewForm.rating,
      content: reviewForm.content,
      context: reviewForm.context
    })
    ElMessage.success('评价已提交！')
    showReview.value = false
    reviews.value = await reviewApi.list({ revieweeId: user.value.id, targetType: 'user' })
    canReview.value = false
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.breadcrumb {
  margin: 20px 0;
}

.profile-header {
  display: flex;
  gap: 30px;
  padding: 30px;
  align-items: center;
}

.avatar-xl {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #e0e7ff;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 28px;
  margin-bottom: 12px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 14px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-num {
  font-size: 13px;
  color: var(--text-secondary);
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.bio {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 18px;
}

.action-row {
  display: flex;
  gap: 12px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
}

.card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-bottom: 14px;
  justify-content: space-between;
}

.card h3 > :first-child {
  display: flex;
  align-items: center;
  gap: 8px;
}

.more-link {
  font-size: 13px;
  color: var(--primary-color);
  font-weight: normal;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.tag-inst { background: #eef2ff; color: var(--primary-dark); font-weight: 500; }
.tag-piece { background: #fdf2f8; color: #be185d; }
.tag-time { background: #ecfeff; color: #0e7490; }

.common-items {
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.mini-inst-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mini-inst {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: var(--bg-light);
  border-radius: 8px;
  transition: background 0.2s;
}

.mini-inst:hover {
  background: #eef2ff;
}

.mini-inst img {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.mini-info .name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.mini-info .price {
  font-size: 13px;
  color: var(--primary-color);
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat {
  text-align: center;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 10px;
}

.stat .num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat .num.highlight {
  color: var(--secondary-color);
}

.stat .label {
  font-size: 12px;
  color: var(--text-secondary);
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: var(--bg-light);
  border-radius: 8px;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.reviewer {
  font-weight: 500;
  font-size: 14px;
}

.review-content p {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.time {
  font-size: 12px;
  color: var(--text-secondary);
}

.empty-state.small {
  padding: 30px 10px;
}

.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
