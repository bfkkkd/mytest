
Component({
  properties: {
    show: {
        type: Boolean,
        value: false
    },
  },

  data: {
  },

  ready: function () { 
    
  },

  methods: {
    togglePopup() {
        return //不关闭
        this.setData({
            show: !this.data.show
        });
    },

    bindGetUserInfo: function (res) {
        if (res.detail.userInfo) {
            this.setData({
                show: false
            });
            var myEventDetail = res.detail.userInfo
            var myEventOption = {}
            this.triggerEvent('finished', myEventDetail, myEventOption)
        }
    },
  }
});