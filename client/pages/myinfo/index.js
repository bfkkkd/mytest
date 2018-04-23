// pages/myinfo/index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var Field = require('../../common/field/index');
var Zan = require('../../dist/index');

// 引入配置
var config = require('../../config');

Page(Object.assign({}, Field, Zan.TopTips, Zan.Toast, Zan.Switch, {
  data: {
    inputData: {
      buildingIndex: 0,
      floorIndex: 0,
      unitIndex: 0,
    },
    buildings: [],
    floors: [],
    units: [],
    pending: '',
    houseId : 0,
    houseName : '',
    allHouse : [],
    houseIndex : 0,
    saved: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initCustomerInfo()
  },

  initCustomerInfo() {
    var that = this
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getCustomerInfo',
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let inputData = that.data.inputData
        let resultData = result.data.data
        resultData['buildingIndex'] = resultData['building']
        resultData['floorIndex'] = resultData['floor']
        resultData['unitIndex'] = resultData['unit']

        Object.assign(inputData,result.data.data)
        that.setData({
          inputData: inputData,
          houseId: resultData.house_id,
        })
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

  setCustomerInfo (field, value) {
    let that = this

    this.setData({
      pending: true
    });
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,
      method: 'POST',

      data: {
        act: 'setCustomerInfo',
        field: field,
        value: value
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        that.setData({
          pending: false
        });
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


  handleZanSwitchChange(e) {
    var { checked, componentId } = e
    var inputData = this.data.inputData
    checked = checked ? 1 : 0
    if (inputData[componentId] == checked) return
    inputData[componentId] = checked
    this.setCustomerInfo(componentId, inputData[componentId])
    this.setData({
      inputData: inputData
    });

  },

  showTopTips(title) {
    this.showZanTopTips(title)
  },
  showToast(e) {
    let content = e.currentTarget.dataset.content
    this.showZanToast(content);
  },

}))