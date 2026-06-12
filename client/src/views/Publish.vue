<template>
  <div class="publish-page">
    <div class="page-header">
      <div class="container">
        <h1>📢 发布闲置乐器</h1>
        <p>让您的闲置乐器继续发声，帮助更多热爱音乐的朋友</p>
      </div>
    </div>
    
    <div class="container">
      <div class="form-wrap card">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" @submit.prevent>
          <el-divider content-position="left">基本信息</el-divider>
          
          <el-form-item label="乐器名称" prop="name">
            <el-input v-model="form.name" placeholder="如：雅马哈古典吉他 C40" style="max-width: 500px" />
          </el-form-item>
          
          <el-form-item label="乐器分类" prop="category">
            <el-select v-model="form.category" placeholder="选择分类" style="width: 200px">
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="品牌" prop="brand">
            <el-input v-model="form.brand" placeholder="如：雅马哈" style="max-width: 300px" />
          </el-form-item>
          
          <el-form-item label="型号">
            <el-input v-model="form.model" placeholder="如：C40" style="max-width: 300px" />
          </el-form-item>
          
          <el-form-item label="难度级别" prop="level">
            <el-radio-group v-model="form.level">
              <el-radio value="入门级">入门级</el-radio>
              <el-radio value="进阶级">进阶级</el-radio>
              <el-radio value="专业级">专业级</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="成色" prop="condition">
            <el-radio-group v-model="form.condition">
              <el-radio value="九五新">九五新</el-radio>
              <el-radio value="九成新">九成新</el-radio>
              <el-radio value="八五新">八五新</el-radio>
              <el-radio value="八成新">八成新</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="图片" prop="image">
            <el-input v-model="form.image" placeholder="请输入图片URL（可使用unsplash等图片链接）" style="max-width: 500px" />
            <div class="image-preview" v-if="form.image">
              <img :src="form.image" @error="form.image = ''" />
            </div>
          </el-form-item>
          
          <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="描述乐器的使用情况、配件、优缺点等" style="max-width: 600px" />
          </el-form-item>
          
          <el-divider content-position="left">租赁信息</el-divider>
          
          <el-form-item label="参考价值">
            <el-input-number v-model="form.value" :min="0" :step="100" />
            <span class="form-tip">元，用于估算押金</span>
          </el-form-item>
          
          <el-form-item label="押金" prop="deposit">
            <el-input-number v-model="form.deposit" :min="0" :step="50" />
            <span class="form-tip">元</span>
          </el-form-item>
          
          <el-form-item label="每日租金" prop="dailyFee">
            <el-input-number v-model="form.dailyFee" :min="0" :step="5" />
            <span class="form-tip">元/天</span>
          </el-form-item>
          
          <el-divider content-position="left">地点与时间</el-divider>
          
          <el-form-item label="所在位置" prop="location">
            <el-input v-model="form.location" placeholder="如：北京市海淀区中关村" style="max-width: 400px" />
          </el-form-item>
          
          <el-form-item label="可借出时间" prop="availableTimes">
            <el-checkbox-group v-model="form.availableTimes">
              <el-checkbox label="工作日白天" />
              <el-checkbox label="工作日晚上" />
              <el-checkbox label="周六上午" />
              <el-checkbox label="周六下午" />
              <el-checkbox label="周六晚上" />
              <el-checkbox label="周日上午" />
              <el-checkbox label="周日下午" />
              <el-checkbox label="周日晚上" />
              <el-checkbox label="随时" />
            </el-checkbox-group>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" size="large" :loading="submitting" @click="submit">
              <el-icon><Upload /></el-icon>
              发布乐器
            </el-button>
            <el-button size="large" @click="$router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { instrumentApi } from '../api'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const submitting = ref(false)

const categories = ['古典吉他', '尤克里里', '小提琴', '钢琴', '电子琴', '架子鼓', '竹笛', '洞箫', '陶埙', '卡洪鼓', '萨克斯', '长笛', '口琴', '古筝', '二胡', '琵琶', '其他']

const form = reactive({
  ownerId: userStore.userId,
  name: '',
  category: '',
  brand: '',
  model: '',
  level: '入门级',
  condition: '九成新',
  image: '',
  description: '',
  value: 1000,
  deposit: 300,
  dailyFee: 20,
  location: '',
  latitude: 39.9042,
  longitude: 116.4074,
  availableTimes: []
})

const rules = {
  name: [{ required: true, message: '请输入乐器名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择乐器分类', trigger: 'change' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  level: [{ required: true, message: '请选择级别', trigger: 'change' }],
  condition: [{ required: true, message: '请选择成色', trigger: 'change' }],
  description: [{ required: true, message: '请填写描述', trigger: 'blur' }],
  dailyFee: [{ required: true, message: '请设置日租金', trigger: 'blur' }],
  location: [{ required: true, message: '请填写位置', trigger: 'blur' }],
  availableTimes: [{ required: true, message: '请选择可借时间', trigger: 'change', type: 'array' }]
}

const submit = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const result = await instrumentApi.create({
      ...form,
      image: form.image || `https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400`
    })
    if (result.success) {
      ElMessage.success('发布成功！')
      router.push(`/instruments/${result.instrument.id}`)
    }
  } catch (e) {
    ElMessage.error('发布失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-wrap {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 40px;
}

.image-preview {
  margin-top: 12px;
  width: 200px;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-tip {
  margin-left: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
