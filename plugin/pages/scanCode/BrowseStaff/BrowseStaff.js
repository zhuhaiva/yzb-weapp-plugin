// pages/scanCode/BrowseStaff/BrowseStaff.js
import { viewemployeeApi, employeepicsApi } from "../../../api/browseStaff";
Page({
  data: {
    stafflist: [],
    imgList: [],
    typeshow: true,
    _num: 0,
    typename: "",
    sindex: "",
    close: true,
    roomId: "",
    status: "",
    start: 0,
    size: 10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { roomId, tenantId } = options;
    this.setData({
      roomId,
      tenantId,
    });
    this.getstaffList();
  },
  getstaffList: function (e) {
    //获取技师列表信息
    var that = this;
    var slist = that.data.start == 0 ? [] : that.data.stafflist;
    var status1 = ["空闲", "上钟", "暂停服务", "预约", "锁定", "请假"];
    viewemployeeApi({
      roomId: that.data.roomId,
      start: that.data.start,
      size: that.data.size,
    })
      .then((data) => {
        for (var i = 0; i < data.iData.length; i++) {
          data.iData[i].status1 = status1[data.iData[i].status];
          slist.push(data.iData[i]);
        }
        that.setData({
          stafflist: slist,
          iTotal: data.iTotal,
        });
      })
      .finally(() => {
        wx.stopPullDownRefresh();
      });
  },
  typetap: function (e) {
    var that = this;
    that.setData({
      typeshow: that.data.typeshow ? false : true,
    });
  },
  typeselect: function (e) {
    var that = this;
    that.setData({
      _num: e.currentTarget.dataset.num,
      typename: e.currentTarget.dataset.name,
      typeshow: that.data.typeshow ? false : true,
    });
  },
  previewImage: function (e) {
    var slist = this.data.stafflist;
    var src = e.currentTarget.dataset.src;
    var index = e.currentTarget.dataset.index;
    var imgList = [];
    var slength = slist.length;
    for (var i = 0; i < slength; i++) {
      //   imgList: imgList.push(slist[i].image);
      imgList.push(slist[i].image);
    }
    wx.previewImage({
      current: imgList[index], // 当前显示图片的http链接
      urls: imgList, // 需要预览的图片http链接列表
    });
  },
  previewStaff: function (e) {
    const { index, code } = e.currentTarget.dataset;
    const list = this.data.stafflist.find((item) => item.code === code);
    if (list.picture) {
      this.getemployeepics(code, list);
    }
  },
  swiperClose: function () {
    var that = this;
    that.setData({
      close: true,
    });
  },
  // 获取更多技师图片
  getemployeepics(emplCode, list) {
    employeepicsApi({
      tenantId: this.data.tenantId,
      emplCode: emplCode,
    }).then((data) => {
      const imgList = [
        {
          picture: list.picture,
          code: list.code,
          summary: list.summary,
        },
      ];
      data.forEach((item) => {
        imgList.push({
          picture: item,
          code: list.code,
          summary: list.summary,
        });
      });
      this.setData({
        imgList,
        close: this.data.close ? false : true,
      });
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      start: 0,
    });
    this.getstaffList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var start = that.data.start,
      size = that.data.size;
    if (start + size <= that.data.iTotal) {
      start += size;
      that.setData({
        start: start,
      });
      that.getstaffList();
    }
  },
});
