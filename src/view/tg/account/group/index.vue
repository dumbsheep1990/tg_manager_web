<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="分组名称">
          <el-input v-model="searchInfo.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button size="small" type="primary" icon="plus" @click="openDialog">新增</el-button>
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column align="left" label="ID" min-width="60" prop="id" />
        <el-table-column align="left" label="分组名称" min-width="150" prop="name" />
        <el-table-column align="left" label="描述" min-width="200" prop="description" />
        <el-table-column align="left" label="账号数量" min-width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.accountCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="可用账号数量" min-width="100">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.activeAccountCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="创建时间" min-width="180">
          <template #default="scope">{{ formatDate(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column align="left" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ scope.row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link icon="edit" @click="editAccountGroup(scope.row)">编辑</el-button>
            <el-button type="primary" link icon="delete" @click="deleteAccountGroup(scope.row)">删除</el-button>
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

    <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px" ref="elFormRef" :rules="rules">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述" prop="description">
          <el-input v-model="formData.description" placeholder="请输入分组描述" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialogType === 'edit'">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="启用" value="ACTIVE" />
            <el-option label="禁用" value="INACTIVE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import { getAccountGroups, createAccountGroup, updateAccountGroup, deleteAccountGroup } from '@/api/tg/accountGroup'

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchInfo = reactive({
  keyword: ''
})

// 对话框数据
const dialogFormVisible = ref(false)
const dialogType = ref('add') // add or edit
const dialogTitle = ref('新增账号分组')
const formData = ref({
  name: '',
  description: '',
  status: 'ACTIVE'
})
const elFormRef = ref(null)
const rules = reactive({
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入分组描述', trigger: 'blur' }]
})

// 获取账号分组列表
const getTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchInfo.keyword
    }
    const res = await getAccountGroups(params)
    if (res.code === 200) {
      total.value = res.data.total
      tableData.value = res.data.account_groups
      // 计算账号数量和活跃账号数量（在实际情况中应该由后端提供）
      tableData.value.forEach(item => {
        item.accountCount = item.accounts ? item.accounts.length : 0
        item.activeAccountCount = item.accounts ? item.accounts.filter(a => a.status === 'ACTIVE').length : 0
      })
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 提交查询
const onSubmit = () => {
  page.value = 1
  getTableData()
}

// 重置查询
const onReset = () => {
  searchInfo.keyword = ''
  onSubmit()
}

// 页码改变
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  getTableData()
}

// 打开新增对话框
const openDialog = () => {
  dialogType.value = 'add'
  dialogTitle.value = '新增账号分组'
  formData.value = {
    name: '',
    description: '',
    status: 'ACTIVE'
  }
  dialogFormVisible.value = true
}

// 编辑账号分组
const editAccountGroup = (row) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑账号分组'
  formData.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status
  }
  dialogFormVisible.value = true
}

// 删除账号分组
const deleteAccountGroup = (row) => {
  ElMessageBox.confirm('确定要删除该账号分组吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteAccountGroup(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getTableData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (err) {
      console.error(err)
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

// 关闭对话框
const closeDialog = () => {
  dialogFormVisible.value = false
  if (elFormRef.value) {
    elFormRef.value.resetFields()
  }
}

// 提交表单
const submitForm = async () => {
  if (!elFormRef.value) return
  
  await elFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (dialogType.value === 'add') {
          res = await createAccountGroup(formData.value)
        } else {
          res = await updateAccountGroup(formData.value.id, formData.value)
        }
        
        if (res.code === 200) {
          ElMessage.success(`${dialogType.value === 'add' ? '新增' : '编辑'}成功`)
          closeDialog()
          getTableData()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (err) {
        console.error(err)
        ElMessage.error('操作失败')
      }
    }
  })
}

onMounted(() => {
  getTableData()
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
</style>
