var api = require('../../vendor/utils/api.js');
var storage = require('../../vendor/utils/storage.js');

function getUserHouse(opts = {}) {
    let houseData = storage.get('house') || {id:0,name:''}

    if (houseData.id) {
        opts.success && opts.success(houseData);
    } else {
        api.baseAction('getCustomerInfo', {

            // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
            login: true,

            success(result) {
                let resultData = result.data.data
                houseData = {
                    id: resultData.house_id,
                    name: resultData.house_name
                }
                if (resultData.house_id) {
                    storage.setSync('house', houseData)
                }
                opts.success && opts.success(houseData);

            },
            fail: function (err) {
                opts.fail && opts.fail(err);
            },
        })
    }

    

}
module.exports = {
    getUserHouse: getUserHouse
}
