// TG营销系统路由配置

const tgRouter = {
  path: 'tg',
  name: 'TG',  // 与menu.js中的菜单定义保持一致
  meta: {
    title: 'TG营销系统',
    icon: 'message'
  },
  component: () => import('@/view/routerHolder.vue'),
  children: [
    {
      path: 'dashboard',
      name: 'TgDashboard',
      meta: {
        title: '系统概览',
        icon: 'odometer'
      },
      component: () => import('@/view/tg/dashboard/index.vue')
    },
    {
      path: 'home',
      name: 'tgHome',
      meta: {
        title: '首页',
        icon: 'home'
      },
      component: () => import('@/view/tg/home/index.vue')
    },
    {
      path: 'system-settings',
      name: 'tgSystemSettings',
      meta: {
        title: '系统设置',
        icon: 'setting'
      },
      component: () => import('@/view/tg/system-settings/index.vue'),
      children: [
        {
          path: 'menu',
          name: 'tgMenuManagement',
          meta: {
            title: '菜单管理'
          },
          component: () => import('@/view/tg/system-settings/menu/index.vue')
        },
        {
          path: 'role',
          name: 'tgRoleManagement',
          meta: {
            title: '角色管理'
          },
          component: () => import('@/view/tg/system-settings/role/index.vue')
        },
        {
          path: 'user',
          name: 'tgSysUserManagement',
          meta: {
            title: '用户管理'
          },
          component: () => import('@/view/tg/system-settings/user/index.vue')
        }
      ]
    },
    {
      path: 'telegram',
      name: 'tgTelegram',
      meta: {
        title: 'telegram管理',
        icon: 'message'
      },
      component: () => import('@/view/tg/telegram/index.vue'),
      children: [
        {
          path: 'account-group',
          name: 'tgAccountGroup',
          meta: {
            title: '账号分组管理'
          },
          component: () => import('@/view/tg/telegram/account-group/index.vue')
        },
        {
          path: 'tdata-account',
          name: 'tgTdataAccount',
          meta: {
            title: 'tdata账号管理'
          },
          component: () => import('@/view/tg/telegram/tdata-account/index.vue')
        },
        {
          path: 'telegram-number',
          name: 'tgTelegramNumber',
          meta: {
            title: '飞机号管理'
          },
          component: () => import('@/view/tg/telegram/telegram-number/index.vue')
        }
      ]
    },
    {
      path: 'group',
      name: 'tgGroup',
      meta: {
        title: '群组管理',
        icon: 'group'
      },
      component: () => import('@/view/tg/group/index.vue'),
      children: [
        {
          path: 'keyword-task',
          name: 'tgKeywordGroupTask',
          meta: {
            title: '获取关键词群组任务'
          },
          component: () => import('@/view/tg/group/keyword-task/index.vue')
        },
        {
          path: 'group-category',
          name: 'tgGroupCategory',
          meta: {
            title: '群组分组管理'
          },
          component: () => import('@/view/tg/group/group-category/index.vue')
        },
        {
          path: 'group-tag',
          name: 'tgGroupTag',
          meta: {
            title: '群组标签管理'
          },
          component: () => import('@/view/tg/group/group-tag/index.vue')
        },
        {
          path: 'group-management',
          name: 'tgGroupList',
          meta: {
            title: '群组管理'
          },
          component: () => import('@/view/tg/group/group-management/index.vue')
        }
      ]
    },
    {
      path: 'user',
      name: 'tgUser',
      meta: {
        title: '用户管理',
        icon: 'user'
      },
      component: () => import('@/view/tg/user/index.vue'),
      children: [
        {
          path: 'user-tag',
          name: 'tgUserTag',
          meta: {
            title: '用户标签'
          },
          component: () => import('@/view/tg/user/user-tag/index.vue')
        },
        {
          path: 'user-management',
          name: 'tgUserList',
          meta: {
            title: '用户管理'
          },
          component: () => import('@/view/tg/user/user-management/index.vue')
        },
        {
          path: 'user-group',
          name: 'tgUserGroup',
          meta: {
            title: '用户分组管理'
          },
          component: () => import('@/view/tg/user/user-group/index.vue')
        }
      ]
    },
    {
      path: 'message',
      name: 'tgMessage',
      meta: {
        title: '消息管理',
        icon: 'chat-dot-round'
      },
      component: () => import('@/view/tg/message/index.vue')
    },
    {
      path: 'task',
      name: 'tgTask',
      meta: {
        title: '任务管理',
        icon: 'list'
      },
      component: () => import('@/view/tg/task/index.vue'),
      children: [
        {
          path: 'send-message',
          name: 'tgSendMessageTask',
          meta: {
            title: '发送消息任务'
          },
          component: () => import('@/view/tg/task/send-message/index.vue')
        },
        {
          path: 'join-group',
          name: 'tgJoinGroupTask',
          meta: {
            title: '加入群组任务'
          },
          component: () => import('@/view/tg/task/join-group/index.vue')
        },
        {
          path: 'add-contact',
          name: 'tgAddContactTask',
          meta: {
            title: '添加联系人任务'
          },
          component: () => import('@/view/tg/task/add-contact/index.vue')
        },
        {
          path: 'extract-members',
          name: 'tgExtractMembersTask',
          meta: {
            title: '提取成员任务'
          },
          component: () => import('@/view/tg/task/extract-members/index.vue')
        },
        {
          path: 'check-account',
          name: 'tgCheckAccountTask',
          meta: {
            title: '账号检测任务'
          },
          component: () => import('@/view/tg/task/check-account/index.vue')
        }
      ]
    }
  ]
}

export default tgRouter
