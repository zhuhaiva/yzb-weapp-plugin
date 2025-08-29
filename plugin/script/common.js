/**
 * 请求封装
 */
import util from '../utils/util.js';
import api from 'api.js';
import login from 'login.js';

async function request(options) {
  const app = getApp();
  const settings = {
    url: '',
    method: 'GET',
    data: {},
    header: {
      'Content-Type': options.method == 'GET' || options.method == null ? 'application/json' : 'application/x-www-form-urlencoded'
    },
    loading: true,
    loadText: "加载中",
    isRootUrl: true,
    isMtoken: true,
    autoAddRootUrl: true,
    complete: function () {},
    cellback: function () {},
    fail: function () {}
  };
  Object.assign(settings, options); //将options参数合并到data中     
  let _url = settings.autoAddRootUrl ? (settings.isRootUrl ? api.rootURL : api.WebViewURL) + settings.url : settings.url;
  if (settings.isMtoken) {
    const mtoken = wx.getStorageSync('mtoken');
    if (mtoken == null || mtoken == "") {
      console.warn('token丢失，发起重新登录')
      login.getLoginPage();
      return;
    }
    if (util.isJSON(settings['data'])) {
      util.extend(settings['data'], {
        mtoken: mtoken
      });
    } else {
      if (settings.method == 'POST') {
        settings['data'] += `&mtoken=${mtoken}`;
      } else {
        _url += `?${settings['data']}&mtoken=${mtoken}`;
        settings['data'] = {};
      }
    };
  }
  return new Promise(function (reslove, reject) {
    if (settings.loading) {
      wx.showLoading({
        title: settings.loadText,
      });
    };
    wx.request({
      url: _url,
      method: settings.method,
      complete: function () {
        if (settings.loading) {
          wx.hideLoading();
        };
        settings.complete();
      },
      header: settings.header,
      data: settings.data,
      success: function (res) {
        if (res.statusCode != 200) {
          if (res.data.message != '' || res.data.message != null) {
            wx.showModal({
              title: '警告',
              content: res.data.message,
            });
          } else {
            wx.showModal({
              title: '警告',
              content: `小程序接口出错，错误代码${res.statusCode}`,
            });
          }
        }
        try {
          if (res.data.type == "error") {
            if (res.data.content == "token无效") {
              app.wxlogin();
            }
          }
        } catch {}
        reslove(res.data);
        settings.cellback(res.data);
      },
      fail: function (res) {
        wx.showModal({
          title: '请求提醒',
          content: JSON.stringify(res),
        });
        reject(res);
        console.log(_url);
        settings.fail(res);
      }
    });
  })
}

function getToken() {
  const mtoken = wx.getStorageSync('mtoken');
  return mtoken;
}
module.exports = {
  request,
  getToken
}