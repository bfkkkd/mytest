// pages/myinfo/index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var Field = require('../../common/field/index');
var Zan = require('../../dist/index');

// 引入配置
var config = require('../../config');

Component({
  properties: {
    houseId: {
      type: Number,
      value: 1
    },
  },

  data: {
    inputData: {
      buildingIndex: 0,
      floorIndex: 0,
      unitIndex: 0,
    },
    pending: '',
    buildings: [],
    floors: [],
    units: [],
    houseId: 0,
    houseName: '',
    allHouse: [],
    houseIndex: 0,
  },

  ready: function () { 
    this.initCustomerInfo()
  },

  methods: {
    getAllHouse() {
      var that = this
      qcloud.request({
        // 要请求的地址
        url: config.service.houseUrl,

        data: {
          act: 'getAllHouse',
        },

        // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
        login: true,

        success(result) {
          console.log('request success2', result.data.data);
          let resultData = result.data.data
          resultData.unshift({ "id": 0, "house_name": "请选择" })
          let houseIndex
          resultData.forEach(function (houseItem, idx) {
            if (houseItem.id == that.data.houseId) {
              houseIndex = idx
            }
          })
          that.setData({
            allHouse: resultData,
            houseIndex: houseIndex
          })
          console.log(that.data)
        },

        fail(error) {
          console.log('request fail', error);
        },

        complete() {
          console.log('request complete');
        }
      })
    },

    initHouseInfo(house_id) {
      var that = this
      qcloud.request({
        // 要请求的地址
        url: config.service.houseUrl,

        data: {
          act: 'getHouseInfo',
          house_id: house_id
        },

        // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
        login: true,

        success(result) {
          console.log('request success', result.data.data);
          let resultData = result.data.data
          let houseConfig = resultData.houseRow.house_config
          houseConfig.buildings.unshift("?栋")
          houseConfig.floors.unshift("?层")
          houseConfig.units.unshift("?单元")
          that.setData({
            buildings: houseConfig.buildings,
            floors: houseConfig.floors,
            units: houseConfig.units,
            houseId: resultData.houseRow.id,
            houseName: resultData.houseRow.house_name
          })
        },

        fail(error) {
          console.log('request fail', error);
        },

        complete() {
          console.log('request complete');
        }
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

          Object.assign(inputData, result.data.data)
          that.setData({
            inputData: inputData,
            houseId: resultData.house_id,
          })
          that.initHouseInfo(resultData.house_id)
          that.getAllHouse()
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

    setCustomerInfo(field, value) {
      let that = this

      this.setData({
          pending: field
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
            pending: ''
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

    bindHouseChange(e) {
      console.log("123",e)
      let houseIndex = Number(e.detail.detail.value)
      if (houseIndex > 0 && this.data.houseIndex != houseIndex) {
        let houseId = this.data.allHouse[houseIndex].id
        this.setData({
          houseId: houseId,
          houseIndex: houseIndex
        });
        this.setCustomerInfo('house_id', houseId)
      }
    },

    bindMultiPickerChange(e) {
      console.log(e)
      let inputData = this.data.inputData
      let tmpdata = e.detail.detail.value
      let buildingIndex = tmpdata[0]
      let floorIndex = tmpdata[1]
      let unitIndex = tmpdata[2]

      if (inputData["buildingIndex"] == buildingIndex && inputData["floorIndex"] == floorIndex && inputData["unitIndex"] == unitIndex) {
        return 1
      }

      inputData["buildingIndex"] = buildingIndex
      inputData["floorIndex"] = floorIndex
      inputData["unitIndex"] = unitIndex
      this.setCustomerInfo('address', {
        building: inputData['buildingIndex'],
        floor: inputData['floorIndex'],
        unit: inputData['unitIndex'],
      })
      console.log(inputData)
      this.setData({
        inputData: inputData
      });
    },

    handleZanFieldChange(e) {
      let componentId = e.detail.currentTarget.dataset.componentId
      let detail = e.detail.detail
      var inputData = this.data.inputData
      if (inputData[componentId] == detail.value) return
      inputData[componentId] = detail.value

      if (this.checkData(componentId, inputData[componentId])) {
        this.setCustomerInfo(componentId, inputData[componentId])
        this.setData({
          inputData: inputData
        });
      }
    },

    checkData(key, data) {
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
  }
});