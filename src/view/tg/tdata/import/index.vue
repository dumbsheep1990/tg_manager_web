<template>
  <div class="import-container">
    <el-card class="import-card">
      <div class="import-header">
        <h3>导入tdata账号</h3>
      </div>
      <el-form :model="formData" ref="formRef" label-width="120px" :rules="rules">
        <el-form-item label="tdata文件" prop="file">
          <el-upload
            class="tdata-upload"
            action=""
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
            :file-list="fileList"
            :show-file-list="true"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传tdata格式文件，且不超过500MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="所属分组" prop="account_group_id">
          <el-select v-model="formData.account_group_id" placeholder="请选择账号分组">
            <el-option
              v-for="group in accountGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="账号等级" prop="account_level">
          <el-slider 
            v-model="formData.account_level" 
            :min="1" 
            :max="3" 
            :marks="{1: '普通', 2: '中级', 3: '高级'}"
            show-stops
          />
          <div class="level-tip">
            <p>等级说明：</p>
            <p>1级 - 普通账号，适用于基础功能</p>
            <p>2级 - 中级账号，适用于群组管理</p>
            <p>3级 - 高级账号，适用于特殊任务</p>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="uploading">导入</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { importTdataAccount } from '@/api/tg/tdata'
import { getAccountGroups } from '@/api/tg/accountGroup'

const router = useRouter()
const formRef = ref(null)
const uploading = ref(false)
const fileList = ref([])
const accountGroups = ref([])

const formData = reactive({
  file: null,
  account_group_id: '',
  account_level: 1,
  status: 'ACTIVE'
})

const rules = {
  file: [
    { required: true, message: '请选择tdata文件', trigger: 'change' }
  ],
  account_group_id: [
    { required: true, message: '请选择账号分组', trigger: 'change' }
  ],
  account_level: [
    { required: true, message: '请选择账号等级', trigger: 'change' }
  ]
}

const handleFileChange = (file) => {
  // 只允许上传tdata文件
  const isAllowed = file.name.includes('tdata')
  if (!isAllowed) {
    ElMessage.error('只能上传tdata文件！')
    fileList.value = []
    return false
  }
  
  // 限制文件大小
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('文件大小不能超过500MB！')
    fileList.value = []
    return false
  }

  formData.file = file.raw
  return true
}

const handleExceed = () => {
  ElMessage.warning('只能上传1个文件！')
}

const handleRemove = () => {
  formData.file = null
}

const loadAccountGroups = async () => {
  try {
    const res = await getAccountGroups({ page: 1, pageSize: 100 })
    if (res.code === 200) {
      accountGroups.value = res.data.account_groups || []
    }
  } catch (err) {
    console.error('获取账号分组失败', err)
    ElMessage.error('获取账号分组失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!formData.file) {
        ElMessage.error('请选择tdata文件')
        return
      }
      
      try {
        uploading.value = true
        
        // 使用FormData提交文件
        const formDataToSubmit = new FormData()
        formDataToSubmit.append('file', formData.file)
        formDataToSubmit.append('account_group_id', formData.account_group_id)
        formDataToSubmit.append('account_level', formData.account_level)
        formDataToSubmit.append('status', formData.status)
        
        const res = await importTdataAccount(formDataToSubmit)
        
        if (res.code === 200) {
          ElMessage.success('tdata账号导入成功，正在处理中')
          router.push('/tg/tdata/list')
        } else {
          ElMessage.error(res.message || '导入失败')
        }
      } catch (err) {
        console.error('导入失败', err)
        ElMessage.error('导入失败')
      } finally {
        uploading.value = false
      }
    }
  })
}

const cancel = () => {
  router.back()
}

onMounted(() => {
  loadAccountGroups()
})
</script>

<style scoped>
.import-container {
  padding: 20px;
}

.import-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.import-header {
  margin-bottom: 20px;
}

.tdata-upload {
  width: 100%;
}

.level-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}
</style>
