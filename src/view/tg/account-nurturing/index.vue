<template>
  <div class="account-nurturing-container">
    <h1>养号管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openCreateDialog">创建养号任务</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </div>
    
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="任务名称" width="150"></el-table-column>
      <el-table-column prop="accountCount" label="账号数量" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="frequency" label="频率" width="120"></el-table-column>
      <el-table-column prop="lastRunTime" label="上次执行时间" width="180"></el-table-column>
      <el-table-column prop="nextRunTime" label="下次执行时间" width="180"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="success" @click="runNow(scope.row)">立即执行</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 'active' ? 'warning' : 'info'"
            @click="toggleStatus(scope.row)">
            {{ scope.row.status === 'active' ? '暂停' : '激活' }}
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
    
    <!-- Create/Edit Dialog -->
    <el-dialog
      :title="dialogType === 'create' ? '创建养号任务' : '编辑养号任务'"
      v-model="dialogVisible"
      width="60%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="taskForm">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="关联账号" prop="accounts">
          <el-select 
            v-model="form.accounts" 
            multiple
            filterable
            placeholder="请选择关联账号">
            <el-option
              v-for="item in accountOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行频率" prop="frequency">
          <el-select v-model="form.frequency" placeholder="请选择执行频率">
            <el-option label="每小时" value="hourly"></el-option>
            <el-option label="每天" value="daily"></el-option>
            <el-option label="每周" value="weekly"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义频率" v-if="form.frequency === 'custom'" prop="customFrequency">
          <el-input-number v-model="form.customFrequency" :min="1" :max="999"></el-input-number>
          <el-select v-model="form.customFrequencyUnit" style="margin-left: 10px">
            <el-option label="分钟" value="minutes"></el-option>
            <el-option label="小时" value="hours"></el-option>
            <el-option label="天" value="days"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间范围" prop="timeRange">
          <el-time-picker
            v-model="form.startTime"
            placeholder="开始时间"
            format="HH:mm">
          </el-time-picker>
          <span style="margin: 0 10px;">至</span>
          <el-time-picker
            v-model="form.endTime"
            placeholder="结束时间"
            format="HH:mm">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="养号任务类型" prop="nurturingTypes">
          <el-checkbox-group v-model="form.nurturingTypes">
            <el-checkbox label="browseGroups">浏览群组</el-checkbox>
            <el-checkbox label="sendMessage">发送消息</el-checkbox>
            <el-checkbox label="forwardContent">转发内容</el-checkbox>
            <el-checkbox label="readMessages">阅读消息</el-checkbox>
            <el-checkbox label="joinGroups">加入群组</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 消息内容配置 -->
        <div v-if="form.nurturingTypes.includes('sendMessage')">
          <el-divider content-position="left">消息发送配置</el-divider>
          <el-form-item label="目标类型" prop="targetType">
            <el-radio-group v-model="form.targetType">
              <el-radio label="group">群组</el-radio>
              <el-radio label="contact">联系人</el-radio>
              <el-radio label="saved">收藏夹</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="目标" prop="targets" v-if="form.targetType !== 'saved'">
            <el-select 
              v-model="form.targets" 
              multiple
              filterable
              placeholder="请选择发送目标">
              <el-option
                v-for="item in targetOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="消息内容库" prop="messageContents">
            <el-button size="small" type="primary" @click="addMessageContent">添加内容</el-button>
            <div v-for="(content, index) in form.messageContents" :key="index" class="message-content-item">
              <el-input 
                type="textarea" 
                v-model="form.messageContents[index]" 
                :rows="2"
                style="width: 90%">
              </el-input>
              <el-button type="danger" icon="Delete" circle @click="removeMessageContent(index)"></el-button>
            </div>
          </el-form-item>
        </div>
        
        <!-- 群组浏览配置 -->
        <div v-if="form.nurturingTypes.includes('browseGroups')">
          <el-divider content-position="left">群组浏览配置</el-divider>
          <el-form-item label="浏览群组" prop="browseGroups">
            <el-select 
              v-model="form.browseGroups" 
              multiple
              filterable
              placeholder="请选择浏览群组">
              <el-option
                v-for="item in groupOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="浏览时长(分钟)" prop="browseDuration">
            <el-input-number v-model="form.browseDuration" :min="1" :max="60"></el-input-number>
          </el-form-item>
        </div>
        
        <!-- 加入群组配置 -->
        <div v-if="form.nurturingTypes.includes('joinGroups')">
          <el-divider content-position="left">加入群组配置</el-divider>
          <el-form-item label="群组链接" prop="groupLinks">
            <el-button size="small" type="primary" @click="addGroupLink">添加链接</el-button>
            <div v-for="(link, index) in form.groupLinks" :key="index" class="group-link-item">
              <el-input 
                v-model="form.groupLinks[index]" 
                placeholder="请输入群组链接"
                style="width: 90%">
              </el-input>
              <el-button type="danger" icon="Delete" circle @click="removeGroupLink(index)"></el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTask">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AccountNurturing',
  data() {
    return {
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      dialogVisible: false,
      dialogType: 'create', // 'create' or 'edit'
      form: {
        id: undefined,
        name: '',
        accounts: [],
        frequency: 'daily',
        customFrequency: 1,
        customFrequencyUnit: 'hours',
        startTime: null,
        endTime: null,
        nurturingTypes: [],
        targetType: 'group',
        targets: [],
        messageContents: [],
        browseGroups: [],
        browseDuration: 5,
        groupLinks: []
      },
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ],
        accounts: [
          { required: true, message: '请选择关联账号', trigger: 'change' }
        ],
        frequency: [
          { required: true, message: '请选择执行频率', trigger: 'change' }
        ],
        nurturingTypes: [
          { required: true, message: '请选择养号任务类型', trigger: 'change' }
        ]
      },
      accountOptions: [],
      targetOptions: [],
      groupOptions: []
    };
  },
  created() {
    this.fetchData();
    this.fetchOptions();
  },
  methods: {
    fetchData() {
      // Mock data
      this.tableData = [
        {
          id: 1,
          name: '日常养号任务',
          accountCount: 5,
          status: 'active',
          frequency: '每天',
          lastRunTime: '2025-05-15 10:00:00',
          nextRunTime: '2025-05-16 10:00:00',
          createTime: '2025-05-01 09:00:00'
        },
        {
          id: 2,
          name: '高频养号任务',
          accountCount: 3,
          status: 'active',
          frequency: '每4小时',
          lastRunTime: '2025-05-15 12:00:00',
          nextRunTime: '2025-05-15 16:00:00',
          createTime: '2025-05-10 14:30:00'
        },
        {
          id: 3,
          name: '低频养号任务',
          accountCount: 10,
          status: 'inactive',
          frequency: '每周',
          lastRunTime: '2025-05-10 09:00:00',
          nextRunTime: '2025-05-17 09:00:00',
          createTime: '2025-04-15 16:45:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    fetchOptions() {
      // Mock options data
      this.accountOptions = [
        { value: 'account1', label: '账号1 (+1234567890)' },
        { value: 'account2', label: '账号2 (+0987654321)' },
        { value: 'account3', label: '账号3 (+1122334455)' },
        { value: 'account4', label: '账号4 (+5566778899)' }
      ];
      
      this.targetOptions = [
        { value: 'group1', label: '群组1' },
        { value: 'group2', label: '群组2' },
        { value: 'contact1', label: '联系人1' },
        { value: 'contact2', label: '联系人2' }
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
    
    getStatusLabel(status) {
      return status === 'active' ? '运行中' : '已暂停';
    },
    
    getStatusType(status) {
      return status === 'active' ? 'success' : 'info';
    },
    
    openCreateDialog() {
      this.dialogType = 'create';
      this.form = {
        name: '',
        accounts: [],
        frequency: 'daily',
        customFrequency: 1,
        customFrequencyUnit: 'hours',
        startTime: null,
        endTime: null,
        nurturingTypes: [],
        targetType: 'group',
        targets: [],
        messageContents: [],
        browseGroups: [],
        browseDuration: 5,
        groupLinks: []
      };
      this.dialogVisible = true;
      
      // Reset form validation
      if (this.$refs.taskForm) {
        this.$refs.taskForm.resetFields();
      }
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      
      // Mock data for editing
      this.form = {
        id: row.id,
        name: row.name,
        accounts: row.id === 1 ? ['account1', 'account2', 'account3', 'account4', 'account5'] : 
                 row.id === 2 ? ['account1', 'account2', 'account3'] : 
                 ['account1', 'account2', 'account3', 'account4', 'account5', 'account6', 'account7', 'account8', 'account9', 'account10'],
        frequency: row.id === 1 ? 'daily' : row.id === 2 ? 'custom' : 'weekly',
        customFrequency: row.id === 2 ? 4 : 1,
        customFrequencyUnit: 'hours',
        startTime: new Date(2025, 0, 1, 9, 0),
        endTime: new Date(2025, 0, 1, 21, 0),
        nurturingTypes: ['browseGroups', 'sendMessage'],
        targetType: 'group',
        targets: ['group1', 'group2'],
        messageContents: ['你好，这是养号消息测试！', '好久不见，最近如何？'],
        browseGroups: ['group1', 'group2'],
        browseDuration: 5,
        groupLinks: []
      };
      
      if (row.id === 3) {
        this.form.nurturingTypes.push('joinGroups');
        this.form.groupLinks = ['https://t.me/group1', 'https://t.me/group2'];
      }
      
      this.dialogVisible = true;
      
      // Reset form validation
      if (this.$refs.taskForm) {
        this.$refs.taskForm.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除该养号任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete nurturing task
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
      
      this.$confirm(`确定要删除选中的${this.selectedRows.length}个养号任务吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to batch delete nurturing tasks
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
    
    saveTask() {
      this.$refs.taskForm.validate((valid) => {
        if (valid) {
          // TODO: Implement API call to save nurturing task
          this.$message({
            type: 'success',
            message: this.dialogType === 'create' ? '创建成功!' : '更新成功!'
          });
          this.dialogVisible = false;
          this.fetchData();
        } else {
          return false;
        }
      });
    },
    
    runNow(row) {
      this.$confirm('确定要立即执行该养号任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to run nurturing task now
        this.$message({
          type: 'success',
          message: '任务已开始执行!'
        });
        row.lastRunTime = new Date().toLocaleString();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        });
      });
    },
    
    toggleStatus(row) {
      const action = row.status === 'active' ? '暂停' : '激活';
      this.$confirm(`确定要${action}该养号任务吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to toggle nurturing task status
        row.status = row.status === 'active' ? 'inactive' : 'active';
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
    },
    
    addMessageContent() {
      this.form.messageContents.push('');
    },
    
    removeMessageContent(index) {
      this.form.messageContents.splice(index, 1);
    },
    
    addGroupLink() {
      this.form.groupLinks.push('');
    },
    
    removeGroupLink(index) {
      this.form.groupLinks.splice(index, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
.account-nurturing-container {
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
  
  .message-content-item, .group-link-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    
    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
