<template>
  <div class="check-account-task-container">
    <h2>账号检测任务</h2>
    
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
        <el-table-column prop="accountCount" label="账号数量" width="100" />
        <el-table-column prop="normalCount" label="正常账号" width="100" />
        <el-table-column prop="abnormalCount" label="异常账号" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewTaskDetail(scope.row)">详情</el-button>
            <el-button type="success" size="small" @click="viewResult(scope.row)" v-if="scope.row.status === 'completed'">检测结果</el-button>
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
    
    <!-- 检测结果对话框 -->
    <el-dialog title="账号检测结果" v-model="resultDialogVisible" width="800px">
      <el-table
        :data="accountResults"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="phone" label="账号" min-width="150" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
              {{ scope.row.status === 'normal' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="异常原因" min-width="200" />
        <el-table-column prop="checkTime" label="检测时间" width="170" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'CheckAccountTask',
  
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
    
    // 检测结果相关
    const resultDialogVisible = ref(false)
    const accountResults = ref([])
    
    // 获取任务列表
    const fetchTasks = async () => {
      loading.value = true
      
      try {
        // 模拟API调用
        setTimeout(() => {
          taskList.value = Array.from({ length: 10 }, (_, index) => {
            const accountCount = Math.floor(5 + Math.random() * 20);
            const abnormalCount = Math.floor(Math.random() * (accountCount / 2));
            
            return {
              taskId: 'TSK' + (50001 + index),
              taskName: '账号检测任务-' + (index + 1),
              accountCount: accountCount,
              normalCount: accountCount - abnormalCount,
              abnormalCount: abnormalCount,
              status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
              createTime: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
              updateTime: new Date(Date.now() - Math.random() * 1000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
            }
          })
          
          total.value = 19 // 模拟总数据量
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
      ElMessageBox.alert('创建账号检测任务功能开发中...', '提示')
    }
    
    // 查看任务详情
    const viewTaskDetail = (task) => {
      ElMessageBox.alert(`任务ID: ${task.taskId}<br>任务名称: ${task.taskName}<br>账号数量: ${task.accountCount}<br>正常账号: ${task.normalCount}<br>异常账号: ${task.abnormalCount}<br>状态: ${getStatusText(task.status)}`, '任务详情', {
        dangerouslyUseHTMLString: true
      })
    }
    
    // 查看检测结果
    const viewResult = (task) => {
      // 模拟获取检测结果
      accountResults.value = Array.from({ length: task.accountCount }, (_, index) => {
        const isNormal = index < task.normalCount;
        
        return {
          phone: '+1 ' + Math.floor(1000000000 + Math.random() * 9000000000),
          username: 'user' + (1000 + index),
          status: isNormal ? 'normal' : 'abnormal',
          reason: isNormal ? '' : ['账号被封禁', '账号限制登录', '账号需验证', '未知错误'][Math.floor(Math.random() * 4)],
          checkTime: new Date(Date.now() - Math.random() * 1000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
        }
      })
      
      resultDialogVisible.value = true
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
      resultDialogVisible,
      accountResults,
      search,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      createTask,
      viewTaskDetail,
      viewResult,
      cancelTask,
      retryTask,
      getStatusType,
      getStatusText
    }
  }
})
</script>

<style scoped>
.check-account-task-container {
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
