import service from '@/utils/request'

// 获取消息模板列表
export const getMessageTemplates = (data) => {
  return service({
    url: '/api/message-template/list',
    method: 'post',
    data
  })
}

// 获取消息发送历史
export const getMessageHistory = (data) => {
  return service({
    url: '/api/message-history/list',
    method: 'post',
    data
  })
}

// 获取消息模板详情
export const getMessageTemplateDetail = (id) => {
  return service({
    url: '/api/message-template/detail',
    method: 'get',
    params: { id }
  })
}

// 创建消息模板
export const createMessageTemplate = (data) => {
  return service({
    url: '/api/message-template/create',
    method: 'post',
    data
  })
}

// 更新消息模板
export const updateMessageTemplate = (data) => {
  return service({
    url: '/api/message-template/update',
    method: 'post',
    data
  })
}

// 删除消息模板
export const deleteMessageTemplate = (id) => {
  return service({
    url: '/api/message-template/delete',
    method: 'post',
    data: { id }
  })
}

// 发送消息
export const sendMessage = (data) => {
  return service({
    url: '/api/message/send',
    method: 'post',
    data
  })
}

// 重试发送消息
export const retrySendMessage = (id) => {
  return service({
    url: '/api/message/retry',
    method: 'post',
    data: { id }
  })
}

// 获取消息发送详情
export const getMessageDetail = (id) => {
  return service({
    url: '/api/message-history/detail',
    method: 'get',
    params: { id }
  })
}
