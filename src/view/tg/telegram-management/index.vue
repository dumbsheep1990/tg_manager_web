<template>
  <div class="telegram-management-container">
    <h1>Telegram管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加账号</el-button>
      <el-button type="success" @click="importAccounts">批量导入</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
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
        label="电话号码"
        width="150">
      </el-table-column>
      <el-table-column
        prop="username"
        label="用户名"
        width="150">
      </el-table-column>
      <el-table-column
        prop="groupName"
        label="分组"
        width="120">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '活跃' : '禁用' }}
          </el-tag>
        </template>
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
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="success" @click="checkStatus(scope.row)">检查</el-button>
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
    
    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="dialogType === 'add' ? '添加Telegram账号' : '编辑Telegram账号'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px">
        <el-form-item label="电话号码">
          <el-input v-model="form.phone" placeholder="请输入电话号码"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="form.groupId" placeholder="请选择分组">
            <el-option
              v-for="item in groups"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAccount">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Import Dialog -->
    <el-dialog
      title="批量导入Telegram账号"
      v-model="importDialogVisible"
      width="50%">
      <el-upload
        class="upload-demo"
        action="#"
        :http-request="uploadFile"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false">
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">
            请上传格式为 .tdata 或 .csv 的文件
          </div>
        </template>
        <el-button class="ml-3" type="success" @click="submitUpload">上传</el-button>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TelegramManagement',
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
      importDialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        phone: '',
        username: '',
        groupId: '',
        status: 'active'
      },
      groups: [],
    };
  },
  created() {
    this.fetchData();
    this.fetchGroups();
  },
  methods: {
    fetchData() {
      // TODO: Implement API call to fetch telegram accounts
      // Mocked data for now
      this.tableData = [
        {
          id: 1,
          phone: '+123456789',
          username: 'user1',
          groupName: '默认分组',
          status: 'active',
          createTime: '2025-05-15 16:00:00',
        },
        {
          id: 2,
          phone: '+987654321',
          username: 'user2',
          groupName: '测试分组',
          status: 'inactive',
          createTime: '2025-05-15 16:10:00',
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    fetchGroups() {
      // TODO: Implement API call to fetch groups
      this.groups = [
        { id: 1, name: '默认分组' },
        { id: 2, name: '测试分组' },
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
    
    openAddDialog() {
      this.dialogType = 'add';
      this.form = {
        phone: '',
        username: '',
        groupId: '',
        status: 'active'
      };
      this.dialogVisible = true;
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = {
        id: row.id,
        phone: row.phone,
        username: row.username,
        groupId: this.groups.find(g => g.name === row.groupName)?.id,
        status: row.status
      };
      this.dialogVisible = true;
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除该账号吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete account
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
      
      this.$confirm(`确定要删除选中的${this.selectedRows.length}条记录吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to batch delete accounts
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
    
    saveAccount() {
      // TODO: Implement API call to save account
      this.$message({
        type: 'success',
        message: this.dialogType === 'add' ? '添加成功!' : '更新成功!'
      });
      this.dialogVisible = false;
      this.fetchData();
    },
    
    checkStatus(row) {
      // TODO: Implement API call to check account status
      this.$message({
        type: 'success',
        message: '账号状态正常!'
      });
    },
    
    importAccounts() {
      this.importDialogVisible = true;
    },
    
    handleExceed() {
      this.$message.warning('只允许上传一个文件!');
    },
    
    uploadFile(param) {
      console.log('Upload file:', param.file);
      // Will be handled by submitUpload
    },
    
    submitUpload() {
      // TODO: Implement API call to upload file
      this.$message({
        type: 'success',
        message: '文件上传成功，正在处理中!'
      });
      this.importDialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.telegram-management-container {
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
}
</style>
