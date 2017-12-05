// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var Zan = require('../../dist/index');
var util  = require('../../vendor/utils/util.js');

// 引入配置
var config = require('../../config');

Page(Object.assign({}, Zan.TopTips, Zan.Tab, {
  data: {
    message: '',
    item:{},
    pending: 0,
    userinfo: {},
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
        result.data.data.start_time = util.formatDayAndTime(new Date(result.data.data.start_time))
        result.data.data.end_time = util.formatDayAndTime(new Date(result.data.data.end_time))
        result.data.data.members.forEach(function (mitem, idx) {
          mitem.add_time = util.formatDayAndTime(new Date(mitem.add_time))
          if (mitem.open_id == result.data.data.open_id) {
            result.data.data.memberIdx = idx
          }
        })
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
    let remark = e.detail.value.remark
    var item = this.data.item
    item.joined = e.detail.target.dataset.type == 'del' ? false : true

    if (item.joined && remark == item.members[item.memberIdx].remark) {
      return
    }

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
        join: item.joined,
        remark: remark
      },

      login: true,

      success(result) {
        let act = result.data.data.act
        let user_info = {}
        if (act == 'join') {
          wx.getUserInfo({
            success: res => {
              let exist = false
              item.members.forEach(function (mitem, idx) {
                if (mitem.open_id == result.data.data.open_id) {
                  mitem.remark = remark
                  exist = true
                }
              })
              if (exist == false) {
                let newMember = { open_id: result.data.data.open_id, user_info: res.userInfo }
                item.members.push(newMember)
                item.memberIdx = item.members.length-1
              }
              item.joined = 1
              that.setData({
                item: item,
                pending: 0
              });
            }
          })

        } else if (act == 'del') {
          item.joined = 0
          that.setData({
            item: item,
            pending: 0
          });
        }
        console.log('request success', result);
      },

      fail(error) {
        item.joined = !item.joined
        that.setData({
          item: item,
          pending: 0
        });
        that.showTopTips(error.type)
        console.log('request fail', error);
      },
    })
  },

  onShareAppMessage() {
    let title = `🔴${this.data.userInfo.nickName}推荐你参加活动：${this.data.item.title}`;
    return {
      title: title,
    }

  },

  showTopTips(title) {
    this.showZanTopTips(title)
  },

  previewImage(e) {
    var that = this
    console.log(e)
    let id = e.currentTarget.dataset.idx
    wx.previewImage({
      current: that.data.item.img_urls[id],
      urls: that.data.item.img_urls
    })
  },

}))