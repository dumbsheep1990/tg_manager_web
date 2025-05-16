<template>
  <div class="group-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>群组管理</span>
          <div>
            <el-button type="primary" size="small" @click="handleImport">
              导入群组
            </el-button>
            <el-button type="success" size="small" @click="handleExport">
              导出群组
            </el-button>
            <el-button type="primary" size="small" @click="handleAdd">
              添加群组
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和过滤 -->
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="群组名称">
          <el-input v-model="queryParams.name" placeholder="请输入群组名称" clearable />
        </el-form-item>
        <el-form-item label="群组类型">
          <el-select v-model="queryParams.type" placeholder="请选择群组类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="公开群" value="public" />
            <el-option label="私有群" value="private" />
            <el-option label="频道" value="channel" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" value="1" />
            <el-option label="已封禁" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="群组名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="members" label="成员数" width="100" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'danger'">
              {{ row.status === '1' ? '正常' : '已封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveTime" label="最后活跃" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该群组吗？"
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
  </div>
</template>

<script>
export default {
  name: 'GroupManagement',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 查询参数
      queryParams: {
        name: '',
        type: '',
        status: '',
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
          name: 'Telegram 官方中文群组',
          username: 'zh_CN',
          type: 'public',
          members: 5000,
          status: '1',
          lastActiveTime: '2023-05-16 10:30:00'
        },
        {
          id: 2,
          name: 'Vue.js 中文社区',
          username: 'vuejs_cn',
          type: 'group',
          members: 12000,
          status: '1',
          lastActiveTime: '2023-05-15 14:20:00'
        },
        {
          id: 3,
          name: 'Node.js 技术交流',
          username: 'nodejs_group',
          type: 'private',
          members: 8000,
          status: '2',
          lastActiveTime: '2023-05-10 09:15:00'
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取群组列表
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
        type: '',
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
    // 查看群组详情
    handleView(row) {
      this.$message.info(`查看群组: ${row.name}`)
    },
    // 添加群组
    handleAdd() {
      this.$message.info('添加群组功能开发中...')
    },
    // 编辑群组
    handleEdit(row) {
      this.$message.info(`编辑群组: ${row.name}`)
    },
    // 删除群组
    handleDelete(row) {
      this.$message.success(`已删除群组: ${row.name}`)
      // 模拟删除
      this.tableData = this.tableData.filter(item => item.id !== row.id)
      this.total = this.tableData.length
    },
    // 导入群组
    handleImport() {
      this.$message.info('导入群组功能开发中...')
    },
    // 导出群组
    handleExport() {
      this.$message.info('导出群组功能开发中...')
    },
    // 获取类型文本
    getTypeText(type) {
      const typeMap = {
        'public': '公开群',
        'private': '私有群',
        'channel': '频道',
        'group': '群组'
      }
      return typeMap[type] || type
    },
    // 获取类型标签样式
    getTypeTagType(type) {
      const typeMap = {
        'public': 'primary',
        'private': 'warning',
        'channel': 'success',
        'group': 'info'
      }
      return typeMap[type] || ''
    }
  }
}
</script>

<style scoped>
.group-management-container {
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
</style>
