<template>
  <div class="message-container">
    <!-- 使用isSubRoute判断是否显示子路由内容 -->
    <router-view v-if="isSubRoute" />
    
    <!-- 下面内容只在直接访问消息管理页面时显示 -->
    <div v-else>
    <div class="message-header">
      <h3>消息管理</h3>
      <div class="message-operation">
        <el-button type="primary" @click="showAddTemplateDialog">创建模板</el-button>
        <el-button type="success" @click="showSendMessageDialog">发送消息</el-button>
      </div>
    </div>
    
    <el-tabs v-model="activeTab" class="message-tabs">
      <el-tab-pane label="消息模板" name="templates">
        <el-card class="message-search">
          <el-form :inline="true" :model="templateSearchForm" ref="templateSearchFormRef" class="search-form">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="templateSearchForm.templateName" placeholder="请输入模板名称" clearable />
            </el-form-item>
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="templateSearchForm.messageType" placeholder="请选择消息类型" clearable>
                <el-option label="文本消息" value="text" />
                <el-option label="图片消息" value="image" />
                <el-option label="视频消息" value="video" />
                <el-option label="文件消息" value="file" />
                <el-option label="混合消息" value="mixed" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchTemplates">查询</el-button>
              <el-button @click="resetTemplateSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="template-list">
          <el-table
            :data="templateList"
            v-loading="templateLoading"
            style="width: 100%"
            border
            stripe
          >
            <el-table-column prop="templateName" label="模板名称" min-width="120" />
            <el-table-column prop="messageType" label="消息类型" width="100">
              <template #default="scope">
                <el-tag :type="getMessageTypeTag(scope.row.messageType)">
                  {{ getMessageTypeText(scope.row.messageType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="preview" label="预览" min-width="200" />
            <el-table-column prop="createTime" label="创建时间" width="170" />
            <el-table-column prop="updateTime" label="更新时间" width="170" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="editTemplate(scope.row)">编辑</el-button>
                <el-button size="small" type="success" @click="useTemplate(scope.row)">使用</el-button>
                <el-button size="small" type="danger" @click="deleteTemplateConfirm(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="template-pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :current-page="templatePage"
              :page-size="templatePageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="templateTotal"
              @size-change="handleTemplateSizeChange"
              @current-change="handleTemplateCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="发送历史" name="history">
        <el-card class="message-search">
          <el-form :inline="true" :model="historySearchForm" ref="historySearchFormRef" class="search-form">
            <el-form-item label="任务名称" prop="taskName">
              <el-input v-model="historySearchForm.taskName" placeholder="请输入任务名称" clearable />
            </el-form-item>
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="historySearchForm.messageType" placeholder="请选择消息类型" clearable>
                <el-option label="文本消息" value="text" />
                <el-option label="图片消息" value="image" />
                <el-option label="视频消息" value="video" />
                <el-option label="文件消息" value="file" />
                <el-option label="混合消息" value="mixed" />
              </el-select>
            </el-form-item>
            <el-form-item label="发送状态" prop="status">
              <el-select v-model="historySearchForm.status" placeholder="请选择发送状态" clearable>
                <el-option label="成功" value="success" />
                <el-option label="失败" value="failed" />
                <el-option label="处理中" value="processing" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchHistory">查询</el-button>
              <el-button @click="resetHistorySearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="history-list">
          <el-table
            :data="historyList"
            v-loading="historyLoading"
            style="width: 100%"
            border
            stripe
          >
            <el-table-column prop="taskName" label="任务名称" min-width="120" />
            <el-table-column prop="messageType" label="消息类型" width="100">
              <template #default="scope">
                <el-tag :type="getMessageTypeTag(scope.row.messageType)">
                  {{ getMessageTypeText(scope.row.messageType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="targetCount" label="目标数量" width="100" />
            <el-table-column prop="successCount" label="成功数量" width="100" />
            <el-table-column prop="failCount" label="失败数量" width="100" />
            <el-table-column prop="sendTime" label="发送时间" width="170" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="viewMessageDetail(scope.row)">详情</el-button>
                <el-button 
                  v-if="scope.row.status === 'failed'" 
                  size="small" 
                  type="warning" 
                  @click="retrySendMessage(scope.row)"
                >
                  重试
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="history-pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :current-page="historyPage"
              :page-size="historyPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="historyTotal"
              @size-change="handleHistorySizeChange"
              @current-change="handleHistoryCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import {
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  getMessageHistory,
  getMessageDetail,
  sendMessage,
  retrySendMessage
} from '@/api/message'

export default defineComponent({
  name: 'TgMessageManager',
  
  setup() {
    const route = useRoute()
    
    // 判断是否为子路由，目前消息管理未配置子路由，但预留此功能以便将来扩展
    const isSubRoute = computed(() => {
      // 如果将来添加了子路由，在这里添加路径判断
      return false
    })
    
    const activeTab = ref('templates')
    
    // 模板列表数据
    const templateList = ref([])
    const templateLoading = ref(false)
    const templatePage = ref(1)
    const templatePageSize = ref(10)
    const templateTotal = ref(0)
    
    // 模板搜索表单
    const templateSearchFormRef = ref(null)
    const templateSearchForm = reactive({
      templateName: '',
      messageType: ''
    })
    
    // 历史记录数据
    const historyList = ref([])
    const historyLoading = ref(false)
    const historyPage = ref(1)
    const historyPageSize = ref(10)
    const historyTotal = ref(0)
    
    // 历史搜索表单
    const historySearchFormRef = ref(null)
    const historySearchForm = reactive({
      taskName: '',
      messageType: '',
      status: ''
    })
    
    // 获取模板列表
    const getTemplateList = async () => {
      templateLoading.value = true
      try {
        const params = {
          page: templatePage.value,
          pageSize: templatePageSize.value,
          ...templateSearchForm
        }
        
        const res = await getMessageTemplates(params)
        if (res.code === 0) {
          templateList.value = res.data.list
          templateTotal.value = res.data.total
        } else {
          ElMessage.error(res.message || '获取消息模板列表失败')
        }
      } catch (error) {
        console.error('获取消息模板列表失败:', error)
        ElMessage.error('获取消息模板列表失败')
      } finally {
        templateLoading.value = false
      }
    }
    
    // 获取历史记录列表
    const getHistoryList = async () => {
      historyLoading.value = true
      try {
        const params = {
          page: historyPage.value,
          pageSize: historyPageSize.value,
          ...historySearchForm
        }
        
        const res = await getMessageHistory(params)
        if (res.code === 0) {
          historyList.value = res.data.list
          historyTotal.value = res.data.total
        } else {
          ElMessage.error(res.message || '获取消息发送历史失败')
        }
      } catch (error) {
        console.error('获取消息发送历史失败:', error)
        ElMessage.error('获取消息发送历史失败')
      } finally {
        historyLoading.value = false
      }
    }
    
    // 搜索模板
    const searchTemplates = () => {
      templatePage.value = 1
      getTemplateList()
    }
    
    // 重置模板搜索
    const resetTemplateSearch = () => {
      templateSearchFormRef.value?.resetFields()
      templatePage.value = 1
      getTemplateList()
    }
    
    // 搜索历史
    const searchHistory = () => {
      historyPage.value = 1
      getHistoryList()
    }
    
    // 重置历史搜索
    const resetHistorySearch = () => {
      historySearchFormRef.value?.resetFields()
      historyPage.value = 1
      getHistoryList()
    }
    
    // 模板分页相关方法
    const handleTemplateSizeChange = (val) => {
      templatePageSize.value = val
      getTemplateList()
    }
    
    const handleTemplateCurrentChange = (val) => {
      templatePage.value = val
      getTemplateList()
    }
    
    // 历史分页相关方法
    const handleHistorySizeChange = (val) => {
      historyPageSize.value = val
      getHistoryList()
    }
    
    const handleHistoryCurrentChange = (val) => {
      historyPage.value = val
      getHistoryList()
    }
    
    // 显示添加模板对话框
    const showAddTemplateDialog = () => {
      ElMessage.info('创建消息模板功能将在后续实现')
    }
    
    // 显示发送消息对话框
    const showSendMessageDialog = () => {
      ElMessage.info('发送消息功能将在后续实现')
    }
    
    // 编辑模板
    const editTemplate = (row) => {
      ElMessage.info(`编辑模板 "${row.templateName}" 功能将在后续实现`)
    }
    
    // 使用模板
    const useTemplate = (row) => {
      ElMessage.info(`使用模板 "${row.templateName}" 功能将在后续实现`)
    }
    
    // 删除模板确认
    const deleteTemplateConfirm = (row) => {
      ElMessageBox.confirm(`确定要删除模板"${row.templateName}"吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteMessageTemplate({ id: row.id })
          if (res.code === 0) {
            ElMessage.success('删除模板成功')
            getTemplateList()
          } else {
            ElMessage.error(res.message || '删除模板失败')
          }
        } catch (error) {
          console.error('删除模板失败:', error)
          ElMessage.error('删除模板失败')
        }
      }).catch(() => {})
    }
    
    // 查看消息详情
    const viewMessageDetail = (row) => {
      ElMessage.info(`查看消息详情功能将在后续实现`)
    }
    
    // 重试发送消息
    const retrySendMessage = (row) => {
      ElMessage.info(`重试发送消息功能将在后续实现`)
    }
    
    // 获取消息类型对应的Tag类型
    const getMessageTypeTag = (type) => {
      const typeMap = {
        'text': 'info',
        'image': 'success',
        'video': 'warning',
        'file': 'primary',
        'mixed': 'danger'
      }
      return typeMap[type] || 'info'
    }
    
    // 获取消息类型文本
    const getMessageTypeText = (type) => {
      const typeMap = {
        'text': '文本消息',
        'image': '图片消息',
        'video': '视频消息',
        'file': '文件消息',
        'mixed': '混合消息'
      }
      return typeMap[type] || '其他'
    }
    
    // 获取状态类型对应的Tag类型
    const getStatusType = (status) => {
      const statusMap = {
        'success': 'success',
        'failed': 'danger',
        'processing': 'warning'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'success': '成功',
        'failed': '失败',
        'processing': '处理中'
      }
      return statusMap[status] || '未知'
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      getTemplateList()
      getHistoryList()
    })
    
    return {
      isSubRoute,
      activeTab,
      templateList,
      templateLoading,
      templatePage,
      templatePageSize,
      templateTotal,
      templateSearchForm,
      templateSearchFormRef,
      historyList,
      historyLoading,
      historyPage,
      historyPageSize,
      historyTotal,
      historySearchForm,
      historySearchFormRef,
      getMessageTypeTag,
      getMessageTypeText,
      getStatusType,
      getStatusText,
      searchTemplates,
      resetTemplateSearch,
      searchHistory,
      resetHistorySearch,
      handleTemplateSizeChange,
      handleTemplateCurrentChange,
      handleHistorySizeChange,
      handleHistoryCurrentChange,
      showAddTemplateDialog,
      showSendMessageDialog,
      editTemplate,
      useTemplate,
      deleteTemplateConfirm,
      viewMessageDetail,
      retrySendMessage
    }
  }
})
</script>

<style lang="scss" scoped>
.message-container {
  padding: 20px;
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .message-operation {
      display: flex;
      gap: 10px;
    }
  }
  
  .message-tabs {
    margin-bottom: 20px;
  }
  
  .message-search {
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      flex-wrap: wrap;
    }
  }
  
  .template-list,
  .history-list {
    margin-bottom: 20px;
  }
  
  .template-pagination,
  .history-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
