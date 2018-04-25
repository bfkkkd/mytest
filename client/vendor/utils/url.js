/**
 * 组装请求URL参数
 */
exports.assemble = function(url, obj) {
    let str = exports.objToString(obj);
    if (url.indexOf('?') > -1) {
        url = url.concat('&').concat(str);
    } else {
        url = url.concat('?').concat(str);
    }
    return url;
}

/**
 * 将对象转化为参数字符串
 */
exports.objToString = function(obj) {
    let arr = [];
    Object.keys(obj).forEach(key => {
        arr.push(key + '=' + obj[key]);
    })
    return arr.join('&');
}