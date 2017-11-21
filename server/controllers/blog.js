const { mysql,message: { checkSignature } } = require('../qcloud')

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

async function getActivitis(start = 0) {
  return mysql('activity')
  .join('cSessionInfo', 'cSessionInfo.open_id', 'activity.open_id')
  .select('activity.id', 'activity.title', 'activity.open_id', 'cSessionInfo.user_info')
  .where('activity.id', '<', start)
  .orderBy('id', 'desc')
  .limit(20)
}

async function getMyActivitis(open_id) {
  return mysql('activity')
    .join('cSessionInfo', 'cSessionInfo.open_id', 'activity.open_id')
    .select('activity.id', 'activity.title', 'activity.open_id', 'cSessionInfo.user_info')
    .where('activity.open_id', open_id)
    .orderBy('id', 'desc')
    .limit(20)
}

async function getActivityDetail(activityId) {
  return mysql('activity')
      .join('cSessionInfo', 'cSessionInfo.open_id', 'activity.open_id')
      .select('activity.id', 'activity.title', 'activity.description', 'activity.start_time', 'activity.end_time', 'activity.open_id', 'cSessionInfo.user_info')
      .where('activity.id', activityId)
      .first()
}

async function getMemberCount(activityIdArray) {
  return mysql('activityMember')
  .select('activity_id')
  .count('open_id as count')
  .whereIn('activity_id', activityIdArray)
  .groupBy('activity_id')

}

async function getActivityMembers(activityId, limit=20) {
  return mysql('activityMember')
    .join('cSessionInfo', 'cSessionInfo.open_id', 'activityMember.open_id')
    .select('cSessionInfo.open_id', 'cSessionInfo.user_info')
    .where('activityMember.activity_id', activityId).limit(limit)

}

async function getJoined(activityIdArray, openId) {
  return mysql('activityMember')
    .select('activity_id')
    .count('open_id as joined')
    .whereIn('activity_id', activityIdArray)
    .andWhere('open_id', openId)
    .groupBy('activity_id')
}

/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function get(ctx, next) {
  const { act } = ctx.query
  const open_id = ctx.state.$wxInfo.userinfo.openId
  ctx.state.code = '0'
  if (act == 'getActivity') {
    var { start } = ctx.query
    start = Number(start)
    let activityRows = await getActivitis(start)
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
    
    memberCount = await getMemberCount(activityIdArray)
    joinedCount = await getJoined(activityIdArray, open_id)
    ctx.state.data = {
      'activityRows': activityRows,
      'memberCount': memberCount,
      'joinedCount': joinedCount
    }

  } else if (act == 'getMyActivity') {
    let activityRows = await getMyActivitis(open_id)
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

    memberCount = await getMemberCount(activityIdArray)
    joinedCount = await getJoined(activityIdArray, open_id)
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
        member = await getActivityMembers((activityId))
        tmpMember.activityId = activityId
        tmpMember.memberData = []
        member.forEach(function (item, index) {
          itemJson = JSON.parse(item.user_info)
          tmpMember.memberData.push(
            {
              'avatarUrl': itemJson.avatarUrl,
              'nickName': itemJson.nickName
            }
          )
        })
        members.push(tmpMember)
      }
    }
      ctx.state.data = members

  } else if (act == 'join') {
    var { activity_id,join } = ctx.query
    activity_id = Number(activity_id)
    const remark = ''
    if (join == 'true') {
      ctx.state.data = await mysql('activityMember')
        .count('open_id as count')
        .where('open_id', open_id)
        .andWhere('activity_id', activity_id)
        .then(res => {
          // 如果存在用户则更新
          if (res[0].count) {
            return true
          } else {
            return mysql('activityMember').insert({
              activity_id, open_id, remark
            })
          }
        })
        .then(() => ({
          activity_id: activity_id,
          open_id: open_id,
          act: 'join'
        }))
    } else {
      ctx.state.data = await mysql('activityMember')
        .count('open_id as count')
        .where('open_id', open_id)
        .andWhere('activity_id', activity_id)
        .then(res => {
          // 如果存在用户则更新
          if (res[0].count) {
            return mysql('activityMember')
              .where('open_id', open_id)
              .andWhere('activity_id', activity_id)
              .del()
          } else {
            return true
          }
        })
        .then(() => ({
          activity_id: activity_id,
          open_id: open_id,
          act : 'del'
        }))

    }
    

  } else if (act == 'del') { 
    var { activity_id } = ctx.query
    activity_id = Number(activity_id)
    ctx.state.data = await mysql('activityMember')
      .where('activity_id', activity_id)
      .andWhere('open_id', open_id)
      .del()
      .then(function (res) {
        return mysql('activity')
          .where('id', activity_id)
          .andWhere('open_id', open_id)
          .del()
      }).then((res) => {
        return res
      })

  } else if (act == 'getActivityDetail') {
    var { activity_id } = ctx.query
    activity_id = Number(activity_id)
    let item = await getActivityDetail(activity_id)
    item.members = await getActivityMembers(activity_id, 20)

    item.joined = 0 
    item.user_info = JSON.parse(item.user_info)

    if (item.members.length > 0) {
      for (let i = 0; i < item.members.length; i++) {
        item.members[i].user_info = JSON.parse(item.members[i].user_info)
        if (item.members[i].open_id == open_id) {
          item.joined = 1
        }
      }

    }
    ctx.state.data =  item

  } else if (act == 'getActivityDetail') {
    var { activity_id } = ctx.query
    activity_id = Number(activity_id)
    let item = await getActivityDetail(activity_id)
    item.members = await getActivityMembers(activity_id, 20)

    item.joined = 0 
    item.user_info = JSON.parse(item.user_info)

    if (item.members.length > 0) {
      for (let i = 0; i < item.members.length; i++) {
        item.members[i].user_info = JSON.parse(item.members[i].user_info)
        if (item.members[i].open_id == open_id) {
          item.joined = 1
        }
      }

    }
    ctx.state.data =  item

  
  
  } else if (act == 'getCustomerInfo') {
    let customerInfo = await getCustomerInfo(open_id)
    .then(res =>{
      if (!res) {
        return newCustomerInfo(ctx.state.$wxInfo.userinfo)
      } else {
        return res
      }
    }).then(res => {
      if (res) {
        return getCustomerInfo(open_id)
      } else {
        return false
      }
    })
    ctx.state.data = customerInfo
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
    var { title, date, description } = ctx.request.body
    if (title.length > 30 || description.length > 300) {
      ctx.state.code = '-1'
      ctx.state.data = '标题或详细内容超出长度'
    } else {
      ctx.state.data = await mysql('activity').insert(
        { title: title, description: description, end_time: date , open_id: open_id })
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
    if (field == 'real_name' || field == 'phone' || field == 'building' || field == 'floor' || field == 'unit' || field == 'published') {
      ctx.state.data = await setCustomerInfo(open_id, field, value) 
    }
  }else {
    ctx.state.data = act
  }

}

module.exports = {
  post,
  get
}
