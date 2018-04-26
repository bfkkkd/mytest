const { mysql } = require('../qcloud')

async function getCustomerInfo(open_id) {
  return mysql('customerInfo')
    .join('house', 'house.id', 'customerInfo.house_id')
      .select('real_name', 'house_id', 'house_name', 'phone', 'phone', 'building', 'floor', 'unit', 'verified', 'published')
    .where('open_id', open_id).first()
}

async function setCustomerInfo(open_id, updateData) {
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