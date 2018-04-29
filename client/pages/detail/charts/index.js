// pages/detail/charts/index.js
var charts = require('../../../vendor/utils/charts');

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
    buildingData: [],
    activityData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var activity_id = Number(options.id)
    if (activity_id < 1) return
    let that = this
    that.setData({ activity_id: activity_id });
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityBuildingCount',
        activity_id: activity_id
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log(result)
        let buildingData = [{building: 0, count: 0}]
        let buildingInfo = result.data.data.buildingInfo
        let activityRows = result.data.data.activityRows

        activityRows.house_config.buildings.unshift("?栋")
        
        buildingInfo.forEach(function (item, index) {
          if (!item.building) {
            buildingData[0].count += item.count
          } else {
            buildingData.push(item)
          }
        })
        that.setData({ 
            buildingData: buildingData,
            activityData: activityRows,
        });
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
  
  },
  
  openBuilding(e) {
    var building = e.currentTarget.dataset.building
    if (!building) return
    wx.navigateTo({ url: '../building/index?id=' + this.data.activity_id + '&building=' + building });
  },

  goDetail() {
    wx.redirectTo({ url: '../../detail/index?id=' + this.data.activity_id });
  },

})