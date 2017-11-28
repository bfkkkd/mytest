// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var util = require('../../vendor/utils/util.js');
var Zan = require('../../dist/index');

// 引入配置
var config = require('../../config');

Page(Object.assign({}, Zan.Field, Zan.TopTips, Zan.Toast, {
  data: {
    inputData : {},
    endDate : '',
    errTipShow: false,
    errTxt: '',
    btnLoad: false,
    btnDisabled: false,
    types:[],
    uploadUrl: config.service.uploadUrl
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
      endDate: endDate
    });
  },

  getActivityTypes() {
    var that = this
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,

      data: {
        act: 'getActivityTypes'
      },

      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        let inputData = that.data.inputData
        inputData.type_idx = result.data.data[0].id
        that.setData({
          types: result.data.data
        });

        console.log('request success', result);
      }
    })
  },

  onTypeChange(e) {
    console.log(e)
    var inputData = this.data.inputData
    inputData.type_idx = e.detail.value
    inputData.type_id = this.data.types[e.detail.value].id || 0

    this.setData({
      inputData: inputData
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
    var inputData = this.data.inputData
    inputData[componentId] = detail.value

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
      this.showTopTips("请选择服务类别！❤️");
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
    qcloud.request({
      // 要请求的地址
      url: config.service.blogUrl,
      method : 'POST',

      data: {
        act: 'save',
        title: data.title,
        type_id: data.type_id,
        date: data.date + ' ' + data.time,
        description : data.description
      },

      login: true,

      success(result) {
        that.setBtnLoading(that)
        if (result.data.code == '0' && result.data.data.activity_id) {
            that.showZanToast('提交成功！');
          wx.navigateTo({ url: '../detail/index?id=' + result.data.data.activity_id });
        } else {
          that.showTopTips(result.data.data)
        }
        console.log('request success', result);
      },

      fail(error) {
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

        for (let i = 0; i < filePaths.length; i++) {
          wx.uploadFile({
            url: that.data.uploadUrl,
            filePath: filePaths[i],
            name: 'file',

            success: function (res) {
              that.showTopTips('上传图片成功')
              let inputData = that.data.inputData
              res = JSON.parse(res.data)
              console.log(res)
              inputData.img_urls.push(res.data.imgUrl)
              that.setData({
                inputData: inputData
              })
            },

            fail: function (e) {
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

}))