<template>
  <div class="user-management-container">
    <h1>用户管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加用户</el-button>
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
        prop="username"
        label="用户名"
        width="150">
      </el-table-column>
      <el-table-column
        prop="realName"
        label="姓名"
        width="150">
      </el-table-column>
      <el-table-column
        prop="role"
        label="角色"
        width="120">
        <template #default="scope">
          <el-tag 
            :type="scope.row.role === 'admin' ? 'danger' : 'primary'">
            {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastLoginTime"
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
        width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 'active' ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)">
            {{ scope.row.status === 'active' ? '禁用' : '启用' }}
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
    
    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="userForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input 
            v-model="form.password" 
            placeholder="请输入密码" 
            type="password"
            show-password>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input 
            v-model="form.confirmPassword" 
            placeholder="请确认密码" 
            type="password"
            show-password>
          </el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    // Password validation rule
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.form.confirmPassword !== '') {
          this.$refs.userForm.validateField('confirmPassword');
        }
        callback();
      }
    };
    
    // Confirm password validation rule
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    
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
        username: '',
        realName: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        status: 'active',
        email: '',
        phone: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      // TODO: Implement API call to fetch users
      // Mocked data for now
      this.tableData = [
        {
          id: 1,
          username: 'admin',
          realName: '系统管理员',
          role: 'admin',
          status: 'active',
          lastLoginTime: '2025-05-15 15:30:00',
          createTime: '2025-01-01 00:00:00',
        },
        {
          id: 2,
          username: 'user1',
          realName: '普通用户1',
          role: 'user',
          status: 'active',
          lastLoginTime: '2025-05-14 09:45:00',
          createTime: '2025-05-01 10:00:00',
        },
        {
          id: 3,
          username: 'user2',
          realName: '普通用户2',
          role: 'user',
          status: 'inactive',
          lastLoginTime: '2025-05-10 14:20:00',
          createTime: '2025-05-05 11:30:00',
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
    
    openAddDialog() {
      this.dialogType = 'add';
      this.form = {
        username: '',
        realName: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        status: 'active',
        email: '',
        phone: ''
      };
      this.dialogVisible = true;
      
      // Reset form validation
      if (this.$refs.userForm) {
        this.$refs.userForm.resetFields();
      }
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = {
        id: row.id,
        username: row.username,
        realName: row.realName,
        role: row.role,
        status: row.status,
        email: '', // Assuming these fields are not in the table data
        phone: ''  // Assuming these fields are not in the table data
      };
      this.dialogVisible = true;
      
      // Reset form validation
      if (this.$refs.userForm) {
        this.$refs.userForm.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete user
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
      
      this.$confirm(`确定要删除选中的${this.selectedRows.length}个用户吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to batch delete users
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
    
    saveUser() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          // TODO: Implement API call to save user
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
    
    toggleStatus(row) {
      const action = row.status === 'active' ? '禁用' : '启用';
      this.$confirm(`确定要${action}该用户吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to toggle user status
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
    }
  }
};
</script>

<style lang="scss" scoped>
.user-management-container {
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
