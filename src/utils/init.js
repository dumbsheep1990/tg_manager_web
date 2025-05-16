// 初始化系统标志
export const initSystem = () => {
  localStorage.setItem('gvaInitFlag', 'true')
  localStorage.setItem('tgManagerInitFlag', 'true')
  console.log('系统初始化标志已设置')
}

// 检查系统是否已初始化
export const checkSystemInit = () => {
  return localStorage.getItem('gvaInitFlag') === 'true'
}

// 自动初始化系统（开发环境）
export const autoInit = () => {
  if (import.meta.env.DEV) {
    initSystem()
    console.log('开发环境自动初始化完成')
    return true
  }
  return false
}
