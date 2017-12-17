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

        result.data.data.forEach(function (item, index) {
          if (item) {
            activityMembers[item.activityId] = item.memberData
          }
        })

        that.setData({ 
          activityMembers: activityMembers,
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
        let memberCount = that.data.memberCount

        result.data.data.activityRows.forEach(function (item, index) {
          activityIds.push(item.id)
        });  

        result.data.data.joinedCount.forEach(function (item, index) {
          reJoinedCount[item.activity_id] = item.joined
        }); 

        result.data.data.memberCount.forEach(function (item, index) {
          memberCount[item.activity_id] = item.count
        });

        that.setData({ 
          items: result.data.data.activityRows, 
          joinedCount: reJoinedCount,
          memberCount: memberCount
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

  delActivity : function(e) {
    console.log(e)
    let that = this
    let id = e.currentTarget.dataset.id

    wx.showModal({
      title: '提示',
      content: '删除将无法找回，确认删除吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
          })

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
              wx.hideLoading()
              console.log('request success', result);
            },

            fail(error) {
              wx.hideLoading()
              console.log('request fail', error);
            },
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  openDetail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '../detail/index?id=' + id });
  },

})