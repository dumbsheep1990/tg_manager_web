import service from '@/utils/request'

// 获取爬虫账号列表
export const getCrawlerAccounts = (data) => {
  return service({
    url: '/telegram/crawler/list',
    method: 'post',
    data
  })
}

// 创建爬虫账号
export const createCrawlerAccount = (data) => {
  return service({
    url: '/telegram/crawler/create',
    method: 'post',
    data
  })
}

// 更新爬虫账号
export const updateCrawlerAccount = (data) => {
  return service({
    url: '/telegram/crawler/update',
    method: 'put',
    data
  })
}

// 删除爬虫账号
export const deleteCrawlerAccount = (data) => {
  return service({
    url: '/telegram/crawler/delete',
    method: 'delete',
    data
  })
}

// 获取爬虫账号状态
export const getCrawlerAccountStatus = (data) => {
  return service({
    url: '/telegram/crawler/status',
    method: 'get',
    params: data
  })
}

// 获取私信账号列表
export const getPrivateMessageAccounts = (data) => {
  return service({
    url: '/telegram/private/list',
    method: 'post',
    data
  })
}

// 创建私信账号
export const createPrivateMessageAccount = (data) => {
  return service({
    url: '/telegram/private/create',
    method: 'post',
    data
  })
}

// 更新私信账号
export const updatePrivateMessageAccount = (data) => {
  return service({
    url: '/telegram/private/update',
    method: 'put',
    data
  })
}

// 删除私信账号
export const deletePrivateMessageAccount = (data) => {
  return service({
    url: '/telegram/private/delete',
    method: 'delete',
    data
  })
}

// 获取私信账号状态
export const getPrivateMessageAccountStatus = (data) => {
  return service({
    url: '/telegram/private/status',
    method: 'get',
    params: data
  })
}
