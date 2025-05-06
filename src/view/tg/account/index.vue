<template>
  <div class="account-container">
    <div class="account-header">
      <h3>电报账号管理</h3>
      <div class="account-operation">
        <el-button type="primary" @click="showAddAccountDialog">添加账号</el-button>
        <el-button type="success" @click="showImportDialog">导入TData</el-button>
        <el-button type="warning" @click="showGroupDialog">账号分组</el-button>
      </div>
    </div>
    
    <el-card class="account-search">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form">
        <el-form-item label="账号名称" prop="accountName">
          <el-input v-model="searchForm.accountName" placeholder="请输入账号名称" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="账号分组" prop="groupId">
          <el-select v-model="searchForm.groupId" placeholder="请选择账号分组" clearable>
            <el-option v-for="item in accountGroups" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择账号状态" clearable>
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="未登录" value="notLogin" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchAccounts">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="account-table-card">
      <el-table
        :data="accountList"
        v-loading="loading"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="accountName" label="账号名称" width="150" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="groupName" label="所属分组" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="loginTime" label="登录时间" width="170" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editAccount(scope.row)">编辑</el-button>
            <el-button size="small" type="success" @click="checkStatus(scope.row)">检测</el-button>
            <el-button size="small" type="danger" @click="deleteAccountConfirm(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="account-pagination">
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
    
    <!-- 添加/编辑账号对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加账号' : '编辑账号'"
      v-model="accountDialogVisible"
      width="500px"
    >
      <el-form :model="accountForm" :rules="accountRules" ref="accountFormRef" label-width="100px">
        <el-form-item label="账号名称" prop="accountName">
          <el-input v-model="accountForm.accountName" placeholder="请输入账号名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="accountForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="accountForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="账号分组" prop="groupId">
          <el-select v-model="accountForm.groupId" placeholder="请选择账号分组">
            <el-option v-for="item in accountGroups" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号描述" prop="description">
          <el-input
            v-model="accountForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入账号描述"
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
    
    <!-- 导入TData对话框 -->
    <el-dialog title="导入TData" v-model="importDialogVisible" width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :http-request="handleUpload"
        :before-upload="beforeUpload"
        :limit="1"
        accept=".zip"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将TData文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传ZIP格式的TData文件，且文件大小不超过500MB
          </div>
        </template>
      </el-upload>
      <el-form :model="importForm" label-width="100px" class="import-form">
        <el-form-item label="账号分组" prop="groupId">
          <el-select v-model="importForm.groupId" placeholder="请选择导入后的账号分组">
            <el-option v-for="item in accountGroups" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport" :disabled="!importForm.file">导入</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 账号分组对话框 -->
    <el-dialog title="账号分组管理" v-model="groupDialogVisible" width="600px">
      <div class="group-header">
        <el-button type="primary" size="small" @click="showAddGroupDialog">添加分组</el-button>
      </div>
      <el-table :data="accountGroups" style="width: 100%" border>
        <el-table-column prop="name" label="分组名称" />
        <el-table-column prop="accountCount" label="账号数量" width="100" />
        <el-table-column prop="description" label="分组描述" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editGroup(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteGroupConfirm(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    
    <!-- 添加/编辑分组对话框 -->
    <el-dialog
      :title="groupDialogType === 'add' ? '添加分组' : '编辑分组'"
      v-model="groupFormDialogVisible"
      width="400px"
    >
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="80px">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述" prop="description">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分组描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="groupFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGroupForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountStatus,
  getAccountGroups,
  createAccountGroup,
  updateAccountGroup,
  deleteAccountGroup,
  importTdataAccount
} from '@/api/tg/account'

export default defineComponent({
  name: 'TgAccountManager',
  
  setup() {
    // 账号列表数据
    const accountList = ref([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectedAccounts = ref([])
    
    // 搜索表单
    const searchFormRef = ref(null)
    const searchForm = reactive({
      accountName: '',
      phone: '',
      groupId: '',
      status: ''
    })
    
    // 账号表单相关
    const accountDialogVisible = ref(false)
    const dialogType = ref('add') // 'add' 或 'edit'
    const accountFormRef = ref(null)
    const accountForm = reactive({
      id: '',
      accountName: '',
      phone: '',
      username: '',
      groupId: '',
      description: ''
    })
    
    // 账号表单校验规则
    const accountRules = {
      accountName: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
      phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
      groupId: [{ required: true, message: '请选择账号分组', trigger: 'change' }]
    }
    
    // 导入TData相关
    const importDialogVisible = ref(false)
    const importForm = reactive({
      file: null,
      groupId: ''
    })
    
    // 账号分组相关
    const accountGroups = ref([])
    const groupDialogVisible = ref(false)
    const groupFormDialogVisible = ref(false)
    const groupDialogType = ref('add')
    const groupFormRef = ref(null)
    const groupForm = reactive({
      id: '',
      name: '',
      description: ''
    })
    
    // 分组表单校验规则
    const groupRules = {
      name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
    }
    
    // 获取账号列表
    const getAccountList = async () => {
      loading.value = true
      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          ...searchForm
        }
        
        const res = await getAccounts(params)
        if (res.code === 0) {
          accountList.value = res.data.list
          total.value = res.data.total
        } else {
          ElMessage.error(res.message || '获取账号列表失败')
        }
      } catch (error) {
        console.error('获取账号列表失败:', error)
        ElMessage.error('获取账号列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 获取账号分组列表
    const getGroupList = async () => {
      try {
        const res = await getAccountGroups({})
        if (res.code === 0) {
          accountGroups.value = res.data.list
        } else {
          ElMessage.error(res.message || '获取账号分组失败')
        }
      } catch (error) {
        console.error('获取账号分组失败:', error)
        ElMessage.error('获取账号分组失败')
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
    
    // 多选相关方法
    const handleSelectionChange = (selection) => {
      selectedAccounts.value = selection
    }
    
    // 显示添加账号对话框
    const showAddAccountDialog = () => {
      dialogType.value = 'add'
      accountForm.id = ''
      accountForm.accountName = ''
      accountForm.phone = ''
      accountForm.username = ''
      accountForm.groupId = ''
      accountForm.description = ''
      accountDialogVisible.value = true
      nextTick(() => {
        accountFormRef.value?.resetFields()
      })
    }
    
    // 编辑账号
    const editAccount = (row) => {
      dialogType.value = 'edit'
      accountForm.id = row.id
      accountForm.accountName = row.accountName
      accountForm.phone = row.phone
      accountForm.username = row.username
      accountForm.groupId = row.groupId
      accountForm.description = row.description
      accountDialogVisible.value = true
    }
    
    // 提交账号表单
    const submitAccountForm = async () => {
      accountFormRef.value?.validate(async (valid) => {
        if (valid) {
          try {
            let res
            if (dialogType.value === 'add') {
              res = await createAccount(accountForm)
            } else {
              res = await updateAccount(accountForm)
            }
            
            if (res.code === 0) {
              ElMessage.success(dialogType.value === 'add' ? '添加账号成功' : '更新账号成功')
              accountDialogVisible.value = false
              getAccountList()
            } else {
              ElMessage.error(res.message || (dialogType.value === 'add' ? '添加账号失败' : '更新账号失败'))
            }
          } catch (error) {
            console.error(dialogType.value === 'add' ? '添加账号失败:' : '更新账号失败:', error)
            ElMessage.error(dialogType.value === 'add' ? '添加账号失败' : '更新账号失败')
          }
        }
      })
    }
    
    // 删除账号确认
    const deleteAccountConfirm = (row) => {
      ElMessageBox.confirm(`确定要删除账号"${row.accountName}"吗？此操作不可恢复！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteAccount({ id: row.id })
          if (res.code === 0) {
            ElMessage.success('删除账号成功')
            getAccountList()
          } else {
            ElMessage.error(res.message || '删除账号失败')
          }
        } catch (error) {
          console.error('删除账号失败:', error)
          ElMessage.error('删除账号失败')
        }
      }).catch(() => {})
    }
    
    // 检测账号状态
    const checkStatus = async (row) => {
      try {
        const res = await getAccountStatus({ id: row.id })
        if (res.code === 0) {
          ElMessage.success(`账号状态: ${getStatusText(res.data.status)}`)
          getAccountList()
        } else {
          ElMessage.error(res.message || '检测账号状态失败')
        }
      } catch (error) {
        console.error('检测账号状态失败:', error)
        ElMessage.error('检测账号状态失败')
      }
    }
    
    // 显示导入对话框
    const showImportDialog = () => {
      importForm.file = null
      importForm.groupId = ''
      importDialogVisible.value = true
    }
    
    // 文件上传前检查
    const beforeUpload = (file) => {
      const isZip = file.type === 'application/zip' || file.name.endsWith('.zip')
      const isLt500M = file.size / 1024 / 1024 < 500
      
      if (!isZip) {
        ElMessage.error('只能上传ZIP格式的TData文件!')
      }
      
      if (!isLt500M) {
        ElMessage.error('文件大小不能超过500MB!')
      }
      
      return isZip && isLt500M
    }
    
    // 处理文件上传
    const handleUpload = (params) => {
      importForm.file = params.file
      return false // 阻止默认上传行为
    }
    
    // 确认导入TData
    const confirmImport = async () => {
      if (!importForm.file) {
        ElMessage.warning('请先选择要上传的TData文件')
        return
      }
      
      if (!importForm.groupId) {
        ElMessage.warning('请选择导入后的账号分组')
        return
      }
      
      const formData = new FormData()
      formData.append('file', importForm.file)
      formData.append('groupId', importForm.groupId)
      
      try {
        const res = await importTdataAccount(formData)
        if (res.code === 0) {
          ElMessage.success('导入TData账号成功')
          importDialogVisible.value = false
          getAccountList()
        } else {
          ElMessage.error(res.message || '导入TData账号失败')
        }
      } catch (error) {
        console.error('导入TData账号失败:', error)
        ElMessage.error('导入TData账号失败')
      }
    }
    
    // 显示分组对话框
    const showGroupDialog = () => {
      groupDialogVisible.value = true
      getGroupList()
    }
    
    // 显示添加分组对话框
    const showAddGroupDialog = () => {
      groupDialogType.value = 'add'
      groupForm.id = ''
      groupForm.name = ''
      groupForm.description = ''
      groupFormDialogVisible.value = true
      nextTick(() => {
        groupFormRef.value?.resetFields()
      })
    }
    
    // 编辑分组
    const editGroup = (row) => {
      groupDialogType.value = 'edit'
      groupForm.id = row.id
      groupForm.name = row.name
      groupForm.description = row.description
      groupFormDialogVisible.value = true
    }
    
    // 提交分组表单
    const submitGroupForm = async () => {
      groupFormRef.value?.validate(async (valid) => {
        if (valid) {
          try {
            let res
            if (groupDialogType.value === 'add') {
              res = await createAccountGroup(groupForm)
            } else {
              res = await updateAccountGroup(groupForm)
            }
            
            if (res.code === 0) {
              ElMessage.success(groupDialogType.value === 'add' ? '添加分组成功' : '更新分组成功')
              groupFormDialogVisible.value = false
              getGroupList()
            } else {
              ElMessage.error(res.message || (groupDialogType.value === 'add' ? '添加分组失败' : '更新分组失败'))
            }
          } catch (error) {
            console.error(groupDialogType.value === 'add' ? '添加分组失败:' : '更新分组失败:', error)
            ElMessage.error(groupDialogType.value === 'add' ? '添加分组失败' : '更新分组失败')
          }
        }
      })
    }
    
    // 删除分组确认
    const deleteGroupConfirm = (row) => {
      ElMessageBox.confirm(`确定要删除分组"${row.name}"吗？删除分组将会导致该分组下的所有账号被移除！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteAccountGroup({ id: row.id })
          if (res.code === 0) {
            ElMessage.success('删除分组成功')
            getGroupList()
          } else {
            ElMessage.error(res.message || '删除分组失败')
          }
        } catch (error) {
          console.error('删除分组失败:', error)
          ElMessage.error('删除分组失败')
        }
      }).catch(() => {})
    }
    
    // 获取状态类型对应的Tag类型
    const getStatusType = (status) => {
      const statusMap = {
        'online': 'success',
        'offline': 'danger',
        'notLogin': 'info',
        'disabled': 'warning'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'online': '在线',
        'offline': '离线',
        'notLogin': '未登录',
        'disabled': '已禁用'
      }
      return statusMap[status] || '未知'
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      getAccountList()
      getGroupList()
    })
    
    return {
      accountList,
      loading,
      page,
      pageSize,
      total,
      selectedAccounts,
      searchForm,
      searchFormRef,
      accountDialogVisible,
      dialogType,
      accountForm,
      accountFormRef,
      accountRules,
      importDialogVisible,
      importForm,
      accountGroups,
      groupDialogVisible,
      groupFormDialogVisible,
      groupDialogType,
      groupForm,
      groupFormRef,
      groupRules,
      getStatusType,
      getStatusText,
      searchAccounts,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleSelectionChange,
      showAddAccountDialog,
      editAccount,
      submitAccountForm,
      deleteAccountConfirm,
      checkStatus,
      showImportDialog,
      beforeUpload,
      handleUpload,
      confirmImport,
      showGroupDialog,
      showAddGroupDialog,
      editGroup,
      submitGroupForm,
      deleteGroupConfirm
    }
  }
})
</script>

<style lang="scss" scoped>
.account-container {
  padding: 20px;
  
  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .account-operation {
      display: flex;
      gap: 10px;
    }
  }
  
  .account-search {
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      flex-wrap: wrap;
    }
  }
  
  .account-table-card {
    margin-bottom: 20px;
  }
  
  .account-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .group-header {
    margin-bottom: 15px;
  }
  
  .import-form {
    margin-top: 20px;
  }
}
</style>
