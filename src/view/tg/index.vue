<template>
  <div class="tg-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用 TG 营销系统</span>
        </div>
      </template>
      <div class="welcome-content">
        <h2>请从左侧菜单选择功能模块</h2>
        <div class="feature-list">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="feature-item" @click="navigateTo('tgTelegram')">
                <el-icon><Message /></el-icon>
                <span>Telegram 管理</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="feature-item" @click="navigateTo('tgGroup')">
                <el-icon><Service /></el-icon>
                <span>群组管理</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="feature-item" @click="navigateTo('tgUser')">
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="8">
              <div class="feature-item" @click="navigateTo('tgHome')">
                <el-icon><HomeFilled /></el-icon>
                <span>首页</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="feature-item" @click="navigateTo('tgSystemSettings')">
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Message, Service, User, HomeFilled, Setting } from '@element-plus/icons-vue'

export default {
  name: 'TgDashboard',
  components: {
    Message,
    Service,
    User,
    HomeFilled,
    Setting
  },
  methods: {
    navigateTo(routeName) {
      this.$router.push({ name: routeName })
    }
  }
}
</script>

<style scoped>
.tg-container {
  padding: 20px;
  min-height: 100%;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  text-align: center;
  padding: 20px;
}

.feature-list {
  margin-top: 30px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background-color: #f4f4f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.feature-item i {
  font-size: 30px;
  margin-bottom: 10px;
  color: #409eff;
}

.feature-item span {
  font-size: 16px;
}
</style>
