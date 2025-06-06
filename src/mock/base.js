import { Random } from 'mockjs'

export default {
  getCaptcha: () => {
    return {
      code: 0,
      data: {
        captchaId: Random.guid(),
        picPath: 'data:image/png;base64,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'
      },
      msg: '验证码获取成功'
    }
  }
}
