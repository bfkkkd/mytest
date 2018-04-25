//本地存储
var storage = {
    /**
     * 保存值到本地存储
     * @method set
     * @param {String} key     需要保存的键名
     * @param {Object|String|Array|Boolean} value  需要保存的值
     * @param {Number} expires 存储的过期时间
     */
    set: function(key, value, expires) {
        var v = {};
        if (expires) {
            var d = new Date().getTime();
            v.expire = d + expires * 1000;
        }
        v.value = value;
        wx.setStorage({
          key: key,
          data: v
        })
    },
    /**
     * 同步保存值到本地存储
     * @method setSync
     * @param {String} key     需要保存的键名
     * @param {Object|String|Array|Boolean} value  需要保存的值
     * @param {Number} expires 存储的过期时间
     */
    setSync: function(key, value, expires) {
        var v = {};
        if (expires) {
            var d = new Date().getTime();
            v.expire = d + expires * 1000;
        }
        v.value = value;
        try {
            wx.setStorageSync(key, v);
        } catch(e) {
            console.log('setStorage fail:  ' + e);
        }
    },
    /**
     * 需要获取的本地存储
     * @method get
     * @param  {String} key 对应的key
     * @return {Object|String|Array|Boolean}  返回值
     */
    get: function(key) {
        var value;
        try {
            value = wx.getStorageSync(key);
        } catch(e) {
            console.log('getStorage fail:  ' + e);
        }
        if (value == null || value == undefined) {
            value = '';
            return value;
        }
        var expire = value.expire;
        if (expire && /^\d{13}$/.test(expire)) {
            var d = new Date().getTime();
            if (expire <= d) {
                wx.removeStorageSync(key)
                return '';
            }
        }

        return value.value;
    },
    /**
     * 删除一个本地存储
     * @method remove
     * @param  {String} key 需要删除的key
     */
    remove : function(key) {
        try {
            wx.removeStorageSync(key)
        } catch(e) {
            console.log('removeStorage fail:  ' + e);
        }
    }
}
module.exports = storage;
