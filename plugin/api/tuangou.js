import request from '@/api/request/index'

// 获取美团团购套餐
export function getTuangouInfo(data) {
  return request({
    url: `/footmassage/market/meituan/tuangou/tuangouInfo`,
    method: 'POST',
    bussinessType: "customer-marketing",
    data
  })
}

// 根据手机号查询美团团购券
export function queryMeituanProductByMobile({
  mobile,
  dealGroupId,
  dealId,
}) {
  return request({
    url: `/footmassage/market/meituan/tuangou/receipt/querybymobile`,
    data: {
      mobile,
      dealGroupId,
      dealId,
    },
    bussinessType: "customer-marketing"
  })
}

// 根据券码查询美团套餐
export function getMeituanCodeInfo(data) {
  return request({
    url: `/footmassage/market/meituan/tuangou/receipt/prepare`,
    data,
    method: "post",
    bussinessType: "customer-marketing"
  })
}
// 美团在线核销
export function verifyMeituan({
  phone,
  code,
  count,
  roomCode
}) {
  return request({
    url: `/footmassage/market/meiTuanLittleOnlineVerify/meituanOnlineVerify`,
    data: {
      phone,
      code,
      count,
      roomCode
    },
    method: "post",
    bussinessType: "customer-marketing"
  })
}

// 抖音核销团购券
export function verifyDouYin({
  phone,
  code,
  roomCode
}) {
  return request({
    url: `/footmassage/market/douYinPay/dzbOnlineVerify`,
    data: {
      phone,
      code,
      roomCode
    },
    method: "post",
    bussinessType: "customer-marketing"
  })
}