//格式化时间
function formatTime(date, format) {
  var date = new Date(date);
  if (format == null) {
    format = "yyyy-MM-dd hh:mm:ss";
  }
  /*
   * eg:format="yyyy-MM-dd hh:mm:ss";
   */
  var o = {
    "M+": date.getMonth() + 1, // month
    "d+": date.getDate(), // day
    "h+": date.getHours(), // hour
    "m+": date.getMinutes(), // minute
    "s+": date.getSeconds(), // second
    "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
    "S+": date.getMilliseconds()
    // millisecond
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 -
      RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      var formatStr = "";
      for (var i = 1; i <= RegExp.$1.length; i++) {
        formatStr += "0";
      }

      var replaceStr = "";
      if (RegExp.$1.length == 1) {
        replaceStr = o[k];
      } else {
        formatStr = formatStr + o[k];
        var index = ("" + o[k]).length;
        formatStr = formatStr.substr(index);
        replaceStr = formatStr;
      }
      format = format.replace(RegExp.$1, replaceStr);
    }
  }
  return format;
};

//一位数字前补0
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
};

//等同于$.exteng()方法
function extend(data, data2) {
  /*
   *target被扩展的对象
   *length参数的数量
   *deep是否深度操作
   */
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // target为第一个参数，如果第一个参数是Boolean类型的值，则把target赋值给deep
  // deep表示是否进行深层面的复制，当为true时，进行深度复制，否则只进行第一层扩展
  // 然后把第二个参数赋值给target
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};

    // 将i赋值为2，跳过前两个参数
    i = 2;
  }

  // target既不是对象也不是函数则把target设置为空对象。
  if (typeof target !== "object" && !jQuery.isFunction(target)) {
    target = {};
  }

  // 如果只有一个参数，则把jQuery对象赋值给target，即扩展到jQuery对象上
  if (length === i) {
    target = this;

    // i减1，指向被扩展对象
    --i;
  }

  // 开始遍历需要被扩展到target上的参数

  for (; i < length; i++) {
    // 处理第i个被扩展的对象，即除去deep和target之外的对象
    if ((options = arguments[i]) != null) {
      // 遍历第i个对象的所有可遍历的属性
      for (name in options) {
        // 根据被扩展对象的键获得目标对象相应值，并赋值给src
        src = target[name];
        // 得到被扩展对象的值
        copy = options[name];

        // 这里为什么是比较target和copy？不应该是比较src和copy吗？
        if (target === copy) {
          continue;
        }

        // 当用户想要深度操作时，递归合并
        // copy是纯对象或者是数组
        if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
          // 如果是数组
          if (copyIsArray) {
            // 将copyIsArray重新设置为false，为下次遍历做准备。
            copyIsArray = false;
            // 判断被扩展的对象中src是不是数组
            clone = src && jQuery.isArray(src) ? src : [];
          } else {
            // 判断被扩展的对象中src是不是纯对象
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          // 递归调用extend方法，继续进行深度遍历
          target[name] = jQuery.extend(deep, clone, copy);

          // 如果不需要深度复制，则直接把copy（第i个被扩展对象中被遍历的那个键的值）
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  // 原对象被改变，因此如果不想改变原对象，target可传入{}
  return target;
};

//判断是否为JSON
function isJSON(obj) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    if (typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length) {
      return true;
    } else {
      return false;
    }
  }
  // var isjson = 
  // return isjson;
};

//获取当前选中门店信息
function getCurrentStore() {
  const store = wx.getStorageSync('store');
  return store != null && store != "" ? JSON.parse(store) : false;
}

// 序列化url参数
function getRequest(url) {
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

// 订阅技师推送消息
async function subsciprt_msg(options) {
  const empl_push_template_Id = 'P2SL-Pj4WE2peSsvbgtDW3bAxuii56l_ZbiwT_sE758'
  // const empl_push_template_Id = 'SeGvfosIOPo_3dMgchVHfMhA8BYJ9GrGVEM70c5vRaM'
  const status_arr = ['accept', 'acceptWithForcePush', 'acceptWithAlert']
  const {
    showModal = false,
      silent = false
  } = options
  return new Promise((resovle) => {
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        const {
          subscriptionsSetting
        } = res
        if (silent && !subscriptionsSetting[empl_push_template_Id]) {
          resovle(false)
          return
        }
        wx.requestSubscribeMessage({
          tmplIds: [empl_push_template_Id],
          success: res => {
            console.log(res)
            const templateStatus = res[empl_push_template_Id]
            const status = status_arr.some(item => item === templateStatus)
            if (showModal) {
              if (status) {
                wx.showToast({
                  title: '订阅成功',
                  icon: 'success'
                })
              } else {
                wx.showModal({
                  content: "订阅失败，原因:用户选择不接收，如有需要请点击右上角菜单->设置->订阅消息开启通知，并设置接受并提醒"
                })
              }
            }
            resovle(status)
          },
          fail: res => {
            const errorInfo = {
              10001: "参数传空了",
              10002: "网络问题，请求消息列表失败",
              10003: "网络问题，订阅请求发送失败",
              10004: "参数类型错误",
              20004: "用户关闭了主开关，无法进行订阅",
            }
            if (showModal) {
              wx.showModal({
                content: errorInfo[res.errCode] || res.errMsg
              })
            }
            resovle(false)
          }
        })
      }
    })

  })
}

// 获取头像数据 - 会员成长体系
function getHeadimg(val) {
  var index = val.phone.substr(-1);
  return (
    "https://www.dzbsaas.com/footmassage/static/assets/images/userheadimg/" +
    (val.sex || "male") +
    index +
    ".png"
  );
}

// 计算年龄 - 会员成长体系
function getAge(val) {
  if (val != null) {
    var birth = new Date(val).getTime();
    var now = Date.now();
    var age = parseInt((now - birth) / (1000 * 60 * 60 * 24 * 30 * 12));
    return age + "岁";
  } else {
    return "--";
  }
}

// 隐藏手机中间四位
function hidePhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

// 判断今天是否生日
function isBirthday(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);

  // 获取当前日期的月份和日期
  const todayMonth = today.getMonth() + 1; // getMonth() 返回 0-11，需要加 1
  const todayDate = today.getDate();

  // 获取出生日期的月份和日期
  const birthMonth = birth.getMonth() + 1; // getMonth() 返回 0-11，需要加 1
  const birthDate = birth.getDate();

  // 比较月份和日期
  return todayMonth === birthMonth && todayDate === birthDate;
}
/**
 * 验证身份证是否正确 -- 示例用法
 * const id = "11010519491231002X";
 * console.log(isValidChineseID(id));  // 输出 true 或 false
 * @param {*} id 
 */
function isValidChineseID(id) {
  // 检查长度和基本格式（18位）
  const pattern = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{3}(\d|X)$/;
  if (!pattern.test(id)) {
    return false;
  }

  // 检查校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  const idArray = id.split('');

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idArray[i], 10) * weights[i];
  }

  const checkCode = checkCodes[sum % 11];
  return checkCode === idArray[17];
}

function stringToArrayBuffer(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  const array = new Uint8Array(bytes);
  return array.buffer;
}

//切割整数和小数
function splitDecimal(num) {
  if (!num) {
    return {
      integer: 0,
      decimal: 0
    }
  }
  const [integerPart, decimalPart = ""] = num.toString().split(".");
  return {
    integer: integerPart,
    decimal: decimalPart.slice(0, 2).padEnd(2, "0") // 保证有两位小数
  };
}

/**
   * 前往结果反馈页面
   * @param {*} code 
   */
  function geterrMsgPage(code, back = false) {
    if (back) {
      wx.navigateTo({
        url: `plugin://yzb-plugin/errMsg?code=${code}`,
      })
    } else {
      wx.redirectTo({
        url: `plugin://yzb-plugin/errMsg?code=${code}`,
      })
    }
  }

module.exports = {
  geterrMsgPage,
  stringToArrayBuffer,
  subsciprt_msg: subsciprt_msg,
  formatTime: formatTime,
  formatNumber: formatNumber,
  extend: extend,
  isJSON: isJSON,
  getCurrentStore: getCurrentStore,
  getRequest,
  getHeadimg,
  getAge,
  hidePhone,
  isBirthday,
  isValidChineseID,
  splitDecimal
}