// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var cache = require('../../vendor/utils/cache.js');
var Zan = require('../../dist/index');

// 引入配置
var config = require('../../config');

Page(Object.assign({}, Zan.TopTips, Zan.Tab, {
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
    userinfo : {},
    types:{
      selectedId: 0,
      scroll: false,
    },
    type_id :0
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

        that.setData({ activityMembers: activityMembers });

        console.log('request success', result);
      }
    })
  },

  getActivity: function (reload = false) {
    var that = this
    let start = reload ? 9999999 : (this.data.lastId > 0 ? this.data.lastId : 9999999)
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivity',
        type_id: this.data.type_id,
        start: start
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let activityIds = []
        let reJoinedCount = reload ? [] : that.data.joinedCount
        let items = reload? [] : that.data.items
        let memberCount = that.data.memberCount

        result.data.data.activityRows.forEach(function (item, index) {
          activityIds.push(item.id)
          items.push(item)
        });

        result.data.data.joinedCount.forEach(function (item, index) {
          reJoinedCount[item.activity_id] = item.joined
        });

        result.data.data.memberCount.forEach(function (item, index) {
          memberCount[item.activity_id] = item.count
        });

        that.setData({
          items: items,
          joinedCount: reJoinedCount,
          memberCount: memberCount,
          loading: false,
          loadingMore: false,
          lastId: activityIds[activityIds.length-1],
          hasMore: activityIds.length < 20 ? false : true
        });
        console.log('request success', result);

        that.getActivityMembers(activityIds)

      },

      fail(error) {
        that.setData({
          loading: false,
          loadingMore: false,
        });
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
      }
    })
  },

  getActivityTypes() {
    var that = this
    let types = cache.get('activity_types')
    if (types) {
      console.log(types)
      let type_id = this.data.type_id
      type_id = type_id ? type_id : types.list[0].id

      this.setData({
        types: types,
        type_id: type_id
      });
      that.getActivity()
      return
    }

    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityTypes'
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let types = that.data.types
        let type_id = that.data.type_id
        types.list = result.data.data
        types.selectedId = types.selectedId ? types.selectedId : result.data.data[0].id
        type_id = type_id ? type_id : result.data.data[0].id
        result.data.data.forEach(function (item, index) {
          item.title = item.name
        })

        cache.put('activity_types', types, 30)

        that.setData({
          types: types,
          type_id: type_id
        });
        console.log('request success', result);
        that.getActivity()
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
    this.getActivityTypes()
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
    let id = e.detail.target.dataset.id
    let idx = e.detail.target.dataset.idx
    let formId = e.detail.formId
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
        form_id: formId,
        join: joinedCount[id],
        remark: '+1'
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
        joinedCount[id] = 0
        that.setData({
          joinedCount: joinedCount,
          pending: 0
        });
        that.showTopTips(error.type)
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
      loading:true,
      loadingMore: true
    });
    this.getActivity()
    console.log('to bottom');
  },
  onShareAppMessage() {
    let title = `🔴${this.data.userInfo.nickName}给您发来了一个丰富社区助手`;
    return {
      title: title,
    }

  },

  handleZanTabChange(e) {
    var componentId = e.componentId;
    var selectedId = e.selectedId;

    this.setData({
      [`types.selectedId`]: selectedId,
      type_id: selectedId,
      items:[],
      loading: true,
    });
    this.getActivity(true)
  },

  showTopTips(title) {
    this.showZanTopTips(title)
  },

}))