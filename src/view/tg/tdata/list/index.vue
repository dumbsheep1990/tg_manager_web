<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="关键词">
          <el-input v-model="searchInfo.keyword" placeholder="手机号/用户名/文件名" />
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="searchInfo.account_group_id" placeholder="请选择分组" clearable>
            <el-option
              v-for="item in accountGroups"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择状态" clearable>
            <el-option label="活跃" value="ACTIVE" />
            <el-option label="导入中" value="PENDING_IMPORT" />
            <el-option label="封禁" value="BANNED" />
            <el-option label="受限" value="RESTRICTED" />
            <el-option label="导入失败" value="IMPORT_FAILED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button size="small" type="primary" icon="plus" @click="goToImport">导入账号</el-button>
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column align="left" label="ID" min-width="60" prop="id" />
        <el-table-column align="left" label="tdata文件名" min-width="180" prop="tdata_filename" />
        <el-table-column align="left" label="创建时间" min-width="180">
          <template #default="scope">{{ formatDate(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column align="left" label="电话号码" min-width="150" prop="phone" />
        <el-table-column align="left" label="登录状态" min-width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="最近检测时间" min-width="180">
          <template #default="scope">
            {{ scope.row.last_check_at ? formatDate(scope.row.last_check_at) : '未检测' }}
          </template>
        </el-table-column>
        <el-table-column align="left" label="账号等级" min-width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.account_level)">
              {{ getLevelText(scope.row.account_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="所属分组" min-width="120">
          <template #default="scope">
            {{ scope.row.account_group ? scope.row.account_group.name : '-' }}
          </template>
        </el-table-column>
        <el-table-column align="left" fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewAccountDetail(scope.row)">详情</el-button>
            <el-button type="primary" link icon="edit" @click="editAccount(scope.row)">编辑</el-button>
            <el-button type="primary" link icon="delete" @click="deleteAccount(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 账号详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="账号详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentAccount.id }}</el-descriptions-item>
        <el-descriptions-item label="电话号码">{{ currentAccount.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentAccount.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="名字">{{ currentAccount.first_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="姓氏">{{ currentAccount.last_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentAccount.status)">
            {{ getStatusText(currentAccount.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="账号等级">
          <el-tag :type="getLevelType(currentAccount.account_level)">
            {{ getLevelText(currentAccount.account_level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属分组">
          {{ currentAccount.account_group ? currentAccount.account_group.name : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="tdata文件">{{ currentAccount.tdata_filename || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间">
          {{ currentAccount.last_login_at ? formatDate(currentAccount.last_login_at) : '未登录' }}
        </el-descriptions-item>
        <el-descriptions-item label="最后检测时间">
          {{ currentAccount.last_check_at ? formatDate(currentAccount.last_check_at) : '未检测' }}
        </el-descriptions-item>
        <el-descriptions-item label="检测结果">{{ currentAccount.check_result || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDate(currentAccount.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
          <el-tag v-if="!currentAccount.error_message" type="success">无</el-tag>
          <div v-else class="error-message">{{ currentAccount.error_message }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑账号弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑账号" width="500px">
      <el-form :model="editForm" label-width="100px" ref="editFormRef" :rules="editRules">
        <el-form-item label="所属分组" prop="account_group_id">
          <el-select v-model="editForm.account_group_id" placeholder="请选择账号分组">
            <el-option
              v-for="group in accountGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="活跃" value="ACTIVE" />
            <el-option label="导入中" value="PENDING_IMPORT" />
            <el-option label="封禁" value="BANNED" />
            <el-option label="受限" value="RESTRICTED" />
            <el-option label="导入失败" value="IMPORT_FAILED" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号等级" prop="account_level">
          <el-slider 
            v-model="editForm.account_level" 
            :min="1" 
            :max="3" 
            :marks="{1: '普通', 2: '中级', 3: '高级'}"
            show-stops
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditForm" :loading="submitting">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/format'
import { getTdataAccounts, getTdataAccountDetail, updateTdataAccount, deleteTdataAccount } from '@/api/tg/tdata'
import { getAccountGroups } from '@/api/tg/accountGroup'

const router = useRouter()
const tableData = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const accountGroups = ref([])
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentAccount = ref({})
const editFormRef = ref(null)

const searchInfo = reactive({
  keyword: '',
  account_group_id: '',
  status: ''
})

const editForm = reactive({
  id: null,
  account_group_id: null,
  status: '',
  account_level: 1
})

const editRules = {
  account_group_id: [
    { required: true, message: '请选择账号分组', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ],
  account_level: [
    { required: true, message: '请选择账号等级', trigger: 'change' }
  ]
}

// 获取账号列表
const getTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchInfo.keyword,
      account_group_id: searchInfo.account_group_id,
      status: searchInfo.status
    }
    
    const res = await getTdataAccounts(params)
    if (res.code === 200) {
      tableData.value = res.data.accounts
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取账号列表失败')
    }
  } catch (err) {
    console.error('获取账号列表失败', err)
    ElMessage.error('获取账号列表失败')
  } finally {
    loading.value = false
  }
}

// 获取账号分组列表
const getAccountGroupList = async () => {
  try {
    const res = await getAccountGroups({ page: 1, pageSize: 100 })
    if (res.code === 200) {
      accountGroups.value = res.data.account_groups || []
    }
  } catch (err) {
    console.error('获取账号分组失败', err)
  }
}

// 状态文本和样式
const getStatusText = (status) => {
  const statusMap = {
    'ACTIVE': '活跃',
    'BANNED': '封禁',
    'RESTRICTED': '受限',
    'PENDING_IMPORT': '导入中',
    'IMPORT_FAILED': '导入失败'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'ACTIVE': 'success',
    'BANNED': 'danger',
    'RESTRICTED': 'warning',
    'PENDING_IMPORT': 'info',
    'IMPORT_FAILED': 'danger'
  }
  return typeMap[status] || ''
}

// 等级文本和样式
const getLevelText = (level) => {
  const levelMap = {
    1: '普通',
    2: '中级',
    3: '高级'
  }
  return levelMap[level] || level
}

const getLevelType = (level) => {
  const typeMap = {
    1: '',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[level] || ''
}

// 查询和重置
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.keyword = ''
  searchInfo.account_group_id = ''
  searchInfo.status = ''
  onSubmit()
}

// 分页
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  getTableData()
}

// 查看账号详情
const viewAccountDetail = async (row) => {
  try {
    const res = await getTdataAccountDetail(row.id)
    if (res.code === 200) {
      currentAccount.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取账号详情失败')
    }
  } catch (err) {
    console.error('获取账号详情失败', err)
    ElMessage.error('获取账号详情失败')
  }
}

// 编辑账号
const editAccount = (row) => {
  editForm.id = row.id
  editForm.account_group_id = row.account_group_id
  editForm.status = row.status
  editForm.account_level = row.account_level || 1
  editDialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        const res = await updateTdataAccount(editForm.id, editForm)
        if (res.code === 200) {
          ElMessage.success('更新成功')
          editDialogVisible.value = false
          getTableData()
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      } catch (err) {
        console.error('更新失败', err)
        ElMessage.error('更新失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除账号
const deleteAccount = (row) => {
  ElMessageBox.confirm('确定要删除该账号吗？相关的tdata文件也将被删除。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteTdataAccount(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getTableData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (err) {
      console.error('删除失败', err)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 跳转到导入页面
const goToImport = () => {
  router.push('/tg/tdata/import')
}

onMounted(() => {
  getTableData()
  getAccountGroupList()
})
</script>

<style scoped>
.gva-search-box {
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
}

.gva-table-box {
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
}

.gva-btn-list {
  margin-bottom: 12px;
}

.gva-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
