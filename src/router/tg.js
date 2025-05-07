// TG营销系统路由配置

const tgRouter = {
  path: 'tg',
  name: 'tg',
  meta: {
    title: 'TG营销系统',
    icon: 'message'
  },
  children: [
    {
      path: 'dashboard',
      name: 'tgDashboard',
      meta: {
        title: '系统概览',
        icon: 'dashboard'
      },
      component: () => import('@/view/tg/dashboard/index.vue')
    },
    {
      path: 'account',
      name: 'tgAccount',
      meta: {
        title: '账号管理',
        icon: 'user'
      },
      component: () => import('@/view/tg/account/index.vue')
    },
    {
      path: 'task',
      name: 'tgTask',
      meta: {
        title: '任务管理',
        icon: 'task'
      },
      component: () => import('@/view/tg/task/index.vue')
    },
    {
      path: 'message',
      name: 'tgMessage',
      meta: {
        title: '消息管理',
        icon: 'message'
      },
      component: () => import('@/view/tg/message/index.vue')
    },
    {
      path: 'tdata',
      name: 'tgTdata',
      meta: {
        title: 'TData管理',
        icon: 'file'
      },
      component: () => import('@/view/tg/tdata/index.vue'),
      children: [
        {
          path: 'import',
          name: 'tgTdataImport',
          meta: {
            title: '导入账号',
            icon: 'upload'
          },
          component: () => import('@/view/tg/tdata/import/index.vue')
        },
        {
          path: 'list',
          name: 'tgTdataList',
          meta: {
            title: '账号列表',
            icon: 'list'
          },
          component: () => import('@/view/tg/tdata/list/index.vue')
        }
      ]
    }
  ]
}

export default tgRouter
