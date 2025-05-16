<template>
  <div class="group-management-container">
    <h1>群组管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">创建群组</el-button>
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
        label="群组名称"
        width="180">
      </el-table-column>
      <el-table-column
        prop="link"
        label="邀请链接"
        width="200">
      </el-table-column>
      <el-table-column
        prop="memberCount"
        label="成员数量"
        width="100">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '活跃' : '已归档' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180">
      </el-table-column>
      <el-table-column
        label="操作"
        width="280">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" type="success" @click="extractMembers(scope.row)">提取成员</el-button>
          <el-button size="small" type="info" @click="viewDetails(scope.row)">详情</el-button>
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
    
    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="dialogType === 'add' ? '创建群组' : '编辑群组'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px">
        <el-form-item label="群组名称">
          <el-input v-model="form.name" placeholder="请输入群组名称"></el-input>
        </el-form-item>
        <el-form-item label="邀请链接">
          <el-input v-model="form.link" placeholder="请输入邀请链接"></el-input>
        </el-form-item>
        <el-form-item label="群组类型">
          <el-radio-group v-model="form.type">
            <el-radio label="group">群组</el-radio>
            <el-radio label="channel">频道</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="archived">已归档</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="请输入群组描述"
            :rows="4">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveGroup">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GroupManagement',
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
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        name: '',
        link: '',
        type: 'group',
        status: 'active',
        description: ''
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      // TODO: Implement API call to fetch groups
      // Mocked data for now
      this.tableData = [
        {
          id: 1,
          name: '测试群组1',
          link: 'https://t.me/testgroup1',
          memberCount: 120,
          status: 'active',
          createTime: '2025-05-10 10:00:00',
        },
        {
          id: 2,
          name: '测试群组2',
          link: 'https://t.me/testgroup2',
          memberCount: 85,
          status: 'active',
          createTime: '2025-05-12 14:30:00',
        },
        {
          id: 3,
          name: '归档群组',
          link: 'https://t.me/archivedgroup',
          memberCount: 50,
          status: 'inactive',
          createTime: '2025-05-01 09:15:00',
        }
      ];
      
      this.pagination.total = this.tableData.length;
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.fetchData();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.fetchData();
    },
    
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    
    openAddDialog() {
      this.dialogType = 'add';
      this.form = {
        name: '',
        link: '',
        type: 'group',
        status: 'active',
        description: ''
      };
      this.dialogVisible = true;
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = {
        id: row.id,
        name: row.name,
        link: row.link,
        type: 'group', // assuming default type
        status: row.status,
        description: '' // assuming no description in the table data
      };
      this.dialogVisible = true;
    },
    
    handleDelete(row) {
      this.$confirm('确定要删除该群组吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to delete group
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
      
      this.$confirm(`确定要删除选中的${this.selectedRows.length}个群组吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: Implement API call to batch delete groups
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
    
    saveGroup() {
      // TODO: Implement API call to save group
      this.$message({
        type: 'success',
        message: this.dialogType === 'add' ? '创建成功!' : '更新成功!'
      });
      this.dialogVisible = false;
      this.fetchData();
    },
    
    extractMembers(row) {
      // TODO: Implement function to extract members from the group
      this.$message({
        type: 'info',
        message: `正在提取群组 "${row.name}" 的成员, 请稍后...`
      });
    },
    
    viewDetails(row) {
      // TODO: Navigate to group details page
      this.$message({
        type: 'info',
        message: `查看群组 "${row.name}" 的详情`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.group-management-container {
  padding: 20px;
  
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
  
  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
