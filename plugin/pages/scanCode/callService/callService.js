// pages/scanCode/callService/callService.js
var app = getApp();
Page({
  data: {
  
  },
  onLoad: function (options) {
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    var scene = decodeURIComponent(options.scene);
  },
  onShow: function () {
  
  },
  setPlain:function(e){
    app.pulicAjax({
      url: '',
      data: {},
      cellback: function (data) {
        if (data.type == "success") {
         
        } else {
          wx.showModal({
            title: '提示',
            content: '呼叫服务失败，请重试',
            showCancel: false
          });
        }
      }
    });
  }
})