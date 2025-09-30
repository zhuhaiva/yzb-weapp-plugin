// pages/scanCode/order/order.js
import Dialog from '@vant/weapp/dialog/dialog';
import Notify from '@vant/weapp/notify/notify';
import md5 from '../../../utils/md5.js';
import {
  pay as sxfPay
} from '../../../api/ordercentre'
import {
  geterrMsgPage
} from '../../../utils/util.js';
import {
  getpayinfoAPI,
  getlockAPI,
  searchEvoucherAPI,
  getListmemberAPI,
  getmemberinfoAPI,
  getPaymentModeAPI,
  gettokenAPI,
  payAPI,
  paythebillAPI,
  getRoomInfoAPI,
  getlock1API
} from '../../../api/scanOrder'
import {
  getStorageConfig
} from '../../../utils/storage'
import {
  getRequest
} from '../../../utils/util'

const getOperator = (str) => {
  let result = str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");
  if (result.length > 11) {
    return `*${result.substring(0,11)}`
  }
  return result
}

const arrangeTypeOptions = {
  "Arrangements": "排钟",
  "Specify": "点钟",
  "Add": "加钟",
  "Call": "括钟",
  "Choice": "选钟"
}
Page({
  data: {
    first: true,
    loading: true,
    checkInIds: [],
    tenantId: null,
    countinfo: null,
    orderitems: [],
    tpList: [],
    showProductDetail: false,
    allowMemberPay: true,
    selectMemberCard: null,
    memberPay: null,
    memberList: [],
    useMemberListDialog: false,
    paymentAmount: 0,
    memberPayModeId: null,
    sxfPayModeId: null,
    voucherPayModeId: null,
    voucherList: [],
    useEvoucherListDialog: false,
    usableVoucherLen: 0,
    payModeType: "wechatPay"
  },
  onLoad(options) {
    const {
      scene: appScene,
      path
    } = wx.getLaunchOptionsSync()
    if (appScene == 1011 && path === "pages/scanCode/order/order") {
      const url = decodeURIComponent(options.q)
      const params = getRequest(url)
      this.setPageParams(params)
    } else {
      this.setPageParams(options)
    }
  },
  setPageParams(options) {
    const {
      checkInId,
      tenantId,
      roomId,
      islock,
      deviceNo,
      c,
      t,
      r,
      l = 'true',
      d,
      allowSelfPay = true
    } = options
    if (c && t && r && l) {
      this.setData({
        checkInIds: [c],
        tenantId: t,
        roomId: r,
        deviceNo: d,
        islock: l === 'true',
        allowSelfPay: allowSelfPay || allowSelfPay === 'true'
      })
    } else {
      this.setData({
        checkInIds: [checkInId],
        tenantId,
        roomId,
        deviceNo,
        islock: islock === 'true',
        allowSelfPay: allowSelfPay || allowSelfPay === 'true'
      })
    }
    this.getPayMentModeId('随行付', 'sxfPayModeId')
    this.getPayMentModeId('代金券', 'voucherPayModeId')
    this.getPayMentModeId('会员卡', 'memberPayModeId').then(async () => {
      this.getMemberList()
      const {
        checkInIds,
        islock
      } = this.data;
      if (islock) {
        const LockCheckInIds = await this.getlockscheckinids(checkInIds)
        this.setData({
          checkInIds: [...checkInIds, ...LockCheckInIds]
        })
      }
      this.getPayInfo().then(async (res) => {
        if (this.data.islock) {
          // 同组手牌结账

          if (res.lockMemo.length > 0) {
            const currentLock = res.lockMemo[0]
            // 查询手牌信息
            if (!currentLock.code) {
              return
            }
            this.getLockInfo({
              id: currentLock.code
            }).then(async locks => {
              const {
                checkInIds
              } = this.data
              const {
                lockSign,
                sameRoomNotGroup,
                groupLock
              } = locks
              // 确认所在房间是否计费
              if (lockSign.room) {
                const roomId = lockSign.room.split(';')[0]
                const roomInfo = await this.getRoomInfo({
                  roomID: roomId
                }, 'lock')
                if (roomInfo.Rooms[0].charge) {
                  checkInIds.push(roomInfo.Rooms[0].checkin.id)
                }
              }
              const lockList = [];
              // 同组手牌
              if (lockSign.groupNo) {
                groupLock[lockSign.groupNo].forEach(item => {
                  if (item.code !== lockSign.code) {
                    lockList.push(item)
                  }
                })
              }
              // 同房间手牌
              if (sameRoomNotGroup && sameRoomNotGroup.length > 0) {
                sameRoomNotGroup.forEach(item => {
                  lockList.push(item)
                })
              }
              if (lockList.length === 0) {
                return
              }
              const lockText = lockList.map(item => item.code)
              wx.showModal({
                title: '温馨提示',
                content: `是否将同组/同房间手牌【${lockText.join(',')}】一起进行结账？`,
                complete: (res) => {
                  if (res.confirm) {
                    lockList.forEach(item => {
                      checkInIds.push(item.checkIn_Id)
                    });
                    this.setData({
                      checkInIds
                    })
                    this.getPayInfo()
                  }
                }
              })
            })
          }
        }
      })
    })
  },
  onPullDownRefresh() {
    const {
      allowSelfPay
    } = this.data
    this.getPayInfo()
    if (allowSelfPay) {
      this.getMemberList()
      this.getVoucher(false)
    }
    this.setData({
      memberPay: null
    })
  },
  /**
   * 获取账单明细
   */
  getPayInfo() {
    return new Promise(resolve => {
      const {
        checkInIds,
        tenantId,
        memberPayModeId,
        islock,
        allowMemberPay
      } = this.data
      this.setData({
        loading: true
      })
      const list = checkInIds.map(item => {
        return "checkInId=" + item
      })
      const encryptJson = encrypt(tenantId)
      for (let key in encryptJson) {
        list.push(`${key}=${encryptJson[key]}`)
      }
      getpayinfoAPI(islock, list.join('&')).then(data => {
        if (data.message.type === 'error') {
          geterrMsgPage(60002)
          return
        }
        const {
          countinfo,
          orderitems,
          tpList
        } = data
        const productTotal = orderitems.reduce((total, item) => {
          return total + item.subtotalByOriginal
        }, 0)
        const memberPay = function () {
          const item = tpList.find(item => {
            return item.payModeID === memberPayModeId
          })
          if (item) {
            return {
              remaining: item.realAmount,
              cardNo: item.voucherNo.split('$')[0],
              id: item.memberId
            }
          }
          return null
        }()
        this.setData({
          loading: false,
          countinfo,
          orderitems: orderitems.map(item => {
            return {
              ...item,
              arrangeTypeText: arrangeTypeOptions[item.arrangeType] || ''
            }
          }),
          countList: [{
            title: "消费金额",
            value: countinfo.roomCost + countinfo.minConsume + productTotal,
            isOpen: false,
            list: [{
              label: "包厢费",
              value: countinfo.roomCost
            }, {
              label: "最低消费",
              value: countinfo.minConsume
            }, {
              label: "商品/服务",
              value: productTotal
            }],
          }, {
            title: "优惠金额",
            value: countinfo.cheapTotal + countinfo.freeTotal + countinfo.rounding + countinfo.giveTotal,
            isOpen: false,
            list: [{
                label: "店铺/会员折扣",
                value: countinfo.cheapTotal
              },
              {
                label: "免单",
                value: countinfo.freeTotal
              },
              {
                label: "抹零",
                value: countinfo.rounding
              },
              {
                label: "赠送",
                value: countinfo.giveTotal
              }
            ]
          }, {
            title: "已支付金额",
            value: tpList.reduce((total, item) => {
              if (item.payModeName !== '免单') {
                return total + item.realAmount
              }
              return total
            }, 0),
            isOpen: false,
            list: tpList.map(item => {
              return {
                label: item.payModeName + '-' + item.voucherNo,
                value: item.realAmount
              }
            }).filter(item => {
              return item.label.indexOf('免单') < 0
            }),
          }],
          memberPay,
          first: false
        })
        wx.stopPullDownRefresh()
        if (allowMemberPay) {
          this.getVoucher()
        }
        resolve(data)
      })
    })

  },
  /**
   * 获取手牌列表
   */
  getlockscheckinids() {
    return new Promise(resolve => {
      const {
        checkInIds,
        tenantId
      } = this.data
      const list = checkInIds.map(item => {
        return "roomCheckInId=" + item
      })
      const encryptJson = encrypt(tenantId)
      for (let key in encryptJson) {
        list.push(`${key}=${encryptJson[key]}`)
      }
      app.pulicAjax({
        url: "../customerservice/lock/getlockscheckinids.do",
        data: list.join('&'),
        cellback: (data) => {
          resolve(data)
        }
      })
    })

  },
  setshowProductDetail() {
    this.setData({
      showProductDetail: !this.data.showProductDetail
    })
  },
  setIsOpen(e) {
    const {
      title
    } = e.currentTarget.dataset
    const {
      countList
    } = this.data
    const index = countList.findIndex(item => item.title === title)
    if (countList[index].list.length === 0) {
      wx.showToast({
        icon: "none",
        title: '暂无明细',
      })
      return
    }
    countList[index].isOpen = !countList[index].isOpen
    this.setData({
      countList
    })
  },
  setUseMemberListDialog() {
    this.setData({
      useMemberListDialog: !this.data.useMemberListDialog
    })
  },
  /**
   * 获取优惠券
   * voucherType = {
        0: "抵价券",
        1: "免费券",
        2: "团购券",
        3: "打折券",
        4: "现金券"
    };
   */
  getVoucher(isAlert = true) {
    const {
      tenantId,
      countinfo
    } = this.data
    searchEvoucherAPI({
      start: 0,
      size: 100,
      tenantId
    }).then((data) => {
      const {
        consumeTotal
      } = this.data.countinfo
      const {
        orderitems
      } = this.data
      // 筛选出可用券的项目
      const useableOrderitems = orderitems.filter(item => !item.isVoucher && item.scale === 100)
      const voucherList = data.filter(item => {
        return item.voucherType === 0
      }).map(item => {
        const useConditionAmount = item.useCondition === '无' ? -1 : extractNumbers(item.useCondition)
        const hasAllowUseItem = (() => {
          if (useableOrderitems.length > 0) {
            if (item.memo) {
              return useableOrderitems.filter(j => {
                return item.memo.split().includes(j.name)
              }).length > 0
            }
            return true
          }
          return false
        })()
        item.allowUseVoucherFlag = consumeTotal >= useConditionAmount && hasAllowUseItem
        item.notAllowUseReason = !hasAllowUseItem ? '无可用商品或项目' : consumeTotal < useConditionAmount ? '消费金额不满足' : ''
        return item
      })
      voucherList.sort((a, b) => {
        const a1 = a.allowUseVoucherFlag ? 1 : 0
        const b1 = b.allowUseVoucherFlag ? 1 : 0
        return b1 - a1
      })
      const usableVoucherLen = voucherList.filter(item => item.allowUseVoucherFlag).length
      this.setData({
        usableVoucherLen,
        voucherList
      })
      if (usableVoucherLen && isAlert && countinfo && countinfo.balance > 0) {
        wx.showModal({
          title: '温馨提示',
          content: '当前订单有可用优惠券，是否查看使用?',
          complete: (res) => {
            if (res.confirm) {
              this.setData({
                useEvoucherListDialog: true
              })
            }
          }
        })
      }
    })
  },
  /*
   * 打开、关闭使用券页面
   */
  setEvoucherListDialog() {
    const {
      useEvoucherListDialog
    } = this.data
    this.setData({
      useEvoucherListDialog: !useEvoucherListDialog
    })
  },
  /**
   * 核销电子券
   */
  useVoucher(e) {
    const {
      voucherPayModeId: payId
    } = this.data
    const {
      code: eVoucherId
    } = e.currentTarget.dataset
    const formData = {
      eVoucherId,
      payId
    }
    this.pay(formData).then((flag) => {
      if (flag) {
        wx.showModal({
          content: '电子券核销成功',
        })
        this.getVoucher(false)
        this.setData({
          useEvoucherListDialog: false
        })
      }
    })
  },
  /**
   * 获取会员卡列表
   */
  getMemberList() {
    const cardTypeArr = {
      Save: "充值卡",
      Rebate: "打折卡",
      Meter: "计次卡",
      RebateAndSave: "打折充值卡",
      Yearly: "年卡"
    };
    const {
      tenantId
    } = this.data
    getListmemberAPI(tenantId).then((data) => {
      if (data.length > 0) {
        const memberList = data.filter(item => {
          return !(item.lost && item.enabled)
        }).map(item => {
          item.cardTypeText = cardTypeArr[item.cardType]
          item.hideCardNo = `**** ${item.cardNo.slice(-4)}`
          return item
        })
        memberList.sort((a, b) => {
          return b.balance - a.balance
        })
        this.setData({
          memberList
        })
        if (memberList.length > 0) {
          this.onClickMemberCard({
            currentTarget: {
              dataset: {
                id: memberList[0].id
              }
            }
          })
        }
      }
    })
  },
  /**
   * 获取会员卡支付金额
   * autoFree 积分抵扣金额
   * autoFreeNum 可抵扣次数
   * isTodayBirthDay 是否今日生日
   * birthDayFree 生日抵扣金额
   * specify_Deduct 指定项目扣款金额
   * member.expireDate 有效期，卡是否过期
   * member.dailyUseFrequency 每天可消费次数
   */
  getmemberPayInfo(options) {
    const {
      id,
      cardNo,
    } = options
    const {
      checkInIds,
      tenantId,
      memberPayModeId
    } = this.data
    const list = checkInIds.map(item => {
      return "checkInId=" + item
    })
    list.push(`member_id=${id}`)
    list.push(`cardNo=${cardNo}`)
    const encryptJson = encrypt(tenantId)
    for (let key in encryptJson) {
      list.push(`${key}=${encryptJson[key]}`)
    }
    getmemberinfoAPI(list.join('&')).then((data) => {
      if (data.type === 'error') {
        Notify({
          type: "warning",
          message: data.content
        })
        return
      }
      const {
        member,
        Remaining,
        specify_Deduct,
        birthDayFree,
        isTodayBirthDay
      } = data
      const {
        balance,
        cardNo,
        id,
        password,
        name
      } = member
      const memberPay = {
        remaining: balance >= Remaining ? Remaining : balance,
        cardNo: cardNo,
        id,
        payData: password
      }
      if (specify_Deduct) {
        memberPay.remaining = specify_Deduct
      }
      if (isTodayBirthDay && birthDayFree > 0) {
        // const morememo = isTodayBirthDay ? `，今日是您的生日可免单${birthDayFree}元` : ""
        Dialog.alert({
          message: `尊敬的【${name}】，祝您生日快乐，请前往收银台买单享受优惠哦`,
          confirmButtonText: '我知道了'
        })
        return
      }
      Dialog.confirm({
          title: "会员卡支付",
          message: `使用会员卡【${cardNo}】预计支付${memberPay.remaining}元`,
          confirmButtonText: "确认支付",
        })
        .then(() => {
          const data = {
            payId: memberPayModeId,
            card_id: memberPay.id,
            member_id: memberPay.id,
            paymentAmount: memberPay.remaining,
            payData: memberPay.payData,
          }
          this.pay(data)
        })
    })
  },
  /**
   * 选择会员卡
   * @param {*} e 
   */
  onClickMemberCard(e) {
    const {
      id
    } = e.currentTarget.dataset
    const selectMemberCard = this.data.memberList.find(item => item.id === id)
    this.setData({
      selectMemberCard,
      payModeType: "memberCardPay"
    })
  },
  /**
   * 使用会员卡 | 不使用会员卡
   */
  setUseMember() {
    const {
      memberPay
    } = this.data
    if (memberPay) {
      Notify({
        type: 'warning',
        message: "已使用过会员卡支付"
      })
      return
    }
    const {
      cardno,
      id
    } = this.data.selectMemberCard
    this.getmemberPayInfo({
      cardNo: cardno,
      id
    })
  },
  /**
   * 获取支付方式的payModeId
   */
  getPayMentModeId(paymentModeName, key) {
    return new Promise(resolve => {
      const {
        tenantId
      } = this.data
      getPaymentModeAPI({
        paymentModeName,
        tenantId
      }).then((data) => {
        const {
          id
        } = data
        this.setData({
          [key]: id
        })
        resolve()
      })
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
   * 支付
   */
  async pay(formData) {
    const {
      checkInIds,
      tenantId,
      islock,
      allowMemberPay
    } = this.data
    const token = await this.getToken()
    const {
      userInfo
    } = getStorageConfig()
    const list = checkInIds.map(item => {
      return "checkInId=" + item
    })
    list.push(`token=${token}`)
    list.push(`operator=${getOperator(userInfo.nickName)}`)
    for (let key in formData) {
      list.push(`${key}=${formData[key]}`)
    }
    const encryptJson = encrypt(tenantId)
    for (let key in encryptJson) {
      list.push(`${key}=${encryptJson[key]}`)
    }
    return new Promise(resolve => {
      payAPI(islock, list.join('&')).then((data) => {
        if (data.type === 'error') {
          Notify({
            type: 'warning',
            message: data.content
          });
          resolve(false)
          return
        }
        resolve(true)
        this.getPayInfo().then(res => {
          const {
            balance
          } = res.countinfo
          if (balance === 0) {
            this.paythebill();
          } else {
            if (allowMemberPay) {
              this.getMemberList()
              this.getVoucher()
            }
            Notify({
              type: data.type === 'success' ? 'success' : 'warning',
              message: data.content
            });
          }
        })
      })
    })
  },
  submitForm() {
    const {
      payModeType
    } = this.data
    const {
      balance
    } = this.data.countinfo
    if (balance > 0) {
      if (payModeType === 'wechatPay') {
        this.sxfPay()
      } else if (payModeType === 'memberCardPay') {
        this.setUseMember()
      }
    }
  },
  /**
   * 发起微信支付
   */
  sxfPay() {
    const {
      tenantId,
      countinfo,
      checkInIds,
      sxfPayModeId,
      deviceNo
    } = this.data
    const {
      userInfo
    } = getStorageConfig()
    const data = {
      "masterPayPreReqDtos": [{
        "payType": "SxfJsPay",
        "payPreMasterDto": {
          "financialReqDto": {
            "memo": "日常消费",
            "reqAmount": countinfo.balance,
            "subject": "茶几码扫码自助结账"
          },
          "relateDto": JSON.stringify({
            "mtoken": wx.getStorageSync('mtoken'),
            "payType": "WECHAT",
            "payWay": "03",
            "subject": `茶几码扫码自助结账`,
            "wxSubAppId": 'wx1661bfa96451133d',
            "deviceNo": deviceNo !== 'null' ? deviceNo : null
          })
        }
      }],
      "detailPayPreReqDtos": [{
        "detailPayType": "checkInPay",
        "payPreDetailDto": {
          "financialReqDto": {
            "memo": "日常消费",
            "reqAmount": countinfo.balance,
            "subject": "茶几码扫码自助结账"
          },
          "relateDto": JSON.stringify({
            "checkInIds": checkInIds,
            "operator": `${getOperator(userInfo.nickName)}`,
            "payModeId": sxfPayModeId,
            "subject": "茶几码扫码自助结账"
          })
        }
      }],
      "tenantId": tenantId
    }
    sxfPay(tenantId, data).then(data => {
      //发起微信支付
      if (data.resCode == 202) {
        var opt = data.returnMessage[0].SxfJsPay;
        wx.requestPayment({
          timeStamp: opt.payTimeStamp,
          nonceStr: opt.paynonceStr,
          package: opt.payPackage,
          signType: opt.paySignType,
          paySign: opt.paySign,
          success: res => {
            this.getPayInfo().then(res => {
              const {
                balance
              } = res.countinfo
              if (balance === 0) {
                this.paythebill();
                geterrMsgPage(60001, true)
              } else {
                Notify({
                  type: data.type === 'success' ? 'success' : 'warning',
                  message: data.content
                });
              }
            })
          },
          fail: res => {
            Notify({
              type: 'warning',
              message: res.errMsg
            });
          }
        });
      }
    })
  },
  /**
   * 平账
   */
  async paythebill() {
    const {
      checkInIds,
      tenantId,
      roomId,
      islock
    } = this.data
    const token = await this.getToken()
    const {
      userInfo
    } = getStorageConfig()
    const list = checkInIds.map(item => {
      return "checkInId=" + item
    })
    list.push(`token=${token}`)
    list.push(`operator=${getOperator(userInfo.nickName)}`)
    list.push(`roomId=${roomId}`)
    list.push(`cash=0`)
    list.push(`roomCost=0`)
    list.push(`rounding=0`)
    const encryptJson = encrypt(tenantId)
    for (let key in encryptJson) {
      list.push(`${key}=${encryptJson[key]}`)
    }
    paythebillAPI(islock, list.join('&')).then((data) => {
      if (data.type === 'success') {
        geterrMsgPage(60001, true)
      } else {
        Notify({
          type: 'warning',
          message: data.content
        });
      }
    })
  },
  /**
   * 切换支付方式
   */
  onChangePayModeType(e) {
    const {
      detail: payModeType
    } = e
    if (payModeType === "memberCardPay") {
      const {
        memberList
      } = this.data
      memberList.length > 0 && this.onClickMemberCard({
        currentTarget: {
          dataset: {
            id: memberList[0].id
          }
        }
      })
    } else {
      this.setData({
        selectMemberCard: null,
        payModeType
      })
    }
  },
  /**
   * 查询房间信息
   */
  getRoomInfo(roomID, type = 'room') {
    return new Promise(resolve => {
      const {
        tenantId
      } = this.data
      getRoomInfoAPI(type, {
        ...roomID,
        ...encrypt(tenantId)
      }).then((data) => {
        resolve(data)
      })
    })
  },
  /**
   * 查询手牌信息
   */
  getLockInfo(data) {
    return new Promise(resolve => {
      const {
        tenantId
      } = this.data
      getlock1API({
        ...data,
        ...encrypt(tenantId)
      }).then((data) => {
        resolve(data)
      })
    })
  }
})
/**
 * 生成签名
 * @param {*} tenantId 
 */
function encrypt(tenantId) {
  const {
    userInfo,
    mtoken
  } = getStorageConfig()
  if (userInfo) {
    const arr = {
      tenantId,
      name: getOperator(userInfo.nickName),
      password: '123456789',
      mtoken,
      timeStamp: new Date().getTime()
    };
    var sign = md5(arr.tenantId + arr.password + arr.name + arr.timeStamp);
    return {
      ...arr,
      sign
    }
  }
}
/**
 * 提取文字中的数字
 * @param {*} str 
 */
function extractNumbers(str) {
  let matches = str.match(/\d+/g);
  return matches ? matches.map(Number)[0] : 0;
}