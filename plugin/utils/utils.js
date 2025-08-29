import {
  setStorageKey,
  getStorageKey
} from "./storage.js";

// 计算小程序安全距离
export function getCustomNavStyle() {
  wx.getSystemInfo({
    success: (res) => {
      const isAndroid = res.platform === "android";
      const isDevtools = res.platform === "devtools";
      // 导航栏高度
      let navTextHeight = 44;
      // 导航顶部安全距离
      let safeAreaTop = res.statusBarHeight;
      // 单位px
      setStorageKey("safeArea", {
        safeAreaTop: safeAreaTop,
        navTextHeight: navTextHeight,
        // 导航栏总高度
        navTotalHeight: safeAreaTop + navTextHeight,
        // tabbar的高度
        tabbarHeight: 60,
        // 底部安全距离
        safeAreaBottom: res.screenHeight - res.safeArea.bottom,
        // tabbar总高度
        tabbarTotalHeight: 60 + res.screenHeight - res.safeArea.bottom,
        // 页面整体的高度(计算tabbar和safeBottom)
        screenHeight: res.screenHeight,
        //
      });
    },
  });
}

// 时间格式化
export function formatTime(input, format) {
  let date
  if (input instanceof Date && !isNaN(input.getTime())) {
    date = input;
  } else if (typeof input === 'number' && !isNaN(input)) {
    date = new Date(input);
  } else {
    return "Invalid Date";
  }

  const padZero = (num, len = 2) => num.toString().padStart(len, '0');

  const replacements = {
    'YYYY': date.getFullYear(),
    'MM': padZero(date.getMonth() + 1),
    'DD': padZero(date.getDate()),
    'HH': padZero(date.getHours()),
    'mm': padZero(date.getMinutes()),
    'ss': padZero(date.getSeconds())
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => replacements[match]);
}

function Rad(d) {
  return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
}

//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
export function GetDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000; //输出为公里
  //s=s.toFixed(4);
  return s;
}

// 序列化url参数
export function getRequest(url) {
  //获取URL地址参数
  const theRequest = new Object();
  if (url.indexOf("?") != -1) {
    const str = url.substr(url.indexOf("?") + 1);
    const strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  return theRequest;
}

export function getSence(url) {
  //获取URL地址参数
  const theRequest = new Object();
  const strs = url.split("&");
  for (var i = 0; i < strs.length; i++) {
    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
  }
  return theRequest;
}