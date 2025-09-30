# yzb-plugin 使用说明

## 引入插件

```js
var plugin = requirePlugin("yzb-plugin");
const { miniProgram } = wx.getAccountInfoSync();
```

## 基础调用

```js
plugin
  .config({
    ...options,
    appId: miniProgram.appId,   // 当前小程序 appId，必传
    type: 1000,                 // 入口类型（详见下方说明）
    wxscene: getApp().scene,    // 小程序场景值
    mtoken: "必填",             // 授权 token，必传
    tenantId: "必填",           // 租户/商户 ID，必传
    userInfo: {                 // 用户信息（可选）
      nickName: "develop"
    },
    phone: "用户手机号"        // 用户手机号（可选）
  })
  .then(({ url }) => {
    wx.redirectTo({ url });     // 成功后跳转插件页面
  })
  .catch(err => {
    console.error("插件调用失败", err);
  });
```

## 参数说明

| 参数名        | 类型     | 是否必填 | 说明                              |
| ---------- | ------ | ---- | ------------------------------- |
| `appId`    | String | ✅ 是  | 当前小程序 appId                     |
| `type`     | Number | ✅ 是  | 入口类型（见下方说明）                     |
| `wxscene`  | String | ❌ 否  | 小程序场景值，可通过 `getApp().scene` 获取  |
| `mtoken`   | String | ✅ 是  | 鉴权 token                        |
| `tenantId` | String | ✅ 是  | 租户/商户 ID                        |
| `userInfo` | Object | ❌ 否  | 用户基本信息，例如 `{ nickName: "xxx" }` |
| `phone`    | String | ❌ 否  | 用户手机号                           |

## type 取值说明

* **1000** → 进入 **茶几码页面**
* **1011** → 进入 **核销页面（美团 / 抖音）**

## 返回结果

* **成功**：返回 `{ url }`，需使用 `wx.redirectTo({ url })` 跳转
* **失败**：返回错误信息，可通过 `catch` 捕获

## 使用示例

### 进入茶几码页面

```js
plugin
  .config({
    appId: miniProgram.appId,
    type: 1000,
    wxscene: getApp().scene,
    mtoken: "204b2101-e7a0-4b08-9c54-7aa1ebd181a1",
    tenantId: "caba6906",
    userInfo: { nickName: "tester" },
    phone: "13700000000"
  })
  .then(({ url }) => {
    wx.redirectTo({ url });
  });
```

### 进入核销页面

```js
plugin
  .config({
    appId: miniProgram.appId,
    type: 1011,
    wxscene: getApp().scene,
    mtoken: "204b2101-e7a0-4b08-9c54-7aa1ebd181a1",
    tenantId: "caba6906",
    userInfo: { nickName: "tester" },
    phone: "13700000000"
  })
  .then(({ url }) => {
    wx.redirectTo({ url });
  });
```
