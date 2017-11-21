// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

Page({
  data: {
    message: '',
    items:[],
    memberCount: [],
    activityMembers: [],
    joinedCount: [],
    pending:0,
    loading:true,
  },

  getActivityMembers: function (ids) {
    var that = this
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityMembers',
        activity_ids: ids
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let activityMembers = that.data.activityMembers
        let memberCount = that.data.memberCount

        result.data.data.forEach(function (item, index) {
          if (item) {
            memberCount[item.activityId] = item.memberData.length
            activityMembers[item.activityId] = item.memberData
          }
        })

        that.setData({ 
          activityMembers: activityMembers,
          memberCount: memberCount,
          loading: false
        });

        console.log('request success', result);
      }
    })
  },

  onLoad () {
    var that = this
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getMyActivity',
        start: 0
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let activityIds = []
        let reJoinedCount = []

        result.data.data.activityRows.forEach(function (item, index) {
          activityIds.push(item.id)
        });  

        result.data.data.joinedCount.forEach(function (item, index) {
          reJoinedCount[item.activity_id] = item.joined
        }); 

        that.setData({ items: result.data.data.activityRows });
        that.setData({ joinedCount: reJoinedCount });
        console.log('request success', result);

        that.getActivityMembers(activityIds)

      },

      fail(error) {
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
      }
    })

  },

  delActivity : function(e) {
    console.log(e)

    let that = this
    let id = e.currentTarget.dataset.id

    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'del',
        activity_id: id,
      },

      login: true,

      success(result) {
        that.onLoad()
        console.log('request success', result);
      },

      fail(error) {
        console.log('request fail', error);
      },
    })
  },

  openDetail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '../detail/index?id=' + id });
  },

})