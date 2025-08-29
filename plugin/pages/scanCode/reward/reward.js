// pages/scanCode/reward/reward.js
var app = getApp();
var util = require('../../../utils/util.js');
Page({
  data: {
    topIndex: "",
    bottomIndex: "",
    btnDisabled: true
  },
  onLoad: function (options) {
    this.getPageInfo(options.empl_Id);
  },
  getPageInfo: function (data) {
    //获取员工信息
    var that = this;
    app.pulicAjax({
      url: "member/rest/scanreward.do?" + app.encrypt('str'),
      method: "get",
      isRootUrl: false,      
      data: { empl_Id: data },
      cellback: function (data) {
        // if (data.message.type == "success") {

        // } else {
        //   wx.showModal({
        //     content: data.message.content
        //   })
        // }
      }
    });
  },
  selectIndex: function (e) {
    //打星
    var index = e.currentTarget.dataset.index,
      _type = e.currentTarget.dataset.type,
      opt = _type == "top" ? { topIndex: index } : { bottomIndex: index },
      flag = _type == "top" ? this.data.bottomIndex != "" :  this.data.topIndex != "";
    util.extend(opt, { btnDisabled: !flag });    
    console.log(opt)
    this.setData(opt);
  },
  formSubmit: function (e) {
    var that = this,
      formId = e.detail.formId;
    app.onLoadFormId(formId);
    app.pulicAjax({
      url: 'boss/smsgenerateorder.do',
      isRootUrl: false,
      method: 'POST',
      data: util.extend({
        rechargeType: that.data.i,
        balance: that.data.balance,
        payType: 'tencenpay'
      }, app.encrypt()),
      cellback: function (data) {
        //发起微信支付
        if (data.type == "success") {
          var opt = JSON.parse(data.content);
          wx.requestPayment({
            timeStamp: opt.timeStamp,
            nonceStr: opt.nonceStr,
            package: opt.package,
            signType: opt.signType,
            paySign: opt.sign,
            success: function (res) {
              console.log(res);
            },
            fail: function (res) {
              wx.showModal({
                content: res.err_desc,
              })
            }
          });
        }
      }
    });
  }
})