// pages/evoucher/consume/consume.js
import { getStorageKey, getStorageConfig } from "../../../utils/storage.js";
import { getSence } from "../../../utils/utils";
import { setCurrentTenant } from "../../../utils/tenant";
Page({
  data: {
    activeName: "meituan",
    mobile: "",
  },
  async onLoad(query) {
    let params = {};
    const { phone } = getStorageConfig();

    let sceneObj = wx.getLaunchOptionsSync();
    let { scene } = sceneObj;
    if (scene === 1011) {
      // 扫二维码场景
      const options = decodeURIComponent(query.q);
      const list = options.replace("hlht://", "").split(".");
      const temp = list[0].split("+");
      params = {
        tenantId: temp[0],
        roomCode: temp[1],
      };
    } else {
      const options = decodeURIComponent(query.scene);
      params = getSence(options);
    }
    const { tenantId, roomCode } = params;
    if (tenantId) {
      await setCurrentTenant(tenantId);
    }
    this.setData({
      safeArea: getStorageKey("safeArea"),
      roomCode,
    });
    this.setData({
      mobile: phone,
    });
  },
  validatePhoneNumber(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },
  onTabsChange(e) {
    const { name } = e.detail;
    console.log(e);

    this.setData({
      activeName: name,
    });
  },
});
