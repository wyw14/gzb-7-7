<template>
  <div>
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <h1>旧乐器流转 · 寻找练琴搭子</h1>
          <p class="hero-subtitle">让每一把闲置乐器重新发声，让每一个音乐爱好者找到同好</p>
          <div class="hero-actions">
            <router-link to="/instruments" class="hero-btn primary">
              <el-icon><Goods /></el-icon>
              浏览闲置乐器
            </router-link>
            <router-link to="/buddies" class="hero-btn secondary">
              <el-icon><User /></el-icon>
              寻找练习搭子
            </router-link>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-num">{{ stats.instruments }}</span>
              <span class="stat-label">闲置乐器</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ stats.users }}</span>
              <span class="stat-label">活跃用户</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ stats.checkins }}</span>
              <span class="stat-label">练琴打卡</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ stats.borrows }}</span>
              <span class="stat-label">成功流转</span>
            </div>
          </div>
        </div>
        <div class="hero-illustration">
          <div class="illustration-card card-1">🎸</div>
          <div class="illustration-card card-2">🎹</div>
          <div class="illustration-card card-3">🎻</div>
          <div class="illustration-card card-4">🥁</div>
        </div>
      </div>
    </section>
    
    <div class="container">
      <section class="section mb-40" v-if="recommendInstruments.length">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Star /></el-icon>
            为你推荐的乐器
          </h2>
          <router-link to="/instruments" class="view-more">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="grid grid-4 gap-20">
          <InstrumentCard v-for="inst in recommendInstruments" :key="inst.id" :instrument="inst" />
        </div>
      </section>
      
      <section class="section mb-40" v-if="recommendBuddies.length">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><UserFilled /></el-icon>
            适合你的练习搭子
          </h2>
          <router-link to="/buddies" class="view-more">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="grid grid-3 gap-20">
          <BuddyCard v-for="buddy in recommendBuddies" :key="buddy.id" :user="buddy" :showScore="true" />
        </div>
      </section>
      
      <section class="section mb-40">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Document /></el-icon>
            最新练琴打卡
          </h2>
          <router-link to="/checkin" class="view-more">
            去打卡 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="grid grid-2 gap-20" v-if="recentCheckins.length">
          <CheckinCard v-for="c in recentCheckins" :key="c.id" :checkin="c" />
        </div>
        <div v-else class="empty-state">
          <el-icon><Document /></el-icon>
          <p>暂无打卡记录，成为第一个打卡的人吧！</p>
        </div>
      </section>
      
      <section class="section mb-40">
        <h2 class="section-title">
          <el-icon><Medal /></el-icon>
          为什么选择乐搭
        </h2>
        <div class="features grid grid-4 gap-20">
          <div class="feature-card card">
            <div class="feature-icon">🔄</div>
            <h3>乐器流转</h3>
            <p>闲置乐器借出去，想用的乐器租回来，让乐器真正发挥价值</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">🎯</div>
            <h3>智能匹配</h3>
            <p>按乐器、水平、时间、距离多维度推荐，找到最合适的搭子</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">✅</div>
            <h3>信用互评</h3>
            <p>双方互评体系，建立可信的音乐社区，交易更放心</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">📈</div>
            <h3>练琴打卡</h3>
            <p>记录每一次进步，和搭子互相督促，坚持练琴不孤单</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { instrumentApi, recommendApi, checkinApi, borrowApi, userApi } from '../api'
import InstrumentCard from '../components/InstrumentCard.vue'
import BuddyCard from '../components/BuddyCard.vue'
import CheckinCard from '../components/CheckinCard.vue'
import { Star, UserFilled, Document, Medal, ArrowRight, Goods, User } from '@element-plus/icons-vue'

const userStore = useUserStore()
const requireLogin = inject('requireLogin', () => {})

const stats = ref({
  instruments: 0,
  users: 0,
  checkins: 0,
  borrows: 0
})

const recommendInstruments = ref([])
const recommendBuddies = ref([])
const recentCheckins = ref([])

onMounted(async () => {
  try {
    const [insts, users, cks, brws] = await Promise.all([
      instrumentApi.list(),
      userApi.list(),
      checkinApi.list(),
      borrowApi.list()
    ])
    stats.value.instruments = insts.length
    stats.value.users = users.length
    stats.value.checkins = cks.length
    stats.value.borrows = brws.filter(b => b.status === 'returned' || b.status === 'confirmed').length
  } catch (e) {}
  
  try {
    recentCheckins.value = (await checkinApi.list()).slice(0, 6)
  } catch (e) {}
  
  if (userStore.isLoggedIn) {
    try {
      const instRec = await recommendApi.instruments(userStore.userId)
      recommendInstruments.value = instRec.recommendations.slice(0, 4)
    } catch (e) {
      recommendInstruments.value = (await instrumentApi.list({ status: 'available' })).slice(0, 4)
    }
    
    try {
      const buddyRec = await recommendApi.buddies(userStore.userId)
      recommendBuddies.value = buddyRec.recommendations.filter(b => b.isMatched).slice(0, 3)
    } catch (e) {}
  } else {
    try {
      recommendInstruments.value = (await instrumentApi.list({ status: 'available' })).slice(0, 4)
    } catch (e) {}
  }
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0 80px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content h1 {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.hero-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
}

.hero-btn.primary {
  background: white;
  color: var(--primary-color);
}

.hero-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.hero-btn.secondary {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.hero-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.hero-illustration {
  position: relative;
  height: 360px;
}

.illustration-card {
  position: absolute;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
}

.card-1 { top: 20px; left: 40px; animation-delay: 0s; }
.card-2 { top: 60px; right: 60px; animation-delay: 0.5s; }
.card-3 { bottom: 40px; left: 20px; animation-delay: 1s; }
.card-4 { bottom: 20px; right: 40px; animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.section {
  margin-top: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-color);
  font-weight: 500;
}

.view-more:hover {
  color: var(--primary-dark);
}

.features {
  margin-top: 10px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.feature-card p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.mb-40 {
  margin-bottom: 40px;
}

@media (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }
  .hero-illustration {
    display: none;
  }
  .hero-content h1 {
    font-size: 32px;
  }
}
</style>
