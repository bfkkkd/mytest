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
    buildings: [],
    floors: [],
    units: [],
    houseId: 0,
    houseName: '',
    allHouse: [],
    houseIndex: 0,
  },

  ready: function () { 
    this.getAllHouse()
  },

  methods: {
    onMyButtonTap: function () {
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      })
    },
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
  }
});