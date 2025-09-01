import { make_b64, utf8to16 } from "../utils/base64.min";
import env from "./env";
import { getStorageConfig } from "../utils/storage";
const baseURL =
  env == "develop" || env == "trial"
    ? "https://www.dzbsaas.cn/footmassage"
    : "https://littleapp.dzbsaas.cn/footmassage";
async function service(options) {
  return new Promise((resolve, reject) => {
    const { mtoken, tenantId } = getStorageConfig();

    let config = {
      bussinessType: "baseURL",
      method: "get",
      header: {
        ...options.header,
      },
      loading: true,
      complete() {
        wx.hideLoading();
      },
      // respone 成功
      success: (res) => {
        if (res.statusCode != 200) {
          wx.showModal({
            title: "警告",
            content:
              res.data.data ||
              res.data.message ||
              `小程序接口出错，错误代码${res.statusCode}`,
          });
          return;
        }
        try {
          if (res.data.type == "error") {
            if (res.data.content == "token无效") {
              // 登录态无效
            }
          }
        } catch {}
        if (config.bussinessType === "baseURL" || config.useData === "use") {
          resolve(res.data);
        }
        {
          resolve(res.data.data);
        }
      },
      // respone 失败
      error: (res) => {
        if (config.bussinessType !== "baseURL") {
          wx.showModal({
            title: "请求提醒",
            content: JSON.stringify(res),
          });
        } else {
          wx.showModal({
            title: "请求提醒",
            content: res.data || `未知错误，错误代码${res.status}`,
          });
        }
        reject(res);
      },
    };

    Object.assign(config, options);
    if (config.loading) {
      wx.showLoading({
        title: "正在加载",
      });
    }
    if (config.method.toLowerCase() == "get" && config.data) {
      let arr = [];
      if (typeof config.data === "object") {
        for (var key in config.data) {
          arr.push(`${key}=${config.data[key]}`);
        }
        if (arr.length > 0) {
          config.url = splicingURL(config.url, arr.join("&"));
        }
      } else if (typeof config.data === "string") {
        config.url = splicingURL(config.url, config.data);
      }
      config.data = {};
    }

    // 给接口加上token
    if (mtoken) {
      config.url = splicingURL(config.url, `mtoken=${mtoken}`);
    }

    if (tenantId) {
      config.url = splicingURL(config.url, `tenantId=${tenantId}`);
    }

    if (config.bussinessType !== "baseURL") {
      config.url = returnRedirectUrl(config);
    } else {
      config.url = `${baseURL}/${config.url}`;
    }
    wx.request(config);
  });
}

// 拼接URL
function splicingURL(url, params) {
  const icon = url.indexOf("?") < 0 ? "?" : "&";
  return `${url}${icon}${params}`;
}

// 返回转发地址
export function returnRedirectUrl(config) {
  const settings = {
    url: "",
    method: "get",
    bussinessType: "",
    ...config,
  };

  if (env === "develop") {
    return `https://www.dzbsaas.cn/openapi2/${settings.url}`;
  }
  return `https://www.dzbsaas.com/footmassage/openapi/redirectOpen/redirect/${settings.method.toLowerCase()}.do?requestUrl=${make_b64().encode(
    utf8to16(settings.url)
  )}`;
}

export default service;
