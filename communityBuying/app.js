//app.js

const UserClass = require("./class/userMethods.js");
let userMs = new UserClass;
const wxApi = require("./utils/wxApi.js");
App({
  userMs,
  onLaunch: function (options) {
    if (options.referrerInfo && options.referrerInfo.extraData && options.referrerInfo.extraData.isFormMerchant){
      this.globalData.isFormMerchant = true; //判断是否从团长端跳转过来的
    }
    let that = this;
    // 使用同步接口获取用户设备信息 
    // iphone x 底部的安全区域兼容
    try {
      const res = wx.getSystemInfoSync();
      let modelmes = res.model;
      if (modelmes.search('iPhone X') != -1 || modelmes.search('iPhone XR') != -1 || modelmes.search('iPhone XS') != -1) {
        that.globalData.isIphoneX = true
      }
      // console.log(res.model)
      // console.log(res.pixelRatio)
      // console.log(res.windowWidth)
      // console.log(res.windowHeight)
      // console.log(res.language)
      // console.log(res.version)
      // console.log(res.platform)
    } catch (e) {
      // Do something when catch error
    }
    // wx.getSystemInfo({
    //   success: res => {
    //     // console.log('手机信息res'+res.model)
    //     // iphone x 底部的安全区域兼容
    //     let modelmes = res.model;
    //     if (modelmes.search('iPhone X') != -1 || modelmes.search('iPhone XR') != -1 || modelmes.search('iPhone XS') != -1) {
    //       that.globalData.isIphoneX = true
    //     }

    //   }
    // })
    
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }else{
    //       console.log("未授权")
    //     }
    //   }
    // })

    // 判断是否已经授权，
    // 获取用户资料，方便转发的时候，携带门店信息
    let _this = this;
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        userMs.onFetchUserData();
      } else {
      }
    })
    // userMs.getDefaultData();
  },
  onShow(){
    // 放在onLaunch 中，如果用户已经打开了小程序，再点卡片，则不会再触发
    // 这里想要用户拿到最新代码，只能放在onShow中操作
    this.checkUpdatehandler();
  },
  //检查是否存在新版本 && 只支持6.5.5以上版本好像
  checkUpdatehandler: function () {
    // 检测是否可以调用getUpdateManager检查更新
    if (!wx.canIUse("getUpdateManager")) return;
    let updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {      // 请求完新版本信息的回调 
      console.log("是否有新版本：" + res.hasUpdate);
      if (res.hasUpdate) {
        //如果有新版本                
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）        
        updateManager.onUpdateReady(function () {
          //当新版本下载完成，会进行回调          
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，单击确定重启小程序',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启                
                updateManager.applyUpdate();
              }
            }
          })
        })
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）        
        updateManager.onUpdateFailed(function () {
          //当新版本下载失败，会进行回调          
          wx.showModal({
            title: '提示',
            content: '检查到有新版本，但下载失败，请检查网络设置',
            showCancel: false,
          })
        })
      }
    });
  },
  globalData: {
    isIphoneX:false,//（没有默认值，直接进入某些页面会报错）
    isOrderDetailUpdata:false,//用于限制订单列表更新
    naviBackUrl:"", // 供多个页面进入同一页面，判断该返回哪个页面,
    cartItemNumber:0, // 供tabBar 页面 显示购物车数量
    onChangeLocationStatus:false, // 首页onshow 事件判断，如果重新选择了地址，则重新请求事件
    onFetchPackageStatus: false, // 首页onshow 事件判断，如果已经请求过红包列表 则该小程序生存周期都不请求
    // onGoToCompareCommunityPage:false, // 判断是否到达选择比较社区页面
    isCarUpdateStatus:false, // 判断是否在购物车列表有更新操作
  }
})