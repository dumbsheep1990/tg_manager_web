<template>
  <div class="add-contact-task-container">
    <h2>添加联系人任务</h2>
    
    <el-card class="task-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="searchForm.taskName" placeholder="请输入任务名称" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待执行" value="pending" />
            <el-option label="进行中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="task-list">
      <div class="action-bar">
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </div>
      
      <el-table
        :data="taskList"
        v-loading="loading"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="taskId" label="任务ID" width="100" />
        <el-table-column prop="taskName" label="任务名称" min-width="150" />
        <el-table-column prop="accountInfo" label="使用账号" min-width="140" />
        <el-table-column prop="contactCount" label="联系人数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewTaskDetail(scope.row)">详情</el-button>
            <el-button type="danger" size="small" @click="cancelTask(scope.row)" v-if="scope.row.status === 'pending' || scope.row.status === 'processing'">取消</el-button>
            <el-button type="warning" size="small" @click="retryTask(scope.row)" v-if="scope.row.status === 'failed'">重试</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'AddContactTask',
  
  setup() {
    // 搜索表单
    const searchForm = reactive({
      taskName: '',
      status: ''
    })
    const searchFormRef = ref(null)
    
    // 分页数据
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    // 表格数据和加载状态
    const taskList = ref([])
    const loading = ref(false)
    
    // 获取任务列表
    const fetchTasks = async () => {
      loading.value = true
      
      try {
        // 模拟API调用
        setTimeout(() => {
          taskList.value = Array.from({ length: 10 }, (_, index) => ({
            taskId: 'TSK' + (30001 + index),
            taskName: '添加联系人任务-' + (index + 1),
            accountInfo: '+1 ' + Math.floor(1000000000 + Math.random() * 9000000000) + ' (user' + (1000 + index) + ')',
            contactCount: Math.floor(10 + Math.random() * 30),
            status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
            createTime: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
            updateTime: new Date(Date.now() - Math.random() * 1000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
          }))
          
          total.value = 32 // 模拟总数据量
          loading.value = false
        }, 500)
      } catch (error) {
        console.error('获取任务列表失败:', error)
        ElMessage.error('获取任务列表失败')
        loading.value = false
      }
    }
    
    // 搜索任务
    const search = () => {
      currentPage.value = 1
      fetchTasks()
    }
    
    // 重置搜索
    const resetSearch = () => {
      searchFormRef.value?.resetFields()
      currentPage.value = 1
      fetchTasks()
    }
    
    // 分页相关方法
    const handleSizeChange = (val) => {
      pageSize.value = val
      fetchTasks()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      fetchTasks()
    }
    
    // 创建任务
    const createTask = () => {
      ElMessageBox.alert('创建添加联系人任务功能开发中...', '提示')
    }
    
    // 查看任务详情
    const viewTaskDetail = (task) => {
      ElMessageBox.alert(`任务ID: ${task.taskId}<br>任务名称: ${task.taskName}<br>账号: ${task.accountInfo}<br>状态: ${getStatusText(task.status)}`, '任务详情', {
        dangerouslyUseHTMLString: true
      })
    }
    
    // 取消任务
    const cancelTask = (task) => {
      ElMessageBox.confirm(`确定要取消任务"${task.taskName}"吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('任务已取消')
        fetchTasks()
      }).catch(() => {})
    }
    
    // 重试任务
    const retryTask = (task) => {
      ElMessageBox.confirm(`确定要重试任务"${task.taskName}"吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('任务已重新开始执行')
        fetchTasks()
      }).catch(() => {})
    }
    
    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        'pending': 'info',
        'processing': 'warning',
        'completed': 'success',
        'failed': 'danger'
      }
      return typeMap[status] || 'info'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        'pending': '待执行',
        'processing': '进行中',
        'completed': '已完成',
        'failed': '失败'
      }
      return textMap[status] || '未知'
    }
    
    onMounted(() => {
      fetchTasks()
    })
    
    return {
      searchForm,
      searchFormRef,
      currentPage,
      pageSize,
      total,
      taskList,
      loading,
      search,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      createTask,
      viewTaskDetail,
      cancelTask,
      retryTask,
      getStatusType,
      getStatusText
    }
  }
})
</script>

<style scoped>
.add-contact-task-container {
  padding: 20px;
}

.task-card {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
