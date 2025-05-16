<template>
  <div class="global-settings-container">
    <h1>全局设置</h1>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础配置" name="basic">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>系统基础配置</span>
            </div>
          </template>
          <el-form ref="basicForm" :model="basicForm" label-width="180px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName"></el-input>
            </el-form-item>
            <el-form-item label="最大任务并发数">
              <el-input-number v-model="basicForm.maxConcurrentTasks" :min="1" :max="100"></el-input-number>
            </el-form-item>
            <el-form-item label="任务默认超时(秒)">
              <el-input-number v-model="basicForm.defaultTaskTimeout" :min="30" :max="3600"></el-input-number>
            </el-form-item>
            <el-form-item label="数据保留天数">
              <el-input-number v-model="basicForm.dataRetentionDays" :min="7" :max="365"></el-input-number>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="消息模板" name="message-templates">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>系统消息模板</span>
              <el-button type="text" @click="addTemplate">添加模板</el-button>
            </div>
          </template>
          <el-table :data="templateData" border style="width: 100%">
            <el-table-column prop="name" label="模板名称" width="200"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="editTemplate(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteTemplate(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="API配置" name="api-config">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>API配置</span>
            </div>
          </template>
          <el-form ref="apiForm" :model="apiForm" label-width="180px">
            <el-form-item label="API访问密钥">
              <el-input v-model="apiForm.apiKey" show-password></el-input>
            </el-form-item>
            <el-form-item label="API访问IP白名单">
              <el-input 
                type="textarea" 
                v-model="apiForm.ipWhitelist" 
                placeholder="每行输入一个IP地址"
                :rows="4">
              </el-input>
            </el-form-item>
            <el-form-item label="API请求频率限制(次/分钟)">
              <el-input-number v-model="apiForm.rateLimit" :min="10" :max="1000"></el-input-number>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveApiSettings">保存设置</el-button>
              <el-button type="success" @click="regenerateApiKey">重新生成密钥</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="通知设置" name="notification-settings">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>通知设置</span>
            </div>
          </template>
          <el-form ref="notificationForm" :model="notificationForm" label-width="180px">
            <el-form-item label="任务完成通知">
              <el-switch v-model="notificationForm.taskCompleteNotify"></el-switch>
            </el-form-item>
            <el-form-item label="任务失败通知">
              <el-switch v-model="notificationForm.taskFailNotify"></el-switch>
            </el-form-item>
            <el-form-item label="账号异常通知">
              <el-switch v-model="notificationForm.accountAbnormalNotify"></el-switch>
            </el-form-item>
            <el-form-item label="系统异常通知">
              <el-switch v-model="notificationForm.systemErrorNotify"></el-switch>
            </el-form-item>
            <el-form-item label="邮件通知地址">
              <el-input v-model="notificationForm.emailAddress" placeholder="接收通知的邮箱地址"></el-input>
            </el-form-item>
            <el-form-item label="Webhook地址">
              <el-input v-model="notificationForm.webhookUrl" placeholder="接收通知的Webhook地址"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
              <el-button type="success" @click="testNotification">测试通知</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- Template Dialog -->
    <el-dialog
      :title="templateDialogType === 'add' ? '添加模板' : '编辑模板'"
      v-model="templateDialogVisible"
      width="50%">
      <el-form :model="templateForm" label-width="120px" ref="templateForm">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="templateForm.description" placeholder="请输入模板描述"></el-input>
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <el-input
            type="textarea"
            v-model="templateForm.content"
            placeholder="请输入模板内容"
            :rows="6">
          </el-input>
        </el-form-item>
        <el-form-item label="变量说明">
          <ul class="variables-list">
            <li><code>{{name}}</code> - 接收者名称</li>
            <li><code>{{date}}</code> - 当前日期</li>
            <li><code>{{time}}</code> - 当前时间</li>
            <li><code>{{group}}</code> - 群组名称</li>
          </ul>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GlobalSettings',
  data() {
    return {
      activeTab: 'basic',
      basicForm: {
        systemName: 'TG营销系统',
        maxConcurrentTasks: 10,
        defaultTaskTimeout: 60,
        dataRetentionDays: 30
      },
      apiForm: {
        apiKey: '请在此输入您的API密钥', // 移除硬编码的API密钥
        ipWhitelist: '127.0.0.1\n192.168.1.1',
        rateLimit: 100
      },
      notificationForm: {
        taskCompleteNotify: true,
        taskFailNotify: true,
        accountAbnormalNotify: true,
        systemErrorNotify: true,
        emailAddress: 'admin@example.com',
        webhookUrl: 'https://webhook.example.com/notify'
      },
      templateData: [
        {
          id: 1,
          name: '欢迎消息模板',
          description: '新用户加入群组时的欢迎消息',
          createTime: '2025-05-01 10:00:00'
        },
        {
          id: 2,
          name: '活动通知模板',
          description: '发送活动通知的通用模板',
          createTime: '2025-05-05 14:30:00'
        }
      ],
      templateDialogVisible: false,
      templateDialogType: 'add',
      templateForm: {
        id: undefined,
        name: '',
        description: '',
        content: ''
      }
    };
  },
  created() {
    this.fetchSettings();
  },
  methods: {
    fetchSettings() {
      // TODO: Implement API call to fetch settings
      console.log('Fetching global settings');
    },
    
    saveBasicSettings() {
      // TODO: Implement API call to save basic settings
      this.$message({
        type: 'success',
        message: '基础设置保存成功!'
      });
    },
    
    saveApiSettings() {
      // TODO: Implement API call to save API settings
      this.$message({
        type: 'success',
        message: 'API设置保存成功!'
      });
    },
    
    regenerateApiKey() {
      this.$confirm('确定要重新生成API密钥吗？这将使当前所有使用旧密钥的应用失效。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to regenerate API key
        this.apiForm.apiKey = 'sk_test_' + Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);
        this.$message({
          type: 'success',
          message: 'API密钥已重新生成!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        });
      });
    },
    
    saveNotificationSettings() {
      // TODO: Implement API call to save notification settings
      this.$message({
        type: 'success',
        message: '通知设置保存成功!'
      });
    },
    
    testNotification() {
      // TODO: Implement API call to test notification
      this.$message({
        type: 'info',
        message: '测试通知已发送，请检查您的邮箱或Webhook'
      });
    },
    
    addTemplate() {
      this.templateDialogType = 'add';
      this.templateForm = {
        name: '',
        description: '',
        content: ''
      };
      this.templateDialogVisible = true;
    },
    
    editTemplate(template) {
      this.templateDialogType = 'edit';
      this.templateForm = {
        id: template.id,
        name: template.name,
        description: template.description,
        content: '尊敬的{{name}}，\n\n欢迎加入我们的{{group}}！\n\n如有任何问题，请随时联系我们。\n\n{{date}} {{time}}'
      };
      this.templateDialogVisible = true;
    },
    
    deleteTemplate(template) {
      this.$confirm(`确定要删除模板 "${template.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete template
        this.templateData = this.templateData.filter(item => item.id !== template.id);
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    
    saveTemplate() {
      // TODO: Implement API call to save template
      if (this.templateDialogType === 'add') {
        const newTemplate = {
          id: this.templateData.length + 1,
          name: this.templateForm.name,
          description: this.templateForm.description,
          createTime: new Date().toLocaleString()
        };
        this.templateData.push(newTemplate);
      } else {
        const index = this.templateData.findIndex(item => item.id === this.templateForm.id);
        if (index !== -1) {
          this.templateData[index].name = this.templateForm.name;
          this.templateData[index].description = this.templateForm.description;
        }
      }
      
      this.$message({
        type: 'success',
        message: this.templateDialogType === 'add' ? '模板添加成功!' : '模板更新成功!'
      });
      this.templateDialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.global-settings-container {
  padding: 20px;
  
  .box-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .variables-list {
    padding-left: 20px;
    margin: 0;
    
    code {
      background-color: #f5f7fa;
      padding: 2px 5px;
      border-radius: 3px;
      color: #409eff;
    }
  }
}
</style>
