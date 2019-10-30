const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

const getStorage = (key) => {
  return wx.getStorageSync(config.preFix+key)
}
const setStorage = (key,value) => {
  wx.setStorageSync(config.preFix + key, value)
}
const removeStorage = (key) => {
  wx.removeStorageSync(config.preFix + key);
}
module.exports = {
  getStorage: getStorage,
  setStorage: setStorage,
  removeStorage: removeStorage
}