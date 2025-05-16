<template>
  <div class="group-tag-container">
    <h1>群组标签管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加标签</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
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
        prop="name"
        label="标签名称"
        width="150">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.type)" effect="dark">
            {{ scope.row.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="标签类型"
        width="120">
      </el-table-column>
      <el-table-column
        prop="groupCount"
        label="使用数量"
        width="100">
      </el-table-column>
      <el-table-column
        prop="description"
        label="标签描述">
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
          <el-button size="small" type="primary" @click="viewGroups(scope.row)">查看群组</el-button>
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
    
    <!-- 添加/编辑标签对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加标签' : '编辑标签'"
      v-model="dialogVisible"
      width="40%">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
        <el-form-item label="标签类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择标签类型">
            <el-option label="行业" value="industry"></el-option>
            <el-option label="地区" value="region"></el-option>
            <el-option label="规模" value="size"></el-option>
            <el-option label="活跃度" value="activity"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="form.color"></el-color-picker>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            type="textarea" 
            v-model="form.description" 
            placeholder="请输入标签描述"
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTag">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看群组对话框 -->
    <el-dialog
      title="标签群组列表"
      v-model="groupsDialogVisible"
      width="70%">
      <div v-if="currentTag">
        <h3>
          <el-tag :type="getTagType(currentTag.type)" effect="dark">{{ currentTag.name }}</el-tag>
          标签群组列表
        </h3>
        <el-table :data="groupsList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="群组名称" width="180"></el-table-column>
          <el-table-column prop="category" label="分类" width="120"></el-table-column>
          <el-table-column prop="memberCount" label="成员数量" width="100"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '活跃' : '已归档' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" type="danger" @click="removeTag(scope.row)">移除标签</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupsDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GroupTagManagement',
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
      groupsDialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        name: '',
        type: '',
        color: '#409EFF',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择标签类型', trigger: 'change' }
        ]
      },
      currentTag: null,
      groupsList: []
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
          name: '技术',
          type: 'industry',
          groupCount: 25,
          description: '技术相关群组标签',
          createTime: '2025-05-01 00:00:00'
        },
        {
          id: 2,
          name: '中国',
          type: 'region',
          groupCount: 38,
          description: '中国地区群组',
          createTime: '2025-05-02 10:00:00'
        },
        {
          id: 3,
          name: '大型群',
          type: 'size',
          groupCount: 15,
          description: '1000人以上的大型群组',
          createTime: '2025-05-03 14:30:00'
        },
        {
          id: 4,
          name: '高活跃',
          type: 'activity',
          groupCount: 12,
          description: '每日发言量超过500条的群组',
          createTime: '2025-05-04 09:15:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    getTagType(type) {
      const typeMap = {
        'industry': 'primary',
        'region': 'success',
        'size': 'warning',
        'activity': 'danger',
        'custom': 'info'
      };
      return typeMap[type] || 'info';
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
        name: '',
        type: '',
        color: '#409EFF',
        description: ''
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
        name: row.name,
        type: row.type,
        color: '#409EFF', // 假设颜色
        description: row.description
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    saveTag() {
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
      this.$confirm('是否确认删除该标签?', '警告', {
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
      
      this.$confirm(`是否确认批量删除选中的${this.selectedRows.length}个标签?`, '警告', {
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
    
    viewGroups(row) {
      this.currentTag = row;
      this.groupsDialogVisible = true;
      
      // 获取标签下的群组列表
      // 模拟数据，实际应该调用 API
      if (row.type === 'industry') {
        this.groupsList = [
          {
            id: 1,
            name: 'Python交流群',
            category: '技术群组',
            memberCount: 520,
            status: 'active'
          },
          {
            id: 2,
            name: 'JavaScript学习群',
            category: '技术群组',
            memberCount: 350,
            status: 'active'
          },
          {
            id: 3,
            name: 'Golang爱好者',
            category: '技术群组',
            memberCount: 280,
            status: 'active'
          }
        ];
      } else if (row.type === 'region') {
        this.groupsList = [
          {
            id: 4,
            name: '北京交友群',
            category: '社交群组',
            memberCount: 1200,
            status: 'active'
          },
          {
            id: 5,
            name: '上海IT人',
            category: '技术群组',
            memberCount: 850,
            status: 'active'
          },
          {
            id: 6,
            name: '广州美食分享',
            category: '社交群组',
            memberCount: 650,
            status: 'active'
          }
        ];
      } else {
        this.groupsList = [
          {
            id: 7,
            name: 'AI大模型讨论组',
            category: '技术群组',
            memberCount: 1500,
            status: 'active'
          },
          {
            id: 8,
            name: '全球数字游民',
            category: '社交群组',
            memberCount: 2300,
            status: 'active'
          }
        ];
      }
    },
    
    removeTag(group) {
      this.$confirm(`是否确认将标签 ${this.currentTag.name} 从群组 ${group.name} 移除?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用移除标签 API
        this.$message({
          type: 'success',
          message: '移除标签成功!'
        });
        
        // 从列表中移除
        const index = this.groupsList.findIndex(g => g.id === group.id);
        if (index !== -1) {
          this.groupsList.splice(index, 1);
          
          // 更新标签使用数量
          if (this.currentTag) {
            this.currentTag.groupCount--;
            const tagIndex = this.tableData.findIndex(t => t.id === this.currentTag.id);
            if (tagIndex !== -1) {
              this.tableData[tagIndex].groupCount = this.currentTag.groupCount;
            }
          }
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消移除'
        });          
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.group-tag-container {
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
