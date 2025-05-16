<template>
  <div class="telegram-container">
    <router-view />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TelegramAccountManager',
  created() {
    // 当前路径为父路径时重定向到账号分组管理页面
    if (this.$route.path === '/layout/tg/telegram') {
      console.log('当前在Telegram管理页面，重定向到账号分组管理')
      this.$router.push('/layout/tg/telegram/account-group')
    }
  }
})
</script>

<style scoped>
.telegram-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}
</style>
