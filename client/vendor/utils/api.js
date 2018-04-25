var ajax = require('./ajax.js');
var storage = require('./storage.js');
const urlUtils = require('./url');
var config = require('../../config');

// 接口api
var api = {
    /** api */
    baseUrl: config.service.blogUrl,  // 公共接口
    houseUrl: config.service.houseUrl,  // 小区接口

    baseAction: function(act, opts) {
        opts.url = this.baseUrl
        opts.data = opts.data || {};
        opts.data.act = act
        this.ajaxAction(opts);
    },

    houseAction: function (act, opts) {
        opts.url = this.houseUrl
        opts.data = opts.data || {};
        opts.data.act = act
        this.ajaxAction(opts);
    },

    ajaxAction: function(opts) {
        var _this = this;
        let url = urlUtils.assemble(opts.url, {_xcxid: new Date().getTime()});
        ajax.request({
            timeout: opts.timeout || '',
            url: url,
            method: opts.method || 'GET',
            data: opts.data,
            dataType: opts.dataType || 'json',
            header: opts.header || {},
            login: opts.login || false,
            success: function(res) {
                opts.success && opts.success(res);
            },
            fail: function(err) {
                opts.fail && opts.fail(err);
            },
            complete: function(res) {
                opts.complete && opts.complete(res);
            }
        });
    },
}

module.exports = api;
