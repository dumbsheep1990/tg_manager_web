// TG营销系统菜单配置
export const tgMenus = [
  {
    path: 'tg',
    name: 'TG',
    component: 'view/layout/routerView/parent.vue',
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
        path: 'account',
        name: 'TgAccount',
        component: 'view/tg/account/index.vue',
        meta: {
          title: '账号管理',
          icon: 'user'
        }
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
        path: 'telegram',
        name: 'TgTelegram',
        component: 'view/tg/telegram/index.vue',
        meta: {
          title: '飞机号管理',
          icon: 'iphone'
        }
      },
      {
        path: 'tdata',
        name: 'TgTdata',
        component: 'view/tg/tdata/index.vue',
        meta: {
          title: 'TData管理',
          icon: 'folder'
        }
      }
    ]
  }
]
