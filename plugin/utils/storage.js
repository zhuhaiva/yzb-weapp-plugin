// 获取getTenantId
export const getTenantId = () => {
  return getStorageKey("tenantId");
};

export const getAppId = () => {
  return getStorageKey("appId");
};

// 保存key
export const setStorageKey = (key, value) => {
  wx.setStorageSync(key, value);
  return;
};

// 获取key
export const getStorageKey = (key) => {
  return wx.getStorageSync(key);
};

// 移除key
export const removeStorageKey = (key) => {
  wx.removeStorageSync(key);
  return;
};

// 保存外部传入的config
export const setStorageConfig = (value) => {
  if (value) {
    wx.setStorageSync('config', JSON.stringify(value));
    return true;
  }
  return false;
};

// 保存外部传入的config
export const getStorageConfig = () => {
  const config = wx.getStorageSync('config')
  if (config) {
    return JSON.parse(config);
  }
  return {};
};