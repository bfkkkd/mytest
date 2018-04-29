var qcoundRequest = require('../wafer2-client-sdk/lib/request.js')
var cookies = require('./cookies.js');
const fire = require('./onfire');

/**
 * 应rpc请求的格式要求，需在data数组中每一个对象添加 id、jsonrpc 两个参数
 * @method setRequestRpc
 * @param {object} data  待处理的对象
 */
function setRequestRpc(data) {
    var rpcId = (new Date().getTime() + '').slice(4) + (Math.random() + '').slice(2, 6);
    for(var i in data) {
        // console.log(data[i])
        const id = rpcId++;
        data[i]['id'] = id
        data[i]['jsonrpc'] = '2.0';
    }
}

/**
 * 由于小程序不支持cookie，为了兼容后端原有的接口功能，需自行拼装header
 * @method setRequestHeader
 * @param {object} currentHeader 当前请求头
 */
function setRequestHeader(currentHeader) {
    var header = currentHeader || {};
    header['content-type'] = header['content-type'] || 'application/json';
    header['Cookie'] = cookies.getCookies() + (header['Cookie'] || '');
    return header;
}

/**
 * 发送请求前，先检查当前网络状态
 * @method checkNetwork
 * @param {object} currentHeader 当前请求头
 */
function checkNetwork(param) {
    wx.getNetworkType({
        success: function(res) {
            // 返回网络类型, 有效值：
            // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
            var networkType = res.networkType;
            if (networkType == 'none') {
                wx.showModal({
                    title: '当前网络不可用，请检查网络设置',
                    confirmText: '重试',
                    success: function(res) {
                        if (res.confirm) {
                            checkNetwork(param);
                        }
                    }
                });
            } else {
                if (param.timeout) {
                    setTimeoutRequest(param);
                } else {
                    sendRequest(param);    
                }
            }
        }
    });
}
/**
 * 小程序请求timeout时间一到，断掉连接
 */
function setTimeoutRequest(param) {
    let isSuccess = false;
    fire.on('reqSuccess', () => {
        isSuccess = true;
        clearTimeout(abortTimer);
    });

    const requestTask = sendRequest(param);
    const abortTimer = setTimeout(() => {
        if (!isSuccess && requestTask) {
            requestTask.abort();
        }
    }, param.timeout);
}
/**
 * 重新封装小程序的wx.request()
 * @method setRequestHeader
 * @param {object} currentHeader 当前请求头
 */
function sendRequest(param) {
    if (param.data instanceof Array) {
        setRequestRpc(param.data);
    }
    let dataType = param.dataType || 'json'
    return qcoundRequest.request({
        url: param.url,
        data: param.data,
        method: param.method || 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: setRequestHeader(param.header), // 设置请求的 header
        dataType: dataType,
        login: param.login || false,
        success: function(res){
            if (res.statusCode == 200) {
                param.success && param.success(res);
                if (param.timeout) {
                    fire.fire('reqSuccess');
                }
            } else {
                param.fail && param.fail(res);
            }
        },
        fail: function(err) {
            console.error(err)
            param.fail && param.fail(err);
        },
        complete: function(res) {
            param.complete && param.complete(res);
        }
    });
}
module.exports = {
    request: checkNetwork
}
