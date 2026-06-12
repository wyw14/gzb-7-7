<template>
  <el-dialog v-model="visible" title="登录 / 注册" width="420px" :close-on-click-modal="false" @close="$emit('close')">
    <div class="login-wrap">
      <div class="login-header">
        <div class="login-icon">🎵</div>
        <h3>欢迎来到乐搭</h3>
        <p>让闲置乐器流动，让练琴不再孤单</p>
      </div>
      
      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent>
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" size="large" :prefix-icon="Phone">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入昵称（可选，新用户注册用）" size="large">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-button type="primary" size="large" style="width: 100%;" :loading="loading" @click="handleLogin">
          登录 / 注册
        </el-button>
      </el-form>
      
      <div class="login-tips">
        <p>首次使用将自动注册账号，您的信息仅用于平台服务</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Phone, User } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['close', 'success'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, val => visible.value = val)
watch(visible, val => emit('update:modelValue', val))

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  phone: '',
  username: ''
})

const rules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  
  loading.value = true
  try {
    const result = await userStore.login(form.username, form.phone)
    if (result.success) {
      ElMessage.success('登录成功！')
      emit('success')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (e) {
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  padding: 10px 0;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.login-header h3 {
  font-size: 22px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-tips {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
