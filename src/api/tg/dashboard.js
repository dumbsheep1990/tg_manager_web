import service from '@/utils/request'

// 获取仪表盘概览数据
export const getDashboardOverview = () => {
  return service({
    url: '/dashboard/overview',
    method: 'get'
  })
}

// 获取账号统计数据
export const getAccountStats = () => {
  return service({
    url: '/dashboard/accountStats',
    method: 'get'
  })
}

// 获取任务统计数据
export const getTaskStats = () => {
  return service({
    url: '/dashboard/taskStats',
    method: 'get'
  })
}

// 获取消息统计数据
export const getMessageStats = () => {
  return service({
    url: '/dashboard/messageStats',
    method: 'get'
  })
}

// 获取系统运行状态
export const getSystemStatus = () => {
  return service({
    url: '/dashboard/systemStatus',
    method: 'get'
  })
}

// 获取最近活动日志
export const getRecentActivities = (data) => {
  return service({
    url: '/dashboard/recentActivities',
    method: 'post',
    data
  })
}

// 获取任务执行趋势
export const getTaskTrend = (data) => {
  return service({
    url: '/dashboard/taskTrend',
    method: 'get',
    params: data
  })
}

// 获取系统资源使用情况
export const getResourceUsage = () => {
  return service({
    url: '/dashboard/resourceUsage',
    method: 'get'
  })
}
