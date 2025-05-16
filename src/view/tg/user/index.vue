<template>
  <div class="user-management-container">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    return {}
  },
  created() {
    // 默认重定向到用户管理子路由
    if (this.$route.matched.length === 1) {
      this.$router.replace({ name: 'tgUserList' })
    }
  }
}
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}
</style>
