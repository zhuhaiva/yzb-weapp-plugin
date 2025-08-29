import request from '../script/request.js'

//发起支付
export function pay(tenantId, data) {
  return request({
    url: '/footmassage/market/pay/pay-event/pay-request?tenantId=' + tenantId,
    method: 'POST',
    data,
    bussinessType: "customer-marketing"
  })
}