<template>
  <div class="group-category-container">
    <h1>群组分组管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加分类</el-button>
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
        label="分类名称"
        width="180">
      </el-table-column>
      <el-table-column
        prop="description"
        label="描述">
      </el-table-column>
      <el-table-column
        prop="groupCount"
        label="群组数量"
        width="100">
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
    
    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加分类' : '编辑分类'"
      v-model="dialogVisible"
      width="40%">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            type="textarea" 
            v-model="form.description" 
            placeholder="请输入分类描述"
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看群组对话框 -->
    <el-dialog
      title="分类群组列表"
      v-model="groupsDialogVisible"
      width="70%">
      <div v-if="currentCategory">
        <h3>{{ currentCategory.name }} 分类群组列表</h3>
        <el-table :data="groupsList" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="群组名称" width="180"></el-table-column>
          <el-table-column prop="link" label="邀请链接" width="200"></el-table-column>
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
              <el-button size="small" type="danger" @click="removeFromCategory(scope.row)">移出分类</el-button>
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
  name: 'GroupCategoryManagement',
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
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      currentCategory: null,
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
          name: '技术群组',
          description: '包含各种技术交流群',
          groupCount: 15,
          createTime: '2025-05-01 00:00:00'
        },
        {
          id: 2,
          name: '营销群组',
          description: '用于营销推广的群组分类',
          groupCount: 8,
          createTime: '2025-05-02 10:00:00'
        },
        {
          id: 3,
          name: '社交群组',
          description: '社交和娱乐群组分类',
          groupCount: 12,
          createTime: '2025-05-03 14:30:00'
        }
      ];
      
      this.pagination.total = this.tableData.length;
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
        description: row.description
      };
      this.dialogVisible = true;
      
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
    },
    
    handleDelete(row) {
      this.$confirm('是否确认删除该分类?', '警告', {
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
      
      this.$confirm(`是否确认批量删除选中的${this.selectedRows.length}个分类?`, '警告', {
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
    
    saveCategory() {
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
    
    viewGroups(row) {
      this.currentCategory = row;
      this.groupsDialogVisible = true;
      
      // 获取分类下的群组列表
      // 模拟数据，实际应该调用 API
      if (row.id === 1) {
        this.groupsList = [
          {
            id: 1,
            name: 'Python交流群',
            link: 'https://t.me/python_group',
            memberCount: 520,
            status: 'active'
          },
          {
            id: 2,
            name: 'JavaScript学习群',
            link: 'https://t.me/js_group',
            memberCount: 350,
            status: 'active'
          },
          {
            id: 3,
            name: 'Golang爱好者',
            link: 'https://t.me/golang_group',
            memberCount: 280,
            status: 'active'
          }
        ];
      } else if (row.id === 2) {
        this.groupsList = [
          {
            id: 4,
            name: '数字营销交流',
            link: 'https://t.me/digital_marketing',
            memberCount: 430,
            status: 'active'
          },
          {
            id: 5,
            name: 'SEO优化技术',
            link: 'https://t.me/seo_group',
            memberCount: 210,
            status: 'active'
          }
        ];
      } else {
        this.groupsList = [
          {
            id: 6,
            name: '音乐爱好者',
            link: 'https://t.me/music_lovers',
            memberCount: 620,
            status: 'active'
          },
          {
            id: 7,
            name: '电影交流群',
            link: 'https://t.me/movie_group',
            memberCount: 480,
            status: 'inactive'
          }
        ];
      }
    },
    
    removeFromCategory(group) {
      this.$confirm(`是否确认将群组 ${group.name} 从分类移除?`, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用移除 API
        this.$message({
          type: 'success',
          message: '移除成功!'
        });
        
        // 从列表中移除
        const index = this.groupsList.findIndex(g => g.id === group.id);
        if (index !== -1) {
          this.groupsList.splice(index, 1);
          
          // 更新分类群组数量
          if (this.currentCategory) {
            this.currentCategory.groupCount--;
            const categoryIndex = this.tableData.findIndex(c => c.id === this.currentCategory.id);
            if (categoryIndex !== -1) {
              this.tableData[categoryIndex].groupCount = this.currentCategory.groupCount;
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
.group-category-container {
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
