// TG营销系统菜单配置
const tgMenus = [
  {
    path: 'tg',
    name: 'TG',
    component: 'view/routerHolder.vue',
    meta: {
      title: 'TG营销系统',
      icon: 'message'
    },
    children: [
      {
        path: 'dashboard',
        name: 'TgDashboard',
        component: 'view/tg/dashboard/index.vue',
        meta: {
          title: '系统概览',
          icon: 'odometer'
        }
      },
      {
        path: 'telegram-management',
        name: 'TgTelegramManagement',
        component: 'view/tg/telegram-management/index.vue',
        meta: {
          title: 'TG管理',
          icon: 'message'
        },
        children: [
          {
            path: 'account-group',
            name: 'tgAccountGroup',
            meta: {
              title: '账号分组管理'
            },
            component: 'view/tg/telegram/account-group/index.vue'
          },
          {
            path: 'tdata-account',
            name: 'tgTdataAccount',
            meta: {
              title: 'tdata账号管理'
            },
            component: 'view/tg/telegram/tdata-account/index.vue'
          },
          {
            path: 'telegram-number',
            name: 'tgTelegramNumber',
            meta: {
              title: '飞机号管理'
            },
            component: 'view/tg/telegram/telegram-number/index.vue'
          }
        ]
      },
      {
        path: 'task',
        name: 'TgTask',
        component: 'view/tg/task/index.vue',
        meta: {
          title: '任务管理',
          icon: 'copy-document'
        }
      },
      {
        path: 'message',
        name: 'TgMessage',
        component: 'view/tg/message/index.vue',
        meta: {
          title: '消息管理',
          icon: 'chat-dot-round'
        }
      },
      {
        path: 'system-settings',
        name: 'tgSystemSettings',
        component: 'view/tg/system-settings/index.vue',
        meta: {
          title: '系统设置',
          icon: 'setting'
        },
        children: [
          {
            path: 'menu',
            name: 'tgMenuManagement',
            meta: {
              title: '菜单管理'
            },
            component: 'view/tg/system-settings/menu/index.vue'
          },
          {
            path: 'role',
            name: 'tgRoleManagement',
            meta: {
              title: '角色管理'
            },
            component: 'view/tg/system-settings/role/index.vue'
          },
          {
            path: 'user',
            name: 'tgSysUserManagement',
            meta: {
              title: '用户管理'
            },
            component: 'view/tg/system-settings/user/index.vue'
          }
        ]
      }
    ]
  }
]

export default {
  getMenu: () => {
    return {
      code: 0,
      data: {
        menus: tgMenus
      },
      msg: '获取菜单成功'
    }
  }
}
