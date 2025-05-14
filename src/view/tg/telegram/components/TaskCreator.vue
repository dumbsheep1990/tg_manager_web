<template>
  <div class="task-creator">
    <el-dialog
      title="创建任务"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="taskForm" :rules="taskRules" ref="taskFormRef" label-width="100px">
        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="taskForm.taskType" placeholder="请选择任务类型" @change="handleTaskTypeChange">
            <el-option v-for="item in taskTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        
        <!-- 发送消息相关的参数 -->
        <template v-if="taskForm.taskType === 'send_message'">
          <el-form-item label="接收者" prop="receiver">
            <el-input v-model="taskForm.params.receiver" placeholder="请输入接收者用户名或手机号" />
          </el-form-item>
          <el-form-item label="消息内容" prop="message">
            <el-input
              v-model="taskForm.params.message"
              type="textarea"
              :rows="4"
              placeholder="请输入要发送的消息内容"
            />
          </el-form-item>
          <el-form-item label="媒体类型" prop="mediaType">
            <el-select v-model="taskForm.params.mediaType" placeholder="请选择媒体类型">
              <el-option label="无" value="none" />
              <el-option label="图片" value="photo" />
              <el-option label="视频" value="video" />
              <el-option label="文件" value="file" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="taskForm.params.mediaType !== 'none'" label="媒体URL" prop="mediaUrl">
            <el-input v-model="taskForm.params.mediaUrl" placeholder="请输入媒体文件URL" />
          </el-form-item>
        </template>
        
        <!-- 加入群组相关的参数 -->
        <template v-if="taskForm.taskType === 'join_group'">
          <el-form-item label="群组链接" prop="groupLink">
            <el-input v-model="taskForm.params.groupLink" placeholder="请输入群组邀请链接" />
          </el-form-item>
        </template>
        
        <!-- 添加联系人相关的参数 -->
        <template v-if="taskForm.taskType === 'add_contact'">
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="taskForm.params.contact" placeholder="请输入联系人用户名或手机号" />
          </el-form-item>
          <el-form-item label="备注名" prop="firstName">
            <el-input v-model="taskForm.params.firstName" placeholder="请输入联系人备注名" />
          </el-form-item>
        </template>
        
        <!-- 提取群成员相关的参数 -->
        <template v-if="taskForm.taskType === 'extract_members'">
          <el-form-item label="群组链接" prop="groupLink">
            <el-input v-model="taskForm.params.groupLink" placeholder="请输入需要提取成员的群组链接" />
          </el-form-item>
          <el-form-item label="最大数量" prop="maxCount">
            <el-input-number v-model="taskForm.params.maxCount" :min="1" :max="10000" />
          </el-form-item>
        </template>
        
        <el-form-item label="超时时间" prop="timeout">
          <el-input-number v-model="taskForm.timeout" :min="30" :max="3600" :step="30" />
          <span class="unit-text">秒</span>
        </el-form-item>
        
        <el-form-item label="执行时间" prop="executeTime">
          <el-radio-group v-model="taskForm.executeType">
            <el-radio label="immediate">立即执行</el-radio>
            <el-radio label="scheduled">定时执行</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="taskForm.executeType === 'scheduled'" label="计划时间" prop="scheduledTime">
          <el-date-picker
            v-model="taskForm.scheduledTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTaskForm">创建任务</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { apiRequest } from '@/utils/telegram-helper'
import { createTask } from '@/api/tg/task'

export default defineComponent({
  name: 'TaskCreator',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedAccounts: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['update:visible', 'task-created'],
  
  setup(props, { emit }) {
    const taskFormRef = ref(null)
    
    // 任务类型列表
    const taskTypes = [
      { label: '发送消息', value: 'send_message' },
      { label: '加入群组', value: 'join_group' },
      { label: '添加联系人', value: 'add_contact' },
      { label: '检查账号', value: 'check_account' },
      { label: '提取群成员', value: 'extract_members' }
    ]
    
    // 任务表单数据
    const taskForm = reactive({
      taskType: 'send_message',
      accountIds: [],
      params: {
        // 发送消息相关
        receiver: '',
        message: '',
        mediaType: 'none',
        mediaUrl: '',
        
        // 加入群组相关
        groupLink: '',
        
        // 添加联系人相关
        contact: '',
        firstName: '',
        
        // 提取成员相关
        maxCount: 100
      },
      timeout: 300, // 默认5分钟超时
      executeType: 'immediate',
      scheduledTime: null
    })
    
    // 表单验证规则
    const taskRules = {
      taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
      'params.receiver': [{ required: true, message: '请输入接收者', trigger: 'blur' }],
      'params.message': [{ required: true, message: '请输入消息内容', trigger: 'blur' }],
      'params.groupLink': [{ required: true, message: '请输入群组链接', trigger: 'blur' }],
      'params.contact': [{ required: true, message: '请输入联系人', trigger: 'blur' }],
      'params.mediaUrl': [{ required: true, message: '请输入媒体URL', trigger: 'blur' }],
      timeout: [{ required: true, message: '请设置超时时间', trigger: 'blur' }],
      scheduledTime: [{ required: true, message: '请选择计划执行时间', trigger: 'change' }]
    }
    
    // 不允许选择过去的日期
    const disabledDate = (time) => {
      return time.getTime() < Date.now()
    }
    
    // 监听对话框可见性变化
    const dialogVisible = ref(props.visible)
    
    // 监听任务类型变化，清空不相关的参数
    const handleTaskTypeChange = (value) => {
      // 清空所有参数
      taskForm.params = {
        receiver: '',
        message: '',
        mediaType: 'none',
        mediaUrl: '',
        groupLink: '',
        contact: '',
        firstName: '',
        maxCount: 100
      }
    }
    
    // 提交任务表单
    const submitTaskForm = async () => {
      if (props.selectedAccounts.length === 0) {
        ElMessage.warning('请先选择需要执行任务的账号')
        return
      }
      
      taskFormRef.value?.validate(async (valid) => {
        if (valid) {
          // 准备提交的数据
          const submitData = {
            taskType: taskForm.taskType,
            accountIds: props.selectedAccounts.map(account => account.id),
            params: { ...taskForm.params },
            timeout: taskForm.timeout
          }
          
          // 如果是定时任务，添加执行时间
          if (taskForm.executeType === 'scheduled' && taskForm.scheduledTime) {
            submitData.scheduledTime = taskForm.scheduledTime
          }
          
          // 发送请求创建任务
          const result = await apiRequest(createTask, submitData, {
            successMessage: '任务创建成功',
            errorMessage: '任务创建失败'
          })
          
          if (result.success) {
            dialogVisible.value = false
            emit('task-created', result.data)
          } else {
            // 开发测试环境下模拟成功
            if (process.env.NODE_ENV === 'development') {
              ElMessage.success('开发环境下模拟任务创建成功')
              dialogVisible.value = false
              emit('task-created', { id: Date.now(), ...submitData })
            }
          }
        }
      })
    }
    
    // 同步props.visible和dialogVisible
    watch(() => props.visible, (val) => {
      dialogVisible.value = val
      if (val) {
        // 显示对话框时重置表单
        nextTick(() => {
          taskFormRef.value?.resetFields()
          taskForm.taskType = 'send_message'
          taskForm.executeType = 'immediate'
          taskForm.scheduledTime = null
          taskForm.timeout = 300
        })
      }
    })
    
    // 同步dialogVisible到父组件
    watch(() => dialogVisible.value, (val) => {
      emit('update:visible', val)
    })
    
    return {
      dialogVisible,
      taskFormRef,
      taskTypes,
      taskForm,
      taskRules,
      disabledDate,
      handleTaskTypeChange,
      submitTaskForm
    }
  }
})
</script>

<style scoped>
.unit-text {
  margin-left: 8px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
