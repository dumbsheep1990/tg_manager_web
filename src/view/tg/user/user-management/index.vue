<template>
  <div class="user-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div>
            <el-button type="primary" size="small" @click="handleImport">
              导入用户
            </el-button>
            <el-button type="success" size="small" @click="handleExport">
              导出用户
            </el-button>
            <el-button type="primary" size="small" @click="handleAdd">
              添加用户
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和过滤 -->
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="queryParams.tagIds" placeholder="请选择标签" clearable multiple collapse-tags>
            <el-option v-for="item in tagOptions" :key="item.id" :label="item.name" :value="item.id">
              <div style="display: flex; align-items: center;">
                <div class="tag-color" :style="{ backgroundColor: item.color }"></div>
                <span style="margin-left: 8px;">{{ item.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="已封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
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
            <el-button v-if="!row.tags || row.tags.length === 0" link type="primary" size="small" @click="handleAddTag(row)">
              添加标签
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="lastSeen" label="最后在线" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该用户吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div style="margin: 10px 0;" v-if="selectedRows.length > 0">
        <el-button type="primary" size="small" @click="handleBatchAddTag">批量添加标签</el-button>
        <el-button type="danger" size="small" @click="handleBatchDelete">批量删除</el-button>
      </div>

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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="名字" prop="firstName">
          <el-input v-model="form.firstName" placeholder="请输入名字" />
        </el-form-item>
        <el-form-item label="姓氏" prop="lastName">
          <el-input v-model="form.lastName" placeholder="请输入姓氏" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="标签" prop="tagIds">
          <el-select v-model="form.tagIds" multiple placeholder="请选择标签" style="width: 100%">
            <el-option v-for="item in tagOptions" :key="item.id" :label="item.name" :value="item.id">
              <div style="display: flex; align-items: center;">
                <div class="tag-color" :style="{ backgroundColor: item.color }"></div>
                <span style="margin-left: 8px;">{{ item.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="已封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
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

    <!-- 批量添加标签对话框 -->
    <el-dialog
      title="批量添加标签"
      v-model="tagDialog.visible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="tagForm" label-width="100px">
        <el-form-item label="标签" prop="tagIds">
          <el-select v-model="tagForm.tagIds" multiple placeholder="请选择标签" style="width: 100%">
            <el-option v-for="item in tagOptions" :key="item.id" :label="item.name" :value="item.id">
              <div style="display: flex; align-items: center;">
                <div class="tag-color" :style="{ backgroundColor: item.color }"></div>
                <span style="margin-left: 8px;">{{ item.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tagDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitTagForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 查询参数
      queryParams: {
        username: '',
        phone: '',
        tagIds: [],
        status: '',
        pageNum: 1,
        pageSize: 10
      },
      // 总条数
      total: 0,
      // 选中行
      selectedRows: [],
      // 标签选项
      tagOptions: [
        {
          id: 1,
          name: 'VIP客户',
          color: '#409EFF'
        },
        {
          id: 2,
          name: '新用户',
          color: '#67C23A'
        },
        {
          id: 3,
          name: '潜在客户',
          color: '#E6A23C'
        }
      ],
      // 表格数据
      tableData: [
        // 示例数据
        {
          id: 1,
          username: 'john_doe',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1 123 456 7890',
          tags: [
            { id: 1, name: 'VIP客户', color: '#409EFF' }
          ],
          lastSeen: '2023-05-16 10:30:00',
          status: 'online',
          note: '重要客户'
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
          ],
          lastSeen: '2023-05-15 14:20:00',
          status: 'offline',
          note: ''
        },
        {
          id: 3,
          username: 'bob_johnson',
          firstName: 'Bob',
          lastName: 'Johnson',
          phone: '+1 555 123 4567',
          tags: [],
          lastSeen: '2023-05-10 09:15:00',
          status: 'banned',
          note: '违规用户'
        }
      ],
      // 用户对话框
      dialog: {
        title: '',
        visible: false,
        isEdit: false
      },
      // 用户表单
      form: {
        id: undefined,
        username: '',
        firstName: '',
        lastName: '',
        phone: '',
        tagIds: [],
        status: 'offline',
        note: ''
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在 3 到 30 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ],
        firstName: [
          { required: true, message: '请输入名字', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      // 标签对话框
      tagDialog: {
        visible: false,
        userId: undefined
      },
      // 标签表单
      tagForm: {
        tagIds: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取用户列表
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
        username: '',
        phone: '',
        tagIds: [],
        status: '',
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 查看用户详情
    handleView(row) {
      this.$message.info(`查看用户: ${row.username}`)
    },
    // 添加用户
    handleAdd() {
      this.dialog = {
        title: '添加用户',
        visible: true,
        isEdit: false
      }
      this.form = {
        id: undefined,
        username: '',
        firstName: '',
        lastName: '',
        phone: '',
        tagIds: [],
        status: 'offline',
        note: ''
      }
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate()
      })
    },
    // 编辑用户
    handleEdit(row) {
      this.dialog = {
        title: '编辑用户',
        visible: true,
        isEdit: true
      }
      // 转换标签为标签ID数组
      const tagIds = (row.tags || []).map(tag => tag.id)
      this.form = { 
        ...row, 
        tagIds 
      }
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate()
      })
    },
    // 删除用户
    handleDelete(row) {
      this.$message.success(`已删除用户: ${row.username}`)
      // 模拟删除
      this.tableData = this.tableData.filter(item => item.id !== row.id)
      this.total = this.tableData.length
    },
    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      this.$confirm('确认要删除已选中的用户吗?', '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedRows.map(row => row.id)
        // 模拟删除
        this.tableData = this.tableData.filter(item => !ids.includes(item.id))
        this.total = this.tableData.length
        this.$message.success('批量删除成功')
        this.selectedRows = []
      }).catch(() => {})
    },
    // 添加标签
    handleAddTag(row) {
      this.tagDialog.visible = true
      this.tagDialog.userId = row.id
      this.tagForm.tagIds = (row.tags || []).map(tag => tag.id)
    },
    // 批量添加标签
    handleBatchAddTag() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      this.tagDialog.visible = true
      this.tagDialog.userId = null // 批量模式
      this.tagForm.tagIds = []
    },
    // 提交标签表单
    submitTagForm() {
      if (this.tagForm.tagIds.length === 0) {
        this.$message.warning('请至少选择一个标签')
        return
      }
      
      // 获取选中的标签对象
      const selectedTags = this.tagForm.tagIds.map(id => {
        return this.tagOptions.find(tag => tag.id === id)
      })
      
      if (this.tagDialog.userId) {
        // 单个用户添加标签
        const index = this.tableData.findIndex(item => item.id === this.tagDialog.userId)
        if (index !== -1) {
          this.tableData[index].tags = selectedTags
          this.$message.success(`标签已更新`)
        }
      } else {
        // 批量添加标签
        const ids = this.selectedRows.map(row => row.id)
        this.tableData.forEach(item => {
          if (ids.includes(item.id)) {
            // 合并已有标签和新标签，去重
            const existingTagIds = (item.tags || []).map(tag => tag.id)
            const newTagIds = this.tagForm.tagIds.filter(id => !existingTagIds.includes(id))
            const newTags = newTagIds.map(id => this.tagOptions.find(tag => tag.id === id))
            item.tags = [...(item.tags || []), ...newTags]
          }
        })
        this.$message.success(`已为${ids.length}个用户添加标签`)
      }
      
      this.tagDialog.visible = false
    },
    // 导入用户
    handleImport() {
      this.$message.info('导入用户功能开发中...')
    },
    // 导出用户
    handleExport() {
      this.$message.info('导出用户功能开发中...')
    },
    // 提交表单
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const message = this.dialog.isEdit ? '修改成功' : '添加成功'
          
          // 转换标签ID为标签对象
          const tags = this.form.tagIds.map(id => {
            return this.tagOptions.find(tag => tag.id === id)
          })
          
          const userData = {
            ...this.form,
            tags
          }
          
          // 模拟保存
          if (this.dialog.isEdit) {
            const index = this.tableData.findIndex(item => item.id === this.form.id)
            if (index !== -1) {
              this.tableData.splice(index, 1, userData)
            }
          } else {
            this.tableData.unshift({
              ...userData,
              id: Date.now(),
              lastSeen: new Date().toLocaleString()
            })
          }
          
          this.$message.success(message)
          this.dialog.visible = false
          this.getList()
        }
      })
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'online': '在线',
        'offline': '离线',
        'banned': '已封禁'
      }
      return statusMap[status] || status
    },
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        'online': 'success',
        'offline': 'info',
        'banned': 'danger'
      }
      return typeMap[status] || ''
    }
  }
}
</script>

<style scoped>
.user-management-container {
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
.tag-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
  vertical-align: middle;
}
.user-tag {
  margin-right: 5px;
  margin-bottom: 5px;
  color: white;
}
</style>
