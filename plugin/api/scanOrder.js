import request from '../script/request'

// 获取座位数据
export function getScanteatableAPI(teaTableId) {
  return request({
    url: `/littleapp/v2/scanteatable.do?teaTableId=${teaTableId}`,
  })
}

// 获取商品分类列表
export function getgoodscategorylistAPI(roomId) {
  return request({
    url: `/littleapp/v2/getgoodscategorylist.do?roomId=${roomId}`,
  })
}

// 获取商品列表
export function getgoodslistAPI(data) {
  return request({
    url: `/littleapp/v2/getgoodslist.do`,
    data
  })
}

// 商品下单
export function commitgoodsorderAPI(data) {
  return request({
    url: `/littleapp/v2/commitgoodsorder.do`,
    method: 'POST',
    header: {
      "content-Type": "application/x-www-form-urlencoded"
    },
    data
  })
}

// 获取账单列表
export function getpayinfoAPI(islock = false, data) {
  const url = islock ? "littleapp/customerservice/lock/getpayinfo.do" : "littleapp/customerservice/getpayinfo.do"
  return request({
    url,
    header: {
      "content-Type": "application/x-www-form-urlencoded"
    },
    data
  })
}

// 获取商品详细图片
export function getgoodsimagesAPI(data) {
  return request({
    url: "/littleapp/v2/getgoodsimages",
    data
  })
}

// 获取token
export function gettokenAPI(data) {
  return request({
    url: `/littleapp/v2/gettoken.do`,
    data
  })
}

// 查找手牌信息
export function getlockAPI(data) {
  return request({
    url: `/littleapp/customerservice/getlock.do`,
    data
  })
}

// 查询优惠券信息
export function searchEvoucherAPI(data) {
  return request({
    url: `/littleapp/v3/evoucher/evoucher/search.do`,
    data
  })
}

// 查询会员卡列表
export function getListmemberAPI(tenantId) {
  return request({
    url: `/littleapp/member/rest/listmember_m.do?tenantId=${tenantId}`,
  })
}

// 查询会员卡信息
export function getmemberinfoAPI(data) {
  return request({
    url: `/littleapp/customerservice/getmemberinfo.do`,
    data
  })
}

// 获取支付方式的paymodelId
export function getPaymentModeAPI(data) {
  return request({
    url: `/pay/paymentMode/get.do`,
    data
  })
}

// 选择支付方式支付
export function payAPI(islock = false, data) {
  const url = islock ? "littleapp/customerservice/lock/pay.do" : "littleapp/customerservice/pay.do"
  return request({
    url,
    method: "POST",
    header: {
      "content-Type": "application/x-www-form-urlencoded"
    },
    data
  })
}

// 订单平账
export function paythebillAPI(islock = false, data) {
  const url = islock ? "littleapp/customerservice/lock/paythebill.do" : "littleapp/customerservice/paythebill.do"
  return request({
    url,
    method: "POST",
    header: {
      "content-Type": "application/x-www-form-urlencoded"
    },
    data
  })
}

// 查询房间信息
export function getRoomInfoAPI(type = 'room', data) {
  return request({
    url: `customerservice/${type === 'room' ? '' : 'lock'}/getroom.do`,
    data
  })
}

// 查询手牌信息
export function getlock1API(data) {
  return request({
    url: 'customerservice/lock/getlock1.do',
    data
  })
}

// 获取房间配置
export function getRoomListSet(tenantId) {
  return request({
    url: 'rooms/roomsListGet?tenantId=' + tenantId,
    bussinessType: "customer-marketing"
  })
}