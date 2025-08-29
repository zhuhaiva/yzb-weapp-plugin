import request from '../script/request'

// 获取当前门店具体信息
export function getCurrentStoreInfo(tenantId){
  return request({
    url: `/footmassage/market/wxPlatform/wxAppStoreInfo/wxAppStoreInfoGet`,
    data: {
      tenantId
    },
    bussinessType: "customer-marketing"
  })
}

// 查询门店是否加入了企业
export function getJoinEnterpriseApi(){
  return request({
    url: `/footmassage/market//memberEnterprise/joinEnterpriseGet`,
    bussinessType: "customer-marketing"
  })
}