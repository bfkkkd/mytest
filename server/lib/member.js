const { mysql } = require('../qcloud')

async function getCustomerInfo(open_id) {
  return mysql('customerInfo')
    .select('real_name', 'phone', 'phone', 'building', 'floor', 'unit', 'verified', 'published')
    .where('open_id', open_id).first()
}

async function setCustomerInfo(open_id, field, value) {
  let updateData = {}
  updateData[field] = value
  return mysql('customerInfo').update(updateData).where('open_id', open_id)
}

async function newCustomerInfo(userinfo) {
  return mysql('customerInfo').insert({
    open_id: userinfo.openId, real_name: userinfo.nickName
  })
}

module.exports = {
  getCustomerInfo,
  setCustomerInfo,
  newCustomerInfo
}