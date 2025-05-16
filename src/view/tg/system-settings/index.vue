<template>
  <div class="system-settings-container">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'SystemSettings',
  created() {
    // 默认重定向到菜单管理页面
    if (this.$route.path === '/layout/tg/system-settings') {
      this.$router.push('/layout/tg/system-settings/menu')
    }
  },
  methods: {
    fetchSettings() {
      // TODO: Implement API call to fetch settings
      console.log('Fetching system settings');
    },
    saveSettings() {
      // TODO: Implement API call to save settings
      console.log('Saving system settings:', this.formData);
      this.$message.success('设置保存成功');
    }
  }
};
</script>

<style lang="scss" scoped>
.system-settings-container {
  padding: 20px;
  
  .box-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
