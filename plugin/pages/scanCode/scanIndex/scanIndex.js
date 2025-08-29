// pages/scanCode/scanIndex/scanIndex.js
const app = {}
import md5 from '../../../utils/md5.js';
import {
  formatTime,
  getRequest
} from '../../../utils/util'
import {
  getScanteatableAPI,
  getlockAPI
} from '../../../api/scanOrder'
import {
  getStorageConfig
} from '../../../utils/storage'
let allowRefresh = false
Page({
  data: {
    loading: false,
    systemInfo: wx.getSystemInfoSync(),
    checkIn: null,
    room: [],
    teaTable: null,
    showlockCodeSheet: false,
    lockList: [],
    currentLockCode: null,
    options: null,
    isSCM: false,
    isBusiness: true
  },
  onLoad: function (options) {
    const {
      id,
      teaTableId,
      time
    } = options;
    this.data.options = options
    this.setData({
      currentLockCode: null
    })
    if ((Date.now() - Number(time)) / 60000 > 5) {
      app.geterrMsgPage(60003)
      return
    }
    if (teaTableId) {
      this.setData({
        teaTableId
      })
      this.getScanteaTable().then(() => {
        // 扫码点单机二维码进入
        if (id) {
          this.isScanCodeMachineEnter(id)
        } else {
          const {
            lockList
          } = this.data
          if (lockList.length === 1) {
            this.selectLockCode({
              detail: {
                name: lockList[0].name
              }
            })
          } else if (lockList.length > 1) {
            this.setData({
              showlockCodeSheet: true
            })
          }
        }
        this.setData({
          isSCM: id !== null
        })
      });
    } else {
      wx.showModal({
        content: '无法识别此二维码信息',
        showCancel: false
      });
    }
  },
  onShow() {
    if (allowRefresh) {
      this.onLoad(this.data.options)
    }
  },
  onHide() {
    allowRefresh = true
  },
  /**
   * 获取当前茶几码信息
   * @param {*} scene 
   */
  getScanteaTable() {
    //获取当前座位数据
    const {
      teaTableId
    } = this.data
    return new Promise(resolve => {
      this.setData({
        loading: true
      })
      getScanteatableAPI(teaTableId).then(data => {
        wx.stopPullDownRefresh()
        if (Object.keys(data).length > 0) {
          const {
            checkIn,
            handcards,
            room,
            teaTable,
            tenant,
            setting
          } = data
          this.isBusinessFunc(setting)
          this.setData({
            teaTable,
            tenantId: tenant.tenantId,
            tenantName: tenant.name,
            room: {
              name: room.name,
              id: room.id,
              status: room.status
            },
            checkIn: checkIn ? {
              id: checkIn.id,
              sn: checkIn.sn
            } : null,
            loading: false,
            setting,
            lockList: handcards.map(item => {
              return {
                name: item
              }
            })
          });
          resolve()
          /**设置店名 */
          wx.setNavigationBarTitle({
            title: data.tenant.name
          });
        }
      })
    })
  },
  /**
   * 是否是扫码点单机进入
   */
  isScanCodeMachineEnter(id) {
    if (id.indexOf('#') === 1) {
      const arr = id.replace(/^\[#|\]/g, '').split('#')
      if (arr.length >= 3) {
        let tempLockId = parseInt(arr[2].slice(-8), 16).toString()
        if (tempLockId.length < 10) {
          const count = 10 - tempLockId.length
          for (let i = 1; i <= count; i++) {
            tempLockId = `0${tempLockId}`
          }
        }
        this.searchLock({
          id: tempLockId
        })
      }
    } else if (id.indexOf('!') === 1) {
      const arr = id.replace(/^\[!|\]/g, '').split('!')
      if (arr.length >= 3) {
        const subStr = arr[2].slice(-8);
        const bytesArray = subStr.match(/.{1,2}/g).reverse();
        const card = bytesArray.join('')
        let tempLockId = parseInt(card, 16).toString()
        if (tempLockId.length < 10) {
          const count = 10 - tempLockId.length
          for (let i = 1; i <= count; i++) {
            tempLockId = `0${tempLockId}`
          }
        }
        this.searchLock({
          id: tempLockId
        })
      }
    } else {
      this.searchLock({
        id
      })
    }
  },
  /**
   * 跳转到点单页面
   */
  getGoodsPage() {
    const {
      room,
      teaTable,
      setting,
      checkIn,
      tenantId,
      currentLockCode,
      isSCM,
      isBusiness
    } = this.data
    if (setting.onlyHandCard && !currentLockCode) {
      wx.showModal({
        title: '请输入手牌号',
        editable: true,
        placeholderText: "请输入您的手牌号",
        success: (res) => {
          const {
            confirm,
            content
          } = res
          if (confirm) {
            if (content) {
              this.searchLock({
                id: content
              }, () => {
                this.getGoodsPage()
              })
            } else {
              wx.showToast({
                icon: "none",
                title: '当前房间只支持手牌点单',
              })
            }
          }
        }
      })
      return
    }
    const url = `plugin://yzb-plugin/goodsorder?roomName=${room.name}&roomId=${room.id}&teaTable=${teaTable}&selfOrder=${setting.allowSelfOrder}&checkInId=${checkIn ? checkIn.id : ''}&checkInSN=${checkIn ? checkIn.sn : ''}&tenantId=${tenantId}&lockcode=${currentLockCode}&isSCM=${isSCM}&isBusiness=${isBusiness}&openTime=${setting.openTime}&closeTime=${setting.closeTime}&islock=${currentLockCode != null}&limitBuyProduct=${setting.limitBuyProduct}`
    wx.navigateTo({
      url
    })
  },
  /**
   * 呼叫服务
   */
  callServer: function () {
    //呼叫服务
    var that = this;
    app.pulicAjax({
      url: "ringcall.do",
      method: "POST",
      data: {
        roomId: that.data.room.id,
        teaTable: that.data.teaTable,
        ringId: ""
      },
      cellback: function (data) {
        if (data.type == "success") {
          setTimeout(function () {
            wx.showToast({
              title: data.content,
              icon: 'success',
              duration: 2000
            })
          }, 200);
        }
      }
    });
  },
  /**
   * 浏览技师
   */
  getBrowseEmplPage() {
    const {
      room,
      tenantId,
    } = this.data
    const url = `plugin://yzb-plugin/browseStaff?roomId=${room.id}&tenantId=${tenantId}`
    wx.navigateTo({
      url
    })
  },
  /**
   * 跳转结账页面
   */
  getPayMemtPage() {
    const {
      checkIn
    } = this.data
    if (!checkIn) {
      wx.showToast({
        icon: "none",
        title: '未查询到订单信息',
      })
      return
    }
    const {
      tenantId,
      room,
      currentLockCode,
      setting
    } = this.data    
    wx.navigateTo({
      url: `plugin://yzb-plugin/payment?roomId=${room.id}&tenantId=${tenantId}&checkInId=${checkIn.id}&islock=${currentLockCode != null}&deviceNo=${setting.deviceNo}&allowSelfPay=${setting.allowSelfPay}`,
    })
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.onLoad(this.data.options);
  },
  /**
   * 选择手牌
   * @param {*} e 
   */
  selectLockCode(e) {
    // 选择手牌
    const {
      name
    } = e.detail
    this.searchLock({
      id: name
    })
  },
  setCurrentLock(item) {
    const {
      code
    } = item
    this.setData({
      checkIn: item.checkIn ? {
        id: item.checkIn.id,
        sn: item.checkIn.sn
      } : null,
      currentLockCode: code,
      showlockCodeSheet: false
    })
  },
  /**
   * 查询手牌信息
   */
  searchLock(data, cellback) {
    const {
      tenantId
    } = this.data
    getlockAPI({
      ...data,
      ...encrypt(tenantId)
    }).then((data) => {
      const {
        code,
        status
      } = data
      if (code) {
        if (status === 'Idle') {
          wx.showModal({
            title: "温馨提示",
            content: `【${code}】手牌未开牌，暂不允许点单！`
          })
          return
        }
        this.setCurrentLock(data)
        cellback && cellback()
      } else {
        wx.showToast({
          icon: 'none',
          title: '手牌不存在',
        })
      }
    })
  },
  /**
   * 判断当前是否是营业时间
   */
  isBusinessFunc(options) {
    const {
      openTime,
      closeTime
    } = options
    if (openTime && closeTime) {
      const currentDate = formatTime(new Date(), 'yyyy/MM/dd')
      const _openTime = new Date(`${currentDate} ${openTime}`).getTime()
      let _closeTime = new Date(`${currentDate} ${closeTime}`).getTime()
      if (_openTime > _closeTime) {
        _closeTime += 1000 * 60 * 60 * 24
      }
      const currentTime = Date.now()
      if (currentTime >= _openTime && currentTime <= _closeTime) {
        this.setData({
          isBusiness: true
        })
      } else {
        this.setData({
          isBusiness: false
        })
      }
    } else {
      this.setData({
        isBusiness: true
      })
    }
  }
})

/**
 * 生成签名
 * @param {*} tenantId 
 */
function encrypt(tenantId) {
  const {
    userInfo,
    mtoken
  } = getStorageConfig()
  if (userInfo) {
    const arr = {
      tenantId,
      name: userInfo.nickName,
      password: '123456789',
      mtoken,
      timeStamp: new Date().getTime()
    };
    var sign = md5(arr.tenantId + arr.password + arr.name + arr.timeStamp);
    return {
      ...arr,
      sign
    }
  }
}