const { mysql, config } = require('../qcloud')
const http = require('axios')

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
      template_id: 'FDtQfdNLCejNjmB3Xs60IF9PkhW03-odEyivkwHURSc',
      data: {
        "keyword1": {
          "value": activity.title,
          "color": "#173177"
        },
        "keyword2": {
          "value": member.real_name,
          "color": "#173177"
        },
        "keyword3": {
          "value": '',
          "color": "#173177"
        },
        "keyword4": {
          "value": member.phone,
          "color": "#173177"
        },
        "keyword5": {
          "value": member.building + '座' + member.floor + '层' + member.unit + "单元",
          "color": "#173177"
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