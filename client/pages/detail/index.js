// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var Zan = require('../../dist/index');
var util  = require('../../vendor/utils/util.js');
var storage = require('../../vendor/utils/storage.js')

// 引入配置
var config = require('../../config');

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
    showPopup: false,
    showBottomPopup: false,
    showCenterPopup: false,
    hideToggle: false,
    customInfoLoad: false,
    houseData: {},
    notice: ""
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
    wx.getUserInfo({
        success: function (res) {
            let houseData = storage.get('house') || {}
            that.setData({
                houseData: houseData
            })
            that.loadActivity(activity_id)
            setTimeout(function () {
                if (that.data.loading == true) {
                    that.setData({
                        loading: false,
                        notice: "网络异常，请点击重试！"
                    })
                }
            }, 10000)
        },
        fail: function (err) {
            wx.openSetting()
            that.setData({
                loading: false,
                notice: "网络异常，请点击重试！"
            })
        }
    })
  },

  loadActivity(activity_id) {
    let that = this
    that.setData({ loading: true })
    wx.getUserInfo({
      success: function (res) {
        that.setData({ userInfo: res.userInfo });
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
              mitem.address = util.formatAddress(mitem.building, mitem.floor, mitem.unit, result.data.data.house_config)
              if (mitem.open_id == result.data.data.my_open_id) {
                result.data.data.memberIdx = idx
              }
            })
            that.setData({ item: result.data.data });

            let memberLehgth = result.data.data.members.length
            if (memberLehgth > 0) {
              that.setData({
                last_time: result.data.data.members[memberLehgth - 1].add_time,
                hasMore: memberLehgth < 20 ? false : true
              });
            }
            that.setData({ 
                loading: false,
                notice: "" 
            })
            console.log('request success', result);
          },

          fail(error) {
            that.setData({ 
                loading: false,
                notice: "网络异常，请点击重试！"
            })
            console.log('request fail', error);
          },
        })
      }
    })
    
  },

  doActivity : function(e) {
    console.log(e)
    if (this.data.pending != 0) return

    if (this.data.houseData.id && this.data.item.house_id != this.data.houseData.id) {
        this.showTopTips('只允许本小区业主参与，请确认个人信息正确！')
        return
    }

    var that = this
    let formId = e.detail.formId
    let remark = e.detail.value.remark
    var item = this.data.item
    item.joined = e.detail.target.dataset.type == 'del' ? false : true

    if (item.joined && item.members[item.memberIdx] && remark == item.members[item.memberIdx].remark) {
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
          //弹出用户信息
          let tmpUserInfo = result.data.data.user_info
          if (!tmpUserInfo.building || !tmpUserInfo.floor || !tmpUserInfo.house_id || !tmpUserInfo.phone || !tmpUserInfo.real_name || !tmpUserInfo.unit) {
            that.togglePopup()
          } else {
              that.toggleCenterPopup()
          }
          wx.getUserInfo({
            success: res => {
              let exist = false
              item.members.forEach(function (mitem, idx) {
                if (mitem.open_id == result.data.data.open_id) {
                  mitem.remark = remark
                  item.memberIdx = idx
                  exist = true
                }
              })
              if (exist == false) {
                let tmpUserInfo = result.data.data.user_info
                let newMember = Object.assign({ 
                  open_id: result.data.data.open_id, 
                  remark: remark, 
                  user_info: res.userInfo,  
                  add_time: util.formatDayAndTime(new Date()),
                  address: util.formatAddress(tmpUserInfo.building, tmpUserInfo.floor, tmpUserInfo.unit, item.house_config)
                }, tmpUserInfo)
                item.members.unshift(newMember)
                item.memberIdx = 0
                item.memberCount.count++
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
          item.members.splice(item.memberIdx, 1)
          item.memberIdx = -1
          item.memberCount.count--
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

  getActivityMembers: function (reload = false) {
    var that = this
    let add_time = reload ? 0 : this.data.last_time
    let activity_id = this.data.item.id
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityDetailMembers',
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

        if (result.data.data.length) {
            add_time = result.data.data[result.data.data.length - 1].add_time
        }

        that.setData({ 
          item: activityItem,
          last_time: add_time,
          hasMore: result.data.data.length < 20 ? false : true,
          loadingMore: false
        });

        console.log('request success', result);
      }
    })
  },

  onPullDownRefresh: function () {
    console.log('refresh');
    if (this.data.loading) return 
    this.initData()
    this.loadActivity(this.data.activity_id)
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {

    if (this.data.loadingMore || !this.data.hasMore) return
    this.setData({
      loadingMore: true
    });
    this.getActivityMembers()
    console.log('to bottom');
  },

  onShareAppMessage() {
    let title = `🔴${this.data.userInfo.nickName}参与了小区活动：${this.data.item.title}`;
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

  goMine(e) {
    wx.navigateTo({
      url: '/pages/myinfo/index'
    })
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  goNew() {
    wx.switchTab({
      url: '/pages/new/index'
    })
  },

  goChart() {
    wx.navigateTo({ url: 'charts/index?id=' + this.data.item.id });
  },

  togglePopup(e) {
    this.setData({
        showPopup: !this.data.showPopup,
        customInfoLoad: true,
        showCenterPopup: false,
        hideToggle: e ? true : false
    });
  },

  toggleCenterPopup(e) {
      if (!e || !this.data.hideToggle) {
          this.setData({
            showPopup: false,
            showCenterPopup: !this.data.showCenterPopup,
          });
      }
      
  },

  fieldFinished(res) {
      let field = res.detail.field
      let value = res.detail.value
      var item = this.data.item
      if (item.memberIdx != -1) {
          if (field == 'address') {
              item.members[item.memberIdx]['address'] = util.formatAddress(value.building, value.floor, value.unit, item.house_config)
              item.members[item.memberIdx]['building'] = value.building
              item.members[item.memberIdx]['floor'] = value.floor
              item.members[item.memberIdx]['unit'] = value.unit
          } else {
              item.members[item.memberIdx][field] = value
          }
          
          this.setData({
              item: item,
          });
      }

  },

}))