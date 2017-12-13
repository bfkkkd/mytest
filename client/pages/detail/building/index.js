// pages/detail/building/index.js

// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../../vendor/wafer2-client-sdk/index');
var Zan = require('../../../dist/index');
var util = require('../../../vendor/utils/util.js');

// 引入配置
var config = require('../../../config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity_id: 0,
    building: 1,
    buildingData: [],
    floors: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
    units: [1,2,3,4,5,6]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let activity_id = Number(options.id)
    let building = Number(options.building)
    let that = this
    this.setData({ 
      activity_id: activity_id,
      building: building
    });
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityBuildingUnits',
        activity_id: activity_id,
        building: building
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log(result)
        
        let buildingData = []
        result.data.data.forEach(function (item, index) {
          if (item.floor) {
            buildingData[item.floor] = []
            buildingData[item.floor][item.unit] = 1
          }
        })
        that.setData({ buildingData: buildingData });
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})