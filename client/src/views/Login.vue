<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <span class="brand-icon">🎵</span>
          <span class="brand-name">乐搭</span>
        </div>
        <h1>让音乐连接每一个人</h1>
        <p>闲置乐器流转平台 · 智能匹配练琴搭子</p>
        <div class="features">
          <div class="feature">
            <span class="icon">🔄</span>
            <div>
              <h4>乐器流转</h4>
              <p>借还方便，押金保障</p>
            </div>
          </div>
          <div class="feature">
            <span class="icon">🎯</span>
            <div>
              <h4>智能匹配</h4>
              <p>多维匹配最合适的搭子</p>
            </div>
          </div>
          <div class="feature">
            <span class="icon">✅</span>
            <div>
              <h4>信用互评</h4>
              <p>真实评价，放心交友</p>
            </div>
          </div>
          <div class="feature">
            <span class="icon">📈</span>
            <div>
              <h4>练琴打卡</h4>
              <p>记录进步，互相督促</p>
            </div>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-card">
          <h2>欢迎登录</h2>
          <p class="sub">首次使用将自动注册</p>
          
          <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent>
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" size="large">
                <template #prefix><el-icon><Phone /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="username">
              <el-input v-model="form.username" placeholder="昵称（新用户必填" size="large">
                <template #prefix><el-icon><User /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-button type="primary" size="large" style="width: 100%; margin-top: 10px" :loading="loading" @click="handleLogin">
              登录 / 注册
            </el-button>
          </el-form>
          
          <div class="divider">
            <span>或使用体验账号</span>
          </div>
          
          <div class="demo-accounts">
            <el-button v-for="acc in demoAccounts" :key="acc.phone" @click="useDemo(acc)" size="small">
              <img :src="acc.avatar" class="avatar-sm" />
              <span>{{ acc.name }}</span>
            </el-button>
          </div>
          
          <p class="agreement">
            登录即表示同意 <a href="#">用户协议</a> 和 <a href="#">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Phone, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  phone: '',
  username: ''
})

const rules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const demoAccounts = [
  { name: '音乐小明', phone: '13800138001', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming' },
  { name: '钢琴少女', phone: '13800138002', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=piano' },
  { name: '爵士鼓手', phone: '13800138004', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=drum' }
]

const handleLogin = async () => {
  try {
    await formRef.value.validate()
  } catch { return }
  doLogin()
}

const useDemo = (acc) => {
  form.phone = acc.phone
  form.username = acc.name
  doLogin()
}

const doLogin = async () => {
  loading.value = true
  try {
    const result = await userStore.login(form.username, form.phone)
    if (result.success) {
      ElMessage.success(`欢迎回来，${result.user.username}！`)
      const redirect = route.query.redirect || '/'
      setTimeout(() => router.push(redirect), 300)
    }
  } catch (e) {
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-left {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  color: white;
  padding: 50px 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.brand-icon {
  font-size: 40px;
}

.brand-name {
  font-size: 32px;
  font-weight: 700;
}

.login-left h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.login-left > p {
  font-size: 16px;
  opacity: 0.85;
  margin-bottom: 40px;
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.feature {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.feature .icon {
  font-size: 28px;
  flex-shrink: 0;
}

.feature h4 {
  font-size: 15px;
  margin-bottom: 4px;
}

.feature p {
  font-size: 12px;
  opacity: 0.75;
}

.login-right {
  padding: 50px 40px;
  display: flex;
  align-items: center;
}

.login-card {
  width: 100%;
}

.login-card h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-card .sub {
  color: var(--text-secondary);
  margin-bottom: 28px;
}

.divider {
  text-align: center;
  margin: 24px 0 16px;
  color: var(--text-secondary);
  font-size: 13px;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background: var(--border-color);
}

.divider::before { left: 0; }
.divider::after { right: 0; }
.divider span {
  background: white;
  padding: 0 12px;
  position: relative;
  z-index: 1;
}

.demo-accounts {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.demo-accounts .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar-sm {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.agreement {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.agreement a {
  color: var(--primary-color);
}

@media (max-width: 800px) {
  .login-container {
    grid-template-columns: 1fr;
  }
  .login-left {
    padding: 30px;
  }
  .login-left h1 {
    font-size: 26px;
  }
}
</style>
