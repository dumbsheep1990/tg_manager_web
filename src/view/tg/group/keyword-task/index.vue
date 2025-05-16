<template>
  <div class="keyword-task-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>关键词群组任务</span>
          <el-button type="primary" size="small" @click="handleCreate">
            新建任务
          </el-button>
        </div>
      </template>
      
      <!-- 搜索和过滤 -->
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="任务名称">
          <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="进行中" value="1" />
            <el-option label="已暂停" value="2" />
            <el-option label="已完成" value="3" />
            <el-option label="已取消" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="120" />
        <el-table-column prop="keywords" label="关键词" min-width="150" />
        <el-table-column prop="groupCount" label="群组数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button
              size="small"
              :type="scope.row.status === '2' ? 'success' : 'warning'"
              @click="handleStatus(scope.row)"
            >
              {{ scope.row.status === '2' ? '启动' : '暂停' }}
            </el-button>
            <el-popconfirm
              title="确定要删除该任务吗？"
              @confirm="handleDelete(scope.row)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
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
  name: 'KeywordTask',
  data() {
    return {
      // 查询参数
      queryParams: {
        name: '',
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
          name: '测试任务1',
          keywords: '科技,互联网',
          groupCount: 10,
          status: '1',
          createTime: '2023-05-16 10:00:00'
        },
        {
          id: 2,
          name: '测试任务2',
          keywords: '电商,购物',
          groupCount: 5,
          status: '2',
          createTime: '2023-05-15 14:30:00'
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取任务列表
    getList() {
      // TODO: 调用接口获取数据
      console.log('查询参数:', this.queryParams)
      // 模拟接口返回
      this.total = this.tableData.length
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
    // 新建任务
    handleCreate() {
      this.$message.info('新建任务功能开发中...')
    },
    // 查看任务详情
    handleView(row) {
      this.$message.info(`查看任务: ${row.name}`)
    },
    // 修改任务状态
    handleStatus(row) {
      const action = row.status === '2' ? '启动' : '暂停'
      this.$message.success(`已${action}任务: ${row.name}`)
      // 模拟状态切换
      row.status = row.status === '2' ? '1' : '2'
    },
    // 删除任务
    handleDelete(row) {
      this.$message.success(`已删除任务: ${row.name}`)
      // 模拟删除
      this.tableData = this.tableData.filter(item => item.id !== row.id)
      this.total = this.tableData.length
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        '1': '进行中',
        '2': '已暂停',
        '3': '已完成',
        '4': '已取消'
      }
      return statusMap[status] || '未知状态'
    },
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        '1': 'success',
        '2': 'info',
        '3': 'primary',
        '4': 'danger'
      }
      return typeMap[status] || ''
    }
  }
}
</script>

<style scoped>
.keyword-task-container {
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
