// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

Page({
  data: {
    userInfo: {}
  },

  onLoad: function () {
    let that = this
    wx.getUserInfo({
      success: function (res) {
        that.setData({ userInfo: res.userInfo });
        console.log(res.userInfo);
      }
    })
  },
})
