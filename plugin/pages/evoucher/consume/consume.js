// pages/evoucher/consume/consume.js
import Dialog from 'tdesign-miniprogram/dialog/index';
import {
  getStorageKey
} from "../../../utils/storage.js";
import {
  getSence
} from "../../../utils/utils"
import {
  setCurrentTenant
} from "../../../utils/tenant"
import {
  wxUserPhoneGetApi,
} from '../../../api/login'
const userInfo = getStorageKey('userInfo')
Page({
  data: {
    activeName: "meituan",
    mobile: ""
  },
  async onLoad(query) {
    let params = {}
    if (scene === 1011) {
      // 扫二维码场景
      const options = decodeURIComponent(query.q)
      const list = options.replace('hlht://', '').split('.')
      const temp = list[0].split('+')
      params = {
        tenantId: temp[0],
        roomCode: temp[1]
      }
    } else {
      const options = decodeURIComponent(query.scene)
      params = getSence(options)
    }
    const {
      tenantId,
      roomCode
    } = params
    if (tenantId) {
      await setCurrentTenant(tenantId)
    }
    this.setData({
      safeArea: getStorageKey('safeArea'),
      roomCode
    })
    const {
      mobile
    } = userInfo
    if (this.validatePhoneNumber(mobile)) {
      this.setData({
        mobile
      })
    } else {
      this.alertBindMobileDialog()
    }
  },
  validatePhoneNumber(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },
  onTabsChange(e) {
    const {
      value
    } = e.detail
    this.setData({
      activeName: value
    })
  },
  // 获取用户手机号
  getUserMobile(code) {
    wxUserPhoneGetApi({
      code,
      // appId: getApp().globalData.miniProgram.appId
    }).then(res => {
      this.setData({
        mobile: res.data.phoneNumber
      })
    })
  },
  alertBindMobileDialog() {
    const self = this
    const dialogConfig = {
      context: this,
      title: '温馨提示',
      content: '当前已激活手机号快速查询美团团购券功能，是否使用？',
      cancelBtn: '我再想想',
      confirmBtn: {
        openType: 'getPhoneNumber',
        content: '立即使用',
        bindgetphonenumber({
          detail
        }) {
          const {
            code
          } = detail
          if (code) {
            // self.getUserMobile(code)
          }
          if (detail.errMsg.includes('fail')) {
            console.log('获取失败');
            return false; // 不关闭弹窗
          }
          return true; // 关闭弹窗
        },
      },
    };

    Dialog.confirm(dialogConfig)
  }
})