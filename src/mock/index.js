// Mock数据服务
import Mock from 'mockjs'
import menuAPI from './menu'
import userAPI from './user'
import baseAPI from './base'
import initAPI from './init'
import tgAPI from './tg'
import { classifyAndHandleRequest } from './mockProxyHandler'

// 设置模拟延迟
Mock.setup({
  timeout: '300-600'
})

// 开启全局Mock拦截模式，返回模拟数据
const openMock = true

// 添加全局请求拦截器
const XHR = window.XMLHttpRequest
window._originalXHR = window._originalXHR || XHR

function MockXHR() {
  const xhr = new window._originalXHR()
  const _open = xhr.open
  const _send = xhr.send

  // 拦截open方法
  xhr.open = function() {
    const url = arguments[1]
    const method = arguments[0]
    
    // 记录原始参数
    this._url = url
    this._method = method
    return _open.apply(this, arguments)
  }

  // 拦截send方法
  xhr.send = function() {
    // 模拟后端服务不可用的特殊处理
    if (openMock && (this._url.includes('/menu/getMenu') || this._url.includes('/user/getUserInfo'))) {
      // 打印请求信息
      console.log(`[Mock拦截] 已拦截请求: ${this._method} ${this._url}`)
      
      // 设置一个延迟，模拟网络请求
      setTimeout(() => {
        let responseData
        
        // 根据请求URL判断返回的模拟数据
        if (this._url.includes('/menu/getMenu')) {
          responseData = menuAPI.getMenu()
        } else if (this._url.includes('/user/getUserInfo')) {
          responseData = userAPI.getUserInfo()
        }
        
        // 设置响应头
        this.status = 200
        this.readyState = 4
        this.responseText = JSON.stringify(responseData)
        this.response = JSON.stringify(responseData)
        
        // 触发事件
        if (this.onreadystatechange) {
          this.onreadystatechange()
        }
        if (this.onload) {
          this.onload()
        }
      }, 300)
      
      return
    }
    
    // 其他请求正常发送
    return _send.apply(this, arguments)
  }

  return xhr
}

window.XMLHttpRequest = MockXHR

// 菜单相关接口
Mock.mock(/\/api\/menu\/getMenu/, 'post', menuAPI.getMenu)
Mock.mock(/\/menu\/getMenu/, 'post', menuAPI.getMenu)

// 用户相关接口
Mock.mock(/\/api\/user\/getUserInfo/, 'get', userAPI.getUserInfo)
Mock.mock(/\/user\/getUserInfo/, 'get', userAPI.getUserInfo)

// 登录接口
Mock.mock(/\/api\/base\/login/, 'post', userAPI.login)
Mock.mock(/\/base\/login/, 'post', userAPI.login)
Mock.mock(/\/api\/user\/login/, 'post', userAPI.login)
Mock.mock(/\/user\/login/, 'post', userAPI.login)

// 基础API
Mock.mock(/\/api\/base\/captcha/, 'get', baseAPI.getCaptcha)
Mock.mock(/\/base\/captcha/, 'get', baseAPI.getCaptcha)

// 初始化相关API
Mock.mock(/\/api\/init\/checkdb/, 'get', initAPI.checkdb)
Mock.mock(/\/init\/checkdb/, 'get', initAPI.checkdb)

// TG营销系统相关API
// TG营销系统相关接口
Mock.mock(/\/api\/account-group\/list/, 'post', tgAPI.getAccountGroups)
Mock.mock(/\/api\/account\/list/, 'post', tgAPI.getAccounts)
Mock.mock(/\/api\/user-tag\/list/, 'get', tgAPI.getUserTags)
Mock.mock(/\/api\/user-group\/list/, 'get', tgAPI.getUserGroups)
Mock.mock(/\/api\/contact\/list/, 'post', tgAPI.getContacts)
Mock.mock(/\/api\/contact\/detail/, 'get', tgAPI.getContactDetail)
Mock.mock(/\/api\/group-tag\/list/, 'get', tgAPI.getGroupTags)
Mock.mock(/\/api\/group-category\/list/, 'get', tgAPI.getGroupCategories)
Mock.mock(/\/api\/group\/list/, 'post', tgAPI.getGroups)
Mock.mock(/\/api\/group\/detail/, 'get', tgAPI.getGroupDetail)
Mock.mock(/\/api\/task\/list/, 'post', tgAPI.getTasks)
Mock.mock(/\/api\/task\/detail/, 'get', tgAPI.getTaskDetail)

// 消息管理相关接口
Mock.mock(/\/api\/message-template\/list/, 'post', tgAPI.getMessageTemplates)
Mock.mock(/\/api\/message-history\/list/, 'post', tgAPI.getMessageHistory)
Mock.mock(/\/api\/message-template\/detail/, 'get', tgAPI.getMessageTemplateDetail)
Mock.mock(/\/api\/message-history\/detail/, 'get', tgAPI.getMessageDetail)
Mock.mock(/\/api\/message\/send/, 'post', tgAPI.sendMessage)
Mock.mock(/\/api\/message\/retry/, 'post', tgAPI.retrySendMessage)

// 通用接口 - 创建，更新和删除
Mock.mock(/\/api\/tg\/.*\/create/, 'post', tgAPI.commonResponse)
Mock.mock(/\/api\/tg\/.*\/update/, 'post', tgAPI.commonResponse)
Mock.mock(/\/api\/tg\/.*\/delete/, 'post', tgAPI.commonResponse)

// 通用拦截器 - 处理所有未明确定义的API请求
Mock.mock(/^\/api\//, 'get', (options) => {
  return classifyAndHandleRequest(options.url.replace('/api', ''), 'get', null)
})

Mock.mock(/^\/api\//, 'post', (options) => {
  const data = JSON.parse(options.body)
  return classifyAndHandleRequest(options.url.replace('/api', ''), 'post', data)
})

export default Mock
