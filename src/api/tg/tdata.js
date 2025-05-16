import service from '@/utils/request'

// 导入tdata账号
export const importTdataAccount = (data) => {
  return service({
    url: '/api/v1/tdata-accounts/import',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取tdata账号列表
export const getTdataAccounts = (params) => {
  return service({
    url: '/api/v1/tdata-accounts',
    method: 'get',
    params
  })
}

// 获取tdata账号详情
export const getTdataAccountDetail = (id) => {
  return service({
    url: `/api/v1/tdata-accounts/${id}`,
    method: 'get'
  })
}

// 更新tdata账号
export const updateTdataAccount = (id, data) => {
  return service({
    url: `/api/v1/tdata-accounts/${id}`,
    method: 'put',
    data
  })
}

// 删除tdata账号
export const deleteTdataAccount = (id) => {
  return service({
    url: `/api/v1/tdata-accounts/${id}`,
    method: 'delete'
  })
}

// 检测tdata账号状态
export const checkTdataAccountStatus = (id) => {
  return service({
    url: `/api/v1/tdata-accounts/${id}/check`,
    method: 'post'
  })
}
