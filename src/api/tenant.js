import request from '../utils/request'

/**
 * 分页获取租户列表
 * @param {Object} params - 查询参数 {page, limit, typeId, name, contactPerson, contactPhone, status, regionCode}
 * @returns {Promise}
 */
export function getTenantList(params) {
  console.log('获取租户列表参数:', params)
  return request({
    url: '/api/tenant',
    method: 'get',
    params
  }).then(res => {
    console.log('租户列表响应:', res)
    return res
  }).catch(err => {
    console.error('获取租户列表错误:', err)
    throw err
  })
}

/**
 * 获取租户详情
 * @param {Number} id - 租户ID
 * @returns {Promise}
 */
export function getTenantDetail(id) {
  return request({
    url: `/api/tenant/${id}`,
    method: 'get'
  })
}

/**
 * 新增租户
 * @param {Object} data - 租户数据
 * @returns {Promise}
 */
export function addTenant(data) {
  console.log('添加租户数据:', data)
  return request({
    url: '/api/tenant',
    method: 'post',
    data
  }).then(res => {
    console.log('添加租户响应:', res)
    return res
  }).catch(err => {
    console.error('添加租户错误:', err)
    throw err
  })
}

/**
 * 更新租户
 * @param {Number} id - 租户ID
 * @param {Object} data - 租户数据
 * @returns {Promise}
 */
export function updateTenant(id, data) {
  console.log('更新租户数据:', id, data)
  return request({
    url: `/api/tenant/${id}`,
    method: 'put',
    data
  }).then(res => {
    console.log('更新租户响应:', res)
    return res
  }).catch(err => {
    console.error('更新租户错误:', err)
    throw err
  })
}

/**
 * 删除租户
 * @param {Array} ids - 租户ID数组
 * @returns {Promise}
 */
export function deleteTenant(ids) {
  console.log('删除租户IDs:', ids)
  return request({
    url: '/api/tenant',
    method: 'delete',
    data: ids
  }).then(res => {
    console.log('删除租户响应:', res)
    return res
  }).catch(err => {
    console.error('删除租户错误:', err)
    throw err
  })
}

/**
 * 分页获取租户类型列表
 * @param {Object} params - 查询参数 {page, limit, ...其他筛选条件}
 * @returns {Promise}
 */
export function getTenantTypeList(params) {
  console.log('获取租户类型列表参数:', params)
  return request({
    url: '/api/tenant-type',
    method: 'get',
    params
  }).then(res => {
    console.log('租户类型列表响应:', res)
    return res
  }).catch(err => {
    console.error('获取租户类型列表错误:', err)
    throw err
  })
}

/**
 * 获取租户类型详情
 * @param {Number} id - 租户类型ID
 * @returns {Promise}
 */
export function getTenantTypeDetail(id) {
  return request({
    url: `/api/tenant-type/${id}`,
    method: 'get'
  })
}

/**
 * 新增租户类型
 * @param {Object} data - 租户类型数据
 * @returns {Promise}
 */
export function addTenantType(data) {
  console.log('添加租户类型数据:', data)
  return request({
    url: '/api/tenant-type/save',
    method: 'post',
    data
  }).then(res => {
    console.log('添加租户类型响应:', res)
    return res
  }).catch(err => {
    console.error('添加租户类型错误:', err)
    throw err
  })
}

/**
 * 更新租户类型
 * @param {Number} id - 租户类型ID
 * @param {Object} data - 租户类型数据
 * @returns {Promise}
 */
export function updateTenantType(id, data) {
  // 确保设置了ID
  data.id = id;
  console.log('更新租户类型数据:', id, data)
  return request({
    url: `/api/tenant-type/update/${id}`,
    method: 'put',
    data
  }).then(res => {
    console.log('更新租户类型响应:', res)
    return res
  }).catch(err => {
    console.error('更新租户类型错误:', err)
    throw err
  })
}

/**
 * 删除租户类型
 * @param {Array} ids - 租户类型ID数组
 * @returns {Promise}
 */
export function deleteTenantType(ids) {
  console.log('删除租户类型IDs:', ids)
  return request({
    url: `/api/tenant-type/delete/${ids[0]}`, // 后端API设计有问题，应该接收一个数组
    method: 'delete',
    data: ids
  }).then(res => {
    console.log('删除租户类型响应:', res)
    return res
  }).catch(err => {
    console.error('删除租户类型错误:', err)
    throw err
  })
}

/**
 * 获取所有租户的详细信息列表
 * @returns {Promise}
 */
export function getAllTenantDetails() {
  return request({
    url: '/api/tenant-type/details',
    method: 'get'
  })
}

/**
 * 获取租户扩展属性定义列表
 * @param {Object} params - 查询参数 {page, limit, typeId, name, code, dataType, status}
 * @returns {Promise}
 */
export function getTenantAttributeDefinitionList(params) {
  console.log('获取租户扩展属性定义列表参数:', params)
  return request({
    url: '/iot/tenant-attribute-definitions',
    method: 'get',
    params
  }).then(res => {
    console.log('租户扩展属性定义列表响应:', res)
    return res
  }).catch(err => {
    console.error('获取租户扩展属性定义列表错误:', err)
    throw err
  })
}

/**
 * 获取租户扩展属性定义详情
 * @param {Number} id - 属性定义ID
 * @returns {Promise}
 */
export function getTenantAttributeDefinitionById(id) {
  return request({
    url: `/iot/tenant-attribute-definitions/${id}`,
    method: 'get'
  })
}

/**
 * 新增租户扩展属性定义
 * @param {Object} data - 属性定义数据
 * @returns {Promise}
 */
export function addTenantAttributeDefinition(data) {
  console.log('添加租户扩展属性定义数据:', data)
  return request({
    url: '/iot/tenant-attribute-definitions',
    method: 'post',
    data
  }).then(res => {
    console.log('添加租户扩展属性定义响应:', res)
    return res
  }).catch(err => {
    console.error('添加租户扩展属性定义错误:', err)
    throw err
  })
}

/**
 * 更新租户扩展属性定义
 * @param {Object} data - 属性定义数据
 * @returns {Promise}
 */
export function updateTenantAttributeDefinition(data) {
  console.log('更新租户扩展属性定义数据:', data)
  return request({
    url: '/iot/tenant-attribute-definitions',
    method: 'put',
    data
  }).then(res => {
    console.log('更新租户扩展属性定义响应:', res)
    return res
  }).catch(err => {
    console.error('更新租户扩展属性定义错误:', err)
    throw err
  })
}

/**
 * 删除租户扩展属性定义
 * @param {Number} id - 属性定义ID
 * @returns {Promise}
 */
export function deleteTenantAttributeDefinition(id) {
  return request({
    url: `/iot/tenant-attribute-definitions/${id}`,
    method: 'delete'
  })
}

/**
 * 获取租户扩展属性值列表
 * @param {Object} params - 查询参数 {page, limit, tenantId, attrId}
 * @returns {Promise}
 */
export function getTenantAttributeValueList(params) {
  console.log('获取租户扩展属性值列表参数:', params)
  return request({
    url: '/iot/tenant-attribute-values',
    method: 'get',
    params
  }).then(res => {
    console.log('租户扩展属性值列表响应:', res)
    return res
  }).catch(err => {
    console.error('获取租户扩展属性值列表错误:', err)
    throw err
  })
}

/**
 * 保存租户扩展属性值
 * @param {Object} data - 属性值数据
 * @returns {Promise}
 */
export function saveTenantAttributeValue(data) {
  console.log('保存租户扩展属性值数据:', data)
  return request({
    url: '/iot/tenant-attribute-values',
    method: 'post',
    data
  }).then(res => {
    console.log('保存租户扩展属性值响应:', res)
    return res
  }).catch(err => {
    console.error('保存租户扩展属性值错误:', err)
    throw err
  })
}

/**
 * 更新租户扩展属性值
 * @param {Object} data - 属性值数据
 * @returns {Promise}
 */
export function updateTenantAttributeValue(data) {
  console.log('更新租户扩展属性值数据:', data)
  return request({
    url: '/iot/tenant-attribute-values',
    method: 'put',
    data
  }).then(res => {
    console.log('更新租户扩展属性值响应:', res)
    return res
  }).catch(err => {
    console.error('更新租户扩展属性值错误:', err)
    throw err
  })
}

/**
 * 根据租户类型ID获取属性定义列表
 * @param {Number} typeId - 租户类型ID
 * @returns {Promise}
 */
export function getAttributeDefinitionsByTypeId(typeId) {
  console.log('根据租户类型ID获取属性定义列表:', typeId)
  return request({
    url: '/iot/tenant-attribute-definitions',
    method: 'get',
    params: { typeId }
  }).then(res => {
    console.log('根据租户类型ID获取属性定义列表响应:', res)
    return res
  }).catch(err => {
    console.error('根据租户类型ID获取属性定义列表错误:', err)
    throw err
  })
}

/**
 * 根据租户ID获取属性值列表
 * @param {Number} tenantId - 租户ID
 * @returns {Promise}
 */
export function getAttributeValuesByTenantId(tenantId) {
  console.log('根据租户ID获取属性值列表:', tenantId)
  return request({
    url: '/iot/tenant-attribute-values',
    method: 'get',
    params: { tenantId }
  }).then(res => {
    console.log('根据租户ID获取属性值列表响应:', res)
    return res
  }).catch(err => {
    console.error('根据租户ID获取属性值列表错误:', err)
    throw err
  })
} 