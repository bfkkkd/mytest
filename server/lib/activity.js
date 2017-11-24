const { mysql } = require('../qcloud')

async function getActivitis(type_id = 1, start = 0) {
  return mysql('activity')
    .join('cSessionInfo', 'cSessionInfo.open_id', 'activity.open_id')
    .select('activity.id', 'activity.title', 'activity.open_id', 'cSessionInfo.user_info')
    .where('activity.type_id', type_id)
    .andWhere('activity.id', '<', start)
    .orderBy('activity.id', 'desc')
    .limit(20)
}

async function getMyActivitis(open_id) {
  return mysql('activity')
    .join('cSessionInfo', 'cSessionInfo.open_id', 'activity.open_id')
    .join('activityType', 'activityType.id', 'activity.type_id')
    .select('activity.id', 'activity.title', 'activity.open_id', 'cSessionInfo.user_info', 'activityType.id AS type_id', 'activityType.name AS type_name')
    .where('activity.open_id', open_id)
    .orderBy('activity.id', 'desc')
    .limit(20)
}

async function getActivityDetail(activityId) {
  return mysql('activity')
    .join('cSessionInfo', 'cSessionInfo.open_id', 'activity.open_id')
    .join('activityType', 'activityType.id', 'activity.type_id')
    .select('activity.id', 'activity.title', 'activity.description', 'activity.start_time', 'activity.end_time', 'activity.open_id', 'cSessionInfo.user_info', 'activityType.id AS type_id', 'activityType.name AS type_name')
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

async function getActivityMembers(activityId, limit = 20) {
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

async function getJoinedCount(activityId, openId) {
  return mysql('activityMember')
    .count('open_id as count')
    .where('open_id', openId)
    .andWhere('activity_id', activityId)
    .first()
}

async function del(activityId, open_id) {
  return mysql('activityMember')
    .where('activity_id', activityId)
    .del()
    .then(function (res) {
      return mysql('activity')
        .where('id', activityId)
        .andWhere('open_id', open_id)
        .del()
    }).then((res) => {
      return res
    })
}

async function getActivityTypes() {
  return mysql('activityType')
    .select('id', 'name')
    .limit(20)
    .orderBy('sort_id')

}

module.exports = {
  getActivitis,
  getMyActivitis,
  getActivityDetail,
  getMemberCount,
  getActivityMembers,
  getJoined,
  getJoinedCount,
  del,
  getActivityTypes
}