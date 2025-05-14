<template>
  <div class="telegram-container">
    <div class="telegram-header">
      <h3>飞机号管理</h3>
    </div>
    
    <el-card class="telegram-tabs-card">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="爬虫账号" name="crawler">
          <CrawlerAccounts />
        </el-tab-pane>
        <el-tab-pane label="私信账号" name="private">
          <PrivateMessageAccounts />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import CrawlerAccounts from './components/CrawlerAccounts.vue'
import PrivateMessageAccounts from './components/PrivateMessageAccounts.vue'

export default defineComponent({
  name: 'TelegramAccountManager',
  
  components: {
    CrawlerAccounts,
    PrivateMessageAccounts
  },
  
  setup() {
    const activeTab = ref('crawler')
    
    return {
      activeTab
    }
  }
})
</script>

<style scoped>
.telegram-container {
  padding: 20px;
}

.telegram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.telegram-header h3 {
  margin: 0;
  font-size: 20px;
}

.telegram-tabs-card {
  margin-bottom: 20px;
}
</style>
