<template>
  <div class="tdata-container">
    <div class="tdata-header">
      <h3>TData文件管理</h3>
      <div class="tdata-operation">
        <el-button type="primary" @click="showUploadDialog">上传TData</el-button>
      </div>
    </div>
    
    <el-card class="tdata-search">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form">
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="searchForm.fileName" placeholder="请输入文件名" clearable />
        </el-form-item>
        <el-form-item label="导入状态" prop="importStatus">
          <el-select v-model="searchForm.importStatus" placeholder="请选择导入状态" clearable>
            <el-option label="未导入" value="notImported" />
            <el-option label="已导入" value="imported" />
            <el-option label="导入中" value="importing" />
            <el-option label="导入失败" value="importFailed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTdataFiles">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="tdata-table-card">
      <el-table
        :data="tdataList"
        v-loading="loading"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="fileName" label="文件名" min-width="150" />
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="accountCount" label="账号数量" width="100" />
        <el-table-column prop="importStatus" label="导入状态" width="100">
          <template #default="scope">
            <el-tag :type="getImportStatusType(scope.row.importStatus)">
              {{ getImportStatusText(scope.row.importStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="170" />
        <el-table-column prop="importTime" label="导入时间" width="170" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.importStatus === 'notImported'"
              size="small" 
              type="success" 
              @click="importTdata(scope.row)"
            >
              导入
            </el-button>
            <el-button
              v-if="scope.row.importStatus === 'importing'"
              size="small"
              type="warning"
              @click="checkImportStatus(scope.row)"
            >
              检查状态
            </el-button>
            <el-button
              v-if="scope.row.importStatus === 'importFailed'"
              size="small"
              type="warning"
              @click="retryImport(scope.row)"
            >
              重试导入
            </el-button>
            <el-button size="small" type="primary" @click="viewTdataDetail(scope.row)">详情</el-button>
            <el-button size="small" type="danger" @click="deleteTdataConfirm(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="tdata-pagination">
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
    
    <!-- 上传TData对话框 -->
    <el-dialog title="上传TData文件" v-model="uploadDialogVisible" width="500px">
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpload" :disabled="!uploadFile">上传</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 导入确认对话框 -->
    <el-dialog title="导入TData文件" v-model="importDialogVisible" width="500px">
      <el-form :model="importForm" label-width="100px" class="import-form">
        <el-form-item label="账号分组" prop="groupId">
          <el-select v-model="importForm.groupId" placeholder="请选择导入后的账号分组">
            <el-option v-for="item in accountGroups" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="importForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入导入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport">导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTdataFiles,
  uploadTdataFile,
  deleteTdataFile,
  importTdataFile,
  checkTdataStatus
} from '@/api/tg/tdata'
import { getAccountGroups } from '@/api/tg/account'

export default defineComponent({
  name: 'TgTdataManager',
  
  setup() {
    // TData列表数据
    const tdataList = ref([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    // 搜索表单
    const searchFormRef = ref(null)
    const searchForm = reactive({
      fileName: '',
      importStatus: ''
    })
    
    // 上传相关
    const uploadDialogVisible = ref(false)
    const uploadFile = ref(null)
    
    // 导入相关
    const importDialogVisible = ref(false)
    const currentTdataId = ref('')
    const importForm = reactive({
      groupId: '',
      remark: ''
    })
    const accountGroups = ref([])
    
    // 获取TData文件列表
    const getTdataList = async () => {
      loading.value = true
      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          ...searchForm
        }
        
        const res = await getTdataFiles(params)
        if (res.code === 0) {
          tdataList.value = res.data.list
          total.value = res.data.total
        } else {
          ElMessage.error(res.message || '获取TData文件列表失败')
        }
      } catch (error) {
        console.error('获取TData文件列表失败:', error)
        ElMessage.error('获取TData文件列表失败')
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
    
    // 搜索TData文件
    const searchTdataFiles = () => {
      page.value = 1
      getTdataList()
    }
    
    // 重置搜索
    const resetSearch = () => {
      searchFormRef.value?.resetFields()
      page.value = 1
      getTdataList()
    }
    
    // 分页相关方法
    const handleSizeChange = (val) => {
      pageSize.value = val
      getTdataList()
    }
    
    const handleCurrentChange = (val) => {
      page.value = val
      getTdataList()
    }
    
    // 显示上传对话框
    const showUploadDialog = () => {
      uploadFile.value = null
      uploadDialogVisible.value = true
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
      uploadFile.value = params.file
      return false // 阻止默认上传行为
    }
    
    // 确认上传
    const confirmUpload = async () => {
      if (!uploadFile.value) {
        ElMessage.warning('请先选择要上传的TData文件')
        return
      }
      
      const formData = new FormData()
      formData.append('file', uploadFile.value)
      
      try {
        const res = await uploadTdataFile(formData)
        if (res.code === 0) {
          ElMessage.success('上传TData文件成功')
          uploadDialogVisible.value = false
          getTdataList()
        } else {
          ElMessage.error(res.message || '上传TData文件失败')
        }
      } catch (error) {
        console.error('上传TData文件失败:', error)
        ElMessage.error('上传TData文件失败')
      }
    }
    
    // 导入TData
    const importTdata = (row) => {
      currentTdataId.value = row.id
      importForm.groupId = ''
      importForm.remark = ''
      importDialogVisible.value = true
      getGroupList()
    }
    
    // 确认导入
    const confirmImport = async () => {
      if (!importForm.groupId) {
        ElMessage.warning('请选择导入后的账号分组')
        return
      }
      
      try {
        const params = {
          id: currentTdataId.value,
          groupId: importForm.groupId,
          remark: importForm.remark
        }
        
        const res = await importTdataFile(params)
        if (res.code === 0) {
          ElMessage.success('TData导入请求已提交，请稍后查看导入状态')
          importDialogVisible.value = false
          getTdataList()
        } else {
          ElMessage.error(res.message || '导入TData文件失败')
        }
      } catch (error) {
        console.error('导入TData文件失败:', error)
        ElMessage.error('导入TData文件失败')
      }
    }
    
    // 检查导入状态
    const checkImportStatus = async (row) => {
      try {
        const res = await checkTdataStatus({ id: row.id })
        if (res.code === 0) {
          const status = getImportStatusText(res.data.importStatus)
          ElMessage.success(`当前导入状态: ${status}`)
          getTdataList()
        } else {
          ElMessage.error(res.message || '检查导入状态失败')
        }
      } catch (error) {
        console.error('检查导入状态失败:', error)
        ElMessage.error('检查导入状态失败')
      }
    }
    
    // 重试导入
    const retryImport = (row) => {
      currentTdataId.value = row.id
      importForm.groupId = row.groupId || ''
      importForm.remark = row.remark || ''
      importDialogVisible.value = true
      getGroupList()
    }
    
    // 查看TData详情
    const viewTdataDetail = (row) => {
      ElMessage.info(`查看TData文件 "${row.fileName}" 的详情将在后续实现`)
    }
    
    // 删除TData确认
    const deleteTdataConfirm = (row) => {
      ElMessageBox.confirm(`确定要删除TData文件"${row.fileName}"吗？此操作不可恢复！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteTdataFile({ id: row.id })
          if (res.code === 0) {
            ElMessage.success('删除TData文件成功')
            getTdataList()
          } else {
            ElMessage.error(res.message || '删除TData文件失败')
          }
        } catch (error) {
          console.error('删除TData文件失败:', error)
          ElMessage.error('删除TData文件失败')
        }
      }).catch(() => {})
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    // 获取导入状态类型对应的Tag类型
    const getImportStatusType = (status) => {
      const statusMap = {
        'notImported': 'info',
        'importing': 'warning',
        'imported': 'success',
        'importFailed': 'danger'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取导入状态文本
    const getImportStatusText = (status) => {
      const statusMap = {
        'notImported': '未导入',
        'importing': '导入中',
        'imported': '已导入',
        'importFailed': '导入失败'
      }
      return statusMap[status] || '未知'
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      getTdataList()
    })
    
    return {
      tdataList,
      loading,
      page,
      pageSize,
      total,
      searchForm,
      searchFormRef,
      uploadDialogVisible,
      uploadFile,
      importDialogVisible,
      importForm,
      accountGroups,
      formatFileSize,
      getImportStatusType,
      getImportStatusText,
      searchTdataFiles,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      showUploadDialog,
      beforeUpload,
      handleUpload,
      confirmUpload,
      importTdata,
      confirmImport,
      checkImportStatus,
      retryImport,
      viewTdataDetail,
      deleteTdataConfirm
    }
  }
})
</script>

<style lang="scss" scoped>
.tdata-container {
  padding: 20px;
  
  .tdata-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .tdata-operation {
      display: flex;
      gap: 10px;
    }
  }
  
  .tdata-search {
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      flex-wrap: wrap;
    }
  }
  
  .tdata-table-card {
    margin-bottom: 20px;
  }
  
  .tdata-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .import-form {
    margin-top: 20px;
  }
}
</style>
