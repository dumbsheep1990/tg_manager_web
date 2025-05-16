<template>
  <div class="message-center-container">
    <h1>消息中心</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openCreateDialog">创建消息</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="消息列表" name="message-list">
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="id"
            label="ID"
            width="80">
          </el-table-column>
          <el-table-column
            prop="title"
            label="消息标题"
            width="200">
          </el-table-column>
          <el-table-column
            prop="type"
            label="消息类型"
            width="120">
            <template #default="scope">
              <el-tag :type="getMessageTypeTag(scope.row.type)">
                {{ getMessageTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'sent' ? 'success' : scope.row.status === 'sending' ? 'warning' : 'info'">
                {{ scope.row.status === 'sent' ? '已发送' : scope.row.status === 'sending' ? '发送中' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="recipient"
            label="接收者"
            width="150">
          </el-table-column>
          <el-table-column
            prop="sendTime"
            label="发送时间"
            width="180">
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180">
          </el-table-column>
          <el-table-column
            label="操作"
            width="250">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              <el-button size="small" type="success" v-if="scope.row.status === 'draft'" @click="sendMessage(scope.row)">发送</el-button>
              <el-button size="small" type="info" @click="viewDetail(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </el-tab-pane>
      
      <el-tab-pane label="模板管理" name="template-management">
        <el-table
          :data="templateData"
          border
          style="width: 100%">
          <el-table-column
            prop="id"
            label="ID"
            width="80">
          </el-table-column>
          <el-table-column
            prop="name"
            label="模板名称"
            width="200">
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述">
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180">
          </el-table-column>
          <el-table-column
            label="操作"
            width="200">
            <template #default="scope">
              <el-button size="small" @click="editTemplate(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteTemplate(scope.row)">删除</el-button>
              <el-button size="small" type="success" @click="useTemplate(scope.row)">使用</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    
    <!-- Create/Edit Message Dialog -->
    <el-dialog
      :title="dialogType === 'create' ? '创建消息' : '编辑消息'"
      v-model="messageDialogVisible"
      width="60%">
      <el-form :model="messageForm" label-width="120px" :rules="messageRules" ref="messageForm">
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="messageForm.title" placeholder="请输入消息标题"></el-input>
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="messageForm.type" placeholder="请选择消息类型">
            <el-option label="文本消息" value="text"></el-option>
            <el-option label="图片消息" value="image"></el-option>
            <el-option label="视频消息" value="video"></el-option>
            <el-option label="文件消息" value="file"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接收者类型" prop="recipientType">
          <el-radio-group v-model="messageForm.recipientType">
            <el-radio label="user">个人用户</el-radio>
            <el-radio label="group">群组</el-radio>
            <el-radio label="channel">频道</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="接收者" prop="recipient">
          <el-select 
            v-model="messageForm.recipient" 
            placeholder="请选择接收者"
            filterable
            remote
            :remote-method="remoteSearch"
            :loading="loading">
            <el-option
              v-for="item in recipientOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            type="textarea"
            v-model="messageForm.content"
            placeholder="请输入消息内容"
            :rows="5">
          </el-input>
        </el-form-item>
        <el-form-item label="附件" v-if="messageForm.type !== 'text'">
          <el-upload
            class="upload-demo"
            action="#"
            :http-request="uploadFile"
            :auto-upload="false"
            :limit="1">
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ getUploadTip() }}
              </div>
            </template>
            <el-button class="ml-3" type="success" @click="submitUpload">上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-radio-group v-model="messageForm.sendTimeType">
            <el-radio label="now">立即发送</el-radio>
            <el-radio label="scheduled">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="定时时间" v-if="messageForm.sendTimeType === 'scheduled'">
          <el-date-picker
            v-model="messageForm.scheduledTime"
            type="datetime"
            placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="messageDialogVisible = false">取消</el-button>
          <el-button type="success" @click="saveAsDraft">保存草稿</el-button>
          <el-button type="primary" @click="saveAndSendMessage">保存并发送</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Template Dialog -->
    <el-dialog
      :title="templateDialogType === 'create' ? '创建模板' : '编辑模板'"
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
  name: 'MessageCenter',
  data() {
    return {
      activeTab: 'message-list',
      tableData: [],
      templateData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      messageDialogVisible: false,
      templateDialogVisible: false,
      dialogType: 'create', // 'create' or 'edit'
      templateDialogType: 'create', // 'create' or 'edit'
      messageForm: {
        id: undefined,
        title: '',
        type: 'text',
        recipientType: 'user',
        recipient: '',
        content: '',
        sendTimeType: 'now',
        scheduledTime: '',
        attachmentUrl: ''
      },
      templateForm: {
        id: undefined,
        name: '',
        description: '',
        content: ''
      },
      messageRules: {
        title: [
          { required: true, message: '请输入消息标题', trigger: 'blur' },
        ],
        type: [
          { required: true, message: '请选择消息类型', trigger: 'change' }
        ],
        recipient: [
          { required: true, message: '请选择接收者', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入消息内容', trigger: 'blur' }
        ]
      },
      recipientOptions: [],
      loading: false
    };
  },
  created() {
    this.fetchData();
    this.fetchTemplates();
  },
  methods: {
    fetchData() {
      // TODO: Implement API call to fetch messages
      // Mocked data for now
      this.tableData = [
        {
          id: 1,
          title: '欢迎消息',
          type: 'text',
          status: 'sent',
          recipient: 'Group Chat 1',
          sendTime: '2025-05-15 09:00:00',
          createTime: '2025-05-14 16:30:00',
        },
        {
          id: 2,
          title: '活动公告',
          type: 'image',
          status: 'sent',
          recipient: 'Marketing Channel',
          sendTime: '2025-05-14 12:00:00',
          createTime: '2025-05-13 15:45:00',
        },
        {
          id: 3,
          title: '新功能介绍',
          type: 'video',
          status: 'draft',
          recipient: 'All Members',
          sendTime: '',
          createTime: '2025-05-15 10:20:00',
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    fetchTemplates() {
      // TODO: Implement API call to fetch templates
      // Mocked data for now
      this.templateData = [
        {
          id: 1,
          name: '欢迎模板',
          description: '新成员加入时发送的欢迎消息',
          createTime: '2025-04-01 09:00:00',
        },
        {
          id: 2,
          name: '活动通知模板',
          description: '用于发送活动通知的通用模板',
          createTime: '2025-04-10 14:30:00',
        }
      ];
    },
    
    handleTabClick() {
      if (this.activeTab === 'message-list') {
        this.fetchData();
      } else if (this.activeTab === 'template-management') {
        this.fetchTemplates();
      }
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.fetchData();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchData();
    },
    
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    
    getMessageTypeLabel(type) {
      const typeMap = {
        text: '文本消息',
        image: '图片消息',
        video: '视频消息',
        file: '文件消息'
      };
      return typeMap[type] || type;
    },
    
    getMessageTypeTag(type) {
      const typeMap = {
        text: '',
        image: 'success',
        video: 'warning',
        file: 'info'
      };
      return typeMap[type] || '';
    },
    
    getUploadTip() {
      const tipMap = {
        image: '请上传JPG/PNG格式的图片文件',
        video: '请上传MP4格式的视频文件',
        file: '请上传需要发送的文件'
      };
      return tipMap[this.messageForm.type] || '';
    },
    
    openCreateDialog() {
      this.dialogType = 'create';
      this.messageForm = {
        title: '',
        type: 'text',
        recipientType: 'user',
        recipient: '',
        content: '',
        sendTimeType: 'now',
        scheduledTime: '',
        attachmentUrl: ''
      };
      this.messageDialogVisible = true;
      
      // Reset form validation
      if (this.$refs.messageForm) {
        this.$refs.messageForm.resetFields();
      }
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.messageForm = {
        id: row.id,
        title: row.title,
        type: row.type,
        recipientType: this.getRecipientType(row.recipient),
        recipient: row.recipient,
        content: '', // Assuming content is not in the table data
        sendTimeType: row.status === 'draft' ? 'scheduled' : 'now',
        scheduledTime: '',
        attachmentUrl: ''
      };
      
      // TODO: Fetch message content from API
      
      this.messageDialogVisible = true;
      
      // Reset form validation
      if (this.$refs.messageForm) {
        this.$refs.messageForm.resetFields();
      }
    },
    
    getRecipientType(recipient) {
      // This is a simplified logic to determine recipient type
      if (recipient.includes('Group')) {
        return 'group';
      } else if (recipient.includes('Channel')) {
        return 'channel';
      }
      return 'user';
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除该消息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete message
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        this.fetchData();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录');
        return;
      }
      
      this.$confirm(`确定要删除选中的${this.selectedRows.length}条消息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to batch delete messages
        this.$message({
          type: 'success',
          message: '批量删除成功!'
        });
        this.fetchData();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    
    sendMessage(row) {
      this.$confirm('确定要发送该消息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to send message
        this.$message({
          type: 'success',
          message: '消息已发送!'
        });
        row.status = 'sent';
        row.sendTime = new Date().toLocaleString();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消发送'
        });
      });
    },
    
    viewDetail(row) {
      // TODO: Implement view detail logic
      this.$message({
        type: 'info',
        message: `查看消息 "${row.title}" 的详情`
      });
    },
    
    saveAsDraft() {
      this.$refs.messageForm.validate((valid) => {
        if (valid) {
          // TODO: Implement API call to save message as draft
          this.$message({
            type: 'success',
            message: '草稿保存成功!'
          });
          this.messageDialogVisible = false;
          this.fetchData();
        } else {
          return false;
        }
      });
    },
    
    saveAndSendMessage() {
      this.$refs.messageForm.validate((valid) => {
        if (valid) {
          if (this.messageForm.sendTimeType === 'scheduled' && !this.messageForm.scheduledTime) {
            this.$message.warning('请选择定时发送时间');
            return;
          }
          
          // TODO: Implement API call to save and send message
          this.$message({
            type: 'success',
            message: this.messageForm.sendTimeType === 'now' ? 
              '消息发送成功!' : 
              '消息已保存，将在设定时间发送!'
          });
          this.messageDialogVisible = false;
          this.fetchData();
        } else {
          return false;
        }
      });
    },
    
    remoteSearch(query) {
      if (query !== '') {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          // TODO: Replace with actual API call
          this.recipientOptions = [
            { value: 'User1', label: 'User 1' },
            { value: 'User2', label: 'User 2' },
            { value: 'GroupChat1', label: 'Group Chat 1' },
            { value: 'MarketingChannel', label: 'Marketing Channel' }
          ].filter(item => {
            return item.label.toLowerCase().includes(query.toLowerCase());
          });
        }, 200);
      } else {
        this.recipientOptions = [];
      }
    },
    
    uploadFile(param) {
      console.log('Upload file:', param.file);
      // Will be handled by submitUpload
    },
    
    submitUpload() {
      // TODO: Implement API call to upload file
      this.$message({
        type: 'success',
        message: '文件上传成功!'
      });
      this.messageForm.attachmentUrl = 'https://example.com/path/to/uploaded/file';
    },
    
    // Template management methods
    editTemplate(row) {
      this.templateDialogType = 'edit';
      this.templateForm = {
        id: row.id,
        name: row.name,
        description: row.description,
        content: '' // Fetch from API
      };
      
      // TODO: Fetch template content from API
      this.templateForm.content = '尊敬的{{name}}，\n\n欢迎加入我们的社区！\n\n如有任何问题，请随时联系我们。';
      
      this.templateDialogVisible = true;
    },
    
    deleteTemplate(row) {
      this.$confirm('确定要删除该模板吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete template
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        this.fetchTemplates();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    
    useTemplate(row) {
      // TODO: Fetch template content from API
      const templateContent = '尊敬的{{name}}，\n\n欢迎加入我们的社区！\n\n如有任何问题，请随时联系我们。';
      
      this.activeTab = 'message-list';
      this.openCreateDialog();
      this.messageForm.title = row.name;
      this.messageForm.content = templateContent;
    },
    
    saveTemplate() {
      // TODO: Implement API call to save template
      this.$message({
        type: 'success',
        message: this.templateDialogType === 'create' ? '模板创建成功!' : '模板更新成功!'
      });
      this.templateDialogVisible = false;
      this.fetchTemplates();
    }
  }
};
</script>

<style lang="scss" scoped>
.message-center-container {
  padding: 20px;
  
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
  
  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }
  
  .el-tabs {
    margin-bottom: 20px;
  }
}
</style>
