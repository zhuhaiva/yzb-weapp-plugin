// pages/evoucher/consume/components/meituan/meituan.js
import {
  getTuangouInfo,
  queryMeituanProductByMobile,
  verifyMeituan,
} from "../../../../../api/tuangou";
Component({
  properties: {
    mobile: {
      type: String,
      value: "",
    },
    roomCode: {
      type: String,
      value: "",
    },
  },
  data: {
    code: "",
    tuangouList: [],
    imageSrc:
      "https://dzb.dzbsaas.com/upload/image/20250417/bfb9993f-142c-4ba3-b221-bf2957ccaf43-source.png",
  },
  observers: {
    mobile: function (val) {
      if (val) {
        this.getTuangouInfoHandler(val);
      }
    },
  },
  methods: {
    // 查询券码
    onSubmit() {
      const { code } = this.data;
      if (!code) {
        wx.showToast({
          icon: "none",
          title: "请输入券码",
        });
        return;
      }
      // 券码，直接查询并核销
      this.onConsume({
        currentTarget: {
          dataset: {
            code,
          },
        },
      });
    },

    getTuangouInfoHandler(mobile) {
      getTuangouInfo({}).then((res) => {
        const { boundMeituanTuangouSets } = res;
        const list = [];
        boundMeituanTuangouSets.forEach((item, index) => {
          this.queryMeituanProductByMobileHandler(item, mobile).then(
            (evoucher) => {
              list.push({
                ...item,
                evoucher,
              });
              if (boundMeituanTuangouSets.length - 1 >= index) {
                this.setData({
                  tuangouList: list.filter((item) => item.evoucher.length > 0),
                });
              }
            }
          );
        });
      });
    },
    queryMeituanProductByMobileHandler(item, mobile) {
      return new Promise((resolve) => {
        const { dealGroupId, dealId } = item;
        queryMeituanProductByMobile({
          mobile,
          dealGroupId,
          dealId,
        }).then((res) => {
          resolve(
            res.map((item) => {
              return {
                code: item.serialNumber,
                codeText: item.serialNumber.replace(/(.{4})(?=.)/g, "$1 "),
              };
            })
          );
        });
      });
    },
    onConsume(e) {
      const { code } = e.currentTarget.dataset;
      wx.showModal({
        title: "自助核销",
        content: `是否确认核销券号【${code}】的美团券？`,
        complete: (res) => {
          if (res.confirm) {
            this.verifyMeituanHandler(code);
          }
        },
      });
    },
    verifyMeituanHandler(code) {
      const { mobile, roomCode } = this.data;
      verifyMeituan({
        code,
        phone: mobile,
        count: 1,
        roomCode,
      }).then((res) => {
        console.log(res);
        if (res.message === "成功") {
          const { tuangouList } = this.data;
          const list = tuangouList
            .map((item) => {
              item.evoucher = item.evoucher.filter((v) => {
                return v.code !== code;
              });
              return item;
            })
            .filter((item) => item.evoucher.length > 0);
          this.setData({
            tuangouList: list,
            code: "",
          });
        }
        wx.showToast({
          icon: "none",
          title: res.message === "成功" ? "团购券核销成功" : "团购券核销失败",
        });
      });
    },
    onScanCode() {
      wx.scanCode({
        success: (res) => {
          if (res.result) {
            this.setData({
              code: res.result,
            });
            this.onSearch();
          }
        },
      });
    },
  },
});
