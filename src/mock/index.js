// Mock数据服务
import Mock from 'mockjs'
import menuAPI from './menu'
import userAPI from './user'
import baseAPI from './base'
import initAPI from './init'
import { classifyAndHandleRequest } from './mockProxyHandler'

// 设置模拟延迟
Mock.setup({
  timeout: '300-600'
})

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

// 通用拦截器 - 处理所有未明确定义的API请求
Mock.mock(/^\/api\//, 'get', (options) => {
  return classifyAndHandleRequest(options.url.replace('/api', ''), 'get', null)
})

Mock.mock(/^\/api\//, 'post', (options) => {
  const data = JSON.parse(options.body)
  return classifyAndHandleRequest(options.url.replace('/api', ''), 'post', data)
})

export default Mock
