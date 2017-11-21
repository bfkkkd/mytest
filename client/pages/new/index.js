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
    btnDisabled: false
  },

  onLoad(option) {
    this.initdefault()
  },

  initdefault() {
    let currDay = new Date();
    currDay.setHours(currDay.getHours() + 1);
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
    this.setData({
      inputData: inputData,
      endDate: endDate
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
  }
}))