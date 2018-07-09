const { mysql, config } = require('../qcloud')
const http = require('axios')
const util = require('../utils/util.js')

/**
 * 模板消息
 * @param 
 * @return 
 * @example 
 */
function sendMsg(open_id, form_id, data) {
  const appid = config.appId
  const appsecret = config.appSecret
  let activity = data.activity
  let member = data.member
  let autohr = data.autohr
  let houseConfig = activity.house_config
  member.address = (member.building && member.floor && member.unit) ? util.formatAddress(member.building, member.floor, member.unit, houseConfig) : "请完善个人信息"

  let remrak = data.remark

  if (!activity || !member) {
    return -1
  }

  return http({
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    method: 'GET',
    params: {
      appid: appid,
      secret: appsecret,
      grant_type: 'client_credential'
    }
  }).then(res => {
    return http.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + res.data.access_token, {
      touser: open_id,
      form_id: form_id,
      page: "pages/detail/index?id=" + activity.id,
      template_id: 'FDtQfdNLCejNjmB3Xs60IBDCpV3KprSIKNqsMRCZZR0',
      data: {
        "keyword1": {
          "value": activity.title,
          "color": "#173177"
        },
        "keyword2": {
            "value": util.formatAddress(autohr.building, autohr.floor, autohr.unit, houseConfig,) + " " + autohr.real_name,
            "color": "#173177"
        },
        "keyword3": {
            "value": autohr.phone,
            "color": "#173177"
        },
        "keyword4": {
            "value": member.real_name + "(" + member.address + ")",
            "color": "#173177"
        },
        "keyword5": {
            "value": remrak,
            "color": "#ff0033"
        }
      }

    }).then(res => {
      return res.data
    })
  })
}

module.exports = {
  sendMsg
}