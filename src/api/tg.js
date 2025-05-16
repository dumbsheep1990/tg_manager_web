import service from '@/utils/request'

// 账号分组管理接口
export const getAccountGroups = (params) => {
  return service({
    url: '/tg/account-group/list',
    method: 'get',
    params
  })
}

export const createAccountGroup = (data) => {
  return service({
    url: '/tg/account-group/create',
    method: 'post',
    data
  })
}

export const updateAccountGroup = (data) => {
  return service({
    url: '/tg/account-group/update',
    method: 'post',
    data
  })
}

export const deleteAccountGroup = (data) => {
  return service({
    url: '/tg/account-group/delete',
    method: 'post',
    data
  })
}

// 账号管理接口
export const getAccounts = (params) => {
  return service({
    url: '/tg/account/list',
    method: 'get',
    params
  })
}

export const createAccount = (data) => {
  return service({
    url: '/tg/account/create',
    method: 'post',
    data
  })
}

export const updateAccount = (data) => {
  return service({
    url: '/tg/account/update',
    method: 'post',
    data
  })
}

export const deleteAccount = (data) => {
  return service({
    url: '/tg/account/delete',
    method: 'post',
    data
  })
}

// 用户标签管理接口
export const getUserTags = (params) => {
  return service({
    url: '/tg/user-tag/list',
    method: 'get',
    params
  })
}

export const createUserTag = (data) => {
  return service({
    url: '/tg/user-tag/create',
    method: 'post',
    data
  })
}

export const updateUserTag = (data) => {
  return service({
    url: '/tg/user-tag/update',
    method: 'post',
    data
  })
}

export const deleteUserTag = (data) => {
  return service({
    url: '/tg/user-tag/delete',
    method: 'post',
    data
  })
}

// 用户分组管理接口
export const getUserGroups = (params) => {
  return service({
    url: '/tg/user-group/list',
    method: 'get',
    params
  })
}

export const createUserGroup = (data) => {
  return service({
    url: '/tg/user-group/create',
    method: 'post',
    data
  })
}

export const updateUserGroup = (data) => {
  return service({
    url: '/tg/user-group/update',
    method: 'post',
    data
  })
}

export const deleteUserGroup = (data) => {
  return service({
    url: '/tg/user-group/delete',
    method: 'post',
    data
  })
}

// 用户管理接口
export const getUsers = (params) => {
  return service({
    url: '/tg/user/list',
    method: 'get',
    params
  })
}

export const createUser = (data) => {
  return service({
    url: '/tg/user/create',
    method: 'post',
    data
  })
}

export const updateUser = (data) => {
  return service({
    url: '/tg/user/update',
    method: 'post',
    data
  })
}

export const deleteUser = (data) => {
  return service({
    url: '/tg/user/delete',
    method: 'post',
    data
  })
}

// 群组标签管理接口
export const getGroupTags = (params) => {
  return service({
    url: '/tg/group-tag/list',
    method: 'get',
    params
  })
}

export const createGroupTag = (data) => {
  return service({
    url: '/tg/group-tag/create',
    method: 'post',
    data
  })
}

export const updateGroupTag = (data) => {
  return service({
    url: '/tg/group-tag/update',
    method: 'post',
    data
  })
}

export const deleteGroupTag = (data) => {
  return service({
    url: '/tg/group-tag/delete',
    method: 'post',
    data
  })
}

// 群组分类管理接口
export const getGroupCategories = (params) => {
  return service({
    url: '/tg/group-category/list',
    method: 'get',
    params
  })
}

export const createGroupCategory = (data) => {
  return service({
    url: '/tg/group-category/create',
    method: 'post',
    data
  })
}

export const updateGroupCategory = (data) => {
  return service({
    url: '/tg/group-category/update',
    method: 'post',
    data
  })
}

export const deleteGroupCategory = (data) => {
  return service({
    url: '/tg/group-category/delete',
    method: 'post',
    data
  })
}

// 群组管理接口
export const getGroups = (params) => {
  return service({
    url: '/tg/group/list',
    method: 'get',
    params
  })
}

export const createGroup = (data) => {
  return service({
    url: '/tg/group/create',
    method: 'post',
    data
  })
}

export const updateGroup = (data) => {
  return service({
    url: '/tg/group/update',
    method: 'post',
    data
  })
}

export const deleteGroup = (data) => {
  return service({
    url: '/tg/group/delete',
    method: 'post',
    data
  })
}

// 任务管理接口
export const getTasks = (params) => {
  return service({
    url: '/tg/task/list',
    method: 'get',
    params
  })
}

export const createTask = (data) => {
  return service({
    url: '/tg/task/create',
    method: 'post',
    data
  })
}

export const updateTask = (data) => {
  return service({
    url: '/tg/task/update',
    method: 'post',
    data
  })
}

export const deleteTask = (data) => {
  return service({
    url: '/tg/task/delete',
    method: 'post',
    data
  })
}
