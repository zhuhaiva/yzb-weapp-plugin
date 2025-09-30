// pages/scanCode/goodsorder/goodsorder.js
import md5 from '../../../utils/md5'
import {
  splitDecimal
} from '../../../utils/util'
import {
  getStorageConfig
} from '../../../utils/storage'
import {
  getgoodscategorylistAPI,
  getgoodslistAPI,
  commitgoodsorderAPI,
  gettokenAPI,
  getpayinfoAPI,
  getgoodsimagesAPI
} from '../../../api/scanOrder'

const getOperator = (str) => {
  let result = str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");
  if(result.length > 11) {
    return `*${result.substring(0,11)}`
  }
  return result
}

Page({
  data: {
    roomId: null,
    teaTable: null,
    roomName: null,
    categorylist: null,
    systemInfo: wx.getSystemInfoSync(),
    shopCarList: {}, //购物车
    showShopingCar: false, //购物车dialog
    sumTotal: 0,
    orginsumTotal: 0,
    sum: 0,
    TabCur: 0,
    VerticalNavTop: 0,
    load: true,
    showSumbitModel: false, //打开提交订单页面
    selectEvoucher: null, //选择券
    selectMember: null,
    useMemberListDialog: false,
    order: [],
    orignProductList: []
  },
  onLoad: async function (options) {
    const {
      roomId,
      teaTable,
      checkInSN,
      selfOrder = true,
      tenantId,
      lockcode,
      roomName,
      isSCM = false,
      closeTime,
      openTime,
      isBusiness = true,
      checkInId,
      islock = false,
      limitBuyProduct = 0
    } = options
    this.setData({
      roomId,
      teaTable,
      checkInSN,
      selfOrder,
      tenantId,
      lockcode,
      isSCM,
      closeTime,
      openTime,
      isBusiness: isBusiness && isBusiness === 'true',
      checkInId,
      islock,
      limitBuyProduct
    });
    wx.setNavigationBarTitle({
      title: `${roomName}-${teaTable}座位点单`
    });
    this.getPageInfo()
  },
  async getPageInfo() {
    const {
      roomId,
      limitBuyProduct,
      checkInId
    } = this.data
    const order = checkInId ? await this.getPayInfo() : []
    const orderSum = order.reduce((total, item) => {
      if (item.productType === 1) {
        return total + item.netQuantity
      }
      return total
    }, 0)
    this.setData({
      order: order.map(item => {
        const {
          name,
          productId,
          netQuantity
        } = item
        return {
          name,
          id: productId,
          quantity: netQuantity
        }
      }),
      addBtnDisabled: orderSum >= Number(limitBuyProduct) && Number(limitBuyProduct) > 0
    })
    this.getgoodscategorylist(roomId, order);
  },
  //选择分类
  tabSelect(e) {
    const {
      index
    } = e.currentTarget.dataset
    this.setData({
      TabCur: index,
      MainCur: index,
      VerticalNavTop: (index - 1) * 50,
    });
  },
  //添加到购物车
  pushShopCar(e) {
    const selectGood = e.currentTarget.dataset.list;
    const num = 1;
    const {
      limitBuyProduct,
      order,
      orginProductList
    } = this.data
    const orderSum = order.reduce((total, item) => {
      if (orginProductList.indexOf(item.id) >= 0) {
        return total + item.quantity
      }
      return total
    }, 0)
    if ((orderSum + this.data.sum) >= Number(limitBuyProduct) && Number(limitBuyProduct) > 0) {
      wx.showToast({
        icon: 'none',
        title: '已达最大购买数',
      })
      return
    }
    if (this.data.shopCarList[selectGood.id]) {
      // 检验限购
      if (selectGood.max) {
        const currentNum = this.data.shopCarList[selectGood.id].num + 1
        if (currentNum > selectGood.max) {
          wx.showToast({
            icon: 'none',
            title: '已达最大购买数',
          })
          return
        }
      }
      // 检验限售
      if (selectGood.isStock && selectGood.stock < this.data.shopCarList[selectGood.id].num + 1) {
        this.views.setData({
          error: "超过当前商品最大库存"
        })
        return
      }
      this.data.shopCarList[selectGood.id].num++;
    } else {
      this.data.shopCarList[selectGood.id] = {
        id: selectGood.id,
        name: selectGood.name,
        price: selectGood.price,
        promotionalPrice: selectGood.promotionalPrice,
        num: num,
        image: selectGood.image,
        buyNumber: selectGood.buyNumber,
        limitBuyStock: selectGood.limitBuyStock,
        isStock: selectGood.isStock,
        stock: selectGood.stock
      }
    }
    const sumInfo = this.sumTotal(this.data.shopCarList)
    const sum = this.sum(this.data.shopCarList)
    this.setData({
      sum,
      sales: sumInfo.sales,
      orignSumTotal: sumInfo.orignSumTotal,
      sumTotal: sumInfo.sumTotal,
      shopCarList: this.data.shopCarList,
      addBtnDisabled: (orderSum + sum) >= Number(limitBuyProduct) && limitBuyProduct > 0
    })
  },
  //商品移除购物车
  removeShopCar(e) {
    const id = e.currentTarget.dataset.id
    let currentGood = this.data.shopCarList
    let num = currentGood[id].num;
    if (num - 1 > 0) {
      currentGood[id].num = num - 1;
    } else {
      delete this.data.shopCarList[id];
    }

    const sum = this.sumTotal(this.data.shopCarList)
    this.setData({
      sum: this.sum(currentGood),
      sales: sum.sales,
      sumTotal: sum.sumTotal,
      orignSumTotal: sum.orignSumTotal,
      shopCarList: this.data.shopCarList
    })
  },
  shopCarInput(e) {
    const selectGood = e.currentTarget.dataset.list
    const currentNum = Number(e.detail.value)
    // 检验限购
    this.data.shopCarList[selectGood.id].num = currentNum
    const sum = this.sumTotal(this.data.shopCarList)
    this.setData({
      sum: this.sum(this.data.shopCarList),
      sales: sum.sales,
      orignSumTotal: sum.orignSumTotal,
      sumTotal: sum.sumTotal,
      shopCarList: this.data.shopCarList
    })
  },
  //打开关闭购物车
  toggleCarSheet() {
    this.setData({
      showShopingCar: !this.data.showShopingCar
    })
  },
  //滚动选择商品
  VerticalMain(e) {
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        list[i].top = tabHeight;
        tabHeight = tabHeight + list[i].list.length * 116;
        list[i].bottom = tabHeight;
      }
      this.setData({
        load: false,
        list: list,
      });
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        this.setData({
          VerticalNavTop: (list[i].index - 1) * 50,
          TabCur: list[i].index,
        });
        return false;
      }
    }
  },
  //计算合计金额
  sumTotal(list) {
    let sumTotal = Object.values(list).reduce((total, item) => {
        return item.promotionalPrice && item.promotionalPrice !== null ? total + item.promotionalPrice * item.num : total + item.price * item.num
      }, 0),
      orignSumTotal = Object.values(list).reduce((total, item) => {
        return total + item.price * item.num
      }, 0),
      sales = Object.values(list).reduce((total, item) => {
        return item.promotionalPrice && item.promotionalPrice !== null ? total + (item.price - item.promotionalPrice) * item.num : total
      }, 0)

    return {
      sales: sales.toFixed(2),
      orignSumTotal: orignSumTotal.toFixed(2),
      sumTotal: sumTotal.toFixed(2)
    };
  },
  //计算商品数量
  sum(list) {
    let sum = 0;
    for (var item in list) {
      if (list[item] != null) {
        sum += list[item].num;
      }
    }
    return sum;
  },
  getgoodscategorylist(roomId, order) {
    //获取分类列表
    getgoodscategorylistAPI(roomId).then(data => {
      if (Object.keys(data).length > 0) {
        this.getGoodsAjax(data, roomId, order);
      }
    })
  },
  getGoods: function (e) {
    //获取商品列表
    const {
      index,
      id
    } = e.currentTarget.dataset
    this.setData({
      activeID: index,
      GoodsList: [],
      start: 0,
      iTotal: 0,
      isAjax: true,
      categoryId: id,
      TabCur: index
    });
    this.getGoodsAjax();
  },
  getGoodsAjax: function (category, roomId, order) {
    var that = this;
    const {
      checkInId
    } = this.data
    getgoodslistAPI({
      roomId: roomId,
      categoryId: "",
      start: 0,
      size: 500,
      checkIn_Id: checkInId
    }).then((data) => {
      const {
        error
      } = data
      if (error) {
        this.setData({
          isBusiness: false,
          errorMsg: error === "未刷卡" ? "请移步至入口处刷闸机入场后再点餐" : error
        })
        return
      }
      let list = category.map((item) => {
        item.list = this.getGoodsMap(data.iData.filter(j => j.pcname === item.name)).filter(j => !j.sellOut && j.timeLimit === 0)
        return {
          id: item.id,
          name: item.name,
          list: item.list
        }
      })
      list = list.filter(item => item.list.length > 0).map((item, index) => {
        item.index = index
        return item
      })
      const {
        limitBuyProduct
      } = this.data
      const orginProductList = data.iData.map(item => item.id)
      const orderSum = order.reduce((total, item) => {
        if (orginProductList.indexOf(item.productId) >= 0) {
          return total + item.netQuantity
        }
        return total
      }, 0)
      that.setData({
        list,
        orginProductList,
        addBtnDisabled: orderSum >= Number(limitBuyProduct) && Number(limitBuyProduct) > 0
      })
    })
  },
  // 返回限购值
  getGoodsMap(list) {
    const {
      order
    } = this.data
    return list.map(item => {
      const hasOrder = order.find(k => {
        return k.id === item.id
      })
      if (item.limitBuy > 0) {
        if (hasOrder) {
          item.max = item.limitBuy - hasOrder.quantity
        } else {
          item.max = item.limitBuy
        }
      } else {
        item.max = 999999
      }
      return {
        name: item.name,
        max: item.max,
        id: item.id,
        image: item.image,
        limitBuy: item.limitBuy,
        pcname: item.pcname,
        price: item.price,
        priceObj: splitDecimal(item.price),
        stock: item.stock,
        timeLimit: item.timeLimit,
        sellOut: item.sellOut
      }
    })
  },
  async onSubmit() {
    /**提交下单 */
    if (!this.data.selfOrder) {
      wx.showModal({
        content: '门店未开通自助点单功能',
      });
      return false;
    }
    const {
      roomId,
      checkInSN,
      teaTable,
      isSCM,
      shopCarList
    } = this.data
    let postData = `roomId=${roomId}&checkInSN=${checkInSN}&operator=茶几码自助点餐&teaTable=${teaTable}&isSCM=${isSCM}`;
    Object.values(shopCarList).forEach((item, i) => {
      postData += `&orderItems[${i}].product.id=${item.id}&orderItems[${i}].printMemo=&orderItems[${i}].name=${item.name}&orderItems[${i}].productType = Goods&orderItems[${i}].quantity=${item.num}`;
    })

    if (this.data.lockcode !== 'null') {
      postData += `&lockCode=${this.data.lockcode}`
    }
    const token = await this.getToken()
    postData += `&token=${token}`
    commitgoodsorderAPI(postData).then(data => {
      if (data.type == "success") {
        wx.showModal({
          content: data.content,
          cancelText: "继续点单",
          confirmText: "返回首页",
          success: (e) => {
            if (e.confirm) {
              wx.navigateBack();
            } else {
              this.getPageInfo()
            }
          }
        });
        this.clearShopCar();
      } else {
        wx.showToast({
          icon: "none",
          title: data.content
        })
      }
    })
  },
  clearShopCar() {
    this.data.shopCarList = {}
    const sum = this.sumTotal(this.data.shopCarList)
    this.setData({
      sum: this.sum(this.data.shopCarList),
      sales: sum.sales,
      orignSumTotal: sum.orignSumTotal,
      sumTotal: sum.sumTotal,
      shopCarList: this.data.shopCarList
    })
  },
  /**
   * 获取Token
   * @param {*} memberPay 
   */
  getToken() {
    return new Promise(resolve => {
      const {
        tenantId
      } = this.data
      gettokenAPI({
        ...encrypt(tenantId)
      }).then(data => {
        resolve(data.content)

      })
    })
  },
  /**
   * 获取账单明细
   */
  getPayInfo() {
    return new Promise(resolve => {
      const {
        checkInId,
        tenantId,
        islock
      } = this.data
      this.setData({
        loading: true
      })
      const encryptJson = encrypt(tenantId)
      getpayinfoAPI(islock, {checkInId,...encryptJson}).then(data => {
        const {
          orderitems,
        } = data
        resolve(orderitems)
      })
    })
  },
  getPayInfoPage() {
    const {
      tenantId,
      checkInId,
      islock,
      roomId
    } = this.data
    wx.navigateTo({
      url: `/pages/scanCode/order/order?roomId=${roomId}&tenantId=${tenantId}&checkInId=${checkInId}&islock=${islock}&allowMemberPay=false`,
    })
  },
  previewImage(e) {
    const {
      id,
      img
    } = e.currentTarget.dataset
    if (img) {
      getgoodsimagesAPI({
        productId: id,
        start: 0,
        size: 10
      }).then(data => {
        wx.previewImage({
          current: img,
          urls: [img, ...data.iData]
        })
      })
    } else {
      wx.showToast({
        title: '商家未上传图片',
        icon: 'none'
      })
    }
  }
})

/**
 * 生成签名
 * @param {*} tenantId 
 */
function encrypt(tenantId) {
  const {userInfo,mtoken} = getStorageConfig()
  if (userInfo) {
    const arr = {
      tenantId,
      name: getOperator(userInfo.nickName),
      password: '123456789',
      mtoken,
      timeStamp: Date.now()
    };
    var sign = md5(arr.tenantId + arr.password + arr.name + arr.timeStamp);
    return {
      ...arr,
      sign
    }
  }
}