var plugin = requirePlugin("yzb-plugin");

Page({
  data: {
    items: [],
    currentItem: 0,
  },
  onLoad(options) {
    const {
      miniProgram
    } = wx.getAccountInfoSync();
    plugin
      .config({
        ...options,
        appId: miniProgram.appId,
        type: 1000,
        wxscene: getApp().scene,
        mtoken: "12b66d18-c9e2-4cf6-8faa-cae90ca32ddf",
        userInfo: {
          nickName: "develop",
        },
        tenantId: "caba6906",
        phone: "13733174682"
      })
      .then(({
        url
      }) => {
        wx.redirectTo({
          url
        });
      });
  },
  addItem() {
    this.data.items.push(this.data.currentItem++);
    this.setData({
      items: this.data.items,
      currentItem: this.data.currentItem,
    });
  },
});