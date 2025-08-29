import { getStorageKey } from "@/utils/storage.js";
import { getMyselfEVoucherPageApi } from '@/api/member'

Page({
  data: {
		list: [],
		form: {
			"basePageReq": {
				"page": 1,
				"rows": 10,
				"searchText": "",
				"orderBy": ""
			},
			"phone": '',
			// "tenantIds": ['caba6906']
		},
		isAjax: false
  },
  onLoad(options) {
		let { screenHeight, navTotalHeight, safeAreaBottom } = getStorageKey("safeArea");
		const userInfo = getStorageKey('userInfo')
    this.setData({
			scrollHeight: `${screenHeight}px - ${navTotalHeight}px - ${safeAreaBottom}px`,
			safeAreaBottom,
			'form.phone': userInfo.mobile
		});
		this.getMyselfEVoucherPage()
	},
	getMyselfEVoucherPage() {
		const { form } = this.data
		getMyselfEVoucherPageApi(form).then(res => {
			if (res.data.pageObject.records != 0) {
        let list = form.basePageReq.page === 0 ? [] : this.data.list,
          start = ++form.basePageReq.page,
          isAjax = list.length < res.data.pageObject.records
        this.setData({
          list: list.concat(res.data.data),
          'form.basePageReq.page': start,
          isAjax: isAjax,
          isRefreshing: false
        })
      } else {
        this.setData({
          list: [],
          'form.basePageReq.page': 1,
          isAjax: true,
          isRefreshing: false
        })
      }
		})
	},
	lower: function () {
    if (this.data.isAjax) {
      this.getMyselfEVoucherPage();
    }
  },
  refresh: function () {
    this.setData({
      list: [],
      'form.basePageReq.page': 1,
      isAjax: true,
      isRefreshing: true
    })
    this.getMyselfEVoucherPage();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      list: [],
      'form.basePageReq.page': 1,
      isAjax: true
    })
    this.getMyselfEVoucherPage();
  },
})