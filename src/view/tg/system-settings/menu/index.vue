<template>
  <div class="menu-management-container">
    <h1>菜单管理</h1>
    
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">添加菜单</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </div>
    
    <el-table
      :data="tableData"
      border
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children'}"
      style="width: 100%">
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
        label="菜单名称"
        width="150">
      </el-table-column>
      <el-table-column
        prop="icon"
        label="图标"
        width="80">
        <template #default="scope">
          <i :class="scope.row.icon"></i>
        </template>
      </el-table-column>
      <el-table-column
        prop="path"
        label="路由路径"
        width="180">
      </el-table-column>
      <el-table-column
        prop="sort"
        label="排序"
        width="80">
      </el-table-column>
      <el-table-column
        prop="type"
        label="类型"
        width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 1">菜单</el-tag>
          <el-tag type="success" v-else-if="scope.row.type === 2">按钮</el-tag>
          <el-tag type="warning" v-else>目录</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="permission"
        label="权限标识"
        width="180">
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'">
            {{ scope.row.status ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button v-if="scope.row.type !== 2" size="small" type="primary" @click="addChild(scope.row)">添加子项</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加/编辑菜单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加菜单' : '编辑菜单'"
      v-model="dialogVisible"
      width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTreeData"
            check-strictly
            :render-after-expand="false"
            placeholder="请选择上级菜单">
          </el-tree-select>
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-radio-group v-model="form.type">
            <el-radio :label="0">目录</el-radio>
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="图标" v-if="form.type !== 2">
          <el-input v-model="form.icon" placeholder="请输入图标类名"></el-input>
        </el-form-item>
        <el-form-item label="路由路径" v-if="form.type !== 2" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由路径"></el-input>
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="form.permission" placeholder="请输入权限标识"></el-input>
        </el-form-item>
        <el-form-item label="组件路径" v-if="form.type === 1">
          <el-input v-model="form.component" placeholder="请输入组件路径"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="正常" inactive-text="禁用"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMenu">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MenuManagement',
  data() {
    return {
      tableData: [],
      menuTreeData: [],
      dialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      form: {
        id: undefined,
        parentId: 0,
        name: '',
        icon: '',
        path: '',
        component: '',
        type: 1,
        permission: '',
        sort: 0,
        status: true
      },
      rules: {
        name: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入路由路径', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      // 这里可以调用 API 获取菜单数据
      // 暂时使用模拟数据
      this.tableData = [
        {
          id: 1,
          name: '系统设置',
          icon: 'el-icon-setting',
          path: '/system',
          type: 0,
          permission: '',
          sort: 1,
          status: true,
          children: [
            {
              id: 2,
              name: '菜单管理',
              icon: 'el-icon-menu',
              path: '/system/menu',
              type: 1,
              permission: 'system:menu:list',
              sort: 1,
              status: true,
              children: [
                {
                  id: 6,
                  name: '添加',
                  icon: '',
                  path: '',
                  type: 2,
                  permission: 'system:menu:add',
                  sort: 1,
                  status: true
                },
                {
                  id: 7,
                  name: '编辑',
                  icon: '',
                  path: '',
                  type: 2,
                  permission: 'system:menu:edit',
                  sort: 2,
                  status: true
                },
                {
                  id: 8,
                  name: '删除',
                  icon: '',
                  path: '',
                  type: 2,
                  permission: 'system:menu:delete',
                  sort: 3,
                  status: true
                }
              ]
            },
            {
              id: 3,
              name: '角色管理',
              icon: 'el-icon-user',
              path: '/system/role',
              type: 1,
              permission: 'system:role:list',
              sort: 2,
              status: true
            },
            {
              id: 4,
              name: '用户管理',
              icon: 'el-icon-user',
              path: '/system/user',
              type: 1,
              permission: 'system:user:list',
              sort: 3,
              status: true
            }
          ]
        },
        {
          id: 5,
          name: 'telegram管理',
          icon: 'el-icon-message',
          path: '/telegram',
          type: 0,
          permission: '',
          sort: 2,
          status: true
        }
      ];
      
      // 构建菜单树数据
      this.menuTreeData = this.convertToTreeData(this.tableData);
    },
    
    convertToTreeData(data) {
      return data.map(item => {
        const node = {
          value: item.id,
          label: item.name,
        };
        
        if (item.children && item.children.length > 0) {
          node.children = this.convertToTreeData(item.children);
        }
        
        return node;
      });
    },
    
    openAddDialog() {
      this.dialogType = 'add';
      this.form = {
        parentId: 0,
        name: '',
        icon: '',
        path: '',
        component: '',
        type: 1,
        permission: '',
        sort: 0,
        status: true
      };
      this.dialogVisible = true;
    },
    
    handleEdit(row) {
      this.dialogType = 'edit';
      this.form = { ...row };
      this.dialogVisible = true;
    },
    
    handleDelete(row) {
      this.$confirm('是否确认删除该菜单?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用删除 API
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    
    batchDelete() {
      this.$confirm('是否确认批量删除选中菜单?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用批量删除 API
        this.$message({
          type: 'success',
          message: '批量删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    
    addChild(row) {
      this.dialogType = 'add';
      this.form = {
        parentId: row.id,
        name: '',
        icon: '',
        path: '',
        component: '',
        type: row.type === 0 ? 1 : 2, // 如果父节点是目录，则子节点默认为菜单
        permission: '',
        sort: 0,
        status: true
      };
      this.dialogVisible = true;
    },
    
    saveMenu() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 调用保存 API
          this.$message({
            type: 'success',
            message: this.dialogType === 'add' ? '添加成功!' : '更新成功!'
          });
          this.dialogVisible = false;
          this.fetchData(); // 重新加载数据
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.menu-management-container {
  padding: 20px;
  
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }
}
</style>
