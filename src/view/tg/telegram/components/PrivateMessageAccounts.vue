<template>
  <div class="private-accounts">
    <StatusMonitor accountType="private" />
    
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
            <el-option label="私聊" value="private" />
            <el-option label="群发" value="group" />
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
      <el-button :class="{ active: activeSubTab === 'privateMsg' }" @click="activeSubTab = 'privateMsg'">私信记录</el-button>
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
      <el-table-column prop="lastLoginTime" label="登录时间" width="170" />
      <el-table-column prop="countryCode" label="所属地区" width="100" />
      <el-table-column prop="remark" label="备注" min-width="150" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editAccount(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteAccountConfirm(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-table
      v-else
      :data="messageList"
      v-loading="messageLoading"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="phoneNumber" label="账号手机号" width="150" />
      <el-table-column prop="targetUser" label="目标用户" width="120" />
      <el-table-column prop="messageType" label="消息类型" width="100" />
      <el-table-column prop="messageContent" label="消息内容" min-width="200" />
      <el-table-column prop="sendTime" label="发送时间" width="170" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewMessageDetail(scope.row)">查看</el-button>
          <el-button type="danger" size="small" @click="deleteMessageConfirm(scope.row)">删除</el-button>
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
      :title="dialogType === 'add' ? '添加私信账号' : '编辑私信账号'"
      v-model="accountDialogVisible"
      width="550px"
    >
      <el-form :model="accountForm" :rules="accountRules" ref="accountFormRef" label-width="100px">
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="accountForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="账号用途" prop="accountType">
          <el-select v-model="accountForm.accountType" placeholder="请选择账号用途">
            <el-option label="私聊" value="private" />
            <el-option label="群发" value="group" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标用户" prop="targetUser">
          <el-input v-model="accountForm.targetUser" placeholder="请输入目标用户" />
        </el-form-item>
        <el-form-item label="IP类型" prop="ipType">
          <el-select v-model="accountForm.ipType" placeholder="请选择IP类型">
            <el-option label="国内" value="domestic" />
            <el-option label="国外" value="foreign" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属地区" prop="countryCode">
          <el-select v-model="accountForm.countryCode" placeholder="请选择所属地区">
            <el-option label="中国" value="CN" />
            <el-option label="美国" value="US" />
            <el-option label="俄罗斯" value="RU" />
            <el-option label="其他" value="OTHER" />
          </el-select>
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
    <el-dialog title="导入私信账号" v-model="importDialogVisible" width="500px">
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
    
    <!-- 消息详情对话框 -->
    <el-dialog title="消息详情" v-model="messageDetailVisible" width="600px">
      <div v-if="currentMessage" class="message-detail">
        <div class="detail-item">
          <span class="detail-label">发送账号:</span>
          <span class="detail-value">{{ currentMessage.phoneNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">目标用户:</span>
          <span class="detail-value">{{ currentMessage.targetUser }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">消息类型:</span>
          <span class="detail-value">{{ currentMessage.messageType }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发送时间:</span>
          <span class="detail-value">{{ currentMessage.sendTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <span class="detail-value">
            <el-tag :type="getStatusTagType(currentMessage.status)">
              {{ getStatusText(currentMessage.status) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item content-item">
          <span class="detail-label">消息内容:</span>
          <div class="detail-content">{{ currentMessage.messageContent }}</div>
        </div>
      </div>
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
  getPrivateMessageAccounts,
  createPrivateMessageAccount,
  updatePrivateMessageAccount,
  deletePrivateMessageAccount,
  getPrivateMessageAccountStatus
} from '@/api/tg/telegram'
import {
  formatPhoneNumber,
  getStatusTagType,
  getStatusText,
  getIpTypeText,
  apiRequest,
  generateMockAccounts,
  generateMockMessages
} from '@/utils/telegram-helper'
import StatusMonitor from './StatusMonitor.vue'
import TaskCreator from './TaskCreator.vue'

export default defineComponent({
  name: 'PrivateMessageAccounts',
  
  components: {
    StatusMonitor,
    TaskCreator
  },
  
  setup() {
    // 账号列表数据
    const accountList = ref([])
    const messageList = ref([])
    const loading = ref(false)
    const messageLoading = ref(false)
    
    // ...
    const handleSelectionChange = (val) => {
      selectedRows.value = val
    }
    // ...
    const showTaskDialog = () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择需要执行任务的账号')
        return
      }
      taskDialogVisible.value = true
    }
    // ...
    const handleTaskCreated = (task) => {
      ElMessage.success(`成功创建 ${task.taskType} 任务`)
      // 可以在这里添加其他逻辑，例如刷新任务列表等
    }
    // ...
    return {
      // ...
      selectedRows,
      hasSelectedAccounts,
      handleSelectionChange,
      showTaskDialog,
      handleTaskCreated,
      // ...
      currentMessage,
      getAccountList,
      getMessageList,
      searchAccounts,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      showAddAccountDialog,
      editAccount,
      submitAccountForm,
      deleteAccountConfirm,
      viewMessageDetail,
      deleteMessageConfirm,
      showImportDialog,
      beforeUpload,
      handleUpload,
      confirmImport,
      getStatusText,
      getStatusTagType,
      getAccountTypeText,
      getIpTypeText,
      watchTabChange
    }
  }
})
</script>

<style scoped>
.private-accounts {
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

.message-detail {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
}

.detail-label {
  width: 80px;
  font-weight: bold;
  color: #606266;
}

.detail-value {
  flex: 1;
}

.content-item {
  display: block;
}

.detail-content {
  margin-top: 10px;
  padding: 10px;
  background-color: #f7f7f7;
  border-radius: 4px;
  min-height: 80px;
}
</style>
