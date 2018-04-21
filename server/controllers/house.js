const { mysql,message: { checkSignature } } = require('../qcloud')
const houseObject = require('../lib/house.js')


/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function get(ctx, next) {
  const { act } = ctx.query
  const open_id = ctx.state.$wxInfo.userinfo.openId
  ctx.state.code = '0'
  if (act == 'getHouseInfo') {

    var { house_id } = ctx.query
    house_id = Number(house_id) || 1
    let houseRow = await houseObject.getHouseInfo(house_id)
    houseRow.house_config = JSON.parse(houseRow.house_config)
    ctx.state.data = {
      'houseRow': houseRow
    }

  } else if (act == 'getAllHouse') {
    
    ctx.state.data = await houseObject.getAllHouse()

  } else if (act == 'initInfo') {
    let configData = {
        buildings:["1栋","2栋","3栋","4栋","5栋","6栋", "7栋", "8栋", "9栋", "10栋", "11栋", "12栋", "13栋", "14栋", "15栋", "16栋", "17栋", "18栋", "19栋", "20栋"],
        floors: ["1层", "2层", "3层", "4层", "5层", "6层", "7层", "8层", "9层", "10层", "11层", "12层", "13层", "14层", "15层", "16层", "17层", "18层", "19层", "20层", "21层", "22层", "23层", "24层", "25层", "26层", "27层", "28层", "29层", "30层", "31层", "32层"],
        units: ["1单元", "2单元", "3单元", "4单元", "5单元","6单元"]
      }
    let updateData = {
      'house_config' : JSON.stringify(configData)
    }
    ctx.state.data = await mysql('house').update(updateData).where('id', 1)
  } else {
    ctx.state.data = act
  }

}

async function post(ctx, next) {
  const { act } = ctx.request.body
  const open_id = ctx.state.$wxInfo.userinfo.openId
  let activity_id = 0
  ctx.state.code = '0'
  if (act == 'save') {

  }else {
    ctx.state.data = act
  }

}

module.exports = {
  post,
  get
}
