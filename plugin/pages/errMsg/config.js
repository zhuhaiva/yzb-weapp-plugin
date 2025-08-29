/**
 * 60001 - 69999 区间 茶几码
 */
const list = [{
    code: 0,
    content: {
      theme: "warning",
      title: "未知错误信息",
      description: ""
    }
  },
  {
    code: 60001,
    content: {
      theme: "success",
      title: "支付成功",
      description: "感谢您的使用"
    }
  },
  {
    code: 60002,
    content: {
      theme: "warn",
      title: "订单不存在",
      description: "请稍后重试或联系门店客服"
    }
  },
  {
    code: 60003,
    content: {
      theme: "warn",
      title: "链接已失效",
      description: "请重新扫描二维码"
    }
  },
]

function geterrMsg(value) {
  const code = Number(value)
  const res = list.find(item => item.code === code)
  if (res) {
    return res.content
  }
  return list[0].content
}
export {
  geterrMsg
}