// 引入 QCloud 小程序增强 SDK
var api = require('../../../vendor/utils/api.js');
var qcloud = require('../../../vendor/wafer2-client-sdk/index');
var Zan = require('../../../dist/index');
var util = require('../../../vendor/utils/util.js');
var storage = require('../../../vendor/utils/storage.js')

// 引入配置
var config = require('../../../config');

Page(Object.assign({}, Zan.TopTips, Zan.Tab, {
  data: {
    activity_id: 0,
    message: '',
    item:{},
    pending: 0,
    userinfo: {},
    last_time : '',
    loadingMore : false,
    loading: false,
    hasMore: true,
  },

  initData() {
    this.setData({
      pending: 0,
      last_time: '',
      loadingMore: false,
      loading: false,
      hasMore: true,
      notice: ""
    })
  },

  onHide() {
      this.setData({
          loading: false,
      })
  },

  onLoad(option) {
    let that = this
    var activity_id = Number(option.id)
    if (activity_id < 1) return
    this.setData({
        activity_id: activity_id,
        notice: ''
    })
    this.loadActivity(activity_id)
  },

  loadActivity(activity_id) {
    let that = this
    that.setData({ loading: true })

    api.baseAction('getActivityDetail',{

      data: {
        activity_id: activity_id
      },
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        result.data.data.start_time = util.formatDayAndTime(new Date(result.data.data.start_time))
        result.data.data.end_time = util.formatDayAndTime(new Date(result.data.data.end_time))
        result.data.data.members = []
        that.setData({ item: result.data.data });
        that.setData({ 
            loading: false,
            notice: "" 
        })
        that.getActivityMembers()
        console.log('request success', result);

      },
    })
    
  },

  getActivityMembers: function (reload = false) {
    var that = this
    let add_time = reload ? 0 : this.data.last_time
    let activity_id = this.data.activity_id
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityDetailMembersReport',
        activity_id: activity_id, 
        add_time: add_time
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let activityItem = that.data.item

        result.data.data.forEach(function (item, index) {
          if (item) {
            item.add_time = util.formatDayAndTime(new Date(item.add_time))
            item.address = util.formatAddress(item.building, item.floor, item.unit, activityItem.house_config)
            activityItem.members.push(item)
          }
        })

        that.setData({ 
          item: activityItem,
          last_time: result.data.data[result.data.data.length - 1].add_time,
          hasMore: result.data.data.length < 40 ? false : true,
          loadingMore: false
        });

        console.log('request success', result);
      }
    })
  },


  onReachBottom: function () {

    if (this.data.loadingMore || !this.data.hasMore) return
    this.setData({
      loadingMore: true
    });
    this.getActivityMembers()
    console.log('to bottom');
  },


}))