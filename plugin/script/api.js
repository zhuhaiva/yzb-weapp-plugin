import env from './env'
const url = env === "develop" || env === "trial" ? 'www.dzbsaas.cn/footmassage' : 'littleapp.dzbsaas.cn/footmassage';
const oss = env == "develop" ? 'https' : 'https';
const baseUrl = {
  rootURL: `${oss}://${url}/littleapp/v2/`,
  basePath: `${oss}://${url}`,
  WebViewURL: `${oss}://${url}/littleapp/`,
  websocketUrl: `wss://littleapp.dzbsaas.cn/footmassage/online`
}
console.log(`当前环境为${env},${oss},${baseUrl}`);
module.exports = baseUrl;