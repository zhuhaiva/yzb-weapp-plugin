import {
	getStorageKey
} from "@/utils/storage.js";
// import SkylineBehavior from '@behaviors/skyline.js';
import drawQrcode from '@/utils/weapp.qrcode.esm.js'
import {
  barCode,
  qrCode
} from '@/utils/generatCode.js'
import {
	getEVoucherDetailApi
} from '@/api/member'

Page({
	// behaviors: [SkylineBehavior],
	data: {
		evoucherData: {}
	},
	onLoad(options) {
		const {
			voucherId
		} = options
		let {
			screenHeight,
			navTotalHeight,
			safeAreaBottom
		} = getStorageKey("safeArea");
		this.setData({
			scrollHeight: `${screenHeight}px - ${navTotalHeight}px - ${safeAreaBottom}px`,
			safeAreaBottom,
			voucherId
		});
		this.getEVoucherDetailFn(voucherId)
	},
	getEVoucherDetailFn(voucherId) {
		getEVoucherDetailApi(voucherId).then(res => {
			this.setData({
				evoucherData: res
			})
			this.creatCode()
		})
	},
	creatCode: function () {
		/*生成付款码*/
		const {
			evoucherData
		} = this.data
		barCode({
			id: 'barcode',
			text: evoucherData.code,
			width: 300,
			height: 128,
			color: '#3d3d3d',
			bgcolor: '#fff'
		});
		qrCode({
			id: 'myQrcode',
			text: evoucherData.code,
			width: 300,
			height: 300,
			color: '#3d3d3d',
		})
		// const query = wx.createSelectorQuery()
		// query.select('#myQrcode')
		// 	.fields({
		// 		node: true,
		// 		size: true
		// 	})
		// 	.exec((res) => {
		// 		console.log(res)
		// 		var canvas = res[0].node

		// 		// 调用方法drawQrcode生成二维码
		// 		drawQrcode({
		// 			canvas: canvas,
		// 			canvasId: 'myQrcode',
		// 			width: 300,
		// 			height: 300,
		// 			padding: 30,
		// 			background: '#ffffff',
		// 			foreground: '#000000',
		// 			text: evoucherData.code,
		// 		})

		// 		// 获取临时路径（得到之后，想干嘛就干嘛了）
		// 		wx.canvasToTempFilePath({
		// 			canvasId: 'myQrcode',
		// 			canvas: canvas,
		// 			x: 0,
		// 			y: 0,
		// 			width: 300,
		// 			height: 300,
		// 			destWidth: 300,
		// 			destHeight: 300,
		// 			success(res) {
		// 				console.log('二维码临时路径：', res.tempFilePath)
		// 			},
		// 			fail(res) {
		// 				console.error(res)
		// 			}
		// 		})
		// 	})
	},
	callStoreTel(e) {
		const { tel } = e.currentTarget.dataset
		wx.makePhoneCall({
			phoneNumber: tel,
		})
	}
})