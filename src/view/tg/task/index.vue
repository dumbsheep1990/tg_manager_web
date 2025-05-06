<template>
  <div class="task-container">
    <div class="task-header">
      <h3>任务管理</h3>
      <div class="task-operation">
        <el-button type="primary" @click="showAddTaskDialog">创建任务</el-button>
        <el-button type="danger" :disabled="selectedTasks.length === 0" @click="batchDeleteTasks">批量删除</el-button>
      </div>
    </div>
    
    <el-card class="task-search">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="searchForm.taskName" placeholder="请输入任务名称" clearable />
        </el-form-item>
        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="searchForm.taskType" placeholder="请选择任务类型" clearable>
            <el-option label="消息发送" value="message" />
            <el-option label="好友添加" value="addFriend" />
            <el-option label="群组加入" value="joinGroup" />
            <el-option label="资料更新" value="profileUpdate" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择任务状态" clearable>
            <el-option label="等待中" value="waiting" />
            <el-option label="运行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="已失败" value="failed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTasks">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="task-table-card">
      <el-table
        :data="taskList"
        v-loading="loading"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="taskName" label="任务名称" min-width="120" />
        <el-table-column prop="taskType" label="任务类型" width="100">
          <template #default="scope">
            <el-tag :type="getTaskTypeTag(scope.row.taskType)">
              {{ getTaskTypeText(scope.row.taskType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="180">
          <template #default="scope">
            <el-progress :percentage="scope.row.progress" :status="getProgressStatus(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="accountGroup" label="账号分组" width="120" />
        <el-table-column prop="totalAccounts" label="账号数量" width="90" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'waiting' || scope.row.status === 'paused'"
              size="small" 
              type="success" 
              @click="startTask(scope.row)"
            >
              启动
            </el-button>
            <el-button 
              v-if="scope.row.status === 'running'"
              size="small" 
              type="warning" 
              @click="pauseTask(scope.row)"
            >
              暂停
            </el-button>
            <el-button 
              v-if="scope.row.status === 'running'"
              size="small" 
              type="danger" 
              @click="stopTask(scope.row)"
            >
              停止
            </el-button>
            <el-button size="small" type="primary" @click="viewTaskDetail(scope.row)">详情</el-button>
            <el-button size="small" type="info" @click="viewTaskLogs(scope.row)">日志</el-button>
            <el-button 
              v-if="scope.row.status !== 'running'"
              size="small" 
              type="danger" 
              @click="deleteTaskConfirm(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="task-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  pauseTask,
  stopTask,
  getTaskStatus,
  getTaskLogs
} from '@/api/tg/task'
import { getAccountGroups } from '@/api/tg/account'

export default defineComponent({
  name: 'TgTaskManager',
  
  setup() {
    // 任务列表数据
    const taskList = ref([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectedTasks = ref([])
    const statusRefreshInterval = ref(null)
    
    // 搜索表单
    const searchFormRef = ref(null)
    const searchForm = reactive({
      taskName: '',
      taskType: '',
      status: ''
    })
    
    // 获取任务列表
    const getTaskList = async () => {
      loading.value = true
      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          ...searchForm
        }
        
        const res = await getTasks(params)
        if (res.code === 0) {
          taskList.value = res.data.list
          total.value = res.data.total
        } else {
          ElMessage.error(res.message || '获取任务列表失败')
        }
      } catch (error) {
        console.error('获取任务列表失败:', error)
        ElMessage.error('获取任务列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 搜索任务
    const searchTasks = () => {
      page.value = 1
      getTaskList()
    }
    
    // 重置搜索
    const resetSearch = () => {
      searchFormRef.value?.resetFields()
      page.value = 1
      getTaskList()
    }
    
    // 分页相关方法
    const handleSizeChange = (val) => {
      pageSize.value = val
      getTaskList()
    }
    
    const handleCurrentChange = (val) => {
      page.value = val
      getTaskList()
    }
    
    // 多选相关方法
    const handleSelectionChange = (selection) => {
      selectedTasks.value = selection
    }
    
    // 显示添加任务对话框
    const showAddTaskDialog = () => {
      ElMessage.info('创建任务功能将在后续实现')
    }
    
    // 查看任务详情
    const viewTaskDetail = (row) => {
      ElMessage.info(`查看任务 "${row.taskName}" 的详情将在后续实现`)
    }
    
    // 查看任务日志
    const viewTaskLogs = (row) => {
      ElMessage.info(`查看任务 "${row.taskName}" 的日志将在后续实现`)
    }
    
    // 启动任务
    const startTask = async (row) => {
      try {
        const res = await startTask({ id: row.id })
        if (res.code === 0) {
          ElMessage.success('启动任务成功')
          getTaskList()
        } else {
          ElMessage.error(res.message || '启动任务失败')
        }
      } catch (error) {
        console.error('启动任务失败:', error)
        ElMessage.error('启动任务失败')
      }
    }
    
    // 暂停任务
    const pauseTask = async (row) => {
      try {
        const res = await pauseTask({ id: row.id })
        if (res.code === 0) {
          ElMessage.success('暂停任务成功')
          getTaskList()
        } else {
          ElMessage.error(res.message || '暂停任务失败')
        }
      } catch (error) {
        console.error('暂停任务失败:', error)
        ElMessage.error('暂停任务失败')
      }
    }
    
    // 停止任务
    const stopTask = async (row) => {
      try {
        const res = await stopTask({ id: row.id })
        if (res.code === 0) {
          ElMessage.success('停止任务成功')
          getTaskList()
        } else {
          ElMessage.error(res.message || '停止任务失败')
        }
      } catch (error) {
        console.error('停止任务失败:', error)
        ElMessage.error('停止任务失败')
      }
    }
    
    // 删除任务确认
    const deleteTaskConfirm = (row) => {
      ElMessageBox.confirm(`确定要删除任务"${row.taskName}"吗？此操作不可恢复！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteTask({ id: row.id })
          if (res.code === 0) {
            ElMessage.success('删除任务成功')
            getTaskList()
          } else {
            ElMessage.error(res.message || '删除任务失败')
          }
        } catch (error) {
          console.error('删除任务失败:', error)
          ElMessage.error('删除任务失败')
        }
      }).catch(() => {})
    }
    
    // 批量删除任务
    const batchDeleteTasks = () => {
      if (selectedTasks.value.length === 0) {
        ElMessage.warning('请先选择要删除的任务')
        return
      }
      
      ElMessageBox.confirm(`确定要删除选中的 ${selectedTasks.value.length} 个任务吗？此操作不可恢复！`, '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = selectedTasks.value.map(task => task.id)
          const res = await deleteTask({ ids })
          if (res.code === 0) {
            ElMessage.success('批量删除任务成功')
            getTaskList()
          } else {
            ElMessage.error(res.message || '批量删除任务失败')
          }
        } catch (error) {
          console.error('批量删除任务失败:', error)
          ElMessage.error('批量删除任务失败')
        }
      }).catch(() => {})
    }
    
    // 获取任务类型对应的Tag类型
    const getTaskTypeTag = (type) => {
      const typeMap = {
        'message': 'success',
        'addFriend': 'primary',
        'joinGroup': 'warning',
        'profileUpdate': 'info'
      }
      return typeMap[type] || 'info'
    }
    
    // 获取任务类型文本
    const getTaskTypeText = (type) => {
      const typeMap = {
        'message': '消息发送',
        'addFriend': '好友添加',
        'joinGroup': '群组加入',
        'profileUpdate': '资料更新'
      }
      return typeMap[type] || '其他'
    }
    
    // 获取状态类型对应的Tag类型
    const getStatusType = (status) => {
      const statusMap = {
        'waiting': 'info',
        'running': 'primary',
        'completed': 'success',
        'failed': 'danger',
        'paused': 'warning'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'waiting': '等待中',
        'running': '运行中',
        'completed': '已完成',
        'failed': '已失败',
        'paused': '已暂停'
      }
      return statusMap[status] || '未知'
    }
    
    // 获取进度条状态
    const getProgressStatus = (row) => {
      if (row.status === 'completed') return 'success'
      if (row.status === 'failed') return 'exception'
      if (row.status === 'paused') return 'warning'
      return ''
    }
    
    // 设置定时刷新任务状态
    const setupStatusRefresh = () => {
      statusRefreshInterval.value = setInterval(() => {
        if (taskList.value.some(task => task.status === 'running')) {
          getTaskList()
        }
      }, 10000) // 每10秒刷新一次
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      getTaskList()
      setupStatusRefresh()
    })
    
    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (statusRefreshInterval.value) {
        clearInterval(statusRefreshInterval.value)
      }
    })
    
    return {
      taskList,
      loading,
      page,
      pageSize,
      total,
      selectedTasks,
      searchForm,
      searchFormRef,
      getTaskTypeTag,
      getTaskTypeText,
      getStatusType,
      getStatusText,
      getProgressStatus,
      searchTasks,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleSelectionChange,
      showAddTaskDialog,
      viewTaskDetail,
      viewTaskLogs,
      startTask,
      pauseTask,
      stopTask,
      deleteTaskConfirm,
      batchDeleteTasks
    }
  }
})
</script>

<style lang="scss" scoped>
.task-container {
  padding: 20px;
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .task-operation {
      display: flex;
      gap: 10px;
    }
  }
  
  .task-search {
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      flex-wrap: wrap;
    }
  }
  
  .task-table-card {
    margin-bottom: 20px;
  }
  
  .task-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
