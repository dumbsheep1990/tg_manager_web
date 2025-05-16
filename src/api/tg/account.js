import service from '@/utils/request'

// 获取账号分组列表
export const getAccountGroups = (data) => {
  return service({
    url: '/account/getGroups',
    method: 'post',
    data
  })
}

// 创建账号分组
export const createAccountGroup = (data) => {
  return service({
    url: '/account/createGroup',
    method: 'post',
    data
  })
}

// 更新账号分组
export const updateAccountGroup = (data) => {
  return service({
    url: '/account/updateGroup',
    method: 'put',
    data
  })
}

// 删除账号分组
export const deleteAccountGroup = (data) => {
  return service({
    url: '/account/deleteGroup',
    method: 'delete',
    data
  })
}

// 获取账号列表
export const getAccounts = (data) => {
  return service({
    url: '/account/getAccounts',
    method: 'post',
    data
  })
}

// 创建账号
export const createAccount = (data) => {
  return service({
    url: '/account/create',
    method: 'post',
    data
  })
}

// 更新账号
export const updateAccount = (data) => {
  return service({
    url: '/account/update',
    method: 'put',
    data
  })
}

// 删除账号
export const deleteAccount = (data) => {
  return service({
    url: '/account/delete',
    method: 'delete',
    data
  })
}

// 导入TData账号
export const importTdataAccount = (data) => {
  return service({
    url: '/account/importTdata',
    method: 'post',
    data
  })
}

// 获取账号状态
export const getAccountStatus = (data) => {
  return service({
    url: '/account/status',
    method: 'get',
    params: data
  })
}
