<template>
  <header class="header">
    <div class="container header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">乐搭</span>
      </router-link>
      
      <nav class="nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.name === 'Home' }">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/instruments" class="nav-item" :class="{ active: $route.name === 'Instruments' }">
          <el-icon><Goods /></el-icon>
          <span>乐器市场</span>
        </router-link>
        <router-link to="/buddies" class="nav-item" :class="{ active: $route.name === 'Buddies' }">
          <el-icon><User /></el-icon>
          <span>练习搭子</span>
        </router-link>
        <router-link to="/checkin" class="nav-item" :class="{ active: $route.name === 'Checkin' }">
          <el-icon><Calendar /></el-icon>
          <span>练琴打卡</span>
        </router-link>
      </nav>
      
      <div class="header-right">
        <template v-if="userStore.isLoggedIn">
          <router-link to="/publish" class="publish-btn">
            <el-icon><Plus /></el-icon>
            发布闲置
          </router-link>
          <router-link to="/messages" class="icon-btn" title="消息">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0">
              <el-icon size="20"><Bell /></el-icon>
            </el-badge>
          </router-link>
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <img :src="userStore.currentUser.avatar" class="avatar-sm" alt="" />
              <span class="username">{{ userStore.currentUser.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="my-publish">
                  <el-icon><Goods /></el-icon>我的发布
                </el-dropdown-item>
                <el-dropdown-item command="messages">
                  <el-icon><Message /></el-icon>消息中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="login-btn" @click="goLogin">
            登录/注册
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { borrowApi, invitationApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const requireLogin = inject('requireLogin', () => router.push('/login'))

const unreadCount = ref(0)

const goLogin = () => {
  router.push('/login')
}

const handleCommand = (cmd) => {
  switch (cmd) {
    case 'profile':
      router.push('/profile')
      break
    case 'my-publish':
      router.push({ name: 'Instruments', query: { owner: userStore.userId } })
      break
    case 'messages':
      router.push('/messages')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/')
      }).catch(() => {})
      break
  }
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      const [borrows, invitations] = await Promise.all([
        borrowApi.list({ ownerId: userStore.userId, status: 'pending' }),
        invitationApi.list({ inviteeId: userStore.userId, status: 'pending' })
      ])
      unreadCount.value = borrows.length + invitations.length
    } catch (e) {}
  }
})
</script>

<style scoped>
.header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-color);
}

.logo-icon {
  font-size: 28px;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--bg-light);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.icon-btn {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  position: relative;
}

.icon-btn:hover {
  background: var(--bg-light);
  color: var(--text-primary);
}

.login-btn {
  padding: 8px 20px;
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: var(--primary-color);
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--bg-light);
}

.username {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  .username {
    display: none;
  }
}
</style>
