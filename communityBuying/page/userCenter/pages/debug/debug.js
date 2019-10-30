// page/userCenter/pages/debug/debug.js
const data = require("./data.js");
const storageHandler = require("../../../../utils/localStorage.js");
const env = require("../../../../config/env.js");
const envConstant = require("../../../../config/constant.js");
// const appName = envConstant.ONLINE;  // 正式环境
// const appName = envConstant.TEST;  // 测试环境
// const appName = envConstant.DEV;  // 开发环境
// const appName = envConstant.LOCAL_NETWORK //本地环境
// const envConfig = env.getEnv(appName);
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

Page({

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.getStorageInfo({
      success(res) {
        let arr = []
        res.keys.forEach((item,index)=>{
          let obj={};
          obj.key = item;
          obj.value = wx.getStorageSync(item);
          arr[index] = obj;
        })
        _this.setData({
          "data.arr": arr
        })
        // console.log(res.keys)
        // console.log(res.currentSize)
        // console.log(res.limitSize)
      }
    })
    this.setData({
      "state.envType": config.isDEV?"TEST":"ONLINE"
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  onSelectEnvTypeHandler:function(e){
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;
    if(type == this.data.state.envType) return;
    this.setData({
      "state.envType":type
    })
  },
  onClearStorageHandler:function(){
    wx.clearStorageSync();
    userMs.state.token = ""
    // 清掉本地缓存
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  },
  onSureChangeEnvHandler:function(){
    let type = this.data.state.envType;
    const appName = envConstant[type] //本地环境
    const envConfig = env.getEnv(appName);
    wx.clearStorageSync();
    userMs.state.token = ""
    config.ApiRoot = envConfig.ApiRoot;
    config.isDEV = envConfig.isDEV;
    config.preFix = envConfig.preFix;
    // userMs.config = {
    //   ...config,
    //   ApiRoot: envConfig.ApiRoot,
    //   isDEV: envConfig.isDEV,
    //   preFix: envConfig.preFix
    // }
    // console.log(userMs)
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  }
})