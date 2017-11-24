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
    saved: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initCustomerInfo()
    let buildings = []
    let floors = []
    let units = []
    buildings[0] = '？栋'
    floors[0] = '？层'
    units[0] = '？单'
    for (let i=0; i<20; i++) {
      buildings[i+1] = (i + 1) + "栋"
    }
    for (let i = 0; i < 32; i++) {
      floors[i + 1] = (i + 1) + "层"
    }
    for (let i = 0; i < 6; i++) {
      units[i + 1] = "0" + (i + 1) + "单元"
    }

    this.setData({
      buildings: buildings,
      floors: floors,
      units: units
    })
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
        resultData['building'] = that.data['buildings'][resultData['buildingIndex']]
        resultData['floor'] = that.data['floors'][resultData['floorIndex']]
        resultData['unit'] = that.data['units'][resultData['unitIndex']]

        Object.assign(inputData,result.data.data)
        that.setData({
          inputData: inputData,
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

  bindMultiPickerChange(e) {
    console.log(e)
    let inputData = this.data.inputData
    let tmpdata = e.detail.value
    let buildingIndex = tmpdata[0]
    let floorIndex = tmpdata[1]
    let unitIndex = tmpdata[2]
    
    inputData['building'] = this.data['buildings'][buildingIndex]
    inputData["buildingIndex"] = buildingIndex
    inputData['floor'] = this.data['floors'][floorIndex]
    inputData["floorIndex"] = floorIndex
    inputData['unit'] = this.data['units'][unitIndex]
    inputData["unitIndex"] = unitIndex
    this.setCustomerInfo('address', {
      building : inputData['building'],
      floor: inputData['floor'],
      unit: inputData['unit'],
    })
    console.log(inputData)
    this.setData({
      inputData: inputData
    });
  },

  onAddressChange(e) {
    console.log(e)
    let inputData = this.data.inputData
    let addressType = e.currentTarget.id
    let addressIndex = e.detail.value
    if (inputData[addressType] == this.data[addressType + 's'][addressIndex]) return
    inputData[addressType] = this.data[addressType + 's'][addressIndex]
    inputData[addressType + "Index"] = addressIndex
    console.log(inputData)
    this.setCustomerInfo(addressType, inputData[addressType])
    this.setData({
      inputData: inputData
    });
  },

  handleZanFieldChange(e) {
    const { componentId, detail } = e;
    var inputData = this.data.inputData
    if (inputData[componentId] == detail.value) return
    inputData[componentId] = detail.value

    if (this.checkData(componentId, inputData[componentId])){
      this.setCustomerInfo(componentId, inputData[componentId])
      this.setData({
        inputData: inputData
      });
    }
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

  checkData(key,data) {
    let flag = true;
    if (key == 'phone') {
      var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
      if (!myreg.test(data)) {
        this.showTopTips("电话格式不符！❤️");
        return flag = false;
      }
    }
    return flag;
  },
  showTopTips(title) {
    this.showZanTopTips(title)
  },
}))