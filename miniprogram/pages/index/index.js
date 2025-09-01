var plugin = requirePlugin("yzb-plugin");

Page({
  data: {
    items: [],
    currentItem: 0,
  },
  onLoad(options) {
    const { miniProgram } = wx.getAccountInfoSync();
    plugin
      .config({
        ...options,
        appId: miniProgram.appId,
        type: 1011,
        wxscene: getApp().scene,
        mtoken: "204b2101-e7a0-4b08-9c54-7aa1ebd181a1",
        userInfo: {
          nickName: "develop",
        },
      })
      .then(({ url }) => {
        console.log(url);

        wx.redirectTo({
          url,
          fail(res) {
            console.log(res);
          },
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
