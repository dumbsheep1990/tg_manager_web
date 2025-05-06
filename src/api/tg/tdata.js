import service from '@/utils/request'

// 上传TData文件
export const uploadTdataFile = (data) => {
  return service({
    url: '/tdata/upload',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取TData文件列表
export const getTdataFiles = (data) => {
  return service({
    url: '/tdata/list',
    method: 'post',
    data
  })
}

// 删除TData文件
export const deleteTdataFile = (data) => {
  return service({
    url: '/tdata/delete',
    method: 'delete',
    data
  })
}

// 导入TData文件到系统
export const importTdataFile = (data) => {
  return service({
    url: '/tdata/import',
    method: 'post',
    data
  })
}

// 检查TData文件状态
export const checkTdataStatus = (data) => {
  return service({
    url: '/tdata/status',
    method: 'get',
    params: data
  })
}

// 获取TData导入历史
export const getTdataImportHistory = (data) => {
  return service({
    url: '/tdata/importHistory',
    method: 'post',
    data
  })
}
