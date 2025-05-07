import service from '@/utils/request'

// 创建账号分组
export const createAccountGroup = (data) => {
  return service({
    url: '/api/v1/account-groups',
    method: 'post',
    data
  })
}

// 获取账号分组列表
export const getAccountGroups = (params) => {
  return service({
    url: '/api/v1/account-groups',
    method: 'get',
    params
  })
}

// 获取账号分组详情
export const getAccountGroupDetail = (id) => {
  return service({
    url: `/api/v1/account-groups/${id}`,
    method: 'get'
  })
}

// 更新账号分组
export const updateAccountGroup = (id, data) => {
  return service({
    url: `/api/v1/account-groups/${id}`,
    method: 'put',
    data
  })
}

// 删除账号分组
export const deleteAccountGroup = (id) => {
  return service({
    url: `/api/v1/account-groups/${id}`,
    method: 'delete'
  })
}
