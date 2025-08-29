import request from '../script/request'

// 登录
export function loginApi(data) {
	return request({
		url: `/littleapp/v3/login.do`,
		method: 'GET',
		data,
	})
}

// 解析用户信息
export function decodeuserinfoApi(data) {
	return request({
		url: `/littleapp/v3/decodeuserinfo.do`,
		method: 'GET',
		data,
	})
}

// 绑定用户手机号
export function bindmobileApi(data) {
	return request({
		url: `/littleapp/v3/bindmobile.do`,
		method: 'POST',
		data,
	})
}

// 校验token有效性
export function tokenexpireApi(data) {
	return request({
		url: `/littleapp/v3/tokenexpire.do`,
		method: 'GET',
		data,
	})
}

// 新登录--------------------------------------------------------------------------------------------------------------------

// 小程序登录（代商家管理小程序）
export function littleAppLoginApi(data) {
	return request({
		url: '/footmassage/market/wxPlatform/wxAppRegister/littleAppLogin',
		method: 'GET',
		data,
		bussinessType: "customer-marketing"
	})
}

// 查询小程序用户信息
export function littleInfoGetApi(mToken) {
	return request({
		url: `/footmassage/market/wxPlatform/wxAppRegister/littleInfoGet?mToken=${mToken}`,
		method: 'GET',
		bussinessType: "customer-marketing"
	})
}

// 更新小程序用户相关信息
export function littleInfoUpdateApi(mToken, data) {
	return request({
		url: `/footmassage/market/wxPlatform/wxAppRegister/littleInfoUpdate?mToken=${mToken}`,
		method: 'POST',
		data,
		bussinessType: "customer-marketing"
	})
}

// 获取手机号
export function wxUserPhoneGetApi(data) {
	return request({
		url: '/footmassage/market/wxPlatform/wxAppRegister/wxUserPhoneGet',
		method: 'GET',
		data,
		bussinessType: "customer-marketing"
	})
}