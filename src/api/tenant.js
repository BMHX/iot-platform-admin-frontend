import request from '../utils/request'

/**
 * 获取所有租户类型
 * @param {Object} params - 分页参数 {page, limit}
 * @returns {Promise}
 */
export function getAllTenantTypes(params = { page: 1, limit: 100 }) {
  return request({
    url: '/api/tenant-type',
    method: 'get',
    params
  })
}

/**
 * 获取租户类型详情
 * @param {Number} id - 租户类型ID
 * @returns {Promise}
 */
export function getTenantTypeById(id) {
  return request({
    url: `/api/tenant-type/${id}`,
    method: 'get'
  })
}

/**
 * 获取所有租户详情（包含类型分组）
 * @returns {Promise}
 */
export function getAllTenantDetails() {
  return request({
    url: '/api/tenant-type/details',
    method: 'get'
  })
}

/**
 * 分页查询租户
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getTenants(params = { page: 1, limit: 100 }) {
  return request({
    url: '/api/tenant',
    method: 'get',
    params
  })
}

/**
 * 分页查询租户（getTenantList 别名，与 getTenants 功能相同）
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getTenantList(params = { page: 1, limit: 100 }) {
  console.log('分页查询租户列表，参数:', params)
  return request({
    url: '/api/tenant',
    method: 'get',
    params
  }).then(res => {
    console.log('获取租户列表成功:', res)
    return res
  }).catch(err => {
    console.error('获取租户列表失败:', err)
    throw err
  })
}

/**
 * 获取指定类型的租户列表
 * @param {Object} params - 包含typeId和分页参数的对象
 * @returns {Promise}
 */
export function getTenantsByType(params) {
  console.log('获取指定类型租户列表，参数:', params)
  return request({
    url: '/api/tenant',
    method: 'get',
    params
  }).then(res => {
    console.log('获取指定类型租户列表成功:', res)
    return res
  }).catch(err => {
    console.error('获取指定类型租户列表失败:', err)
    throw err
  })
}

/**
 * 获取租户详情
 * @param {Number} id - 租户ID
 * @returns {Promise}
 */
export function getTenantById(id) {
  return request({
    url: `/api/tenant/${id}`,
    method: 'get'
  })
}

/**
 * 添加租户
 * @param {Object} data - 租户数据
 * @returns {Promise}
 */
export function addTenant(data) {
  return request({
    url: '/api/tenant',
    method: 'post',
    data
  })
}

/**
 * 更新租户
 * @param {Number} id - 租户ID
 * @param {Object} data - 租户数据
 * @returns {Promise}
 */
export function updateTenant(data) {
  console.log('更新租户数据:', data)
  return request({
    url: `/api/tenant/${data.id}`,
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
  return request({
    url: '/api/tenant',
    method: 'delete',
    data: ids
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
 * 获取租户扩展属性定义列表
 * @param {Object} params - 查询参数 {page, limit, typeId, name, code, dataType, status}
 * @returns {Promise}
 */
export function getTenantAttributeDefinitionList(params) {
  return request({
    url: '/api/tenant-attribute-definitions',
    method: 'get',
    params
  })
}

/**
 * 获取租户扩展属性定义详情
 * @param {Number} id - 属性定义ID
 * @returns {Promise}
 */
export function getTenantAttributeDefinitionById(id) {
  return request({
    url: `/api/tenant-attribute-definitions/${id}`,
    method: 'get'
  })
}

/**
 * 新增租户扩展属性定义
 * @param {Object} data - 属性定义数据
 * @returns {Promise}
 */
export function addTenantAttributeDefinition(data) {
  return request({
    url: '/api/tenant-attribute-definitions',
    method: 'post',
    data
  })
}

/**
 * 更新租户扩展属性定义
 * @param {Object} data - 属性定义数据
 * @returns {Promise}
 */
export function updateTenantAttributeDefinition(data) {
  return request({
    url: '/api/tenant-attribute-definitions',
    method: 'put',
    data
  })
}

/**
 * 删除租户扩展属性定义
 * @param {Number} id - 属性定义ID
 * @returns {Promise}
 */
export function deleteTenantAttributeDefinition(id) {
  return request({
    url: `/api/tenant-attribute-definitions/${id}`,
    method: 'delete'
  })
}

/**
 * 获取租户扩展属性值列表
 * @param {Object} params - 查询参数 {page, limit, tenantId, attrId}
 * @returns {Promise}
 */
export function getTenantAttributeValueList(params) {
  return request({
    url: '/api/tenant-attribute-values',
    method: 'get',
    params
  })
}

/**
 * 保存租户扩展属性值
 * @param {Object} data - 属性值数据
 * @returns {Promise}
 */
export function saveTenantAttributeValue(data) {
  return request({
    url: '/api/tenant-attribute-values',
    method: 'post',
    data
  })
}

/**
 * 更新租户扩展属性值
 * @param {Object} data - 属性值数据
 * @returns {Promise}
 */
export function updateTenantAttributeValue(data) {
  return request({
    url: '/api/tenant-attribute-values',
    method: 'put',
    data
  })
}

/**
 * 根据租户类型ID获取属性定义列表
 * @param {Number} typeId - 租户类型ID
 * @returns {Promise}
 */
export function getAttributeDefinitionsByTypeId(typeId) {
  return request({
    url: '/api/tenant-attribute-definitions',
    method: 'get',
    params: { typeId }
  })
}

/**
 * 根据租户ID获取属性值列表
 * @param {Number} tenantId - 租户ID
 * @returns {Promise}
 */
export function getAttributeValuesByTenantId(tenantId) {
  return request({
    url: '/api/tenant-attribute-values',
    method: 'get',
    params: { tenantId }
  })
} 