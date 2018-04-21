const { mysql,message: { checkSignature } } = require('../qcloud')
const activityObject = require('../lib/activity.js')
const memberObject = require('../lib/member.js')
const msgTemplate = require('../lib/msgTemplate.js')
const moment = require('moment');


/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function get(ctx, next) {
  const { act } = ctx.query
  const open_id = ctx.state.$wxInfo.userinfo.openId
  ctx.state.code = '0'
  if (act == 'getActivity') {
    var { start, type_id } = ctx.query
    start = Number(start)
    type_id = Number(type_id)
    let activityRows = await activityObject.getActivitis(type_id, start)
    let activityIdArray = []
    let memberCount = {}
    let joinedCount = {}
    let userInfoTemp = {}
    for (let i = 0; i < activityRows.length; i++) {
      activityIdArray.push(activityRows[i].id)  
      userInfoTemp = JSON.parse(activityRows[i].user_info)
      activityRows[i].user_info = {
        'avatarUrl': userInfoTemp.avatarUrl,
        'nickName': userInfoTemp.nickName
      }
    }
    
    memberCount = await activityObject.getMemberCount(activityIdArray)
    joinedCount = await activityObject.getJoined(activityIdArray, open_id)
    ctx.state.data = {
      'activityRows': activityRows,
      'memberCount': memberCount,
      'joinedCount': joinedCount
    }

  } else if (act == 'getMyActivity') {
    let activityRows = await activityObject.getMyActivitis(open_id)
    let activityIdArray = []
    let memberCount = {}
    let joinedCount = {}
    let userInfoTemp = {}
    for (let i = 0; i < activityRows.length; i++) {
      activityIdArray.push(activityRows[i].id)
      userInfoTemp = JSON.parse(activityRows[i].user_info)
      activityRows[i].user_info = {
        'avatarUrl': userInfoTemp.avatarUrl,
        'nickName': userInfoTemp.nickName
      }
    }

    memberCount = await activityObject.getMemberCount(activityIdArray)
    joinedCount = await activityObject.getJoined(activityIdArray, open_id)
    ctx.state.data = {
      'activityRows': activityRows,
      'memberCount': memberCount,
      'joinedCount': joinedCount
    }

  } else if (act == 'getActivityMembers') {
    const { activity_ids } = ctx.query
    let members = []
    let member = []
    let activityIds = JSON.parse(activity_ids)
    if (activityIds.length > 0) {
      for (let i = 0; i < activityIds.length; i++) {
        let activityId = Number(activityIds[i])
        let tmpMember = {}
        member = await activityObject.getActivityMembers(activityId, 10, moment().format().toString())
        tmpMember.activityId = activityId
        tmpMember.memberData = []
        member.forEach(function (item, index) {
          itemJson = JSON.parse(item.user_info)
          tmpMember.memberData.push(
            {
              'avatarUrl': itemJson ? itemJson.avatarUrl : '',
              'nickName': itemJson ? itemJson.nickName : ''
            }
          )
        })
        members.push(tmpMember)
      }
    }
      ctx.state.data = members

  } else if (act == 'join') {
    var { activity_id,join,form_id, remark } = ctx.query
    activity_id = Number(activity_id)
    if (join == 'true') {

      let activityItem = await activityObject.getActivityDetail(activity_id)
      let memberItem = await memberObject.getCustomerInfo(open_id)
      let autohrItem = await memberObject.getCustomerInfo(activityItem.open_id)

      let returnData = {
        activity_id: activity_id,
        open_id: open_id,
        user_info: memberItem,
        act: 'join',
        state: 0,
        sendMsg: 0,
      }
      
      if (activityItem.only_verified && !memberItem.verified) {
        throw new Error("请先实名认证后再参与！")
      } else {
        activityCount = await activityObject.getJoinedCount(activity_id, open_id)
        if (!activityCount.count) {
          await mysql('activityMember').insert({
            activity_id, open_id, remark
          })
          returnData.state = 1
        } else {
          await mysql('activityMember')
          .update({remark : remark})
          .where('open_id', open_id)
          .andWhere('activity_id', activity_id)
          .limit(1)
          returnData.state = 2
        }

        if (returnData.state == 1) {
          returnData.sendMsg = await msgTemplate.sendMsg(open_id, form_id, { activity: activityItem, autohr: autohrItem, member: memberItem, remark: remark })
        }
      }

      ctx.state.data = returnData

    } else {
      let returnData = {
        activity_id: activity_id,
        open_id: open_id,
        act: 'del',
        state: 0,
      }
      activityCount = await activityObject.getJoinedCount(activity_id, open_id)
      if (activityCount.count) {
        await mysql('activityMember')
          .where('open_id', open_id)
          .andWhere('activity_id', activity_id)
          .del()
        returnData.state = 1
      }
      ctx.state.data = returnData

    }
    

  } else if (act == 'del') { 
    var { activity_id } = ctx.query
    activity_id = Number(activity_id)
    ctx.state.data = await activityObject.del(activity_id, open_id)

  } else if (act == 'getActivityDetail') {
    var { activity_id } = ctx.query
    activity_id = Number(activity_id)
    let item = await activityObject.getActivityDetail(activity_id)
    item.memberCount = await activityObject.getActivityMemberCount(activity_id)

    item.members = await activityObject.getActivityMembers(activity_id, 20, moment().format().toString(), open_id)

    item.joined = 0 
    item.user_info = JSON.parse(item.user_info)
    item.img_urls = JSON.parse(item.img_urls)
    item.my_open_id = open_id

    if (item.members.length > 0) {
      for (let i = 0; i < item.members.length; i++) {
        item.members[i].user_info = JSON.parse(item.members[i].user_info)
        if (item.members[i].open_id == open_id) {
          item.joined = 1
        }
      }

    }
    ctx.state.data =  item

  } else if (act == 'getActivityDetailMembers') {
    var { activity_id, add_time } = ctx.query
    add_time = add_time ? add_time : moment().format().toString(),
    activity_id = Number(activity_id)
    let members = await activityObject.getActivityMembers(activity_id, 20, add_time)

    if (members.length > 0) {
      for (let i = 0; i < members.length; i++) {
        members[i].user_info = JSON.parse(members[i].user_info)
      }

    }
    ctx.state.data = members

  } else if (act == 'getCustomerInfo') {
    let customerInfo = await memberObject.getCustomerInfo(open_id)
    .then(res =>{
      if (!res) {
        return memberObject.newCustomerInfo(ctx.state.$wxInfo.userinfo)
      } else {
        return res
      }
    }).then(res => {
      if (res) {
        return memberObject.getCustomerInfo(open_id)
      } else {
        return false
      }
    })
    ctx.state.data = customerInfo
  } else if (act == 'getActivityTypes') {
    ctx.state.data = await activityObject.getActivityTypes()
  } else if (act == 'getActivityBuildingCount') {
    var { activity_id } = ctx.query
    activity_id = Number(activity_id)
    ctx.state.data = await activityObject.getActivityBuildingCount(activity_id)
  } else if (act == 'getActivityBuildingUnits') {
    var { activity_id, building } = ctx.query
    activity_id = Number(activity_id)
    building = Number(building)
    ctx.state.data = await activityObject.getActivityBuildingUnits(activity_id, building)
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
    var { title, type_id, only_verified, date, description, img_urls } = ctx.request.body
    img_urls = JSON.stringify(img_urls)
    if (title.length > 30 || description.length > 300) {
      ctx.state.code = '-1'
      ctx.state.data = '标题或详细内容超出长度'
    } else {
      ctx.state.data = await mysql('activity').insert(
        { title: title, type_id: type_id, only_verified: only_verified, description: description, end_time: date, open_id: open_id, img_urls: img_urls })
        .then(function (id) {
          activity_id = id[0]
          return mysql('activityMember').insert({
            activity_id: activity_id, open_id: open_id
          })
        })
        .then(() => ({
          activity_id: activity_id,
        }))
    }
  } else if (act == 'setCustomerInfo') {
    var { field, value } = ctx.request.body
    let updateData = {}
    if (field == 'real_name' || field == 'phone' || field == 'building' || field == 'floor' || field == 'unit' || field == 'published' || field == 'house_id') {
      updateData[field] = value
    } else if (field == 'address') {
      if (value.building && value.floor && value.unit) {
        updateData.building = value.building
        updateData.floor = value.floor
        updateData.unit = value.unit
      } else {
        ctx.state.code = '-1'
        ctx.state.data = '不正确的楼栋号'
      }
      
    }

    if (updateData) {
      ctx.state.data = await memberObject.setCustomerInfo(open_id, updateData) 
    }

  }else {
    ctx.state.data = act
  }

}

module.exports = {
  post,
  get
}
