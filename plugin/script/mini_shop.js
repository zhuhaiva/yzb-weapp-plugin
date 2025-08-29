import util from '../utils/util';
import api from 'api';
import base64 from '../utils/base64.min'
var app = getApp(); // 引入app.js里初始化数据
const mini_shop = {
  token: "",
  getToken() {
    /**获取Token */
    return new Promise((resolve) => {
      let _user = wx.getStorageSync('mini_shop_user');
      if (_user != "") {
        _user = JSON.parse(_user);
        if (Date.now() - 10000 <= _user.overtime) {
          this.token = _user.key;
          resolve();
        }else{
          this.resetToken().then(res => {
            this.token = res;
            resolve();
          });
        }        
      } else {
        this.resetToken().then(res => {
          this.token = res;
          resolve();
        });
      };
    })
  },
  resetToken() {
    let user = {};
    return new Promise((resolve, reject) => {
      const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx62b988a123a81254&secret=39e2c713d81b22c510fa8d117f73638c';
      wx.request({
        url: `${api.basePath}/wxopen/wxpublic2/redirect/get.do?requestUrl=${base64.make_b64().encode(url)}`,
        success(res) {
          user = {
            key: res.data.access_token,
            overtime: Date.now() + res.data.expires_in * 1000
          };
          wx.setStorageSync('mini_shop_user', JSON.stringify(user));
          resolve(user.key);
        },
        fail(res) {
          reject(res);
        }
      })
    })
  },
  async request(url, options) {
    var settings = {
      method: 'get',
      needLogin: true,
      data: {},
      loading: true,
      loadText: "加载中",
      complete: () => {}
    }
    util.extend(settings, options) //将options参数合并到data中 
    if (settings.contentType == null) {
      settings.contentType = settings.method == 'get' ? 'application/json' : 'application/x-www-form-urlencoded';
    }
    if (settings.needLogin) {
      await this.getToken();
      if (url.indexOf('?') >= 0) {
        url += `&access_token=${this.token}`
      } else {
        url += `?access_token=${this.token}`
      }
    }
    wx.showLoading({
      title: settings.loadText,
    });
    const _url = `${api.basePath}/wxopen/wxpublic2/redirect/${settings.method}.do?requestUrl=${base64.make_b64().encode(url)}`;
    return new Promise((resolve, reject) => {
      wx.request({
        url: _url,
        method: settings.method,
        data: settings.data,
        header: {
          'Content-Type': settings.contentType
        },
        complete: function () {
          if (settings.loading) {
            wx.hideLoading();
          };
          settings.complete();
        },
        success: (res) => {
          resolve(res);
        },
        fail: (res) => {
          reject(res);
        }
      })
    })
  }
}


module.exports = mini_shop;