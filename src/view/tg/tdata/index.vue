<template>
  <div class="tdata-container">
    <div class="tdata-header">
      <h3>TG账号管理</h3>
      <div class="tdata-nav">
        <el-menu 
          :default-active="activeMenu" 
          mode="horizontal" 
          background-color="#f5f7fa"
          text-color="#303133"
          active-text-color="#409eff"
          router
        >
          <el-menu-item index="/tg/tdata/import">
            <el-icon><Upload /></el-icon>
            <span>导入账号</span>
          </el-menu-item>
          <el-menu-item index="/tg/tdata/list">
            <el-icon><List /></el-icon>
            <span>账号列表</span>
          </el-menu-item>
        </el-menu>
      </div>
    </div>
    
    <div class="tdata-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { List, Upload } from '@element-plus/icons-vue'

const route = useRoute()

// 根据当前路由路径设置当前活动菜单项
const activeMenu = computed(() => {
  return route.path
})
</script>

<style scoped>
.tdata-container {
  padding: 20px;
  height: 100%;
}

.tdata-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.tdata-nav {
  flex: 1;
  margin-left: 30px;
}

.tdata-content {
  background-color: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 180px);
}
</style>
