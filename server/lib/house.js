const { mysql } = require('../qcloud')

async function getHouseInfo(house_id = 1) {
  return mysql('house')
    .select('id', 'house_name', 'house_config')
    .where('id', house_id)
    .first()
}

async function getAllHouse() {
  return mysql('house')
    .select('id', 'house_name')
    .orderBy('id', 'asc')
    .limit(20)
}

module.exports = {
  getHouseInfo,
  getAllHouse
}