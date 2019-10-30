// page/userCenter/pages/sharePackage/sharePackage.js
const wxApi = require("../../../../utils/wxApi.js");
const data = require("./data.js");
const app = getApp();
const userMs = app.userMs;
const config = userMs.config;
const util = require("../../../../utils/util.js");
const UtilActions = require("../../../../class/utilActions.js");
let utilActions = new UtilActions;

Page({

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '壹手仓鲜品分享红包',
    })
    if (options.queryObj) {
      let queryObj = JSON.parse(decodeURIComponent(options.queryObj));
      
      this.setData({
        'data.activity_id': queryObj.activity_id,
        'data.creator': queryObj.creator,
        'data.order_no': queryObj.order_no,
        'data.best_envelop_key': queryObj.best_envelop_key
      })
      // 这个字段，给debug页面，判断点击的卡片，携带的数据有哪些
      wx.setStorageSync("last_package_query_obj", JSON.stringify(queryObj))
    }

    // 适配iphoneX
    this.setData({
      "state.isIphoneX": app.globalData.isIphoneX
    })
  },
  onCallHandlers:function(){
    this.onFetchPackageHandler();
    this.onFetchNewUserPackageHandler();
  },
  onFetchPackageHandler:function(){
    let _this = this;
    let url = `${config.ApiRoot}/red-envelop/sharing/get`;
    wx.showLoading({
      title: '获取红包中',
    })
    let data = {
      url,
      method:"POST",
      data:{
        order_no: this.data.data.order_no,
        activity_id: this.data.data.activity_id,
        creator: this.data.data.creator
      }
    }
    this.setData({
      "state.fetchPackageStatus": true
    })
    userMs.request(data)
    .then(res => {
      const { data, code, msg } = res.data
      this.onFetchGetPackageListHandler();
      if (code == 10000) {
        data.deadlineUtil = util.formatTimeToDay(new Date(data.deadline * 1000));
        let matchArr = this.splitIntFloat(data.amount / 100);
        data.amountInt = matchArr[1];
        data.amountFloat = matchArr[2] ? matchArr[2] : "";
        this.setData({
          "data.packageObj":data
        })
      }else{
        this.setData({
          "data.packageObjMsg":msg
        })
        this.alertHandler(msg)
      }
    })
    .catch(err => {
      console.log(err)
    })
    .finally(res=>{
      this.setData({
        "state.fetchPackageStatus":false
      })
      wx.hideLoading()
    })
  },
  onFetchNewUserPackageHandler: function () {
    let _this = this;
    let url = `${config.ApiRoot}/red-envelop/newcomer/get`;
    let data = {
      url,
    }
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          if (data.received_red_envelop) {
            this.setData({
              "state.isNewUserStatus": !data.received_red_envelop
            })
          } else {
            data.red_envelops.forEach(item => {
              item.deadlineUtil = util.formatTimeToDay(new Date(item.deadline * 1000));
              let matchArr = this.splitIntFloat(item.amount / 100);
              item.amountInt = matchArr[1];
              item.amountFloat = matchArr[2] ? matchArr[2] : "";
            })
            this.setData({
              "state.isNewUserStatus": !data.received_red_envelop,
              "data.newUserPackages": data.red_envelops
            })
          }

        }
      })
      .catch(err => {
        console.log(err)
      });

  },
  onFetchGetPackageListHandler: function () {
    let _this = this;
    let url = `${config.ApiRoot}/red-envelop/list/friends`;
    let data = {
      url,
      method: "GET",
      data: {
        from_order_no: this.data.data.order_no,
      }
    }
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          // 不用自己算最佳手气，通过页面传递best_envelop_key判断
          // let maxAmount = 0;
          // let maxAmountItem = {}
          data.forEach(item => {
            item.nickname && item.nickname.length > 5 ? (item.nickname = item.nickname.substr(0, 4) + "...") : (item.nickname)
            item.receive_time_util = util.formatTimeWithoutYear(new Date(item.receive_time*1000))
            // item.amount > maxAmount && (maxAmountItem=item) && (maxAmount=item.amount)
          })
          // maxAmountItem.isMaxStatus = true
          this.setData({
            "data.getPackageList":data
          })
        } else {
          this.alertHandler(msg)
        }
      })
      .catch(err => {
        console.log(err)
      });
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
    // 如果本地已经存在自己领取的红包了，则不再请求获取红包，只请求红包获取列表
    if (this.data.data.packageObj){
      this.onFetchGetPackageListHandler();
      return;
    }
    wxApi.getSetting().then(res => {
      if (res.authSetting["scope.userInfo"]) {
        this.setData({
          "state.needAuthorize": false,
        })
        this.onCallHandlers();
      } else {
        this.setData({
          "state.needAuthorize": true,
        })
      }
    }).catch(err => {
      console.log(err)
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    const _this = this;
    let title; // 分享标题
    let path; // 分享路径
    let queryObj = {
      order_no: this.data.data.order_no,
      creator: this.data.data.creator,
      activity_id: this.data.data.activity_id,
      best_envelop_key: this.data.data.best_envelop_key
    }
    queryObj = encodeURIComponent(JSON.stringify(queryObj))
    path = `/page/userCenter/pages/sharePackage/sharePackage?queryObj=${queryObj}`
    title = `大吉大利拼手气，第${this.data.data.best_envelop_key}个领取的人得大红包`
    console.log(queryObj)
    
    return {
      title: title, // 分享标题
      // desc: _this.data.productDetail.short_name, // 分享描述
      imageUrl: "/imgs/share-package-bg.png",
      path: path, // 分享路径
      success: function (res) {

      },
      fail: function (res) {
      }
    }
  },
  userInfoHandler: function (e) {
    let _this = this;
    if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {
      wx.navigateTo({
        url: '/page/userCenter/pages/login/login',
      })
    } else {
      //  允许授权，触发获取红包函数 && 判断是否符合新人红包
      this.setData({
        "state.needAuthorize": false,
      })
      this.onCallHandlers();

      // wx.showLoading({
      //   title: '加载中',
      // })

      // 当用户允许授权时，调用登录，保存token
      // wx.showLoading({
      //   title: '授权中...',
      // });
      // let url = `${config.ApiRoot}/auth/me`;
      // let data = {
      //   url,
      //   method: "POST"
      // };
      // userMs.request(data).then(res => {
      //   const { data, code } = res.data;
      //   if (code === 10000) {
      //   }
      // }).catch(err => {
      //   console.log(err)
      // })
      //   .finally(res => {
      //     wx.hideLoading()
      //   })

    }
  },
  onGoToIndexHandler:function(){
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  },
  alertHandler: utilActions.alertHandler,
  splitIntFloat: util.splitIntFloat
})