// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

Page({
  data: {
    message: '',
    item:{},
    pending: 0,
    userinfo: {}
  },

  onLoad(option) {
    let that = this
    wx.getUserInfo({
      success: function (res) {
        that.setData({ userInfo: res.userInfo });
      }
    })
    var activity_id = Number(option.id)
    if (activity_id < 1) return
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityDetail',
        activity_id: activity_id
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        result.data.data.start_time = that.date_format(new Date(result.data.data.start_time))
        result.data.data.end_time = that.date_format(new Date(result.data.data.end_time))
        that.setData({ item: result.data.data });
        console.log('request success', result);
      },

      fail(error) {
        console.log('request fail', error);
      },
    })
  },

  doActivity : function(e) {
    console.log(e)
    if (this.data.pending != 0) return

    var that = this
    let formId = e.detail.formId
    var item = this.data.item
    item.joined = !item.joined;

    this.setData({
      pending: 1
    });

    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'join',
        activity_id: item.id,
        form_id: formId,
        join: item.joined
      },

      login: true,

      success(result) {
        let act = result.data.data.act
        let user_info = {}
        if (act == 'join') {
          wx.getUserInfo({
            success: res => {
              let newMember = { open_id: result.data.data.open_id, user_info: res.userInfo }
              item.members.push(newMember)
              that.setData({
                item: item,
                pending: 0
              });
            }
          })

        } else if (act == 'del') {
          item.members.forEach(function (mitem, idx) {
            if (mitem.open_id == result.data.data.open_id) {
              item.members.splice(idx, 1);
            }
          })
          that.setData({
            item: item,
            pending: 0
          });
        }

        that.setData({
          item: item,
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

  date_format(date) {
    return date.getFullYear() + "-" 
          + (date.getMonth() + 1) 
          + "-" + date.getDate() 
          + " " + date.getHours() 
          + "点" + date.getMinutes() + "分"

  },

  onShareAppMessage() {
    let title = `🔴${this.data.userInfo.nickName}推荐你参加活动：${this.data.item.title}`;
    return {
      title: title,
    }

  },

})