<template>
  <div class="role-management-container">
    <h1>角色管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加角色</el-button>
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
        label="角色ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="name"
        label="角色名称"
        width="150">
      </el-table-column>
      <el-table-column
        prop="roleKey"
        label="权限标识"
        width="150">
      </el-table-column>
      <el-table-column
        prop="sort"
        label="排序"
        width="80">
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
          <el-button size="small" type="primary" @click="assignPermission(scope.row)">分配权限</el-button>
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
    
    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加角色' : '编辑角色'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="权限标识" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限标识"></el-input>
        </el-form-item>
        <el-form-item label="角色排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="正常" inactive-text="禁用"></el-switch>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            type="textarea" 
            v-model="form.remark"
            placeholder="请输入备注"
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      v-model="permissionDialogVisible"
      width="40%">
      <el-form label-width="100px">
        <el-form-item label="角色名称">
          <span>{{ currentRole.name }}</span>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTree"
            :data="menuTreeData"
            show-checkbox
            node-key="id"
            :props="{ label: 'name' }"
            :default-checked-keys="selectedMenus">
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermission">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'RoleManagement',
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
      permissionDialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        name: '',
        roleKey: '',
        sort: 0,
        status: true,
        remark: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '请输入权限标识', trigger: 'blur' }
        ]
      },
      menuTreeData: [],
      selectedMenus: [],
      currentRole: {}
    };
  },
  created() {
    this.fetchData();
    this.fetchMenuTree();
  },
  methods: {
    fetchData() {
      // 模拟数据，实际应该调用 API
      this.tableData = [
        {
          id: 1,
          name: '系统管理员',
          roleKey: 'admin',
          sort: 1,
          status: true,
          createTime: '2025-05-01 00:00:00',
          remark: '系统管理员，拥有所有权限'
        },
        {
          id: 2,
          name: '普通用户',
          roleKey: 'common',
          sort: 2,
          status: true,
          createTime: '2025-05-01 00:00:00',
          remark: '普通用户，拥有基本权限'
        },
        {
          id: 3,
          name: '游客',
          roleKey: 'visitor',
          sort: 3,
          status: false,
          createTime: '2025-05-01 00:00:00',
          remark: '游客，只有查看权限'
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    fetchMenuTree() {
      // 模拟菜单树数据，实际应该调用 API
      this.menuTreeData = [
        {
          id: 1,
          name: '系统设置',
          children: [
            {
              id: 2,
              name: '菜单管理',
              children: [
                { id: 6, name: '添加' },
                { id: 7, name: '编辑' },
                { id: 8, name: '删除' }
              ]
            },
            {
              id: 3,
              name: '角色管理',
              children: [
                { id: 9, name: '添加' },
                { id: 10, name: '编辑' },
                { id: 11, name: '删除' }
              ]
            },
            {
              id: 4,
              name: '用户管理',
              children: [
                { id: 12, name: '添加' },
                { id: 13, name: '编辑' },
                { id: 14, name: '删除' }
              ]
            }
          ]
        },
        {
          id: 5,
          name: 'telegram管理',
          children: [
            { id: 15, name: '账号分组管理' },
            { id: 16, name: 'tdata账号管理' },
            { id: 17, name: '飞机号管理' }
          ]
        }
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
        name: '',
        roleKey: '',
        sort: 0,
        status: true,
        remark: ''
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = { ...row };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('是否确认删除该角色?', '警告', {
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
      
      this.$confirm(`是否确认批量删除选中的${this.selectedRows.length}个角色?`, '警告', {
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
    
    saveRole() {
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
    
    assignPermission(row) {
      this.currentRole = row;
      this.permissionDialogVisible = true;
      
      // 根据角色获取已选菜单权限
      if (row.id === 1) { // 假设管理员拥有所有权限
        this.selectedMenus = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
      } else if (row.id === 2) { // 普通用户有部分权限
        this.selectedMenus = [5, 15, 16, 17];
      } else { // 游客只有查看权限
        this.selectedMenus = [5, 15];
      }
      
      // 等待DOM更新后设置选中项
      this.$nextTick(() => {
        if (this.$refs.menuTree) {
          this.$refs.menuTree.setCheckedKeys(this.selectedMenus);
        }
      });
    },
    
    savePermission() {
      const checkedKeys = this.$refs.menuTree.getCheckedKeys();
      const halfCheckedKeys = this.$refs.menuTree.getHalfCheckedKeys();
      const allKeys = [...checkedKeys, ...halfCheckedKeys];
      
      // 调用保存权限 API
      console.log('保存权限:', allKeys);
      this.$message({
        type: 'success',
        message: '权限分配成功!'
      });
      this.permissionDialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.role-management-container {
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
