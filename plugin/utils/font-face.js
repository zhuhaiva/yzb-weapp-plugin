const fontList = [
  {
    family: 'DouyinSansBold',
    source: 'https://www.dzbsaas.cn/footmassage/static/assets/fonts/DouyinSansBold.ttf',
  },
  {
    family: 'YouSheBiaoTiHei',
    source: 'https://yzbcharge.oss-cn-hangzhou.aliyuncs.com/d780a079-6f4c-443b-9542-dfef1ff79724.woff',
  },
  {
    family: 'DINPro-Medium',
    source: 'https://www.dzbsaas.cn/footmassage/static/assets/fonts/DINPro-Medium.ttf',
  }
]
export const downFontFace = () => {
  fontList.forEach(item => {
    wx.loadFontFace({
      global: true,
      family: item.family,
      source: `url("${item.source}")`,
      scopes: ['webview', 'skyline'],
      success: console.log,
    })
  })
}