/**
 * Telegram账号管理工具函数
 */

import { ElMessage } from 'element-plus'

/**
 * 格式化电话号码，确保国际格式一致性
 * @param {string} phone 电话号码
 * @returns {string} 格式化后的电话号码
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // 如果不是以+开头，则添加+
  if (!phone.startsWith('+')) {
    phone = '+' + phone
  }
  
  return phone
}

/**
 * 获取账号状态标签类型
 * @param {string} status 账号状态
 * @returns {string} element-plus标签类型
 */
export const getStatusTagType = (status) => {
  const typeMap = {
    normal: 'success',
    online: 'success',
    offline: 'info',
    timeout: 'warning',
    disabled: 'danger',
    failed: 'danger',
    banned: 'danger'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取账号状态文本
 * @param {string} status 账号状态
 * @returns {string} 状态文本
 */
export const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    online: '在线',
    offline: '离线',
    timeout: '超时',
    disabled: '已禁用',
    failed: '失败',
    banned: '已封禁'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取IP类型文本
 * @param {string} type IP类型
 * @returns {string} 类型文本
 */
export const getIpTypeText = (type) => {
  const typeMap = {
    domestic: '国内',
    foreign: '国外'
  }
  return typeMap[type] || '未知'
}

/**
 * 通用API请求包装器
 * @param {Function} apiMethod API方法
 * @param {Object} params 参数
 * @param {Object} options 选项
 * @returns {Promise} Promise对象
 */
export const apiRequest = async (apiMethod, params, options = {}) => {
  const { 
    successMessage = '操作成功', 
    errorMessage = '操作失败', 
    showSuccessMessage = true 
  } = options
  
  try {
    const res = await apiMethod(params)
    
    if (res.code === 0) {
      if (showSuccessMessage) {
        ElMessage.success(successMessage)
      }
      return { success: true, data: res.data, message: res.message }
    } else {
      ElMessage.error(res.message || errorMessage)
      return { success: false, data: null, message: res.message || errorMessage }
    }
  } catch (error) {
    console.error('API请求失败:', error)
    ElMessage.error(errorMessage)
    return { success: false, data: null, message: error.message || errorMessage }
  }
}

/**
 * 生成随机账号样本数据（仅开发测试使用）
 * @param {number} count 数量
 * @param {string} type 账号类型
 * @returns {Array} 账号样本数据数组
 */
export const generateMockAccounts = (count = 10, type = 'crawler') => {
  const accounts = []
  
  const phonePrefix = ['+86', '+1', '+44', '+7', '+61']
  const statuses = ['normal', 'offline', 'timeout', 'disabled']
  const ipTypes = ['domestic', 'foreign']
  const crawlerTypes = ['phone', 'username']
  const privateTypes = ['private', 'group']
  const countries = ['中国', '美国', '英国', '俄罗斯', '澳大利亚']
  
  for (let i = 0; i < count; i++) {
    const randomPhone = phonePrefix[Math.floor(Math.random() * phonePrefix.length)] + 
                       Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomIpType = ipTypes[Math.floor(Math.random() * ipTypes.length)]
    const randomCountry = countries[Math.floor(Math.random() * countries.length)]
    
    if (type === 'crawler') {
      accounts.push({
        id: i + 1,
        phoneNumber: randomPhone,
        accountType: crawlerTypes[Math.floor(Math.random() * crawlerTypes.length)],
        ipType: randomIpType,
        proxyInfo: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${8000 + Math.floor(Math.random() * 2000)}`,
        accountStatus: randomStatus,
        lastLoginTime: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 19),
        countryCode: randomCountry,
        telegramVips: `VIP${Math.floor(Math.random() * 10) + 1}`,
        remark: `测试账号${i + 1}`
      })
    } else {
      const targetUser = `user${Math.floor(Math.random() * 1000)}`
      accounts.push({
        id: i + 1,
        phoneNumber: randomPhone,
        accountType: privateTypes[Math.floor(Math.random() * privateTypes.length)],
        targetUser: targetUser,
        ipType: randomIpType,
        accountStatus: randomStatus,
        lastLoginTime: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 19),
        countryCode: randomCountry,
        remark: `私信账号${i + 1} - 目标: ${targetUser}`
      })
    }
  }
  
  return accounts
}

/**
 * 生成随机消息记录数据（仅开发测试使用）
 * @param {number} count 数量
 * @returns {Array} 消息记录样本数据数组
 */
export const generateMockMessages = (count = 10) => {
  const messages = []
  const phonePrefix = ['+86', '+1', '+44', '+7', '+61']
  const statuses = ['normal', 'failed']
  const messageTypes = ['文本', '图片', '视频', '链接']
  
  for (let i = 0; i < count; i++) {
    const randomPhone = phonePrefix[Math.floor(Math.random() * phonePrefix.length)] + 
                       Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')
    
    const targetUser = `user${Math.floor(Math.random() * 1000)}`
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
    
    // 根据消息类型生成不同的内容
    let content = ''
    switch (randomType) {
      case '文本':
        content = `这是一条发送给${targetUser}的测试消息内容，用于演示系统功能。消息ID: ${i + 1}`
        break
      case '图片':
        content = `[图片] 图片${i + 1}.jpg`
        break
      case '视频':
        content = `[视频] 视频${i + 1}.mp4`
        break
      case '链接':
        content = `https://example.com/link${i + 1}`
        break
    }
    
    messages.push({
      id: i + 1,
      phoneNumber: randomPhone,
      targetUser: targetUser,
      messageType: randomType,
      messageContent: content,
      sendTime: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 19),
      status: randomStatus
    })
  }
  
  return messages
}
