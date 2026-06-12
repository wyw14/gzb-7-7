<template>
  <div class="instruments-page">
    <div class="page-header">
      <div class="container">
        <h1>🎸 乐器市场</h1>
        <p>发现身边的闲置乐器，让音乐流动起来</p>
      </div>
    </div>
    
    <div class="container">
      <div class="filter-bar card mb-20">
        <div class="filter-row">
          <div class="filter-group">
            <label>分类</label>
            <el-select v-model="filters.category" placeholder="全部" clearable size="default" style="width: 140px">
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>成色</label>
            <el-select v-model="filters.condition" placeholder="全部" clearable size="default" style="width: 120px">
              <el-option label="九五新" value="九五新" />
              <el-option label="九成新" value="九成新" />
              <el-option label="八五新" value="八五新" />
              <el-option label="八成新" value="八成新" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>状态</label>
            <el-select v-model="filters.status" placeholder="全部" clearable size="default" style="width: 120px">
              <el-option label="可借用" value="available" />
              <el-option label="借用中" value="borrowed" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>距离</label>
            <el-select v-model="filters.maxDistance" placeholder="不限" clearable size="default" style="width: 120px">
              <el-option label="5公里内" :value="5" />
              <el-option label="10公里内" :value="10" />
              <el-option label="20公里内" :value="20" />
              <el-option label="50公里内" :value="50" />
            </el-select>
          </div>
          <div class="filter-group search-group">
            <el-input v-model="filters.keyword" placeholder="搜索乐器名称/品牌" clearable style="width: 240px">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
      </div>
      
      <div class="result-header mb-20">
        <span>共找到 <b>{{ filtered.length }}</b> 件乐器</span>
        <div class="sort-wrap">
          <span>排序：</span>
          <el-radio-group v-model="sortBy" size="small">
            <el-radio-button value="default">默认</el-radio-button>
            <el-radio-button value="price">价格</el-radio-button>
            <el-radio-button value="distance">距离</el-radio-button>
            <el-radio-button value="newest">最新</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <div v-if="sortedInstruments.length" class="grid grid-4 gap-20">
        <InstrumentCard v-for="inst in sortedInstruments" :key="inst.id" :instrument="inst" />
      </div>
      <div v-else class="empty-state">
        <el-icon><Goods /></el-icon>
        <p>暂无符合条件的乐器</p>
        <router-link to="/publish" class="btn-primary mt-20" v-if="userStore.isLoggedIn">
          去发布我的闲置乐器
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { instrumentApi, recommendApi } from '../api'
import InstrumentCard from '../components/InstrumentCard.vue'
import { Search, Goods } from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const allInstruments = ref([])

const categories = ['古典吉他', '尤克里里', '小提琴', '钢琴', '电子琴', '架子鼓', '竹笛', '洞箫', '陶埙', '卡洪鼓']

const filters = reactive({
  category: '',
  condition: '',
  status: 'available',
  keyword: '',
  maxDistance: ''
})

const sortBy = ref('default')

onMounted(async () => {
  if (route.query.owner) {
    filters.ownerId = route.query.owner
  }
  await loadData()
})

const loadData = async () => {
  try {
    if (userStore.isLoggedIn && !route.query.owner) {
      const result = await recommendApi.instruments(userStore.userId, {
        maxDistance: filters.maxDistance || 100
      })
      allInstruments.value = result.recommendations
    } else {
      allInstruments.value = await instrumentApi.list({
        category: filters.category || undefined,
        status: filters.status || undefined,
        keyword: filters.keyword || undefined,
        ownerId: filters.ownerId || undefined
      })
    }
  } catch (e) {
    allInstruments.value = []
  }
}

const resetFilters = () => {
  filters.category = ''
  filters.condition = ''
  filters.status = 'available'
  filters.keyword = ''
  filters.maxDistance = ''
  loadData()
}

const filtered = computed(() => {
  return allInstruments.value.filter(i => {
    if (filters.condition && i.condition !== filters.condition) return false
    if (filters.maxDistance && i.distance !== undefined && i.distance > filters.maxDistance) return false
    return true
  })
})

const sortedInstruments = computed(() => {
  const arr = [...filtered.value]
  switch (sortBy.value) {
    case 'price':
      return arr.sort((a, b) => a.dailyFee - b.dailyFee)
    case 'distance':
      return arr.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    case 'newest':
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'default':
    default:
      return arr.sort((a, b) => (b.score || 0) - (a.score || 0))
  }
})
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

.search-group {
  flex-direction: row;
  align-items: center;
  gap: 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.result-header b {
  color: var(--primary-color);
  font-size: 16px;
}

.sort-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mt-20 {
  display: inline-block;
  margin-top: 20px;
}
</style>
