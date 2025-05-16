<template>
  <div class="telegram-number-container">
    <h1>飞机号管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加飞机号</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
      <el-button type="success" @click="importNumbers">批量导入</el-button>
      <el-button type="warning" @click="exportNumbers">导出数据</el-button>
    </div>
    
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="id"
        label="ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="手机号"
        width="150">
      </el-table-column>
      <el-table-column
        prop="country"
        label="国家/地区"
        width="120">
      </el-table-column>
      <el-table-column
        prop="provider"
        label="提供商"
        width="120">
      </el-table-column>
      <el-table-column
        prop="username"
        label="用户名"
        width="150">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="bindTime"
        label="绑定时间"
        width="180">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180">
      </el-table-column>
      <el-table-column
        label="操作"
        width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="warning" @click="handleUnbind(scope.row)" v-if="scope.row.status === 'bound'">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total">
    </el-pagination>
    
    <!-- 添加/编辑飞机号对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加飞机号' : '编辑飞机号'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="国家/地区" prop="country">
          <el-select v-model="form.country" placeholder="请选择国家/地区" filterable>
            <el-option
              v-for="item in countryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提供商" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择提供商">
            <el-option
              v-for="item in providerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="未绑定" value="unbound"></el-option>
            <el-option label="已绑定" value="bound"></el-option>
            <el-option label="已禁用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            type="textarea" 
            v-model="form.remark" 
            placeholder="请输入备注"
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNumber">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量导入对话框 -->
    <el-dialog
      title="批量导入飞机号"
      v-model="importDialogVisible"
      width="50%">
      <el-form label-width="120px">
        <el-form-item label="导入方式">
          <el-radio-group v-model="importForm.type">
            <el-radio label="file">文件导入</el-radio>
            <el-radio label="text">文本导入</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="importForm.type === 'file'">
          <el-form-item label="Excel文件">
            <el-upload
              class="upload-demo"
              action="#"
              :http-request="uploadFile"
              :auto-upload="false"
              :limit="1"
              accept=".xlsx,.xls,.csv"
              :file-list="importForm.fileList"
              :on-change="handleFileChange">
              <template #trigger>
                <el-button type="primary">选择文件</el-button>
              </template>
              <template #tip>
                <div class="el-upload__tip">请上传 Excel 文件 (.xlsx, .xls, .csv)</div>
              </template>
            </el-upload>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="飞机号列表">
            <el-input
              type="textarea"
              v-model="importForm.content"
              placeholder="请输入飞机号列表，每行一个，格式：手机号,国家,提供商"
              :rows="10">
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport">确认导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TelegramNumberManagement',
  data() {
    return {
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      dialogVisible: false,
      importDialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        phoneNumber: '',
        country: '',
        provider: '',
        username: '',
        status: 'unbound',
        remark: ''
      },
      rules: {
        phoneNumber: [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ],
        country: [
          { required: true, message: '请选择国家/地区', trigger: 'change' }
        ],
        provider: [
          { required: true, message: '请选择提供商', trigger: 'change' }
        ]
      },
      importForm: {
        type: 'file',
        fileList: [],
        content: ''
      },
      countryOptions: [
        { value: 'CN', label: '中国' },
        { value: 'US', label: '美国' },
        { value: 'UK', label: '英国' },
        { value: 'RU', label: '俄罗斯' },
        { value: 'IN', label: '印度' }
      ],
      providerOptions: [
        { value: 'provider1', label: '提供商1' },
        { value: 'provider2', label: '提供商2' },
        { value: 'provider3', label: '提供商3' }
      ]
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      // 模拟数据，实际应该调用 API
      this.tableData = [
        {
          id: 1,
          phoneNumber: '+1234567890',
          country: 'US',
          provider: 'provider1',
          username: 'user1',
          status: 'bound',
          bindTime: '2025-05-10 14:30:00',
          createTime: '2025-05-01 00:00:00'
        },
        {
          id: 2,
          phoneNumber: '+8612345678901',
          country: 'CN',
          provider: 'provider2',
          username: '',
          status: 'unbound',
          bindTime: '',
          createTime: '2025-05-02 10:00:00'
        },
        {
          id: 3,
          phoneNumber: '+447700900123',
          country: 'UK',
          provider: 'provider3',
          username: 'user3',
          status: 'disabled',
          bindTime: '2025-05-08 16:45:00',
          createTime: '2025-05-03 14:30:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    getStatusType(status) {
      const statusMap = {
        'bound': 'success',
        'unbound': 'info',
        'disabled': 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    getStatusText(status) {
      const statusMap = {
        'bound': '已绑定',
        'unbound': '未绑定',
        'disabled': '已禁用'
      };
      return statusMap[status] || '未知';
    },
    
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.fetchData();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchData();
    },
    
    openAddDialog() {
      this.dialogType = 'add';
      this.form = {
        phoneNumber: '',
        country: '',
        provider: '',
        username: '',
        status: 'unbound',
        remark: ''
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = { 
        id: row.id,
        phoneNumber: row.phoneNumber,
        country: row.country,
        provider: row.provider,
        username: row.username,
        status: row.status,
        remark: ''
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    saveNumber() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 调用保存 API
          this.$message({
            type: 'success',
            message: this.dialogType === 'add' ? '添加成功!' : '更新成功!'
          });
          this.dialogVisible = false;
          this.fetchData();
        } else {
          return false;
        }
      });
    },
    
    handleDelete(row) {
      this.$confirm('是否确认删除该飞机号?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用删除 API
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        this.fetchData();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录');
        return;
      }
      
      this.$confirm(`是否确认批量删除选中的${this.selectedRows.length}个飞机号?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用批量删除 API
        this.$message({
          type: 'success',
          message: '批量删除成功!'
        });
        this.fetchData();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    
    handleUnbind(row) {
      this.$confirm(`是否确认解绑飞机号 ${row.phoneNumber}?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用解绑 API
        const index = this.tableData.findIndex(item => item.id === row.id);
        if (index !== -1) {
          this.tableData[index].status = 'unbound';
          this.tableData[index].username = '';
          this.tableData[index].bindTime = '';
        }
        
        this.$message({
          type: 'success',
          message: '解绑成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消解绑'
        });          
      });
    },
    
    importNumbers() {
      this.importForm = {
        type: 'file',
        fileList: [],
        content: ''
      };
      this.importDialogVisible = true;
    },
    
    handleFileChange(file) {
      // 文件变更时触发，可以做一些验证
      console.log('File changed:', file);
    },
    
    uploadFile(option) {
      // 这里实际应该调用上传 API
      console.log('Upload file:', option.file);
      return { status: 'success' };
    },
    
    confirmImport() {
      if (this.importForm.type === 'file' && this.importForm.fileList.length === 0) {
        this.$message.warning('请选择要导入的文件');
        return;
      }
      
      if (this.importForm.type === 'text' && !this.importForm.content.trim()) {
        this.$message.warning('请输入要导入的飞机号列表');
        return;
      }
      
      // 这里实际应该调用导入 API
      this.$message({
        type: 'success',
        message: '飞机号导入成功!'
      });
      this.importDialogVisible = false;
      this.fetchData();
    },
    
    exportNumbers() {
      if (this.selectedRows.length === 0) {
        this.$confirm('是否导出所有飞机号数据?', '提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          // 调用导出全部 API
          this.$message({
            type: 'success',
            message: '导出请求已提交，文件将很快准备好!'
          });
        }).catch(() => {});
      } else {
        // 调用导出选中 API
        this.$message({
          type: 'success',
          message: `已选中${this.selectedRows.length}个飞机号，导出文件将很快准备好!`
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.telegram-number-container {
  padding: 20px;
  
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }
  
  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
