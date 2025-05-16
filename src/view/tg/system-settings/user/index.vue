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
        label="用户ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="username"
        label="用户名"
        width="120">
      </el-table-column>
      <el-table-column
        prop="nickname"
        label="昵称"
        width="120">
      </el-table-column>
      <el-table-column
        prop="roles"
        label="角色"
        width="150">
        <template #default="scope">
          <el-tag v-for="(role, index) in scope.row.roles" :key="index" style="margin-right: 5px">
            {{ role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="180">
      </el-table-column>
      <el-table-column
        prop="phone"
        label="手机号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'">
            {{ scope.row.status ? '正常' : '禁用' }}
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
        width="280">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="primary" @click="assignRole(scope.row)">分配角色</el-button>
          <el-button size="small" type="warning" @click="resetPassword(scope.row)">重置密码</el-button>
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
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="正常" inactive-text="禁用"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      v-model="roleDialogVisible"
      width="40%">
      <el-form label-width="100px">
        <el-form-item label="用户名">
          <span>{{ currentUser.username }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="selectedRoles">
            <el-checkbox v-for="role in roleOptions" :key="role.id" :label="role.id">{{ role.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUserRole">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      title="重置密码"
      v-model="passwordDialogVisible"
      width="40%">
      <el-form :model="passwordForm" label-width="100px" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="用户名">
          <span>{{ currentUser.username }}</span>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNewPassword">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    // 密码验证规则
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.form.confirmPassword !== '') {
          this.$refs.formRef.validateField('confirmPassword');
        }
        callback();
      }
    };
    
    // 确认密码验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };
    
    // 确认新密码验证规则
    const validateNewConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致'));
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
      roleDialogVisible: false,
      passwordDialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        username: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        status: true
      },
      passwordForm: {
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      },
      passwordRules: {
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateNewConfirmPassword, trigger: 'blur' }
        ]
      },
      roleOptions: [],
      selectedRoles: [],
      currentUser: {}
    };
  },
  created() {
    this.fetchData();
    this.fetchRoles();
  },
  methods: {
    fetchData() {
      // 模拟数据，实际应该调用 API
      this.tableData = [
        {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          roles: ['系统管理员'],
          email: 'admin@example.com',
          phone: '13800138000',
          status: true,
          createTime: '2025-05-01 00:00:00'
        },
        {
          id: 2,
          username: 'user1',
          nickname: '用户1',
          roles: ['普通用户'],
          email: 'user1@example.com',
          phone: '13800138001',
          status: true,
          createTime: '2025-05-02 10:00:00'
        },
        {
          id: 3,
          username: 'user2',
          nickname: '用户2',
          roles: ['游客'],
          email: 'user2@example.com',
          phone: '13800138002',
          status: false,
          createTime: '2025-05-03 14:30:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    fetchRoles() {
      // 模拟角色数据，实际应该调用 API
      this.roleOptions = [
        { id: 1, name: '系统管理员' },
        { id: 2, name: '普通用户' },
        { id: 3, name: '游客' }
      ];
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
        username: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        status: true
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
        username: row.username,
        nickname: row.nickname,
        email: row.email,
        phone: row.phone,
        status: row.status
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('是否确认删除该用户?', '警告', {
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
      
      this.$confirm(`是否确认批量删除选中的${this.selectedRows.length}个用户?`, '警告', {
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
    
    saveUser() {
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
    
    assignRole(row) {
      this.currentUser = row;
      this.roleDialogVisible = true;
      
      // 根据用户获取已分配角色
      if (row.username === 'admin') {
        this.selectedRoles = [1];
      } else if (row.username === 'user1') {
        this.selectedRoles = [2];
      } else {
        this.selectedRoles = [3];
      }
    },
    
    saveUserRole() {
      // 调用保存用户角色 API
      console.log('保存用户角色:', this.selectedRoles);
      this.$message({
        type: 'success',
        message: '角色分配成功!'
      });
      this.roleDialogVisible = false;
      
      // 更新表格中的角色显示
      const roleNames = this.selectedRoles.map(id => {
        const role = this.roleOptions.find(r => r.id === id);
        return role ? role.name : '';
      });
      
      const userIndex = this.tableData.findIndex(u => u.id === this.currentUser.id);
      if (userIndex !== -1) {
        this.tableData[userIndex].roles = roleNames;
      }
    },
    
    resetPassword(row) {
      this.currentUser = row;
      this.passwordForm = {
        newPassword: '',
        confirmPassword: ''
      };
      this.passwordDialogVisible = true;
      
      if (this.$refs.passwordFormRef) {
        this.$refs.passwordFormRef.resetFields();
      }
    },
    
    saveNewPassword() {
      this.$refs.passwordFormRef.validate((valid) => {
        if (valid) {
          // 调用重置密码 API
          this.$message({
            type: 'success',
            message: '密码重置成功!'
          });
          this.passwordDialogVisible = false;
        } else {
          return false;
        }
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
    gap: 10px;
  }
  
  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
