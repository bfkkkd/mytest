/**
 * @fileOverview 微信小程序的入口文件
 */

var qcloud = require('./vendor/wafer2-client-sdk/index');
var config = require('./config');

App({
    /**
     * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
     */
    onLaunch() {
        qcloud.setLoginUrl(config.service.loginUrl);
    },

    onShow() {
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo'] === false) {
                    console.log("无权限")
                    wx.showToast({
                        title: '请授权应用！',
                        duration: 2000
                    })

                    setTimeout(function () {
                        wx.openSetting()
                    }, 1000)
                }
            }
        })
    },
});