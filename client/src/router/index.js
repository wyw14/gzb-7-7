import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/instruments',
    name: 'Instruments',
    component: () => import('../views/Instruments.vue'),
    meta: { title: '乐器市场' }
  },
  {
    path: '/instruments/:id',
    name: 'InstrumentDetail',
    component: () => import('../views/InstrumentDetail.vue'),
    meta: { title: '乐器详情' }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('../views/Publish.vue'),
    meta: { title: '发布乐器', requiresAuth: true }
  },
  {
    path: '/buddies',
    name: 'Buddies',
    component: () => import('../views/Buddies.vue'),
    meta: { title: '练习搭子' }
  },
  {
    path: '/buddies/:id',
    name: 'UserDetail',
    component: () => import('../views/UserDetail.vue'),
    meta: { title: '用户详情' }
  },
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('../views/Checkin.vue'),
    meta: { title: '练琴打卡', requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/Messages.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (!userStore.isLoggedIn) {
    userStore.restoreSession()
  }
  
  document.title = to.meta.title ? `${to.meta.title} - 乐搭` : '乐搭 - 旧乐器流转与练习搭子平台'
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
