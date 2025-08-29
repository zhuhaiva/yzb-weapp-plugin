// pages/scanCode/shoesbar.js
const app = getApp();
Page({
  data: {
    selectSex: 0,
    selectbox: 0,
    boxNum: 0,
    status: 'select',
    time: 3 * 60 * 1000,
    timeData: {},
    store: {},
    idleInfo: {},
    area: {},
    tenantId: "",
    success: {},
    show: false,
    areaId: null
  },
  onPullDownRefresh: function () {
    /**下拉刷新 */
    if (this.data.status == 'select') {
      this.getPageInfo(this.data.areaId);
    } else {
      wx.stopPullDownRefresh();
    }
  },
  onShow: function () {
    wx.hideHomeButton()
  },
  onLoad: function (options) {
    const time = (Date.now() - options.timestamp) / 60000;
    this.getPageInfo(options.scene, time);
    /**获取用户信息 */
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        const userInfo = JSON.parse(res.data);
        this.setData({
          userInfo: userInfo,
          selectSex: userInfo.gender == 1 ? 0 : 1
        });
      }
    })
  },
  getPageInfo(areaId, time) {
    /**获取页面信息 */
    const _this = this;
    app.pulicAjax({
      url: "../shoebarserviceself/scanqrcode.do",
      data: {
        areaId: areaId
      },
      isToken: true,
      cellback: data => {
        if (data.type == 'success') {
          wx.setNavigationBarTitle({
            title: data.store.name
          })
          const shoesType = data.idleInfo[0] != null && data.idleInfo[0] != '' ? data.idleInfo[0].shoesType : 0;
          _this.setData({
            status: 'select',
            tenantId: data.tenantId,
            areaId: areaId,
            area: data.area,
            store: data.store,
            idleInfo: data.idleInfo,
            selectbox: shoesType
          });

          wx.stopPullDownRefresh();
          this.setBoxNum();
          this.getMylockSignInfo(res => {
            if (res.status == 1) {
              _this.setData({
                status: 'success',
                success: res,
                time: new Date(res.createDate).getTime() + 182000 - Date.now()
              });
              const countDown = _this.selectComponent('.control-count-down');
              countDown.reset();
            } else if (res.status == 2 || res.status == 5) {
              _this.setData({
                status: 'use',
                success: res
              });
            } else {
              if (time >= 3) {
                _this.setData({
                  status: 'disabled'
                });
              }
            }
          })
        } else {
          const _info = data.content != null ? data.content : "未知错误";
          wx.showToast({
            title: _info,
            icon: 'none'
          });
        }
      }
    })
  },
  selectSexFunc(e) {
    /**选择性别 */
    this.setData({
      selectSex: e.currentTarget.dataset.val
    });
    this.setBoxNum();
  },
  selectBoxFunc(e) {
    /**选择柜子 */
    this.setData({
      selectbox: e.currentTarget.dataset.val
    });
    this.setBoxNum();
  },
  setBoxNum() {
    /**计算柜子可用数量 */
    const [
      gender,
      shoesType
    ] = [
      this.data.selectSex,
      this.data.selectbox
    ];
    const arr = this.data.idleInfo.find(item => {
      return item.gender == gender && item.shoesType == shoesType;
    })
    this.setData({
      boxNum: arr == null ? 0 : arr.cnt
    });
  },
  submitForm() {
    /**提交分配鞋柜 */
    const _this = this;
    _this.setData({
      show: true
    });
    app.pulicAjax({
      url: "../shoebarserviceself/allocatebox.do",
      method: "post",
      loading: false,
      addTenantId: false,
      data: {
        areaId: _this.data.area.id,
        gender: _this.data.selectSex,
        shoeType: _this.data.selectbox,
        tenantId: _this.data.tenantId
      },
      cellback: function (data) {
        try {
          if (data.type == 'error') {
            wx.showToast({
              icon: 'none',
              title: data.content
            })
            _this.setData({
              show: false
            })
          } else {
            setTimeout(() => {
              _this.setData({
                status: "success",
                success: data,
                time: 3 * 60 * 1000,
                show: false
              });
              const countDown = _this.selectComponent('.control-count-down');
              countDown.start();
            }, 1500);
          }
        } catch (e) {

        }
      }
    });
  },
  lockSginInvalid() {
    /**倒计时结束触发 */
    var _this = this;
    if (this.data.status == 'success') {
      this.getMylockSignInfo(res => {
        if (res == "") {
          res = _this.data.success;
          res.status = 0;
        }
        _this.setData({
          success: res
        })
      })
    }
  },
  getMylockSignInfo(cellback) {
    /**查询我的取牌信息 */
    const _this = this;
    app.pulicAjax({
      url: "../shoebarserviceself/shoesSelfAllocates.do",
      data: {
        tenantId: _this.data.tenantId
      },
      cellback(data) {
        if (cellback != null) {
          cellback(data);
        }
      }
    })
  },
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },
  reload() {
    /**重置信息 */
    this.getPageInfo(this.data.areaId);
  },
  devAllocateBoxOrder() {
    //取不了手牌
    const _this = this;
    app.pulicAjax({
      url: "../shoebarserviceself/devAllocateBoxOrder/resend.do",
      method: "post",
      data: {
        lockSignCode: _this.data.success.lockSignCode,
        tenantId: _this.data.tenantId
      },
      cellback(data) {
        wx.showToast({
          title: data.content,
          icon: data.type
        });
      }
    })
  },
  devBuyedNotReturnedOrder() {
    //还不了手牌
    const _this = this;
    app.pulicAjax({
      url: "../shoebarserviceself/devBuyedNotReturnedOrder/resend.do",
      method: "post",
      data: {
        lockSignCode: _this.data.success.lockSignCode,
        tenantId: _this.data.tenantId
      },
      cellback(data) {
        wx.showToast({
          title: data.content,
          icon: data.type
        });
      }
    })
  },
})