<template>
  <div class="user-group-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户分组管理</span>
          <el-button type="primary" size="small" @click="handleAdd">
            新增分组
          </el-button>
        </div>
      </template>
      
      <!-- 搜索和过滤 -->
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="分组名称">
          <el-input v-model="queryParams.name" placeholder="请输入分组名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="分组名称" min-width="120" />
        <el-table-column prop="userCount" label="用户数量" width="100" sortable />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看用户
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该分组吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑分组对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看用户对话框 -->
    <el-dialog
      title="分组用户列表"
      v-model="userDialog.visible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="userDialog.visible">
        <div class="dialog-header-actions">
          <el-button type="primary" size="small" @click="handleAddUser">
            添加用户
          </el-button>
          <el-button type="danger" size="small" @click="handleRemoveUsers" :disabled="selectedUsers.length === 0">
            移除选中用户
          </el-button>
        </div>
        
        <el-table 
          :data="userDialog.users" 
          border 
          style="width: 100%; margin-top: 15px;" 
          v-loading="userDialog.loading"
          @selection-change="handleUserSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
          <el-table-column prop="firstName" label="名字" width="100" />
          <el-table-column prop="lastName" label="姓氏" width="100" />
          <el-table-column prop="phone" label="手机号" width="120" />
          <el-table-column label="标签" min-width="150">
            <template #default="{ row }">
              <el-tag 
                v-for="tag in row.tags" 
                :key="tag.id" 
                :style="{ backgroundColor: tag.color, borderColor: tag.color }" 
                class="user-tag"
              >
                {{ tag.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="handleRemoveUserFromGroup(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加用户到分组对话框 -->
    <el-dialog
      title="添加用户到分组"
      v-model="addUserDialog.visible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="addUserDialog.visible">
        <!-- 搜索和过滤 -->
        <el-form :inline="true" :model="addUserDialog.queryParams" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input v-model="addUserDialog.queryParams.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchUsersToAdd">查询</el-button>
            <el-button @click="resetAddUserSearch">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 用户表格 -->
        <el-table 
          :data="addUserDialog.users" 
          border 
          style="width: 100%" 
          v-loading="addUserDialog.loading"
          @selection-change="handleAddUserSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
          <el-table-column prop="firstName" label="名字" width="100" />
          <el-table-column prop="lastName" label="姓氏" width="100" />
          <el-table-column prop="phone" label="手机号" width="120" />
          <el-table-column label="标签" min-width="150">
            <template #default="{ row }">
              <el-tag 
                v-for="tag in row.tags" 
                :key="tag.id" 
                :style="{ backgroundColor: tag.color, borderColor: tag.color }" 
                class="user-tag"
              >
                {{ tag.name }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="dialog-footer" style="margin-top: 20px;">
          <el-button @click="addUserDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddUsersToGroup" :disabled="selectedUsersToAdd.length === 0">
            确 定
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserGroup',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 查询参数
      queryParams: {
        name: '',
        pageNum: 1,
        pageSize: 10
      },
      // 总条数
      total: 0,
      // 表格数据
      tableData: [
        // 示例数据
        {
          id: 1,
          name: 'VIP用户组',
          userCount: 28,
          description: '高级VIP用户分组',
          createTime: '2023-05-10 10:00:00'
        },
        {
          id: 2,
          name: '新用户组',
          userCount: 156,
          description: '新注册用户分组',
          createTime: '2023-05-08 14:30:00'
        },
        {
          id: 3,
          name: '潜在客户组',
          userCount: 45,
          description: '有购买意向的潜在客户',
          createTime: '2023-05-05 09:15:00'
        }
      ],
      // 对话框
      dialog: {
        title: '',
        visible: false,
        isEdit: false
      },
      // 表单
      form: {
        id: undefined,
        name: '',
        description: ''
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 用户对话框
      userDialog: {
        visible: false,
        loading: false,
        groupId: null,
        groupName: '',
        users: []
      },
      // 选中的用户
      selectedUsers: [],
      // 添加用户对话框
      addUserDialog: {
        visible: false,
        loading: false,
        queryParams: {
          username: '',
          pageNum: 1,
          pageSize: 10
        },
        users: []
      },
      // 选中的要添加的用户
      selectedUsersToAdd: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取分组列表
    getList() {
      this.loading = true
      // TODO: 调用接口获取数据
      console.log('查询参数:', this.queryParams)
      // 模拟接口请求
      setTimeout(() => {
        this.total = this.tableData.length
        this.loading = false
      }, 500)
    },
    // 查询
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 重置查询
    resetQuery() {
      this.queryParams = {
        name: '',
        pageNum: 1,
        pageSize: this.queryParams.pageSize
      }
      this.getList()
    },
    // 每页条数改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },
    // 新增分组
    handleAdd() {
      this.dialog = {
        title: '添加分组',
        visible: true,
        isEdit: false
      }
      this.form = {
        id: undefined,
        name: '',
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate()
      })
    },
    // 编辑分组
    handleEdit(row) {
      this.dialog = {
        title: '编辑分组',
        visible: true,
        isEdit: true
      }
      this.form = { ...row }
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate()
      })
    },
    // 删除分组
    handleDelete(row) {
      this.$message.success(`已删除分组: ${row.name}`)
      // 模拟删除
      this.tableData = this.tableData.filter(item => item.id !== row.id)
      this.total = this.tableData.length
    },
    // 提交表单
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const message = this.dialog.isEdit ? '修改成功' : '添加成功'
          this.$message.success(message)
          this.dialog.visible = false
          // 模拟保存
          if (this.dialog.isEdit) {
            const index = this.tableData.findIndex(item => item.id === this.form.id)
            if (index !== -1) {
              this.tableData.splice(index, 1, { ...this.form })
            }
          } else {
            this.tableData.unshift({
              ...this.form,
              id: Date.now(),
              userCount: 0,
              createTime: new Date().toLocaleString()
            })
          }
          this.getList()
        }
      })
    },
    // 查看分组用户
    handleView(row) {
      this.userDialog = {
        visible: true,
        loading: true,
        groupId: row.id,
        groupName: row.name,
        users: []
      }
      
      // 模拟获取分组用户
      setTimeout(() => {
        // 模拟数据
        this.userDialog.users = [
          {
            id: 1,
            username: 'john_doe',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1 123 456 7890',
            tags: [
              { id: 1, name: 'VIP客户', color: '#409EFF' }
            ]
          },
          {
            id: 2,
            username: 'jane_smith',
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+1 987 654 3210',
            tags: [
              { id: 2, name: '新用户', color: '#67C23A' },
              { id: 3, name: '潜在客户', color: '#E6A23C' }
            ]
          }
        ]
        this.userDialog.loading = false
      }, 500)
    },
    // 用户选择变化
    handleUserSelectionChange(selection) {
      this.selectedUsers = selection
    },
    // 添加用户选择变化
    handleAddUserSelectionChange(selection) {
      this.selectedUsersToAdd = selection
    },
    // 添加用户到分组
    handleAddUser() {
      this.addUserDialog = {
        visible: true,
        loading: true,
        queryParams: {
          username: '',
          pageNum: 1,
          pageSize: 10
        },
        users: []
      }
      
      // 模拟获取系统用户
      setTimeout(() => {
        // 模拟数据
        this.addUserDialog.users = [
          {
            id: 1,
            username: 'john_doe',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1 123 456 7890',
            tags: [
              { id: 1, name: 'VIP客户', color: '#409EFF' }
            ]
          },
          {
            id: 3,
            username: 'bob_johnson',
            firstName: 'Bob',
            lastName: 'Johnson',
            phone: '+1 555 123 4567',
            tags: []
          },
          {
            id: 4,
            username: 'alice_white',
            firstName: 'Alice',
            lastName: 'White',
            phone: '+1 333 444 5555',
            tags: [
              { id: 2, name: '新用户', color: '#67C23A' }
            ]
          }
        ]
        this.addUserDialog.loading = false
      }, 500)
    },
    // 搜索要添加的用户
    searchUsersToAdd() {
      this.addUserDialog.loading = true
      console.log('搜索参数:', this.addUserDialog.queryParams)
      
      // 模拟搜索
      setTimeout(() => {
        // 假设搜索结果
        if (this.addUserDialog.queryParams.username) {
          this.addUserDialog.users = this.addUserDialog.users.filter(user => 
            user.username.includes(this.addUserDialog.queryParams.username)
          )
        }
        this.addUserDialog.loading = false
      }, 300)
    },
    // 重置添加用户搜索
    resetAddUserSearch() {
      this.addUserDialog.queryParams = {
        username: '',
        pageNum: 1,
        pageSize: 10
      }
      this.searchUsersToAdd()
    },
    // 提交添加用户到分组
    submitAddUsersToGroup() {
      if (this.selectedUsersToAdd.length === 0) {
        this.$message.warning('请至少选择一个用户')
        return
      }
      
      this.$message.success(`已添加${this.selectedUsersToAdd.length}个用户到分组`)
      
      // 模拟添加到当前分组用户列表
      this.userDialog.users = [...this.userDialog.users, ...this.selectedUsersToAdd]
      
      // 更新分组的用户数量
      const groupIndex = this.tableData.findIndex(g => g.id === this.userDialog.groupId)
      if (groupIndex !== -1) {
        this.tableData[groupIndex].userCount = this.userDialog.users.length
      }
      
      this.addUserDialog.visible = false
    },
    // 移除用户
    handleRemoveUserFromGroup(user) {
      this.$confirm(`确认从分组中移除用户 ${user.username}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟从分组中移除
        this.userDialog.users = this.userDialog.users.filter(u => u.id !== user.id)
        
        // 更新分组的用户数量
        const groupIndex = this.tableData.findIndex(g => g.id === this.userDialog.groupId)
        if (groupIndex !== -1) {
          this.tableData[groupIndex].userCount = this.userDialog.users.length
        }
        
        this.$message.success('用户已从分组中移除')
      }).catch(() => {})
    },
    // 批量移除用户
    handleRemoveUsers() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      
      this.$confirm(`确认从分组中移除选中的${this.selectedUsers.length}个用户?`, '批量移除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedUsers.map(user => user.id)
        
        // 模拟批量移除
        this.userDialog.users = this.userDialog.users.filter(u => !ids.includes(u.id))
        
        // 更新分组的用户数量
        const groupIndex = this.tableData.findIndex(g => g.id === this.userDialog.groupId)
        if (groupIndex !== -1) {
          this.tableData[groupIndex].userCount = this.userDialog.users.length
        }
        
        this.$message.success('批量移除成功')
        this.selectedUsers = []
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.user-group-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.dialog-header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.user-tag {
  margin-right: 5px;
  margin-bottom: 5px;
  color: white;
}
</style>
