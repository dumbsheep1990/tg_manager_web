<template>
  <div class="user-tag-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户标签管理</span>
          <el-button type="primary" size="small" @click="handleAdd">
            新增标签
          </el-button>
        </div>
      </template>
      
      <!-- 搜索和过滤 -->
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="标签名称">
          <el-input v-model="queryParams.name" placeholder="请输入标签名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="标签名称" min-width="120" />
        <el-table-column prop="color" label="标签颜色" width="100">
          <template #default="{ row }">
            <div class="tag-color" :style="{ backgroundColor: row.color }"></div>
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="用户数" width="100" sortable />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该标签吗？"
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

    <!-- 添加/编辑标签对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="form.color" show-alpha />
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
  </div>
</template>

<script>
export default {
  name: 'UserTag',
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
          name: 'VIP客户',
          color: '#409EFF',
          userCount: 128,
          description: '高价值VIP客户',
          createTime: '2023-05-10 10:00:00'
        },
        {
          id: 2,
          name: '新用户',
          color: '#67C23A',
          userCount: 356,
          description: '新注册用户',
          createTime: '2023-05-08 14:30:00'
        },
        {
          id: 3,
          name: '潜在客户',
          color: '#E6A23C',
          userCount: 89,
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
        color: '#409EFF',
        description: ''
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        color: [
          { required: true, message: '请选择标签颜色', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取标签列表
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
    // 新增标签
    handleAdd() {
      this.dialog = {
        title: '添加标签',
        visible: true,
        isEdit: false
      }
      this.form = {
        id: undefined,
        name: '',
        color: '#409EFF',
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate()
      })
    },
    // 编辑标签
    handleEdit(row) {
      this.dialog = {
        title: '编辑标签',
        visible: true,
        isEdit: true
      }
      this.form = { ...row }
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate()
      })
    },
    // 删除标签
    handleDelete(row) {
      this.$message.success(`已删除标签: ${row.name}`)
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
    }
  }
}
</script>

<style scoped>
.user-tag-container {
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
  width: 30px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
  vertical-align: middle;
}
</style>
