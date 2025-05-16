<template>
  <div class="crawler-accounts">
    <StatusMonitor accountType="crawler" />
    
    <div class="operation-buttons">
      <el-button type="primary" @click="showAddAccountDialog">添加账号</el-button>
      <el-button type="success" @click="showImportDialog">导入账号</el-button>
      <el-button 
        type="warning" 
        @click="showTaskDialog" 
        :disabled="!hasSelectedAccounts"
      >创建任务</el-button>
    </div>
    
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form">
        <el-form-item label="分组" prop="groupId">
          <el-select v-model="searchForm.groupId" placeholder="请选择分组" clearable>
            <el-option label="不限制" :value="null" />
            <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="不限制" :value="null" />
            <el-option label="正常" value="normal" />
            <el-option label="离线" value="offline" />
            <el-option label="超时" value="timeout" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号类型" prop="accountType">
          <el-select v-model="searchForm.accountType" placeholder="请选择账号类型" clearable>
            <el-option label="不限制" :value="null" />
            <el-option label="手机号" value="phone" />
            <el-option label="用户名" value="username" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP类型" prop="ipType">
          <el-select v-model="searchForm.ipType" placeholder="请选择IP类型" clearable>
            <el-option label="不限制" :value="null" />
            <el-option label="国内" value="domestic" />
            <el-option label="国外" value="foreign" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchAccounts">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <div class="tab-buttons">
      <el-button :class="{ active: activeSubTab === 'running' }" @click="activeSubTab = 'running'">账号列表</el-button>
      <el-button :class="{ active: activeSubTab === 'stopped' }" @click="activeSubTab = 'stopped'">私聊列表</el-button>
    </div>
    
    <el-table
      v-if="activeSubTab === 'running'"
      :data="accountList"
      v-loading="loading"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="phoneNumber" label="账号手机号" width="150" />
      <el-table-column prop="accountType" label="账号用途" width="100">
        <template #default="scope">
          {{ getAccountTypeText(scope.row.accountType) }}
        </template>
      </el-table-column>
      <el-table-column prop="ipType" label="IP类型" width="100">
        <template #default="scope">
          {{ getIpTypeText(scope.row.ipType) }}
        </template>
      </el-table-column>
      <el-table-column prop="proxyInfo" label="代理IP地址" width="180" />
      <el-table-column prop="accountStatus" label="账号状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.accountStatus)">
            {{ getStatusText(scope.row.accountStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="登录时间" width="170" />
      <el-table-column prop="countryCode" label="所属地区" width="100" />
      <el-table-column prop="telegramVips" label="相关VIPs" width="150" />
      <el-table-column prop="remark" label="备注" width="150" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editAccount(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteAccountConfirm(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-table
      v-else
      :data="privateMessageList"
      v-loading="privateLoading"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="phoneNumber" label="账号手机号" width="150" />
      <el-table-column prop="messageType" label="账号用途" width="100" />
      <el-table-column prop="targetUser" label="目标用户" width="120" />
      <el-table-column prop="ipType" label="IP类型" width="100">
        <template #default="scope">
          {{ getIpTypeText(scope.row.ipType) }}
        </template>
      </el-table-column>
      <el-table-column prop="accountStatus" label="账号状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.accountStatus)">
            {{ getStatusText(scope.row.accountStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column prop="country" label="所属国家" width="100" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editPrivateMessage(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deletePrivateMessageConfirm(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
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
    
    <!-- 添加/编辑账号对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加爬虫账号' : '编辑爬虫账号'"
      v-model="accountDialogVisible"
      width="550px"
    >
      <el-form :model="accountForm" :rules="accountRules" ref="accountFormRef" label-width="100px">
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="accountForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="账号类型" prop="accountType">
          <el-select v-model="accountForm.accountType" placeholder="请选择账号类型">
            <el-option label="手机号" value="phone" />
            <el-option label="用户名" value="username" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP类型" prop="ipType">
          <el-select v-model="accountForm.ipType" placeholder="请选择IP类型">
            <el-option label="国内" value="domestic" />
            <el-option label="国外" value="foreign" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理信息" prop="proxyInfo">
          <el-input v-model="accountForm.proxyInfo" placeholder="请输入代理信息" />
        </el-form-item>
        <el-form-item label="相关VIPs" prop="telegramVips">
          <el-input v-model="accountForm.telegramVips" placeholder="请输入相关VIPs" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="accountForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="accountDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAccountForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 导入账号对话框 -->
    <el-dialog title="导入账号" v-model="importDialogVisible" width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :http-request="handleUpload"
        :before-upload="beforeUpload"
        :limit="1"
        accept=".csv,.xlsx"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将账号文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持CSV或Excel格式的账号文件，请确保文件格式正确
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport" :disabled="!importFile">导入</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- Task Creator Dialog -->
    <TaskCreator 
      v-model:visible="taskDialogVisible" 
      :selectedAccounts="selectedRows" 
      @task-created="handleTaskCreated" 
    />
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCrawlerAccounts,
  createCrawlerAccount,
  updateCrawlerAccount,
  deleteCrawlerAccount,
  getCrawlerAccountStatus
} from '@/api/tg/telegram'
import {
  formatPhoneNumber,
  getStatusTagType,
  getStatusText,
  getIpTypeText,
  apiRequest,
  generateMockAccounts
} from '@/utils/telegram-helper'
import StatusMonitor from './StatusMonitor.vue'
import TaskCreator from './TaskCreator.vue'

export default defineComponent({
  name: 'CrawlerAccounts',
  
  components: {
    StatusMonitor,
    TaskCreator
  },
  
  setup() {
    // 账号列表数据
    const accountList = ref([])
    const privateMessageList = ref([])
    const loading = ref(false)
    const privateLoading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const activeSubTab = ref('running')
    
    // 表格选择
    const selectedRows = ref([])
    
    // 计算已选中的账号ID
    const selectedAccounts = computed(() => {
      return selectedRows.value
    })
    
    // 判断是否有选中账号
    const hasSelectedAccounts = computed(() => {
      return selectedAccounts.value.length > 0
    })
    
    // 分组选项
    const groupOptions = ref([
      { label: '主要分组', value: 1 },
      { label: '备用分组', value: 2 },
      { label: '测试分组', value: 3 }
    ])
    
    // 搜索表单
    const searchFormRef = ref(null)
    const searchForm = reactive({
      groupId: null,
      status: null,
      accountType: null,
      ipType: null
    })
    
    // 弹窗控制
    const addAccountDialogVisible = ref(false)
    const importDialogVisible = ref(false)
    const taskDialogVisible = ref(false)
    
    // 账号表单相关
    const accountFormRef = ref(null)
    const accountForm = reactive({
      id: '',
      phoneNumber: '',
      accountType: 'phone',
      ipType: 'domestic',
      proxyInfo: '',
      telegramVips: '',
      remark: ''
    })
    
    // 账号表单校验规则
    const accountRules = {
      phoneNumber: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
      accountType: [{ required: true, message: '请选择账号类型', trigger: 'change' }],
      ipType: [{ required: true, message: '请选择IP类型', trigger: 'change' }]
    }
    
    // 导入相关
    const importFile = ref(null)
    
    // 获取账号列表
    const getAccountList = async () => {
      loading.value = true
      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          ...searchForm
        }
        
        const res = await getCrawlerAccounts(params)
        if (res.code === 0) {
          accountList.value = res.data.list || []
          total.value = res.data.total || 0
        } else {
          ElMessage.error(res.message || '获取账号列表失败')
        }
      } catch (error) {
        console.error('获取账号列表失败:', error)
        ElMessage.error('获取账号列表失败')
        // 模拟数据用于开发测试
        accountList.value = generateMockAccounts(10, 'crawler')
        total.value = accountList.value.length
      } finally {
        loading.value = false
      }
    }
    
    // 搜索账号
    const searchAccounts = () => {
      page.value = 1
      getAccountList()
    }
    
    // 重置搜索
    const resetSearch = () => {
      searchFormRef.value?.resetFields()
      page.value = 1
      getAccountList()
    }
    
    // 分页相关方法
    const handleSizeChange = (val) => {
      pageSize.value = val
      getAccountList()
    }
    
    const handleCurrentChange = (val) => {
      page.value = val
      getAccountList()
    }
    
    // 表格选择变化
    const handleSelectionChange = (val) => {
      selectedRows.value = val
    }
    
    // 账号操作相关方法
    const showAddAccountDialog = () => {
      addAccountDialogVisible.value = true
    }
    
    const editAccount = (row) => {
      // ...
    }
    
    const submitAccountForm = async () => {
      // ...
    }
    
    const deleteAccountConfirm = (row) => {
      // ...
    }
    
    // 导入相关方法
    const showImportDialog = () => {
      importDialogVisible.value = true
    }
    
    const beforeUpload = (file) => {
      // ...
    }
    
    const handleUpload = ({ file }) => {
      // ...
    }
    
    const confirmImport = () => {
      // ...
    }
    
    // 显示任务创建对话框
    const showTaskDialog = () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择需要执行任务的账号')
        return
      }
      taskDialogVisible.value = true
    }
    
    // 处理任务创建成功
    const handleTaskCreated = (task) => {
      ElMessage.success(`成功创建 ${task.taskType} 任务`)
      // 可以在这里添加其他逻辑，例如刷新任务列表等
    }
    
    // 生命周期钩子
    onMounted(() => {
      getAccountList()
    })
    
    return {
      accountList,
      privateMessageList,
      loading,
      privateLoading,
      page,
      pageSize,
      total,
      activeSubTab,
      groupOptions,
      searchForm,
      searchFormRef,
      addAccountDialogVisible,
      importDialogVisible,
      taskDialogVisible,
      selectedAccounts,
      hasSelectedAccounts,
      accountForm,
      accountFormRef,
      accountRules,
      getAccountList,
      searchAccounts,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleSelectionChange,
      showAddAccountDialog,
      editAccount,
      submitAccountForm,
      deleteAccountConfirm,
      showImportDialog,
      beforeUpload,
      handleUpload,
      confirmImport,
      getStatusText,
      getStatusTagType,
      getAccountTypeText,
      getIpTypeText,
      // 私信列表相关方法
      editPrivateMessage: () => {},
      deletePrivateMessageConfirm: () => {}
    }
  }
})
</script>

<style scoped>
.crawler-accounts {
  padding: 20px 0;
}

.operation-buttons {
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.tab-buttons {
  margin-bottom: 20px;
}

.tab-buttons .el-button {
  margin-right: 10px;
}

.tab-buttons .el-button.active {
  background-color: #409eff;
  color: white;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
