// pages/errMsg/index.js
import {
  geterrMsg
} from './config'
Page({
  data: {
    theme: "",
    title: "",
    description: ""
  },
  onLoad(options) {
    const {
      code = 0,
        back = false
    } = options
    const {
      theme,
      title,
      description
    } = geterrMsg(code)
    this.setData({
      theme,
      title,
      description,
      back
    })
  },
  exit() {
    wx.exitMiniProgram()
  },
  back(){
    wx.navigateBack()
  }
})