// TG营销系统Mock数据
import Mock from 'mockjs'

const Random = Mock.Random

// 消息相关Mock数据
const messageTemplates = []
const messageHistory = []

// 生成15个消息模板
for (let i = 0; i < 15; i++) {
  const type = ['text', 'image', 'video', 'file', 'mixed'][i % 5]
  let preview = ''
  
  switch (type) {
    case 'text':
      preview = Random.paragraph(1, 2)
      break
    case 'image':
      preview = '[图片消息]'
      break
    case 'video':
      preview = '[视频消息]'
      break
    case 'file':
      preview = '[文件消息]'
      break
    case 'mixed':
      preview = '[图文混合消息]'
      break
  }
  
  messageTemplates.push(Mock.mock({
    'id': '@id',
    'templateName': '模板-' + (i + 1),
    'messageType': type,
    'preview': preview,
    'content': type === 'text' ? Random.paragraph(2, 5) : JSON.stringify({
      type: type,
      content: type === 'mixed' ? [Random.paragraph(1), '[图片]', '[视频]'] : type === 'text' ? Random.paragraph(2, 5) : '[' + type + '内容]'
    }),
    'createTime': '@datetime',
    'updateTime': '@datetime'
  }))
}

// 生成20个消息发送历史记录
for (let i = 0; i < 20; i++) {
  const type = ['text', 'image', 'video', 'file', 'mixed'][i % 5]
  const status = ['success', 'failed', 'processing'][i % 3]
  const targetCount = Random.integer(10, 100)
  const successCount = status === 'success' ? targetCount : status === 'processing' ? Random.integer(0, targetCount) : Random.integer(0, targetCount - 1)
  const failCount = status === 'success' ? 0 : status === 'processing' ? Random.integer(0, targetCount - successCount) : targetCount - successCount
  
  messageHistory.push(Mock.mock({
    'id': '@id',
    'taskName': '消息任务-' + (i + 1),
    'messageType': type,
    'targetCount': targetCount,
    'successCount': successCount,
    'failCount': failCount,
    'status': status,
    'sendTime': '@datetime',
    'content': type === 'text' ? Random.paragraph(1, 3) : JSON.stringify({
      type: type,
      content: type === 'mixed' ? [Random.paragraph(1), '[图片]', '[视频]'] : type === 'text' ? Random.paragraph(1, 3) : '[' + type + '内容]'
    }),
    'targetList': Array(targetCount).fill(null).map(() => ({
      'id': '@id',
      'username': '@first' + Random.integer(100, 999),
      'status': status === 'success' ? 'success' : ['success', 'failed'][Random.integer(0, 1)]
    }))
  }))
}

// 账号相关Mock数据
const accountGroups = []
const accounts = []

// 生成10个账号分组
for (let i = 0; i < 10; i++) {
  accountGroups.push(Mock.mock({
    'id': '@id',
    'name': '分组' + (i + 1),
    'description': '@csentence(10, 20)',
    'status': '@pick(["active", "inactive"])',
    'createdAt': '@datetime',
    'updatedAt': '@datetime'
  }))
}

// 生成30个账号
for (let i = 0; i < 30; i++) {
  accounts.push(Mock.mock({
    'id': '@id',
    'groupId': function() {
      return accountGroups[Random.integer(0, 9)].id
    },
    'phone': '+' + Random.integer(1, 999) + ' ' + Random.integer(1000000000, 9999999999),
    'username': '@first' + Random.integer(1000, 9999),
    'status': '@pick(["active", "inactive", "banned"])',
    'tdata_path': '/path/to/tdata/' + Random.string('lower', 10),
    'createdAt': '@datetime',
    'updatedAt': '@datetime'
  }))
}

// 用户和群组相关Mock数据
const userTags = []
const userGroups = []
const users = []

// 生成5个用户标签
for (let i = 0; i < 5; i++) {
  userTags.push(Mock.mock({
    'id': '@id',
    'name': ['VIP客户', '新用户', '潜在客户', '活跃用户', '流失用户'][i],
    'color': '@color',
    'description': '@csentence(10, 20)',
    'userCount': '@integer(10, 200)',
    'createdAt': '@datetime'
  }))
}

// 生成3个用户分组
for (let i = 0; i < 3; i++) {
  userGroups.push(Mock.mock({
    'id': '@id',
    'name': ['VIP用户组', '新用户组', '潜在客户组'][i],
    'description': '@csentence(10, 20)',
    'userCount': '@integer(30, 200)',
    'createdAt': '@datetime'
  }))
}

// 生成50个用户
for (let i = 0; i < 50; i++) {
  users.push(Mock.mock({
    'id': '@id',
    'username': '@first' + Random.integer(100, 999),
    'firstName': '@first',
    'lastName': '@last',
    'phone': '+' + Random.integer(1, 999) + ' ' + Random.integer(1000000000, 9999999999),
    'tags': function() {
      // 随机选择1-3个标签
      const count = Random.integer(0, 3)
      const selectedTags = []
      for (let j = 0; j < count; j++) {
        const tag = userTags[Random.integer(0, 4)]
        if (!selectedTags.some(t => t.id === tag.id)) {
          selectedTags.push(tag)
        }
      }
      return selectedTags
    },
    'lastSeen': '@datetime',
    'status': '@pick(["online", "offline", "banned"])',
    'note': '@csentence(0, 30)'
  }))
}

// 群组相关Mock数据
const groupTags = []
const groupCategories = []
const groups = []

// 生成5个群组标签
for (let i = 0; i < 5; i++) {
  groupTags.push(Mock.mock({
    'id': '@id',
    'name': ['科技', '娱乐', '教育', '电商', '社交'][i],
    'color': '@color',
    'description': '@csentence(10, 20)',
    'groupCount': '@integer(5, 50)',
    'createdAt': '@datetime'
  }))
}

// 生成3个群组分类
for (let i = 0; i < 3; i++) {
  groupCategories.push(Mock.mock({
    'id': '@id',
    'name': ['科技频道', '娱乐社区', '教育群组'][i],
    'description': '@csentence(10, 20)',
    'groupCount': '@integer(10, 50)',
    'createdAt': '@datetime'
  }))
}

// 生成20个群组
for (let i = 0; i < 20; i++) {
  groups.push(Mock.mock({
    'id': '@id',
    'name': '@cword(3, 8)' + Random.integer(1000, 9999),
    'username': '@word(5, 10)',
    'description': '@csentence(10, 30)',
    'memberCount': '@integer(50, 5000)',
    'tags': function() {
      // 随机选择1-2个标签
      const count = Random.integer(0, 2)
      const selectedTags = []
      for (let j = 0; j < count; j++) {
        const tag = groupTags[Random.integer(0, 4)]
        if (!selectedTags.some(t => t.id === tag.id)) {
          selectedTags.push(tag)
        }
      }
      return selectedTags
    },
    'category': function() {
      return groupCategories[Random.integer(0, 2)]
    },
    'isPublic': '@boolean',
    'hasUsername': '@boolean',
    'linkUrl': 'https://t.me/' + Random.word(5, 10),
    'joinedAt': '@datetime',
    'lastActivity': '@datetime',
    'status': '@pick(["active", "inactive", "banned"])',
    'note': '@csentence(0, 20)'
  }))
}

// 任务相关Mock数据
const tasks = []

// 生成15个任务
for (let i = 0; i < 15; i++) {
  const taskTypes = ['send_message', 'join_group', 'add_contact', 'check_account', 'extract_members']
  const type = taskTypes[i % 5]
  const status = ['pending', 'assigned', 'processing', 'completed', 'failed'][i % 5]
  
  tasks.push(Mock.mock({
    'id': '@id',
    'name': type + '-任务' + (i + 1),
    'type': type,
    'accountId': function() {
      return accounts[Random.integer(0, 29)].id
    },
    'params': function() {
      switch (type) {
        case 'send_message':
          return JSON.stringify({
            target_type: Random.pick(['user', 'group']),
            target_id: Random.id(),
            message: Random.paragraph(1, 3)
          })
        case 'join_group':
          return JSON.stringify({
            group_link: 'https://t.me/' + Random.word(5, 10)
          })
        case 'add_contact':
          return JSON.stringify({
            phone: '+' + Random.integer(1, 999) + ' ' + Random.integer(1000000000, 9999999999)
          })
        case 'check_account':
          return JSON.stringify({check_type: 'full'})
        case 'extract_members':
          return JSON.stringify({group_id: Random.id(), limit: Random.integer(50, 200)})
        default:
          return '{}'
      }
    },
    'status': status,
    'result': function() {
      if (status === 'completed') {
        return JSON.stringify({success: true, details: '操作成功'})
      } else if (status === 'failed') {
        return JSON.stringify({success: false, error: '操作失败，' + Random.csentence(5, 15)})
      }
      return null
    },
    'timeout': '@integer(30, 300)',
    'created_at': '@datetime',
    'updated_at': '@datetime'
  }))
}

// 消息管理相关Mock数据和API实现
const messageManagers = []

// 生成10个消息管理
for (let i = 0; i < 10; i++) {
  messageManagers.push(Mock.mock({
    'id': '@id',
    'name': '消息管理-' + (i + 1),
    'description': '@csentence(10, 20)',
    'status': '@pick(["active", "inactive"])',
    'createdAt': '@datetime',
    'updatedAt': '@datetime'
  }))
}

// API实现
export default {
  // 获取账号分组列表
  getAccountGroups: (config) => {
    return {
      code: 0,
      data: {
        list: accountGroups,
        total: accountGroups.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },
  
  // 获取消息模板列表
  getMessageTemplates: (config) => {
    const { page = 1, pageSize = 10, templateName, messageType } = JSON.parse(config.body)
    
    let filteredTemplates = [...messageTemplates]
    
    if (templateName) {
      filteredTemplates = filteredTemplates.filter(template => template.templateName.includes(templateName))
    }
    
    if (messageType) {
      filteredTemplates = filteredTemplates.filter(template => template.messageType === messageType)
    }
    
    const total = filteredTemplates.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = filteredTemplates.slice(start, end)
    
    return {
      code: 0,
      data: {
        list,
        total,
        page,
        pageSize
      },
      message: '成功'
    }
  },
  
  // 获取消息历史列表
  getMessageHistory: (config) => {
    const { page = 1, pageSize = 10, taskName, messageType, status } = JSON.parse(config.body)
    
    let filteredHistory = [...messageHistory]
    
    if (taskName) {
      filteredHistory = filteredHistory.filter(history => history.taskName.includes(taskName))
    }
    
    if (messageType) {
      filteredHistory = filteredHistory.filter(history => history.messageType === messageType)
    }
    
    if (status) {
      filteredHistory = filteredHistory.filter(history => history.status === status)
    }
    
    const total = filteredHistory.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = filteredHistory.slice(start, end)
    
    return {
      code: 0,
      data: {
        list,
        total,
        page,
        pageSize
      },
      message: '成功'
    }
  },
  
  // 获取消息模板详情
  getMessageTemplateDetail: (config) => {
    const { id } = config.query || {}
    
    if (!id) {
      return {
        code: 1,
        message: '缺少必要参数id'
      }
    }
    
    const template = messageTemplates.find(t => t.id === id)
    
    if (!template) {
      return {
        code: 1,
        message: '模板不存在'
      }
    }
    
    return {
      code: 0,
      data: template,
      message: '成功'
    }
  },
  
  // 获取消息历史详情
  getMessageDetail: (config) => {
    const { id } = config.query || {}
    
    if (!id) {
      return {
        code: 1,
        message: '缺少必要参数id'
      }
    }
    
    const history = messageHistory.find(h => h.id === id)
    
    if (!history) {
      return {
        code: 1,
        message: '历史记录不存在'
      }
    }
    
    return {
      code: 0,
      data: history,
      message: '成功'
    }
  },
  
  // 发送消息
  sendMessage: (config) => {
    const data = JSON.parse(config.body)
    
    // 创建一个新的消息历史记录
    const newHistory = Mock.mock({
      'id': '@id',
      'taskName': data.taskName || '新消息任务',
      'messageType': data.messageType || 'text',
      'targetCount': data.targets ? data.targets.length : Random.integer(10, 50),
      'successCount': 0,
      'failCount': 0,
      'status': 'processing',
      'sendTime': new Date().toISOString(),
      'content': data.content || Random.paragraph(1, 3),
      'targetList': data.targets || Array(Random.integer(10, 50)).fill(null).map(() => ({
        'id': '@id',
        'username': '@first' + Random.integer(100, 999),
        'status': 'pending'
      }))
    })
    
    messageHistory.unshift(newHistory)
    
    return {
      code: 0,
      data: newHistory,
      message: '消息发送任务创建成功'
    }
  },
  
  // 重试发送消息
  retrySendMessage: (config) => {
    const { id } = JSON.parse(config.body)
    
    if (!id) {
      return {
        code: 1,
        message: '缺少必要参数id'
      }
    }
    
    const historyIndex = messageHistory.findIndex(h => h.id === id)
    
    if (historyIndex === -1) {
      return {
        code: 1,
        message: '历史记录不存在'
      }
    }
    
    // 更新状态为处理中
    messageHistory[historyIndex].status = 'processing'
    
    return {
      code: 0,
      data: null,
      message: '消息重新发送任务创建成功'
    }
  },

  // 获取账号列表
  getAccounts: (config) => {
    return {
      code: 0,
      data: {
        list: accounts,
        total: accounts.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },

  // 获取用户标签列表
  getUserTags: () => {
    return {
      code: 0,
      data: {
        list: userTags,
        total: userTags.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },

  /**
   * 获取用户分组列表
   */
  getUserGroups: () => {
    return {
      code: 0,
      data: {
        list: userGroups,
        total: userGroups.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },

  /**
   * 获取用户列表
   */
  getUsers: () => {
    return {
      code: 0,
      data: {
        list: users,
        total: users.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },

  /**
   * 获取群组标签列表
   */
  getGroupTags: () => {
    return {
      code: 0,
      data: {
        list: groupTags,
        total: groupTags.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },

  /**
   * 获取群组分类列表
   */
  getGroupCategories: () => {
    return {
      code: 0,
      data: {
        list: groupCategories,
        total: groupCategories.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },

  /**
   * 获取群组列表
   */
  getGroups: () => {
    return {
      code: 0,
      data: {
        list: groups,
        total: groups.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },

  /**
   * 获取任务列表
   */
  getTasks: () => {
    return {
      code: 0,
      data: {
        list: tasks,
        total: tasks.length,
        page: 1,
        pageSize: 20
      },
      msg: '获取成功'
    }
  },
  
  /**
   * 创建任务
   */
  createTask: (config) => {
    return {
      code: 0,
      data: {
        task_id: Mock.mock('@id'),
        status: 'pending'
      },
      msg: '创建成功'
    }
  },

  /**
   * 通用响应
   */
  commonResponse: () => {
    return {
      code: 0,
      data: {},
      msg: '操作成功'
    }
  }
}
