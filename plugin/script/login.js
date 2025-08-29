import base64 from '../utils/base64.min.js';
/**检查登录态 */
function checkSession() {
  return new Promise(function (reslove) {
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        console.warn('session未过期');
        getApp().globalData.isLogin = true;
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo.length > 0) {
          getApp().globalData.userInfo = JSON.parse(userInfo);
        };
        //检查服务器token是否过期
        const mtoken = wx.getStorageSync('mtoken');
        if (mtoken == null || mtoken == "") {
          console.warn('token丢失，发起重新登录')
          getApp().globalData.isLogin = false;
          reslove({
            type: 'error'
          });
        } else {
          console.warn('检查token是否已经失效')
          wx.request({
            url: `${getApp().basePath}/littleapp/v2/tokenexpire.do?mtoken=${mtoken}`,
            success: res => {
              console.warn(res.data.type == "error" ? 'token已经失效' : 'token未失效');
              getApp().globalData.isLogin = res.data.type == 'success';
              reslove(res.data);
            }
          });
        }
      },
      fail() {
        //session_key 已经失效，需要重新执行登录流程
        console.warn('session已过期');
        reslove({
          type: 'error'
        });
      }
    });
  })
}

/**跳转到登录页面 */
function getLoginPage(type) {
  const app = getApp();
  if (app.globalData.atLoginPage) {
    return;
  }
  var query = app.query,
    parme = "";
  for (var key in query) {
    parme += `${key}=${query[key]}&`;
  };
  var CurrentPage = `${app.path}?${parme.substring(0,parme.length-1)}`;
  if (CurrentPage != "pages/scanCode/scanIndex/scanIndex") {
    wx.setStorage({
      data: CurrentPage,
      key: 'LoginUrl',
      success() {
        console.warn('进入登录页面');
        if (type != null) {
          wx.navigateTo({
            url: "/pages/homePage/login/login"
          });
        } else {
          wx.reLaunch({
            url: "/pages/homePage/login/login"
          });
        }
        app.globalData.atLoginPage = true;
      }
    });
  }
};

/**检查是否绑定了手机号 */
function checkBindMolile() {
  const app = getApp();
  return new Promise(function (reslove) {
    app.pulicAjax({
      url: "checkbindmobile.do",
      cellback: function (res) {
        reslove(res);
      }
    });
  });
};

/**绑定手机号 */
function bindPhoneNumber(data) {
  /**绑定手机号 */
  const app = getApp();
  return new Promise(function (reslove, reject) {
    app.pulicAjax({
      url: 'decodeuserinfo.do',
      isToken: true,
      data: {
        encryptedData: data.detail.encryptedData,
        iv: data.detail.iv
      },
      cellback: function (res) {
        /**获取手机号码绑定 */
        app.pulicAjax({
          url: 'bindmobile.do',
          method: 'POST',
          isToken: true,
          data: {
            mobile: res.purePhoneNumber
          },
          cellback: data => {
            reslove(data);
          }
        });
      }
    });
  });
}

/**获取用户信息 */
function getUserProfile(info, callback) {
  if (info) {
    callback({
      userInfo: info
    });
    getApp().globalData.userInfo = info;
    wx.setStorageSync('userInfo',JSON.stringify(info));
  } else {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const $userInfo = JSON.parse(userInfo)
      callback({
        userInfo: $userInfo
      });
      getApp().globalData.userInfo = $userInfo;
    } else {
      callback(false);
    }
  }
}

/* 发起登录 */
function getLogin(userInfo) {
  console.log(userInfo)
  const app = getApp();
  return new Promise(function (reslove, reject) {
    getUserProfile(userInfo, datas => {
      if (!datas) {
        reject('请先获取用户信息');
        return
      }
      wx.login({
        success: function (loginRes) {
          if (loginRes.code) {
            app.pulicAjax({
              url: 'login.do',
              isMtoken: false,
              data: {
                code: loginRes.code,
                userInfo_Str: encodeURIComponent(base64.make_b64().encode(base64.utf16to8(JSON.stringify(datas.userInfo))))
              },
              cellback: res => {
                if (res.type == "success") {
                  //保存token   
                  wx.setStorageSync('mtoken', res.content);
                  app.globalData.isLogin = true;
                  /**检查是否绑定了手机号 */
                  checkBindMolile().then((checkRes) => {
                    reslove(checkRes);
                  })
                } else {
                  reject();
                }
              },
              fail() {
                reject();
              }
            });
          };
        }
      });
    });
  });
};

module.exports = {
  checkSession,
  getLoginPage,
  getLogin,
  bindPhoneNumber
};