var storage = require('./storage.js');
var cookieKeys = ['cookie_data'];

/**
 * 获取指定的cookie，并拼装成字符串
 * 用于发送请求时，添加到header
 * @method getCookies
 */
function getCookies() {
  	var cookieStr = '';
  	cookieKeys.map(function(key) {
    	var value = storage.get(key);
    	if (value) {
            cookieStr += key + '=' + value + ';';
    	}
  	});
  	return cookieStr;
}

module.exports = {
  	getCookies: getCookies
}