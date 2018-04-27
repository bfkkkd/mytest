// 引入 QCloud 小程序增强 SDK
var api = require('../../vendor/utils/api.js');
var util = require('../../vendor/utils/util.js');
var Zan = require('../../dist/index');
import typeConfig from './typeConfig';

// 引入配置
var config = require('../../config');

Page(Object.assign({}, Zan.Field, Zan.TopTips, Zan.Toast, Zan.Switch,{
  data: {
    inputData : {},
    endDate : '',
    errTipShow: false,
    errTxt: '',
    btnLoad: false,
    btnDisabled: false,
    types:[],    
	uploadUrl: config.service.uploadUrl, 
    typeConfig: typeConfig,
    step: 1,
    customDate: false,
    showBottomPopup: false,
    loadInfo: false,
    loading: false,
  },

  onLoad(option) {
    this.getActivityTypes()
    this.initdefault()
  },

  initdefault() {
    let currDay = new Date();
    currDay.setDate(currDay.getDate() + 1);  
    let year = currDay.getFullYear();
    let day = util.formatDay(currDay, "-");
    //let time = util.formatTime(currDay, ":");
    let time = '00:00';
    let arr1 = day.split('-');
    let endDate = year + 99 + "-" + arr1[1] + "-" + arr1[2];
    
    let inputData = this.data.inputData 
    inputData.date = day
    inputData.time = time
    inputData.title = ''
    inputData.description = ''
    inputData.type_id = 0
    inputData.type_idx = 0
    inputData.img_urls = []
    this.setData({
      inputData: inputData,
      endDate: endDate,
      step: 1,
    });
  },

  getActivityTypes() {
    var that = this
    api.baseAction('getActivityTypes',{
        login: true,
        success: function (result) {
            let inputData = that.data.inputData
            inputData.type_id = result.data.data[0].id
            that.setData({
                types: result.data.data
            });
        }
    });
  },

  checkHouseInfo(param) {
      var that = this
      api.baseAction('getCustomerInfo', {
          // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
          login: true,

          success(result) {
              let resultData = result.data.data
              if (!resultData.house_id) {
                  that.toggleBottomPopup()
              }
              param.success && param.success(resultData.house_id)
              console.log('request success', result);

          },
      })

  },

  onTypeChange(e) {
    console.log(e)
    var inputData = this.data.inputData
    inputData.type_idx = e.currentTarget.dataset.idx
    inputData.type_id = this.data.types[e.currentTarget.dataset.idx].id || 0

    wx.showLoading({
        title: '请稍候',
        mask: true
    })

    if (!inputData.house_id) {
        var that = this
        this.checkHouseInfo({
            success: function (houseId) {
                if (houseId) {
                    inputData.house_id = houseId
                    that.setData({
                        inputData: inputData,
                        step: 2,
                    });
                }
                wx.hideLoading()
            },
        })
    } else {
        this.setData({
            inputData: inputData,
            step: 2,
        });
        wx.hideLoading()
    }
    
  },

  prevStep() {
    let step = this.data.step
    step = step < 1 ? 1 : step-1
    this.setData({
      step: step
    });
  },

  nextStep() {
    let step = this.data.step
    step = step + 1
    this.setData({
      step: step
    });
  },

  customDate() {
    let customDate = !this.data.customDate
    this.setData({
      customDate: customDate
    });
  },

  formSubmit(e) {
    if (this.checkIsNull()) {
      this.save(this.data.inputData)
    } else {
      console.log(this.data.inputData);
    }

  },
  handleZanFieldChange(e) {
    const { componentId, detail } = e;
    let inputData = this.data.inputData

    if (componentId == 'simpleDate') {
      let currDay = new Date();
      currDay.setDate(currDay.getDate() + detail.value);
      let day = util.formatDay(currDay, "/");
      inputData['date'] = day
      inputData['time'] = '23:59'
    } else {
      inputData[componentId] = detail.value
    }

    this.setData({
      inputData: inputData
    });
  },

  handleZanSwitchChange(e) {
    var { checked, componentId } = e
    var inputData = this.data.inputData
    checked = checked ? 1 : 0
    if (inputData[componentId] == checked) return
    inputData[componentId] = checked
    this.setData({
      inputData: inputData
    });

  },

  checkIsNull() {
    let flag = true;
    let inputData = this.data.inputData
    if (inputData.title === '') {
      this.showTopTips("标题不能为空！❤️");
      return flag = false;
    } else if (inputData.type_id < 1) {
      this.showTopTips("请选择组织类别！❤️");
      return flag = false;
    } else if (inputData.house_id < 1) {
        this.showTopTips("未选择小区，请刷新重试！❤️");
        return flag = false;
    }
    return flag;
  },
  showTopTips(title) {
    this.showZanTopTips(title)
  },

  setBtnDefault(page){
    const st = setTimeout(function () {
      page.setData({
        btnLoad: !page.data.btnLoad,
        btnDisabled: !page.data.btnDisabled
      });
      clearTimeout(st);
    }, 1500);
  },

  setBtnLoading(page) {
    page.setData({
      btnLoad: !page.data.btnLoad,
      btnDisabled: !page.data.btnDisabled
    })
    this.setBtnDefault(page);
  },

  save(data) {
    var that = this
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    api.baseAction('save', {
      method : 'POST',

      data: {
        title: data.title,
        type_id: data.type_id,
        only_verified: data.only_verified,
        date: data.date + ' ' + data.time,
        description : data.description,
        img_urls: data.img_urls,
        house_id: data.house_id
      },

      login: true,

      success(result) {
        that.setBtnLoading(that)
        wx.hideLoading();
        if (result.data.code == '0' && result.data.data.activity_id) {
          that.showZanToast('提交成功！');
          that.initdefault()
          wx.navigateTo({ url: '../detail/index?id=' + result.data.data.activity_id });
        } else {
          that.showTopTips(result.data.data)
        }
        console.log('request success', result);
      },

      fail(error) {
        wx.hideLoading();
        that.showTopTips('连接超时请重试！')
        console.log('request fail', error);
      },
    })
  },

  doUpload() {
    var that = this

    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var filePaths = res.tempFilePaths
        wx.showLoading({
          title: '上传中...',
          mask: true
        });

        for (let i = 0; i < filePaths.length; i++) {
          wx.uploadFile({
            url: that.data.uploadUrl,
            filePath: filePaths[i],
            name: 'file',

            success: function (res) {
              wx.hideLoading();
              let inputData = that.data.inputData
              res = JSON.parse(res.data)
              console.log(res)
              inputData.img_urls[i] = res.data.imgUrl
              that.setData({
                inputData: inputData
              })
            },

            fail: function (e) {
              that.showTopTips('连接超时请重试！')
              wx.hideLoading();
              console.error(e)
            }
          })
        }

      },
      fail: function (e) {
        console.error(e)
      }
    })
  },

  previewImage(e) {
    var that = this
    console.log(e)
    let id = e.currentTarget.dataset.idx
    wx.previewImage({
      current: that.data.inputData.img_urls[id],
      urls: that.data.inputData.img_urls
    })
  },

  toggleBottomPopup() {
      this.setData({
          showBottomPopup: !this.data.showBottomPopup,
          loadInfo : true,
      });
  },

}))