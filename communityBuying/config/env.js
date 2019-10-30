const constant = require("./constant.js");

const config = {};

// 开发
config[constant.DEV] = {
  // WX_AppID: "wx19a7f9c1d0871dfb",
  AppId: "wx74f3ba6532341e72",
  ApiRoot: "http://api.bir.com/xp",
  qiniuDomain: "https://static.newkr.net/",
  isDEV: true,
  preFix:'dev_'
};
// 测试
config[constant.TEST] = {
  // WX_AppID: "wx74f3ba6532341e72",
  AppId: "wx74f3ba6532341e72",
  ApiRoot: "https://api.newkr.net/xp",
  qiniuDomain: "https://static.newkr.net/",
  isDEV: true,
  preFix: 'dev_'
};
// ONLINE
config[constant.ONLINE] = {
  WX_AppID: "wx19a7f9c1d0871dfb",
  AppId: "wx74f3ba6532341e72",
  ApiRoot: "https://api.ysc.newkr.net/xp",
  qiniuDomain: "https://static.newkr.net/",
  isDEV: false,
  preFix: 'pro_'
};
// 小夹层
// config[constant.MEZZANINE] = {
//   WX_AppID: "wx792c994dd0d8862c",
//   AppId: "59e9c06f9a658301105ce4b1",
//   ApiRoot: "https://weapp.xiyanghui.com",
//   isDEV: false
// };

// 京东
// config[constant.JD] = {
//   WX_AppID: "wxab02a4fe37888961",
//   AppId: "5a03dca6ca2055358a750d31",
//   ApiRoot: "https://jd.weapp.xiyanghui.com",
//   isDEV: false
// };

// 本地环境
config[constant.LOCAL_NETWORK] = {
  // WX_AppID: "wx19a7f9c1d0871dfb",
  AppId: "wx74f3ba6532341e72",
  ApiRoot: "http://api.bir.com/xp",
  qiniuDomain: "https://static.newkr.net/",
  isDEV: true,
  preFix: 'dev_'
};

function getEnv(label) {
  const result = config[label];
  if (result) {
    return result;
  } else {
    throw new ReferenceError(`${label} config not found`);
  }
}

module.exports = {
  getEnv,
  // config
};