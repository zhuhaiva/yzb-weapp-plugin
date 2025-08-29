import {
  getStorageKey,
  setStorageKey
} from './storage'
import {
  getCurrentStoreInfo
} from "../api/tenant"

// 获取当前选中的门店
export function getCurrentTenant() {
  const tenant = getStorageKey('tenant')
  return tenant || null
}

// 设置当前选中的门店
export function setCurrentTenant(tenantId) {
  return new Promise(async (resolve, reject) => {
    if (tenantId) {
      setStorageKey('tenantId', tenantId);
      const {
        data
      } = await getCurrentStoreInfo(tenantId);
      setStorageKey('tenant', data);
      resolve()
    } else {
      const tenantId = getStorageKey('tenantId')
      if (tenantId) {
        const {
          data
        } = await getCurrentStoreInfo(tenantId);
        setStorageKey('tenant', data);
        resolve()
      } else {
        reject()
      }
    }
  })
}