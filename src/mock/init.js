export default {
  checkdb: () => {
    return {
      code: 0,
      data: {
        dbs: true // 表示数据库连接正常
      },
      msg: '数据库连接正常'
    }
  }
}
