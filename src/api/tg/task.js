import service from '@/utils/request'

// 获取任务列表
export const getTasks = (data) => {
  return service({
    url: '/task/list',
    method: 'post',
    data
  })
}

// 创建任务
export const createTask = (data) => {
  return service({
    url: '/task/create',
    method: 'post',
    data
  })
}

// 更新任务
export const updateTask = (data) => {
  return service({
    url: '/task/update',
    method: 'put',
    data
  })
}

// 删除任务
export const deleteTask = (data) => {
  return service({
    url: '/task/delete',
    method: 'delete',
    data
  })
}

// 获取任务状态
export const getTaskStatus = (data) => {
  return service({
    url: '/task/status',
    method: 'get',
    params: data
  })
}

// 开始任务
export const startTask = (data) => {
  return service({
    url: '/task/start',
    method: 'post',
    data
  })
}

// 暂停任务
export const pauseTask = (data) => {
  return service({
    url: '/task/pause',
    method: 'post',
    data
  })
}

// 停止任务
export const stopTask = (data) => {
  return service({
    url: '/task/stop',
    method: 'post',
    data
  })
}

// 获取任务执行统计
export const getTaskStats = (data) => {
  return service({
    url: '/task/stats',
    method: 'get',
    params: data
  })
}

// 获取任务执行日志
export const getTaskLogs = (data) => {
  return service({
    url: '/task/logs',
    method: 'post',
    data
  })
}
