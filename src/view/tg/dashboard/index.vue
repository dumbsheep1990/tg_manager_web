<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>TG营销系统仪表盘</h2>
      <div class="dashboard-time">{{ currentDate }}</div>
    </div>
    
    <el-row :gutter="20" class="card-row">
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>账号总数</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-value">{{ overview.accountCount || 0 }}</div>
            <div class="card-footer">
              <span>活跃: {{ overview.activeAccounts || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>任务总数</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-value">{{ overview.taskCount || 0 }}</div>
            <div class="card-footer">
              <span>运行中: {{ overview.runningTasks || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>消息总数</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-value">{{ overview.messageCount || 0 }}</div>
            <div class="card-footer">
              <span>成功: {{ overview.successMessages || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
            </div>
          </template>
          <div class="card-content">
            <div class="card-value">
              <el-tag :type="overview.systemStatus === 'normal' ? 'success' : 'danger'">
                {{ overview.systemStatus === 'normal' ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="card-footer">
              <span>工作节点: {{ overview.workerCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>任务执行趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 任务趋势图表将在此处渲染 -->
            <div class="chart-placeholder">任务执行趋势图表</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>消息发送统计</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 消息统计图表将在此处渲染 -->
            <div class="chart-placeholder">消息发送统计图表</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-table :data="recentActivities" style="width: 100%" v-loading="loading">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="scope">
                <el-tag :type="getTypeTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { getDashboardOverview, getRecentActivities } from '@/api/tg/dashboard'

export default defineComponent({
  name: 'TgDashboard',
  
  setup() {
    const overview = ref({
      accountCount: 0,
      activeAccounts: 0,
      taskCount: 0,
      runningTasks: 0,
      messageCount: 0,
      successMessages: 0,
      systemStatus: 'normal',
      workerCount: 0
    })
    
    const recentActivities = ref([])
    const loading = ref(true)
    
    const currentDate = computed(() => {
      const now = new Date()
      return now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    })
    
    const getTypeTagType = (type) => {
      const typeMap = {
        '账号': 'primary',
        '任务': 'success',
        '消息': 'warning',
        '系统': 'info'
      }
      return typeMap[type] || 'info'
    }
    
    const getStatusTagType = (status) => {
      const statusMap = {
        '成功': 'success',
        '失败': 'danger',
        '进行中': 'warning',
        '等待中': 'info'
      }
      return statusMap[status] || 'info'
    }
    
    const fetchDashboardData = async () => {
      loading.value = true
      try {
        const res = await getDashboardOverview()
        if (res.code === 0) {
          overview.value = res.data
        }
        
        const activitiesRes = await getRecentActivities({ page: 1, pageSize: 10 })
        if (activitiesRes.code === 0) {
          recentActivities.value = activitiesRes.data.list
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchDashboardData()
      // 设置定时刷新
      const refreshInterval = setInterval(fetchDashboardData, 60000) // 每分钟刷新一次
      
      // 组件卸载时清除定时器
      onUnmounted(() => {
        clearInterval(refreshInterval)
      })
    })
    
    return {
      overview,
      recentActivities,
      loading,
      currentDate,
      getTypeTagType,
      getStatusTagType
    }
  }
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 22px;
      color: #303133;
    }
    
    .dashboard-time {
      font-size: 14px;
      color: #909399;
    }
  }
  
  .card-row {
    margin-bottom: 20px;
  }
  
  .dashboard-card {
    height: 150px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100px;
      
      .card-value {
        font-size: 32px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 10px;
      }
      
      .card-footer {
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .chart-card {
    height: 350px;
    margin-bottom: 20px;
    
    .chart-container {
      height: 290px;
      
      .chart-placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        background-color: #f9f9f9;
        border-radius: 4px;
      }
    }
  }
  
  .table-card {
    margin-bottom: 20px;
  }
}
</style>
