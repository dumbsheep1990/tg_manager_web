<template>
  <div class="task-center-container">
    <h1>任务中心</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openCreateDialog">创建任务</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </div>
    
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
      <el-table-column prop="name" label="任务名称" width="150"></el-table-column>
      <el-table-column prop="type" label="任务类型" width="120">
        <template #default="scope">
          <el-tag :type="getTaskTypeTag(scope.row.type)">
            {{ getTaskTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="account" label="关联账号" width="150"></el-table-column>
      <el-table-column prop="progress" label="进度" width="180">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress"></el-progress>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 'running' ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)">
            {{ scope.row.status === 'running' ? '停止' : '启动' }}
          </el-button>
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
    
    <!-- Create Task Dialog -->
    <el-dialog
      title="创建任务"
      v-model="createDialogVisible"
      width="60%">
      <el-form :model="taskForm" label-width="120px" :rules="taskRules" ref="taskForm">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select v-model="taskForm.type" placeholder="请选择任务类型">
            <el-option label="发送消息" value="send_message"></el-option>
            <el-option label="加入群组" value="join_group"></el-option>
            <el-option label="添加联系人" value="add_contact"></el-option>
            <el-option label="检查账号" value="check_account"></el-option>
            <el-option label="提取成员" value="extract_members"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联账号" prop="accountId">
          <el-select 
            v-model="taskForm.accountId" 
            multiple
            placeholder="请选择关联账号"
            filterable>
            <el-option
              v-for="item in accountOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 根据不同任务类型显示不同参数 -->
        <template v-if="taskForm.type === 'send_message'">
          <el-form-item label="目标类型" prop="targetType">
            <el-radio-group v-model="taskForm.targetType">
              <el-radio label="user">用户</el-radio>
              <el-radio label="group">群组</el-radio>
              <el-radio label="channel">频道</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="目标" prop="target">
            <el-select 
              v-model="taskForm.target" 
              multiple
              placeholder="请选择目标"
              filterable>
              <el-option
                v-for="item in targetOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="消息内容" prop="message">
            <el-input
              type="textarea"
              v-model="taskForm.message"
              placeholder="请输入消息内容"
              :rows="4">
            </el-input>
          </el-form-item>
        </template>
        
        <template v-if="taskForm.type === 'join_group'">
          <el-form-item label="群组链接" prop="groupLink">
            <el-input v-model="taskForm.groupLink" placeholder="请输入群组链接"></el-input>
          </el-form-item>
        </template>
        
        <template v-if="taskForm.type === 'add_contact'">
          <el-form-item label="联系人" prop="contacts">
            <el-input
              type="textarea"
              v-model="taskForm.contacts"
              placeholder="请输入联系人，每行一个"
              :rows="4">
            </el-input>
          </el-form-item>
        </template>
        
        <template v-if="taskForm.type === 'extract_members'">
          <el-form-item label="目标群组" prop="sourceGroup">
            <el-select 
              v-model="taskForm.sourceGroup" 
              placeholder="请选择目标群组"
              filterable>
              <el-option
                v-for="item in groupOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        
        <el-form-item label="任务超时(秒)" prop="timeout">
          <el-input-number v-model="taskForm.timeout" :min="30" :max="3600"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createTask">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Task Detail Dialog -->
    <el-dialog
      title="任务详情"
      v-model="detailDialogVisible"
      width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">{{ getTaskTypeLabel(currentTask.type) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentTask.status)">{{ getStatusLabel(currentTask.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联账号">{{ currentTask.account }}</el-descriptions-item>
        <el-descriptions-item label="进度">
          <el-progress :percentage="currentTask.progress"></el-progress>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ currentTask.completeTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-tabs v-model="detailActiveTab" class="mt-4">
        <el-tab-pane label="执行记录" name="logs">
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in taskLogs"
              :key="index"
              :timestamp="log.time"
              :type="log.status === 'success' ? 'success' : log.status === 'error' ? 'danger' : 'info'">
              {{ log.message }}
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="任务参数" name="params">
          <pre>{{ JSON.stringify(currentTaskParams, null, 2) }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TaskCenter',
  data() {
    return {
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      createDialogVisible: false,
      detailDialogVisible: false,
      detailActiveTab: 'logs',
      taskForm: {
        name: '',
        type: 'send_message',
        accountId: [],
        targetType: 'user',
        target: [],
        message: '',
        groupLink: '',
        contacts: '',
        sourceGroup: '',
        timeout: 60
      },
      taskRules: {
        name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
        accountId: [{ required: true, message: '请选择关联账号', trigger: 'change' }],
      },
      accountOptions: [],
      targetOptions: [],
      groupOptions: [],
      currentTask: {},
      taskLogs: [],
      currentTaskParams: {}
    };
  },
  created() {
    this.fetchData();
    this.fetchAccounts();
  },
  methods: {
    fetchData() {
      // Mock data
      this.tableData = [
        {
          id: 1,
          name: '每日问候消息',
          type: 'send_message',
          status: 'completed',
          account: 'account1',
          progress: 100,
          createTime: '2025-05-14 09:00:00',
          completeTime: '2025-05-14 09:05:30'
        },
        {
          id: 2,
          name: '加入行业群组',
          type: 'join_group',
          status: 'running',
          account: 'account2,account3',
          progress: 60,
          createTime: '2025-05-15 10:30:00'
        },
        {
          id: 3,
          name: '提取目标群成员',
          type: 'extract_members',
          status: 'pending',
          account: 'account4',
          progress: 0,
          createTime: '2025-05-15 15:00:00'
        },
        {
          id: 4,
          name: '账号健康检查',
          type: 'check_account',
          status: 'failed',
          account: 'account1,account2,account3',
          progress: 30,
          createTime: '2025-05-15 12:00:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    fetchAccounts() {
      // Mock data
      this.accountOptions = [
        { value: 'account1', label: '账号1 (+1234567890)' },
        { value: 'account2', label: '账号2 (+0987654321)' },
        { value: 'account3', label: '账号3 (+1122334455)' },
        { value: 'account4', label: '账号4 (+5566778899)' }
      ];
      
      this.targetOptions = [
        { value: 'user1', label: '用户1' },
        { value: 'user2', label: '用户2' },
        { value: 'group1', label: '群组1' },
        { value: 'channel1', label: '频道1' }
      ];
      
      this.groupOptions = [
        { value: 'group1', label: '群组1' },
        { value: 'group2', label: '群组2' },
        { value: 'group3', label: '群组3' }
      ];
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
    
    getTaskTypeLabel(type) {
      const typeMap = {
        'send_message': '发送消息',
        'join_group': '加入群组',
        'add_contact': '添加联系人',
        'check_account': '检查账号',
        'extract_members': '提取成员'
      };
      return typeMap[type] || type;
    },
    
    getTaskTypeTag(type) {
      const typeMap = {
        'send_message': 'primary',
        'join_group': 'success',
        'add_contact': 'info',
        'check_account': 'warning',
        'extract_members': 'danger'
      };
      return typeMap[type] || '';
    },
    
    getStatusLabel(status) {
      const statusMap = {
        'pending': '等待中',
        'running': '执行中',
        'completed': '已完成',
        'failed': '失败'
      };
      return statusMap[status] || status;
    },
    
    getStatusType(status) {
      const statusMap = {
        'pending': 'info',
        'running': 'primary',
        'completed': 'success',
        'failed': 'danger'
      };
      return statusMap[status] || '';
    },
    
    openCreateDialog() {
      this.taskForm = {
        name: '',
        type: 'send_message',
        accountId: [],
        targetType: 'user',
        target: [],
        message: '',
        groupLink: '',
        contacts: '',
        sourceGroup: '',
        timeout: 60
      };
      this.createDialogVisible = true;
      
      // Reset form validation
      if (this.$refs.taskForm) {
        this.$refs.taskForm.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除该任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete task
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
      
      this.$confirm(`确定要删除选中的${this.selectedRows.length}个任务吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to batch delete tasks
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
    
    createTask() {
      this.$refs.taskForm.validate((valid) => {
        if (valid) {
          // TODO: Implement API call to create task
          this.$message({
            type: 'success',
            message: '任务创建成功!'
          });
          this.createDialogVisible = false;
          this.fetchData();
        } else {
          return false;
        }
      });
    },
    
    viewDetail(row) {
      this.currentTask = row;
      this.detailDialogVisible = true;
      this.fetchTaskLogs(row.id);
      this.fetchTaskParams(row.id);
    },
    
    fetchTaskLogs(taskId) {
      // Mock data
      this.taskLogs = [
        {
          time: '2025-05-15 15:01:00',
          status: 'info',
          message: '任务开始执行'
        },
        {
          time: '2025-05-15 15:01:30',
          status: 'info',
          message: '正在连接Telegram服务器'
        },
        {
          time: '2025-05-15 15:02:00',
          status: 'success',
          message: '成功连接Telegram服务器'
        },
        {
          time: '2025-05-15 15:02:30',
          status: 'info',
          message: '开始执行任务操作'
        },
        {
          time: '2025-05-15 15:03:00',
          status: 'success',
          message: '操作执行完成'
        }
      ];
      
      if (taskId === 4) {
        this.taskLogs.push({
          time: '2025-05-15 15:03:30',
          status: 'error',
          message: '账号2验证失败，可能被限制'
        });
      }
    },
    
    fetchTaskParams(taskId) {
      // Mock data based on task type
      const task = this.tableData.find(t => t.id === taskId);
      
      if (task.type === 'send_message') {
        this.currentTaskParams = {
          type: 'send_message',
          accounts: task.account.split(','),
          targets: ['user1', 'user2'],
          message: 'Hello, this is a test message.',
          timeout: 60
        };
      } else if (task.type === 'join_group') {
        this.currentTaskParams = {
          type: 'join_group',
          accounts: task.account.split(','),
          groupLink: 'https://t.me/testgroup',
          timeout: 60
        };
      } else if (task.type === 'extract_members') {
        this.currentTaskParams = {
          type: 'extract_members',
          account: task.account,
          sourceGroup: 'group1',
          timeout: 300
        };
      } else {
        this.currentTaskParams = {
          type: task.type,
          accounts: task.account.split(','),
          timeout: 60
        };
      }
    },
    
    toggleStatus(row) {
      const action = row.status === 'running' ? '停止' : '启动';
      this.$confirm(`确定要${action}该任务吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to toggle task status
        if (row.status === 'running') {
          row.status = 'pending';
        } else if (row.status === 'pending') {
          row.status = 'running';
        }
        
        this.$message({
          type: 'success',
          message: `${action}成功!`
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: `已取消${action}`
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.task-center-container {
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
  
  pre {
    background-color: #f5f7fa;
    padding: 16px;
    border-radius: 4px;
    overflow: auto;
  }
}
</style>
