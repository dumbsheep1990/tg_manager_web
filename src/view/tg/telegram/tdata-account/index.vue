<template>
  <div class="tdata-account-container">
    <h1>tdata账号管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openImportDialog">导入账号</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
      <el-button type="success" @click="batchCheck">批量检测</el-button>
    </div>
    
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
        prop="phone"
        label="手机号"
        width="150">
      </el-table-column>
      <el-table-column
        prop="username"
        label="用户名"
        width="150">
      </el-table-column>
      <el-table-column
        prop="groupName"
        label="所属分组"
        width="120">
      </el-table-column>
      <el-table-column
        prop="tdataPath"
        label="tdata路径"
        width="200">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastLogin"
        label="最后登录时间"
        width="180">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180">
      </el-table-column>
      <el-table-column
        label="操作"
        width="280">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="success" @click="checkAccount(scope.row)">检测</el-button>
          <el-button size="small" type="primary" @click="changeGroup(scope.row)">更改分组</el-button>
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
    
    <!-- 导入账号对话框 -->
    <el-dialog
      title="导入tdata账号"
      v-model="importDialogVisible"
      width="50%">
      <el-form label-width="120px">
        <el-form-item label="选择分组">
          <el-select v-model="importForm.groupId" placeholder="请选择账号分组">
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="tdata文件">
          <el-upload
            class="upload-demo"
            action="#"
            :http-request="uploadTdata"
            :auto-upload="false"
            :limit="10"
            multiple
            :file-list="importForm.fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove">
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">请选择 .zip 或 .tdata 格式的文件</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importAccounts">确认导入</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑账号对话框 -->
    <el-dialog
      title="编辑账号"
      v-model="editDialogVisible"
      width="50%">
      <el-form :model="editForm" label-width="120px" :rules="editRules" ref="editFormRef">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="tdata路径" prop="tdataPath">
          <el-input v-model="editForm.tdataPath" placeholder="请输入tdata路径" disabled></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.status" 
            :active-value="'active'" 
            :inactive-value="'inactive'"
            active-text="正常" 
            inactive-text="禁用">
          </el-switch>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            type="textarea" 
            v-model="editForm.remark"
            placeholder="请输入备注"
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAccount">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 更改分组对话框 -->
    <el-dialog
      title="更改账号分组"
      v-model="groupDialogVisible"
      width="40%">
      <el-form label-width="120px">
        <el-form-item label="当前账号">
          <span>{{ currentAccount ? currentAccount.phone : '' }}</span>
        </el-form-item>
        <el-form-item label="当前分组">
          <span>{{ currentAccount ? currentAccount.groupName : '' }}</span>
        </el-form-item>
        <el-form-item label="目标分组">
          <el-select v-model="targetGroupId" placeholder="请选择目标分组">
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAccountGroup">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TdataAccountManagement',
  data() {
    return {
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      importDialogVisible: false,
      editDialogVisible: false,
      groupDialogVisible: false,
      importForm: {
        groupId: '',
        fileList: []
      },
      editForm: {
        id: undefined,
        phone: '',
        username: '',
        tdataPath: '',
        status: 'active',
        remark: ''
      },
      editRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      groupOptions: [],
      currentAccount: null,
      targetGroupId: ''
    };
  },
  created() {
    this.fetchData();
    this.fetchGroups();
  },
  methods: {
    fetchData() {
      // 模拟数据，实际应该调用 API
      this.tableData = [
        {
          id: 1,
          phone: '+1234567890',
          username: 'user1',
          groupName: '默认分组',
          tdataPath: '/storage/tdata/user1',
          status: 'active',
          lastLogin: '2025-05-14 10:00:00',
          createTime: '2025-05-01 00:00:00'
        },
        {
          id: 2,
          phone: '+1234567891',
          username: 'user2',
          groupName: '营销组',
          tdataPath: '/storage/tdata/user2',
          status: 'inactive',
          lastLogin: '2025-05-10 14:30:00',
          createTime: '2025-05-02 10:00:00'
        },
        {
          id: 3,
          phone: '+1234567892',
          username: 'user3',
          groupName: '测试组',
          tdataPath: '/storage/tdata/user3',
          status: 'error',
          lastLogin: '2025-05-12 16:45:00',
          createTime: '2025-05-03 14:30:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    fetchGroups() {
      // 模拟数据，实际应该调用 API
      this.groupOptions = [
        { value: 1, label: '默认分组' },
        { value: 2, label: '营销组' },
        { value: 3, label: '测试组' }
      ];
    },
    
    getStatusType(status) {
      const statusMap = {
        'active': 'success',
        'inactive': 'info',
        'error': 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    getStatusText(status) {
      const statusMap = {
        'active': '正常',
        'inactive': '禁用',
        'error': '异常'
      };
      return statusMap[status] || '未知';
    },
    
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.fetchData();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchData();
    },
    
    openImportDialog() {
      this.importForm = {
        groupId: '',
        fileList: []
      };
      this.importDialogVisible = true;
    },
    
    handleFileChange(file) {
      // 文件变更时触发，可以做一些验证
      console.log('File changed:', file);
    },
    
    handleFileRemove(file) {
      // 移除文件时触发
      console.log('File removed:', file);
    },
    
    uploadTdata(option) {
      // 这里实际应该调用上传 API
      console.log('Upload file:', option.file);
      return { status: 'success' };
    },
    
    importAccounts() {
      if (!this.importForm.groupId) {
        this.$message.warning('请选择账号分组');
        return;
      }
      
      if (this.importForm.fileList.length === 0) {
        this.$message.warning('请选择要导入的文件');
        return;
      }
      
      // 这里实际应该调用导入 API
      this.$message({
        type: 'success',
        message: '账号导入成功!'
      });
      this.importDialogVisible = false;
      this.fetchData();
    },
    
    handleEdit(row) {
      this.editForm = {
        id: row.id,
        phone: row.phone,
        username: row.username,
        tdataPath: row.tdataPath,
        status: row.status,
        remark: ''
      };
      this.editDialogVisible = true;
      
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.resetFields();
      }
    },
    
    saveAccount() {
      this.$refs.editFormRef.validate((valid) => {
        if (valid) {
          // 调用保存 API
          this.$message({
            type: 'success',
            message: '更新成功!'
          });
          this.editDialogVisible = false;
          
          // 更新表格中的数据
          const index = this.tableData.findIndex(item => item.id === this.editForm.id);
          if (index !== -1) {
            this.tableData[index].username = this.editForm.username;
            this.tableData[index].status = this.editForm.status;
          }
        } else {
          return false;
        }
      });
    },
    
    handleDelete(row) {
      this.$confirm('是否确认删除该账号?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用删除 API
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
      
      this.$confirm(`是否确认批量删除选中的${this.selectedRows.length}个账号?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用批量删除 API
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
    
    checkAccount(row) {
      this.$message({
        type: 'info',
        message: `正在检测账号 ${row.phone} 的状态...`
      });
      
      // 这里实际应该调用检测 API
      setTimeout(() => {
        const newStatus = Math.random() > 0.5 ? 'active' : 'error';
        const index = this.tableData.findIndex(item => item.id === row.id);
        if (index !== -1) {
          this.tableData[index].status = newStatus;
          this.tableData[index].lastLogin = new Date().toLocaleString();
        }
        
        this.$message({
          type: newStatus === 'active' ? 'success' : 'error',
          message: newStatus === 'active' ? 
            `账号 ${row.phone} 检测正常!` : 
            `账号 ${row.phone} 检测异常!`
        });
      }, 1000);
    },
    
    batchCheck() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录');
        return;
      }
      
      this.$message({
        type: 'info',
        message: `正在批量检测${this.selectedRows.length}个账号...`
      });
      
      // 这里实际应该调用批量检测 API
      setTimeout(() => {
        let successCount = 0;
        let errorCount = 0;
        
        this.selectedRows.forEach(row => {
          const newStatus = Math.random() > 0.3 ? 'active' : 'error';
          const index = this.tableData.findIndex(item => item.id === row.id);
          if (index !== -1) {
            this.tableData[index].status = newStatus;
            this.tableData[index].lastLogin = new Date().toLocaleString();
            
            if (newStatus === 'active') {
              successCount++;
            } else {
              errorCount++;
            }
          }
        });
        
        this.$message({
          type: 'success',
          message: `检测完成! 正常: ${successCount}个, 异常: ${errorCount}个`
        });
      }, 2000);
    },
    
    changeGroup(row) {
      this.currentAccount = row;
      this.targetGroupId = '';
      this.groupDialogVisible = true;
    },
    
    saveAccountGroup() {
      if (!this.targetGroupId) {
        this.$message.warning('请选择目标分组');
        return;
      }
      
      if (this.targetGroupId === this.currentAccount.groupId) {
        this.$message.warning('请选择不同的分组');
        return;
      }
      
      // 调用更改分组 API
      const targetGroup = this.groupOptions.find(item => item.value === this.targetGroupId);
      if (targetGroup) {
        const index = this.tableData.findIndex(item => item.id === this.currentAccount.id);
        if (index !== -1) {
          this.tableData[index].groupName = targetGroup.label;
        }
        
        this.$message({
          type: 'success',
          message: `账号已成功移动到"${targetGroup.label}"分组!`
        });
        
        this.groupDialogVisible = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tdata-account-container {
  padding: 20px;
  
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }
  
  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
