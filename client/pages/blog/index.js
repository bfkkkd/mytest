// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

Page({
  data: {
    message: '',
    items:[],
    pending:0,
  },

  onLoad () {
    var that = this
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivity',
        start: 0
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        that.setData({ items: result.data.data });
        console.log('request success', result);
      },

      fail(error) {
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
      }
    })

  },

  doActivity : function(e) {
    console.log(e)
    if (this.data.pending != 0) return

    var that = this
    var id = e.target.dataset.id
    var idx = e.target.dataset.idx
    var itemTemp = this.data.items;
    var item = itemTemp[idx]
    item.joined = !item.joined;

    this.setData({
      pending: id
    });

    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'join',
        activity_id: item.id,
        join: item.joined
      },

      login: true,

      success(result) {
        item.memberCount = item.joined ? ++item.memberCount : --item.memberCount
        itemTemp[idx] = item
        that.setData({
          items: itemTemp,
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

})