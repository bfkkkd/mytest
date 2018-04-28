// pages/myinfo/index.js
var api = require('../../vendor/utils/api.js');
var Field = require('../../common/field/index');
var Zan = require('../../dist/index');
var storage = require('../../vendor/utils/storage.js');
var house = require('../../vendor/utils/house.js');

// 引入配置
var config = require('../../config');

Component({
  properties: {
    houseId: {
      type: Number,
      value: 0
    },
    loadData: {
        type: Boolean,
        value: false,
        observer: function (newVal, oldVal) { 
            if (newVal != oldVal && newVal==true){
                this.initCustomerInfo()
            }
        }
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
    myHouseId: 0,
    houseName: '',
    allHouse: [],
    houseIndex: 0,
  },

  ready: function () { 
    
  },

  methods: {
    getAllHouse() {
      var that = this
      api.houseAction('getAllHouse', {
        login: true,
        success(result) {
          console.log('request success2', result.data.data);
          let resultData = result.data.data
          resultData.unshift({ "id": 0, "house_name": "请选择" })
          let houseIndex
          resultData.forEach(function (houseItem, idx) {
            if (houseItem.id == that.data.myHouseId) {
              houseIndex = idx
            }
          })
          that.setData({
            allHouse: resultData,
            houseIndex: houseIndex
          })
          console.log(that.data)
        },
      })
    },

    initHouseInfo(house_id) {
      var that = this
      api.houseAction('getHouseInfo', {
        data: {
          house_id: house_id
        },
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
            myHouseId: resultData.houseRow.id,
            houseName: resultData.houseRow.house_name
          })
        },
      })
    },

    initCustomerInfo() {
      var that = this
      api.baseAction('getCustomerInfo',{

        // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
        login: true,

        success(result) {
          let inputData = that.data.inputData
          let resultData = result.data.data
          resultData['buildingIndex'] = resultData['building'] || 0
          resultData['floorIndex'] = resultData['floor'] || 0
          resultData['unitIndex'] = resultData['unit'] || 0

          Object.assign(inputData, result.data.data)
          if (!resultData.house_id && that.data.houseId) {
              resultData.house_id = that.data.houseId
              that.setCustomerInfo('house_id', resultData.house_id)
          }
          that.setData({
            inputData: inputData,
            myHouseId: resultData.house_id,
          })
          that.initHouseInfo(resultData.house_id)
          that.getAllHouse()
          console.log('request success', result);

        },
      })

    },

    setCustomerInfo(field, value) {
      let that = this

      this.setData({
          pending: field
      });

      api.baseAction('setCustomerInfo', {
        method: 'POST',
        data: {
          field: field,
          value: value
        },
        // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
        login: true,
        success(result) {
          let inputData = that.data.inputData
          if (field =='address') {
              inputData['buildingIndex'] = inputData['building'] = value['building']
              inputData['floorIndex'] = inputData['floor'] = value['floor']
              inputData['unitIndex'] = inputData['unit'] = value['unit'] 
          } else {
              inputData[field] = value
          }
          that.setData({
            pending: '',
            inputData: inputData
          });
          console.log('request success', result);

          if (field == 'house_id') {
              storage.remove('house');
              house.getUserHouse()
          }
          
          if (inputData.building && inputData.floor && inputData.house_id && inputData.phone && inputData.real_name && inputData.unit) {
              that.finished()
          }

        },
      })
    },

    bindHouseChange(e) {
      console.log("123",e)
      let houseIndex = Number(e.detail.detail.value)
      if (houseIndex > 0 && this.data.houseIndex != houseIndex) {
        let houseId = this.data.allHouse[houseIndex].id
        this.setData({
          myHouseId: houseId,
          houseIndex: houseIndex
        });
        this.setCustomerInfo('house_id', houseId)
        this.initHouseInfo(houseId)
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

    showTopTips: function(title) {
        wx.showToast({
            title: title,
            icon: 'none',
            duration: 2000
        })
    },

    finished: function () {
        var myEventDetail = {} // detail对象，提供给事件监听函数
        var myEventOption = {} // 触发事件的选项
        this.triggerEvent('finished', myEventDetail, myEventOption)
    }
  }
});