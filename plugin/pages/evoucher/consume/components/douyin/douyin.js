// pages/evoucher/consume/components/douyin/douyin.js
import {
  verifyDouYin
} from '@/api/tuangou'
Component({
  properties: {
    mobile: {
      type: String,
      value: ""
    },
    roomCode: {
      type: String,
      value: ""
    }
  },
  data: {
    code: "",
    douYinImageSrc: 'https://dzb.dzbsaas.com/upload/image/20250417/7492c2cd-e7c5-495b-a274-a58d26b52b39-source.jpeg',
  },
  methods: {
    // 查询券码
    onSubmit() {
      const {
        code
      } = this.data
      if (!code) {
        wx.showToast({
          icon: 'none',
          title: '请输入券码',
        })
        return
      }
      // 券码，直接查询并核销
      this.onConsume({
        currentTarget: {
          dataset: {
            code
          }
        }
      })
    },
    onConsume(e) {
      const {
        code
      } = e.currentTarget.dataset
      wx.showModal({
        title: '自助核销',
        content: `是否确认核销券号【${code}】的美团券？`,
        complete: (res) => {
          if (res.confirm) {
            this.verifyDouYinHandler(code)
          }
        }
      })
    },
    verifyDouYinHandler(code) {
      const {
        mobile,
        roomCode
      } = this.data
      verifyDouYin({
        code,
        phone: mobile,
        roomCode
      }).then(res => {
        if (res.message === '成功') {
          this.setData({
            code: ""
          })
        }
        wx.showToast({
          icon: 'none',
          title: res.message === '成功' ? '团购券核销成功' : '团购券核销失败'
        })
      })
    },
    onScanCode() {
      wx.scanCode({
        success: (res) => {
          if (res.result) {
            this.setData({
              code: res.result
            })
            this.onSearch()
          }
        }
      })
    },
  }
})