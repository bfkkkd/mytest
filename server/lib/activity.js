const { mysql } = require('../qcloud')

async function getActivitis(house_id=1, type_id = 1, start = 0) {
  return mysql('activity')
    .join('cSessionInfo', 'cSessionInfo.open_id', 'activity.open_id')
    .select('activity.id', 'activity.title', 'activity.open_id', 'cSessionInfo.user_info')
    .where('activity.type_id', type_id)
    .andWhere('activity.house_id', house_id)
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
      .select('activity.id', 'activity.house_id', 'activity.title', 'activity.description', 'activity.img_urls', 'activity.start_time', 'activity.end_time', 'activity.only_verified', 'activity.open_id', 'cSessionInfo.user_info', 'activityType.id AS type_id', 'activityType.name AS type_name')
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

async function getActivityMembers(activityId, limit = 20, start, open_id = '') {
  let returnData = mysql('activityMember')
    .leftJoin('cSessionInfo', 'cSessionInfo.open_id', 'activityMember.open_id')
    .leftJoin('customerInfo', 'customerInfo.open_id', 'activityMember.open_id')
    .select('activityMember.open_id', 'cSessionInfo.user_info', 'activityMember.remark', 'activityMember.add_time', 'customerInfo.real_name', 'customerInfo.building', 'customerInfo.floor', 'customerInfo.unit', 'customerInfo.verified')
    .where('activityMember.activity_id', activityId)
    .andWhere('activityMember.add_time', '<', start)
  if (open_id) {
    returnData.orderByRaw('activityMember.open_id = ? desc', open_id)
  }

  return returnData.orderBy('add_time', 'desc')
    .limit(limit)

}

async function getActivityMemberCount(activityId) {
  return mysql('activityMember')
    .count('open_id as count')
    .where('activity_id', activityId)
    .first()
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
    .where('is_show', '1')
    .limit(20)
    .orderBy('sort_id')

}

async function getActivityBuildingCount(activityId) {
  return mysql('activityMember')
    .leftJoin('customerInfo', 'customerInfo.open_id', 'activityMember.open_id')
    .select('customerInfo.building')
    .count('activityMember.open_id as count')
    .where('activityMember.activity_id', activityId)
    .groupBy('building')
    .orderBy('building')
}

async function getActivityBuildingUnits(activityId,Building) {
  return mysql('activityMember')
    .leftJoin('customerInfo', 'customerInfo.open_id', 'activityMember.open_id')
    .select('customerInfo.building', 'customerInfo.floor', 'customerInfo.unit')
    .where('activityMember.activity_id', activityId)
    .andWhere('customerInfo.building', Building)
    .orderBy('floor')
    .orderBy('unit')
}

module.exports = {
  getActivitis,
  getMyActivitis,
  getActivityDetail,
  getActivityMemberCount,// not include mine
  getMemberCount,
  getActivityMembers,
  getJoined,
  getJoinedCount,
  del,
  getActivityTypes,
  getActivityBuildingCount,
  getActivityBuildingUnits
}