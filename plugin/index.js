import { downFontFace } from "./utils/font-face";
import { setStorageConfig } from "./utils/storage";

// 加载字体
downFontFace();

/**
 * config
 *  type = 1000 扫码点单
 *  type = 1011 团购核销
 */
module.exports = {
  config(options) {
    return new Promise(async (resolve, reject) => {
      const {
        mtoken,
        type = 1000,
        scene = 1000,
        userInfo = null,
        tenantId = "caba6906",
        phone = "13733174682",
      } = options;
      if (!mtoken) {
        reject("请传入mtoken");
      }
      setStorageConfig({
        mtoken,
        type,
        scene,
        userInfo,
        tenantId,
        phone,
      });
      if (type === 1000) {
        const { url } = await this.getURL(options);
        resolve({
          url,
        });
      } else if (type === 1011) {
        resolve({
          url: "plugin://yzb-plugin/evoucher",
        });
      }
    });
  },
  getURL(options) {
    const {
      id,
      scene: teaTableId,
      time = Date.now(),
    } = this.getScanCodeParams(options);
    return {
      url: `plugin://yzb-plugin/scanorder?id=${id}&teaTableId=${teaTableId}&time=${time}`,
    };
  },
  getScanCodeParams(options) {
    if (options.q) {
      const url = decodeURIComponent(options.q);
      return getRequest(url);
    } else if (options.scene) {
      return {
        id: options.id || "",
        scene: decodeURIComponent(options.scene),
        time: options.time,
      };
    }
    return options;
  },
};
