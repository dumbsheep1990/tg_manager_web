<template>
  <div class="bot-management-container">
    <h1>机器人管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加机器人</el-button>
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
        prop="name"
        label="机器人名称"
        width="150">
      </el-table-column>
      <el-table-column
        prop="username"
        label="用户名"
        width="150">
      </el-table-column>
      <el-table-column
        prop="token"
        label="Token"
        width="200">
        <template #default="scope">
          <span>{{ maskToken(scope.row.token) }}</span>
          <el-button size="small" type="text" @click="copyToken(scope.row.token)">复制</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '在线' : '离线' }}
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
        width="250">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="success" @click="checkStatus(scope.row)">检查状态</el-button>
          <el-button size="small" type="info" @click="viewLogs(scope.row)">查看日志</el-button>
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
      :title="dialogType === 'add' ? '添加机器人' : '编辑机器人'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="botForm">
        <el-form-item label="机器人名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入机器人名称"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="Token" prop="token">
          <el-input v-model="form.token" placeholder="请输入Token"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="请输入机器人描述"
            :rows="3">
          </el-input>
        </el-form-item>
        <el-form-item label="功能设置">
          <el-checkbox-group v-model="form.features">
            <el-checkbox label="welcome">欢迎消息</el-checkbox>
            <el-checkbox label="autoReply">自动回复</el-checkbox>
            <el-checkbox label="memberManagement">成员管理</el-checkbox>
            <el-checkbox label="antiSpam">反垃圾</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBot">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BotManagement',
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
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        name: '',
        username: '',
        token: '',
        description: '',
        features: []
      },
      rules: {
        name: [
          { required: true, message: '请输入机器人名称', trigger: 'blur' },
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]*$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        token: [
          { required: true, message: '请输入Token', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      // TODO: Implement API call to fetch bots
      // Mocked data for now
      this.tableData = [
        {
          id: 1,
          name: '欢迎机器人',
          username: 'welcome_bot',
          token: '1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg',
          status: 'active',
          createTime: '2025-04-10 09:30:00',
        },
        {
          id: 2,
          name: '审核机器人',
          username: 'moderator_bot',
          token: '0987654321:ZYXWVUTSRQPONMLKJIHGFEDCBAdcba',
          status: 'active',
          createTime: '2025-04-15 14:20:00',
        },
        {
          id: 3,
          name: '统计机器人',
          username: 'stats_bot',
          token: '1357924680:QWERTYUIOPASDFGHJKLZXCVBNMasdfg',
          status: 'inactive',
          createTime: '2025-04-20 16:45:00',
        }
      ];
      
      this.pagination.total = this.tableData.length;
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
    
    maskToken(token) {
      if (!token) return '';
      const parts = token.split(':');
      if (parts.length !== 2) return '******';
      return `${parts[0].substring(0, 3)}...${parts[0].substring(parts[0].length - 3)}:${parts[1].substring(0, 3)}...`;
    },
    
    copyToken(token) {
      navigator.clipboard.writeText(token).then(() => {
        this.$message({
          type: 'success',
          message: 'Token已复制到剪贴板'
        });
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '复制失败，请手动复制'
        });
      });
    },
    
    openAddDialog() {
      this.dialogType = 'add';
      this.form = {
        name: '',
        username: '',
        token: '',
        description: '',
        features: []
      };
      this.dialogVisible = true;
      
      // Reset form validation
      if (this.$refs.botForm) {
        this.$refs.botForm.resetFields();
      }
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = {
        id: row.id,
        name: row.name,
        username: row.username,
        token: row.token,
        description: '',
        features: []  // Assuming these fields are not in the table data
      };
      this.dialogVisible = true;
      
      // Reset form validation
      if (this.$refs.botForm) {
        this.$refs.botForm.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除该机器人吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete bot
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
      
      this.$confirm(`确定要删除选中的${this.selectedRows.length}个机器人吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to batch delete bots
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
    
    saveBot() {
      this.$refs.botForm.validate((valid) => {
        if (valid) {
          // TODO: Implement API call to save bot
          this.$message({
            type: 'success',
            message: this.dialogType === 'add' ? '添加成功!' : '更新成功!'
          });
          this.dialogVisible = false;
          this.fetchData();
        } else {
          return false;
        }
      });
    },
    
    checkStatus(row) {
      // TODO: Implement API call to check bot status
      this.$message({
        type: 'info',
        message: `正在检查机器人 "${row.name}" 的状态，请稍后...`
      });
      
      // Simulate status check
      setTimeout(() => {
        this.$message({
          type: 'success',
          message: `机器人 "${row.name}" 状态正常`
        });
      }, 1500);
    },
    
    viewLogs(row) {
      this.$message({
        type: 'info',
        message: `查看机器人 "${row.name}" 的日志`
      });
      // TODO: Navigate to logs page or open logs dialog
    }
  }
};
</script>

<style lang="scss" scoped>
.bot-management-container {
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
