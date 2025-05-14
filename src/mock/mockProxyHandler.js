// 模拟代理处理器
import { Random } from 'mockjs'

// 默认处理所有API请求的通用处理器
export function handleAnyRequest(url, type, data) {
  console.log(`模拟请求: ${url}, 类型: ${type}`, data ? `数据: ${JSON.stringify(data)}` : '')
  
  // 返回通用的成功响应
  return {
    code: 0,
    data: {
      mock: true,
      url: url,
      type: type,
      timestamp: Date.now(),
      requestId: Random.guid()
    },
    msg: '请求已被Mock数据服务处理'
  }
}

// 根据URL前缀分类处理不同类型的请求
export function classifyAndHandleRequest(url, type, data) {
  // base相关请求
  if (url.startsWith('/base/')) {
    return handleBaseRequest(url, type, data)
  }
  
  // user相关请求
  if (url.startsWith('/user/')) {
    return handleUserRequest(url, type, data)
  }
  
  // menu相关请求
  if (url.startsWith('/menu/')) {
    return handleMenuRequest(url, type, data)
  }
  
  // init相关请求
  if (url.startsWith('/init/')) {
    return handleInitRequest(url, type, data)
  }
  
  // 默认处理
  return handleAnyRequest(url, type, data)
}

// 处理base相关请求
function handleBaseRequest(url, type, data) {
  return {
    code: 0,
    data: {
      mock: true,
      module: 'base',
      url: url
    },
    msg: 'Base模块请求已处理'
  }
}

// 处理user相关请求
function handleUserRequest(url, type, data) {
  // 处理登录请求
  if (url === '/user/login' && type === 'post') {
    return {
      code: 0,
      data: {
        user: {
          uuid: Random.guid(),
          nickName: '管理员',
          headerImg: 'https://qmplusimg.henrongyi.top/gva_header.jpg',
          authority: {
            defaultRouter: 'TgTelegram'
          }
        },
        token: 'mock-token-' + Random.string('lower', 32)
      },
      msg: '登录成功'
    }
  }
  
  return {
    code: 0,
    data: {
      mock: true,
      module: 'user',
      url: url
    },
    msg: 'User模块请求已处理'
  }
}

// 处理menu相关请求
function handleMenuRequest(url, type, data) {
  return {
    code: 0,
    data: {
      mock: true,
      module: 'menu',
      url: url
    },
    msg: 'Menu模块请求已处理'
  }
}

// 处理init相关请求
function handleInitRequest(url, type, data) {
  // 处理checkdb请求
  if (url === '/init/checkdb') {
    return {
      code: 0,
      data: {
        dbs: true
      },
      msg: '数据库连接正常'
    }
  }
  
  return {
    code: 0,
    data: {
      mock: true,
      module: 'init',
      url: url
    },
    msg: 'Init模块请求已处理'
  }
}
