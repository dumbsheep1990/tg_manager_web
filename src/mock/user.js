import { Random } from 'mockjs'

const token = 'mock-token-' + Random.string('lower', 32)

export default {
  getUserInfo: () => {
    return {
      code: 0,
      data: {
        uuid: Random.guid(),
        nickName: '管理员',
        headerImg: 'https://qmplusimg.henrongyi.top/gva_header.jpg',
        authority: {
          defaultRouter: 'TgTelegram'
        },
        sideMode: 'dark',
        activeColor: '#4D70FF',
        baseColor: '#fff'
      },
      msg: '获取用户信息成功'
    }
  },
  login: (config) => {
    console.log('Mock处理登录请求:', config)
    let data = {}
    try {
      data = JSON.parse(config.body || '{}')
    } catch (e) {
      console.log('解析请求失败:', e)
    }
    
    // 为开发测试放宽验证条件
    if (data.username === 'admin' ||
        data.username === 'admin@admin.com' ||
        data.captcha === 'mock-captcha') {
      console.log('用户登录成功:', data.username)
      return {
        code: 0,
        data: {
          user: {
            uuid: Random.guid(),
            nickName: '管理员',
            headerImg: 'https://qmplusimg.henrongyi.top/gva_header.jpg',
            authority: {
              defaultRouter: 'TgTelegram'
            },
            sideMode: 'dark',
            activeColor: '#4D70FF',
            baseColor: '#fff'
          },
          token: token,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
        },
        msg: '登录成功'
      }
    } else {
      console.log('用户登录失败:', data.username)
      return {
        code: 7,
        data: {},
        msg: '用户名或密码错误'
      }
    }
  }
}
