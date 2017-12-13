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
    charts: {
      area: ["上海,750", "杭州,425", "苏州,960", "南京,700", "广州,800", "厦门,975", "北京,375", "沈阳,775", "泉州,100", "哈尔滨,200"],
      pieData: [4, 4, 5, 9]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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