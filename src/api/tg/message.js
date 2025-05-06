import service from '@/utils/request'

// 获取消息模板列表
export const getMessageTemplates = (data) => {
  return service({
    url: '/message/templates',
    method: 'post',
    data
  })
}

// 创建消息模板
export const createMessageTemplate = (data) => {
  return service({
    url: '/message/createTemplate',
    method: 'post',
    data
  })
}

// 更新消息模板
export const updateMessageTemplate = (data) => {
  return service({
    url: '/message/updateTemplate',
    method: 'put',
    data
  })
}

// 删除消息模板
export const deleteMessageTemplate = (data) => {
  return service({
    url: '/message/deleteTemplate',
    method: 'delete',
    data
  })
}

// 获取消息发送历史
export const getMessageHistory = (data) => {
  return service({
    url: '/message/history',
    method: 'post',
    data
  })
}

// 发送消息
export const sendMessage = (data) => {
  return service({
    url: '/message/send',
    method: 'post',
    data
  })
}

// 获取消息发送状态
export const getMessageStatus = (data) => {
  return service({
    url: '/message/status',
    method: 'get',
    params: data
  })
}

// 获取消息统计数据
export const getMessageStats = (data) => {
  return service({
    url: '/message/stats',
    method: 'get',
    params: data
  })
}
