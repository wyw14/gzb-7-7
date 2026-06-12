<template>
  <div class="messages-page">
    <div class="page-header">
      <div class="container">
        <h1>📬 消息中心</h1>
        <p>管理你的借用申请、练琴邀约和互动消息</p>
      </div>
    </div>
    
    <div class="container">
      <el-tabs v-model="activeTab" type="card" class="msg-tabs">
        <el-tab-pane>
          <template #label>
            <el-icon><Goods /></el-icon>
            借用消息
            <el-badge v-if="pendingBorrowsAsOwner.length || pendingBorrowsAsBorrower.length" :value="pendingBorrowsAsOwner.length + pendingBorrowsAsBorrower.length" class="tab-badge" />
          </template>
          
          <div class="section">
            <h3>收到的借用申请（作为主人）</h3>
            <div v-if="borrowsAsOwner.length" class="msg-list">
              <div v-for="b in borrowsAsOwner" :key="b.id" class="msg-item card">
                <div class="msg-avatar">
                  <img :src="b.borrower?.avatar" class="avatar-md" />
                </div>
                <div class="msg-content">
                  <div class="msg-title">
                    <b>{{ b.borrower?.username }}</b> 申请借用您的
                    <router-link :to="`/instruments/${b.instrumentId}`">{{ b.instrument?.name }}</router-link>
                    <span class="badge" :class="statusClass(b.status)">{{ statusText(b.status) }}</span>
                    <span v-if="b.status === 'returned'" class="review-status">
                      <el-tag v-if="b.ownerReviewed" type="success" size="small">您已评价</el-tag>
                      <el-tag v-if="b.borrowerReviewed" type="info" size="small">对方已评价</el-tag>
                    </span>
                  </div>
                  <div class="msg-meta">
                    <span><el-icon><Calendar /></el-icon> {{ b.startDate }} 至 {{ b.endDate }}</span>
                    <span><el-icon><Wallet /></el-icon> 租金 ¥{{ b.feeTotal }} + 押金 ¥{{ b.depositPaid }}</span>
                  </div>
                  <p class="msg-body" v-if="b.purpose">借用目的：{{ b.purpose }}</p>
                  <div class="msg-actions" v-if="b.status === 'pending'">
                    <el-button type="success" size="small" @click="updateBorrow(b, 'confirmed')">
                      <el-icon><CircleCheck /></el-icon>
                      同意借用
                    </el-button>
                    <el-button type="danger" size="small" @click="updateBorrow(b, 'rejected')">
                      <el-icon><CircleClose /></el-icon>
                      拒绝
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="b.status === 'borrowing'">
                    <el-button type="primary" size="small" @click="confirmReturn(b)">
                      <el-icon><CircleCheck /></el-icon>
                      确认归还
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="b.status === 'returned' && b.canReviewOther">
                    <el-button type="warning" size="small" @click="showReviewDialog(b, 'borrow')">
                      <el-icon><Edit /></el-icon>
                      评价借用人
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="b.status === 'returned' && b.ownerReviewed">
                    <el-tag type="success" size="small">您已评价</el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state small"><el-icon><Goods /></el-icon><p>暂无借用申请</p></div>
          </div>
          
          <div class="section">
            <h3>我的借用申请（作为借用人）</h3>
            <div v-if="borrowsAsBorrower.length" class="msg-list">
              <div v-for="b in borrowsAsBorrower" :key="b.id" class="msg-item card">
                <div class="msg-avatar">
                  <img :src="b.instrument?.image" class="inst-thumb" />
                </div>
                <div class="msg-content">
                  <div class="msg-title">
                    您申请借用
                    <router-link :to="`/instruments/${b.instrumentId}`">{{ b.instrument?.name }}</router-link>
                    （主人：{{ b.owner?.username }}）
                    <span class="badge" :class="statusClass(b.status)">{{ statusText(b.status) }}</span>
                    <span v-if="b.status === 'returned'" class="review-status">
                      <el-tag v-if="b.borrowerReviewed" type="success" size="small">您已评价</el-tag>
                      <el-tag v-if="b.ownerReviewed" type="info" size="small">主人已评价</el-tag>
                    </span>
                  </div>
                  <div class="msg-meta">
                    <span><el-icon><Calendar /></el-icon> {{ b.startDate }} 至 {{ b.endDate }}</span>
                    <span><el-icon><Wallet /></el-icon> 租金 ¥{{ b.feeTotal }} + 押金 ¥{{ b.depositPaid }}</span>
                  </div>
                  <p class="msg-body" v-if="b.purpose">借用目的：{{ b.purpose }}</p>
                  <div class="msg-actions" v-if="b.status === 'borrowing'">
                    <el-tag type="primary" size="small">借用中，请按时归还</el-tag>
                  </div>
                  <div class="msg-actions" v-if="b.status === 'returned' && b.canReviewOther">
                    <el-button type="warning" size="small" @click="showReviewDialog(b, 'borrow')">
                      <el-icon><Edit /></el-icon>
                      评价主人
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="b.status === 'returned' && b.borrowerReviewed">
                    <el-tag type="success" size="small">您已评价</el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state small"><el-icon><Goods /></el-icon><p>暂无借用记录</p></div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane>
          <template #label>
            <el-icon><User /></el-icon>
            邀约消息
            <el-badge v-if="pendingInvitationsAsInvitee.length" :value="pendingInvitationsAsInvitee.length" class="tab-badge" />
          </template>
          
          <div class="section">
            <h3>收到的练琴邀约</h3>
            <div v-if="invitationsAsInvitee.length" class="msg-list">
              <div v-for="inv in invitationsAsInvitee" :key="inv.id" class="msg-item card">
                <div class="msg-avatar">
                  <img :src="inv.inviter?.avatar" class="avatar-md" />
                </div>
                <div class="msg-content">
                  <div class="msg-title">
                    <b>{{ inv.inviter?.username }}</b> 邀请你一起练琴
                    <span class="badge" :class="statusClass(inv.status)">{{ statusText(inv.status) }}</span>
                    <span v-if="inv.status === 'completed'" class="review-status">
                      <el-tag v-if="inv.inviteeReviewed" type="success" size="small">您已评价</el-tag>
                      <el-tag v-if="inv.inviterReviewed" type="info" size="small">对方已评价</el-tag>
                    </span>
                  </div>
                  <div class="msg-meta">
                    <span><el-icon><MagicStick /></el-icon> {{ inv.instrument }}</span>
                    <span><el-icon><Notebook /></el-icon> {{ inv.piece || '待定' }}</span>
                    <span><el-icon><Calendar /></el-icon> {{ inv.meetTime }}</span>
                    <span><el-icon><Location /></el-icon> {{ inv.location }}</span>
                  </div>
                  <p class="msg-body" v-if="inv.message">留言：{{ inv.message }}</p>
                  <div class="msg-actions" v-if="inv.status === 'pending'">
                    <el-button type="success" size="small" @click="updateInvitation(inv, 'accepted')">
                      <el-icon><CircleCheck /></el-icon>
                      接受邀约
                    </el-button>
                    <el-button type="danger" size="small" @click="updateInvitation(inv, 'rejected')">
                      <el-icon><CircleClose /></el-icon>
                      婉拒
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="inv.status === 'accepted'">
                    <el-button type="primary" size="small" @click="markInvitationCompleted(inv)">
                      <el-icon><CircleCheck /></el-icon>
                      标记已完成（练琴后）
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="inv.status === 'completed' && inv.canReviewOther">
                    <el-button type="warning" size="small" @click="showReviewDialog(inv, 'invitation')">
                      <el-icon><Edit /></el-icon>
                      评价邀约人
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="inv.status === 'completed' && inv.inviteeReviewed">
                    <el-tag type="success" size="small">您已评价</el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state small"><el-icon><User /></el-icon><p>暂无邀约</p></div>
          </div>
          
          <div class="section">
            <h3>我发出的邀约</h3>
            <div v-if="invitationsAsInviter.length" class="msg-list">
              <div v-for="inv in invitationsAsInviter" :key="inv.id" class="msg-item card">
                <div class="msg-avatar">
                  <img :src="inv.invitee?.avatar" class="avatar-md" />
                </div>
                <div class="msg-content">
                  <div class="msg-title">
                    你邀约 <b>{{ inv.invitee?.username }}</b> 练琴
                    <span class="badge" :class="statusClass(inv.status)">{{ statusText(inv.status) }}</span>
                    <span v-if="inv.status === 'completed'" class="review-status">
                      <el-tag v-if="inv.inviterReviewed" type="success" size="small">您已评价</el-tag>
                      <el-tag v-if="inv.inviteeReviewed" type="info" size="small">对方已评价</el-tag>
                    </span>
                  </div>
                  <div class="msg-meta">
                    <span><el-icon><MagicStick /></el-icon> {{ inv.instrument }}</span>
                    <span><el-icon><Notebook /></el-icon> {{ inv.piece || '待定' }}</span>
                    <span><el-icon><Calendar /></el-icon> {{ inv.meetTime }}</span>
                    <span><el-icon><Location /></el-icon> {{ inv.location }}</span>
                  </div>
                  <p class="msg-body" v-if="inv.message">留言：{{ inv.message }}</p>
                  <div class="msg-actions" v-if="inv.status === 'accepted'">
                    <el-button type="primary" size="small" @click="markInvitationCompleted(inv)">
                      <el-icon><CircleCheck /></el-icon>
                      标记已完成（练琴后）
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="inv.status === 'completed' && inv.canReviewOther">
                    <el-button type="warning" size="small" @click="showReviewDialog(inv, 'invitation')">
                      <el-icon><Edit /></el-icon>
                      评价陪练伙伴
                    </el-button>
                  </div>
                  <div class="msg-actions" v-if="inv.status === 'completed' && inv.inviterReviewed">
                    <el-tag type="success" size="small">您已评价</el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state small"><el-icon><User /></el-icon><p>暂无发出的邀约</p></div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <el-dialog v-model="showReview" :title="reviewForm.title" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="评价对象">
          <div class="review-target">
            <img :src="reviewForm.revieweeAvatar" class="avatar-sm" />
            <span>{{ reviewForm.revieweeName }}</span>
          </div>
        </el-form-item>
        <el-form-item label="评分">
          <el-rate v-model="reviewForm.rating" show-score text-color="#ff9900" />
        </el-form-item>
        <el-form-item label="场景">
          <el-tag>{{ reviewForm.context }}</el-tag>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { borrowApi, invitationApi, reviewApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Goods, User, Calendar, Wallet, CircleCheck, CircleClose, MagicStick, Notebook, Location, Edit } from '@element-plus/icons-vue'

const userStore = useUserStore()

const activeTab = ref('0')
const borrows = ref([])
const invitations = ref([])
const showReview = ref(false)
const submitting = ref(false)

const currentTarget = ref(null)

const reviewForm = reactive({
  title: '评价',
  rating: 5,
  context: '',
  content: '',
  revieweeId: '',
  revieweeName: '',
  revieweeAvatar: '',
  targetType: '',
  targetId: ''
})

const statusMap = {
  pending: { text: '待处理', class: 'badge-warning' },
  confirmed: { text: '已确认', class: 'badge-primary' },
  borrowing: { text: '借用中', class: 'badge-primary' },
  returned: { text: '已归还', class: 'badge-success' },
  rejected: { text: '已拒绝', class: 'badge-danger' },
  accepted: { text: '已接受', class: 'badge-success' },
  completed: { text: '已完成', class: 'badge-success' }
}

const statusText = (s) => statusMap[s]?.text || s
const statusClass = (s) => statusMap[s]?.class || 'badge-primary'

const borrowsAsOwner = computed(() => borrows.value.filter(b => b.ownerId === userStore.userId))
const borrowsAsBorrower = computed(() => borrows.value.filter(b => b.borrowerId === userStore.userId))
const pendingBorrowsAsOwner = computed(() => borrowsAsOwner.value.filter(b => b.status === 'pending'))
const pendingBorrowsAsBorrower = computed(() => borrowsAsBorrower.value.filter(b => b.status === 'pending'))

const invitationsAsInvitee = computed(() => invitations.value.filter(i => i.inviteeId === userStore.userId))
const invitationsAsInviter = computed(() => invitations.value.filter(i => i.inviterId === userStore.userId))
const pendingInvitationsAsInvitee = computed(() => invitationsAsInvitee.value.filter(i => i.status === 'pending'))

onMounted(async () => {
  await loadAll()
})

const loadAll = async () => {
  try {
    const [asOwner, asBorrower] = await Promise.all([
      borrowApi.list({ ownerId: userStore.userId, currentUserId: userStore.userId }),
      borrowApi.list({ borrowerId: userStore.userId, currentUserId: userStore.userId })
    ])
    const borrowSet = new Map()
    asOwner.forEach(b => borrowSet.set(b.id, b))
    asBorrower.forEach(b => { if (!borrowSet.has(b.id)) borrowSet.set(b.id, b) })
    borrows.value = Array.from(borrowSet.values())
  } catch (e) {
    console.error(e)
  }
  
  try {
    invitations.value = await invitationApi.listByUser(userStore.userId)
  } catch (e) {
    console.error(e)
  }
}

const updateBorrow = async (b, status) => {
  try {
    await ElMessageBox.confirm(`确认${status === 'confirmed' ? '同意' : '拒绝'}该借用申请？`, '提示', {
      type: status === 'confirmed' ? 'success' : 'warning'
    })
  } catch { return }
  
  try {
    await borrowApi.update(b.id, { status })
    ElMessage.success(status === 'confirmed' ? '已同意借用，乐器标记为借用中' : '已拒绝申请')
    await loadAll()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const confirmReturn = async (b) => {
  try {
    await ElMessageBox.confirm('确认乐器已完好归还？确认后将退还押金，双方都可以进行评价。', '归还确认', { type: 'success' })
  } catch { return }
  
  try {
    await borrowApi.update(b.id, { status: 'returned' })
    ElMessage.success('已确认归还，请互相评价~')
    await loadAll()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const updateInvitation = async (inv, status) => {
  try {
    await ElMessageBox.confirm(`确认${status === 'accepted' ? '接受' : '拒绝'}该邀约？`, '提示', {
      type: status === 'accepted' ? 'success' : 'warning'
    })
  } catch { return }
  
  try {
    await invitationApi.update(inv.id, { status })
    ElMessage.success(status === 'accepted' ? '已接受邀约，一起开心练琴吧~' : '已婉拒邀约')
    await loadAll()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const markInvitationCompleted = async (inv) => {
  try {
    await ElMessageBox.confirm('确认本次练琴已完成？确认后双方可以进行互评。', '完成确认', { type: 'success' })
  } catch { return }
  
  try {
    await invitationApi.update(inv.id, { status: 'completed' })
    ElMessage.success('已标记完成，记得给对方一个评价~')
    await loadAll()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const showReviewDialog = (target, type) => {
  currentTarget.value = target
  
  if (type === 'borrow') {
    const isOwner = userStore.userId === target.ownerId
    const reviewee = isOwner ? target.borrower : target.owner
    reviewForm.title = isOwner ? '评价借用人' : '评价乐器主人'
    reviewForm.context = '乐器借用'
    reviewForm.revieweeId = reviewee?.id
    reviewForm.revieweeName = reviewee?.username
    reviewForm.revieweeAvatar = reviewee?.avatar
    reviewForm.targetType = 'borrow'
    reviewForm.targetId = target.id
  } else {
    const isInviter = userStore.userId === target.inviterId
    const reviewee = isInviter ? target.invitee : target.inviter
    reviewForm.title = '评价陪练伙伴'
    reviewForm.context = '陪练邀约'
    reviewForm.revieweeId = reviewee?.id
    reviewForm.revieweeName = reviewee?.username
    reviewForm.revieweeAvatar = reviewee?.avatar
    reviewForm.targetType = 'invitation'
    reviewForm.targetId = target.id
  }
  
  reviewForm.rating = 5
  reviewForm.content = ''
  showReview.value = true
}

const submitReview = async () => {
  if (!reviewForm.content) {
    ElMessage.warning('请填写评价内容')
    return
  }
  submitting.value = true
  try {
    const checkResult = await reviewApi.check({
      reviewerId: userStore.userId,
      targetType: reviewForm.targetType,
      targetId: reviewForm.targetId
    })
    
    if (checkResult.reviewed) {
      ElMessage.warning('您已经评价过了，不能重复评价')
      showReview.value = false
      await loadAll()
      return
    }
    
    await reviewApi.create({
      reviewerId: userStore.userId,
      revieweeId: reviewForm.revieweeId,
      targetType: reviewForm.targetType,
      targetId: reviewForm.targetId,
      rating: reviewForm.rating,
      content: reviewForm.content,
      context: reviewForm.context
    })
    ElMessage.success('评价提交成功！感谢您的反馈~')
    showReview.value = false
    await loadAll()
    await userStore.refreshUser()
  } catch (e) {
    if (e.response?.data?.error) {
      ElMessage.warning(e.response.data.error)
    } else {
      ElMessage.error('提交失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.msg-tabs {
  margin-top: 20px;
}

.tab-badge {
  margin-left: 6px;
}

.section {
  margin: 20px 0 30px;
}

.section h3 {
  font-size: 16px;
  margin-bottom: 14px;
  padding-left: 10px;
  border-left: 3px solid var(--primary-color);
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.msg-item {
  display: flex;
  gap: 16px;
  padding: 18px;
}

.msg-avatar {
  flex-shrink: 0;
}

.inst-thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-title {
  font-size: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.msg-title b {
  color: var(--primary-color);
}

.msg-title a {
  font-weight: 500;
  color: var(--text-primary);
}

.msg-title a:hover {
  color: var(--primary-color);
}

.review-status {
  display: flex;
  gap: 6px;
}

.msg-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.msg-meta > span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.msg-body {
  padding: 10px 14px;
  background: var(--bg-light);
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.6;
}

.msg-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.review-target {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state.small {
  padding: 40px 20px;
}

.empty-state.small .el-icon {
  font-size: 48px;
}
</style>
