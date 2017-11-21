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
    loading: true,
    loadingMore: false,
    hasMore: true,
    lastId:0,
    userinfo : {}
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

        that.setData({ activityMembers: activityMembers });
        that.setData({ memberCount: memberCount });

        console.log('request success', result);
      }
    })
  },

  getActivity: function() {
    var that = this
    let start = this.data.lastId > 0 ? this.data.lastId : 9999999
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivity',
        start: start
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let activityIds = []
        let reJoinedCount = that.data.joinedCount
        let items = that.data.items

        result.data.data.activityRows.forEach(function (item, index) {
          activityIds.push(item.id)
          items.push(item)
        });

        result.data.data.joinedCount.forEach(function (item, index) {
          reJoinedCount[item.activity_id] = item.joined
        });

        that.setData({
          items: items,
          joinedCount: reJoinedCount,
          loading: false,
          lastId: activityIds[activityIds.length-1],
          hasMore: activityIds.length < 20 ? false : true
        });
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

  onLoad () {
    let that = this
    wx.getUserInfo({
      success: function (res) {
        that.setData({ userInfo: res.userInfo });
      }
    })
    this.ininData()
    this.getActivity()
  },

  ininData () {
    this.setData({
      message: '',
      items: [],
      memberCount: [],
      activityMembers: [],
      joinedCount: [],
      pending: 0,
      loading: true,
      loadingMore: false,
      hasMore: true,
      lastId: 0
    })
  },

  doActivity : function(e) {
    console.log(e)
    if (this.data.pending != 0) return

    let that = this
    let id = e.currentTarget.dataset.id
    let idx = e.currentTarget.dataset.idx
    let memberCount = this.data.memberCount;
    let joinedCount = this.data.joinedCount;
    joinedCount[id] = !joinedCount[id];

    this.setData({
      pending: id
    });

    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'join',
        activity_id: id,
        join: joinedCount[id]
      },

      login: true,

      success(result) {
        that.getActivityMembers([id])
        that.setData({
          joinedCount: joinedCount,
          pending: 0
        });
        console.log('request success', result);
      },

      fail(error) {
        that.setData({
          pending: 0
        });
        console.log('request fail', error);
      },
    })
  },

  openDetail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '../detail/index?id=' + id });
  },

  onPullDownRefresh: function () {
    if (this.data.loading) return 
    this.onLoad() 
    wx.stopPullDownRefresh()
  },

  onReachBottom: function(){

    if (this.data.loading || !this.data.hasMore) return
    this.setData({
      loadingMore: true
    });
    this.getActivity()
    this.setData({
      loadingMore: false
    });
    console.log('to bottom');
  },
  onShareAppMessage() {
    let title = `🔴${this.data.userInfo.nickName}给您发来了一个丰富社区神器`;
    return {
      title: title,
    }

  },

})