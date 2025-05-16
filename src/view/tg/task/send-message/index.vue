<template>
  <div class="send-message-task-container">
    <h2>发送消息任务</h2>
    
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
        <el-table-column prop="targetCount" label="目标数量" width="100" />
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
    
    <!-- 创建任务对话框 -->
    <el-dialog title="创建发送消息任务" v-model="dialogVisible" width="650px">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="选择账号" prop="accountId">
          <el-select v-model="form.accountId" placeholder="请选择发送账号" filterable>
            <el-option 
              v-for="account in accountList" 
              :key="account.id" 
              :label="account.phone + ' (' + account.username + ')'" 
              :value="account.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消息模板" prop="templateId">
          <el-select v-model="form.templateId" placeholder="请选择消息模板" filterable>
            <el-option 
              v-for="template in templateList" 
              :key="template.id" 
              :label="template.templateName" 
              :value="template.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标用户" prop="targetType">
          <el-radio-group v-model="form.targetType">
            <el-radio label="user">单个用户</el-radio>
            <el-radio label="group">用户分组</el-radio>
            <el-radio label="filter">条件筛选</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 根据目标类型显示不同选择器 -->
        <el-form-item label="选择用户" prop="targetUsers" v-if="form.targetType === 'user'">
          <el-select v-model="form.targetUsers" multiple placeholder="请选择目标用户" filterable>
            <el-option 
              v-for="user in userList" 
              :key="user.id" 
              :label="user.username" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="选择用户分组" prop="targetGroup" v-if="form.targetType === 'group'">
          <el-select v-model="form.targetGroup" placeholder="请选择用户分组" filterable>
            <el-option 
              v-for="group in userGroupList" 
              :key="group.id" 
              :label="group.name" 
              :value="group.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="用户筛选条件" v-if="form.targetType === 'filter'">
          <el-card class="filter-card">
            <el-form-item label="用户标签" prop="tagIds">
              <el-select v-model="form.tagIds" multiple placeholder="请选择用户标签" filterable>
                <el-option 
                  v-for="tag in userTagList" 
                  :key="tag.id" 
                  :label="tag.name" 
                  :value="tag.id" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="上次活跃时间" prop="lastActiveTime">
              <el-date-picker 
                v-model="form.lastActiveTime" 
                type="daterange" 
                range-separator="至" 
                start-placeholder="开始日期" 
                end-placeholder="结束日期"
              />
            </el-form-item>
          </el-card>
        </el-form-item>
        
        <el-form-item label="执行时间" prop="executeType">
          <el-radio-group v-model="form.executeType">
            <el-radio label="now">立即执行</el-radio>
            <el-radio label="schedule">定时执行</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="定时时间" prop="scheduleTime" v-if="form.executeType === 'schedule'">
          <el-date-picker 
            v-model="form.scheduleTime" 
            type="datetime" 
            placeholder="请选择定时执行时间"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'SendMessageTask',
  
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
    
    // 弹窗相关
    const dialogVisible = ref(false)
    const form = reactive({
      taskName: '',
      accountId: '',
      templateId: '',
      targetType: 'user',
      targetUsers: [],
      targetGroup: '',
      tagIds: [],
      lastActiveTime: null,
      executeType: 'now',
      scheduleTime: null
    })
    
    const rules = {
      taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
      accountId: [{ required: true, message: '请选择发送账号', trigger: 'change' }],
      templateId: [{ required: true, message: '请选择消息模板', trigger: 'change' }]
    }
    
    const formRef = ref(null)
    
    // 下拉选项数据
    const accountList = ref([])
    const templateList = ref([])
    const userList = ref([])
    const userGroupList = ref([])
    const userTagList = ref([])
    
    // 获取任务列表
    const fetchTasks = async () => {
      loading.value = true
      
      try {
        // 模拟API调用
        setTimeout(() => {
          taskList.value = Array.from({ length: 10 }, (_, index) => ({
            taskId: 'TSK' + (10001 + index),
            taskName: '消息任务-' + (index + 1),
            accountInfo: '+1 ' + Math.floor(1000000000 + Math.random() * 9000000000) + ' (user' + (1000 + index) + ')',
            targetCount: Math.floor(20 + Math.random() * 100),
            status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
            createTime: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
            updateTime: new Date(Date.now() - Math.random() * 1000000000).toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
          }))
          
          total.value = 57 // 模拟总数据量
          loading.value = false
        }, 500)
      } catch (error) {
        console.error('获取任务列表失败:', error)
        ElMessage.error('获取任务列表失败')
        loading.value = false
      }
    }
    
    // 加载相关数据
    const loadOptions = () => {
      // 这里使用模拟数据，实际项目中应从API获取
      accountList.value = Array.from({ length: 8 }, (_, index) => ({
        id: 'ACC' + (100 + index),
        phone: '+1 ' + Math.floor(1000000000 + Math.random() * 9000000000),
        username: 'user' + (1000 + index)
      }))
      
      templateList.value = Array.from({ length: 5 }, (_, index) => ({
        id: 'TPL' + (100 + index),
        templateName: '消息模板-' + (index + 1)
      }))
      
      userList.value = Array.from({ length: 20 }, (_, index) => ({
        id: 'USR' + (100 + index),
        username: 'telegram_user' + (1000 + index)
      }))
      
      userGroupList.value = Array.from({ length: 3 }, (_, index) => ({
        id: 'GRP' + (100 + index),
        name: ['VIP用户组', '新用户组', '活跃用户组'][index]
      }))
      
      userTagList.value = Array.from({ length: 5 }, (_, index) => ({
        id: 'TAG' + (100 + index),
        name: ['VIP', '新用户', '潜在客户', '活跃用户', '高价值用户'][index]
      }))
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
      form.taskName = ''
      form.accountId = ''
      form.templateId = ''
      form.targetType = 'user'
      form.targetUsers = []
      form.targetGroup = ''
      form.tagIds = []
      form.lastActiveTime = null
      form.executeType = 'now'
      form.scheduleTime = null
      
      dialogVisible.value = true
    }
    
    // 提交表单
    const submitForm = () => {
      formRef.value?.validate((valid) => {
        if (valid) {
          // 模拟API调用
          ElMessage.success('任务创建成功')
          dialogVisible.value = false
          fetchTasks()
        }
      })
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
      loadOptions()
    })
    
    return {
      searchForm,
      searchFormRef,
      currentPage,
      pageSize,
      total,
      taskList,
      loading,
      dialogVisible,
      form,
      rules,
      formRef,
      accountList,
      templateList,
      userList,
      userGroupList,
      userTagList,
      search,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      createTask,
      submitForm,
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
.send-message-task-container {
  padding: 20px;
}

.task-card {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 15px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
