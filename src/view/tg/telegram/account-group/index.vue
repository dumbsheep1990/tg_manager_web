<template>
  <div class="account-group-container">
    <h1>账号分组管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加分组</el-button>
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
        label="分组名称"
        width="150">
      </el-table-column>
      <el-table-column
        prop="accountCount"
        label="账号数量"
        width="100">
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
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="primary" @click="viewAccounts(scope.row)">查看账号</el-button>
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
    
    <!-- 添加/编辑分组对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加分组' : '编辑分组'"
      v-model="dialogVisible"
      width="40%">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分组名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            type="textarea" 
            v-model="form.description" 
            placeholder="请输入分组描述"
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveGroup">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看账号对话框 -->
    <el-dialog
      title="分组账号列表"
      v-model="accountsDialogVisible"
      width="70%">
      <div v-if="currentGroup">
        <h3>{{ currentGroup.name }} 分组账号列表</h3>
        <el-table :data="accountsList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
          <el-table-column prop="username" label="用户名" width="150"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" type="danger" @click="removeFromGroup(scope.row)">移出分组</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="accountsDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AccountGroupManagement',
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
      accountsDialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' }
        ]
      },
      currentGroup: null,
      accountsList: []
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      // 模拟数据，实际应该调用 API
      this.tableData = [
        {
          id: 1,
          name: '默认分组',
          accountCount: 5,
          description: '系统默认分组',
          createTime: '2025-05-01 00:00:00'
        },
        {
          id: 2,
          name: '营销组',
          accountCount: 10,
          description: '用于营销推广的账号分组',
          createTime: '2025-05-02 10:00:00'
        },
        {
          id: 3,
          name: '测试组',
          accountCount: 3,
          description: '用于功能测试的账号分组',
          createTime: '2025-05-03 14:30:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
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
    
    openAddDialog() {
      this.dialogType = 'add';
      this.form = {
        name: '',
        description: ''
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = { 
        id: row.id,
        name: row.name,
        description: row.description
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('是否确认删除该分组?', '警告', {
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
      
      this.$confirm(`是否确认批量删除选中的${this.selectedRows.length}个分组?`, '警告', {
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
    
    saveGroup() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 调用保存 API
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
    
    viewAccounts(row) {
      this.currentGroup = row;
      this.accountsDialogVisible = true;
      
      // 获取分组下的账号列表
      // 模拟数据，实际应该调用 API
      this.accountsList = [
        {
          id: 1,
          phone: '+1234567890',
          username: 'user1',
          status: 'active',
          createTime: '2025-05-01 00:00:00'
        },
        {
          id: 2,
          phone: '+1234567891',
          username: 'user2',
          status: 'active',
          createTime: '2025-05-01 01:00:00'
        },
        {
          id: 3,
          phone: '+1234567892',
          username: 'user3',
          status: 'inactive',
          createTime: '2025-05-01 02:00:00'
        }
      ];
      
      if (row.id === 2) {
        // 添加更多模拟数据
        for (let i = 4; i <= 10; i++) {
          this.accountsList.push({
            id: i,
            phone: `+123456789${i}`,
            username: `user${i}`,
            status: 'active',
            createTime: '2025-05-01 03:00:00'
          });
        }
      }
    },
    
    removeFromGroup(account) {
      this.$confirm(`是否确认将账号 ${account.username} 从分组移除?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用移除 API
        this.$message({
          type: 'success',
          message: '移除成功!'
        });
        
        // 从列表中移除
        const index = this.accountsList.findIndex(a => a.id === account.id);
        if (index !== -1) {
          this.accountsList.splice(index, 1);
          
          // 更新分组账号数量
          if (this.currentGroup) {
            this.currentGroup.accountCount--;
            const groupIndex = this.tableData.findIndex(g => g.id === this.currentGroup.id);
            if (groupIndex !== -1) {
              this.tableData[groupIndex].accountCount = this.currentGroup.accountCount;
            }
          }
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消移除'
        });          
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.account-group-container {
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
