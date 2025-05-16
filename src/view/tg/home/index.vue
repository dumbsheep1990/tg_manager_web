<template>
  <div class="tg-home-container">
    <h1>首页</h1>
    <div class="dashboard-content">
      <!-- Dashboard content will go here -->
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>系统概览</span>
          </div>
        </template>
        <div class="item">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="账号总数" :value="0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="活跃账号" :value="0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="任务总数" :value="0" />
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TgHome',
  data() {
    return {
      // Your component data here
    }
  },
  created() {
    // Initialize component
  },
  methods: {
    // Your methods here
  }
}
</script>

<style lang="scss" scoped>
.tg-home-container {
  padding: 20px;
  
  .dashboard-content {
    margin-top: 20px;
  }
  
  .box-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .item {
    margin-bottom: 18px;
  }
}
</style>
