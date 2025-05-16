<template>
  <div class="tg-sidebar">
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      background-color="#1e293b"
      text-color="#fff"
      active-text-color="#409EFF"
      :collapse="isCollapse"
      @select="handleSelect"
    >
      <el-sub-menu index="dashboard">
        <template #title>
          <el-icon><Odometer /></el-icon>
          <span>系统概览</span>
        </template>
        <el-menu-item index="/layout/tg/dashboard">系统概览</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="telegram">
        <template #title>
          <el-icon><Message /></el-icon>
          <span>TG管理</span>
        </template>
        <el-menu-item index="/layout/tg/telegram/account-group">账号分组管理</el-menu-item>
        <el-menu-item index="/layout/tg/telegram/tdata-account">tdata账号管理</el-menu-item>
        <el-menu-item index="/layout/tg/telegram/telegram-number">飞机号管理</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="task">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>任务管理</span>
        </template>
        <el-menu-item index="/layout/tg/task">任务管理</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="message">
        <template #title>
          <el-icon><ChatDotRound /></el-icon>
          <span>消息管理</span>
        </template>
        <el-menu-item index="/layout/tg/message">消息管理</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </template>
        <el-menu-item index="/layout/tg/system-settings/menu">菜单管理</el-menu-item>
        <el-menu-item index="/layout/tg/system-settings/role">角色管理</el-menu-item>
        <el-menu-item index="/layout/tg/system-settings/user">用户管理</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Message, Setting, Odometer, ChatDotRound } from '@element-plus/icons-vue'

export default {
  name: 'TgSidebar',
  components: {
    Document,
    Message,
    Setting,
    Odometer,
    ChatDotRound
  },
  props: {
    isCollapse: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const activeMenu = computed(() => {
      const { path } = route
      return path
    })
    
    const handleSelect = (key) => {
      router.push(key)
    }
    
    return {
      activeMenu,
      handleSelect
    }
  }
}
</script>

<style scoped>
.tg-sidebar {
  height: 100%;
  background-color: #1e293b;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-sub-menu__title) {
  color: #fff !important;
}

:deep(.el-menu-item) {
  color: #ddd !important;
}

:deep(.el-menu-item.is-active) {
  color: #409EFF !important;
  background-color: #283548 !important;
}
</style>
