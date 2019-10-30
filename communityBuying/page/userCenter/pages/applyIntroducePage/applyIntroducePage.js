// page/userCenter/pages/applyIntroducePage/applyIntroducePage.js

const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:{},
    state:{

    },
    others:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '成为壹手仓鲜品店主',
    })
    this.setData({
      "state.isIphoneX": app.globalData.isIphoneX
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

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },
  onGoToApplyPageHandler:function(){
    wx.navigateTo({
      url: '../applyPage/applyPage',
    })
  },
  userInfoHandler: function (e) {
    let _this = this;
    if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {
      wx.navigateTo({
        url: '/page/userCenter/pages/login/login',
      })
    } else {
      wx.showLoading({
        title: '加载中',
      })

      // 当用户允许授权时，调用登录，保存token
      wx.showLoading({
        title: '授权中...',
      });
      let url = `${config.ApiRoot}/auth/me`;
      let data = {
        url,
        method: "POST"
      };
      userMs.request(data).then(res => {
        const { data, code } = res.data;
        if (code === 10000) {

          if (data) {
            if (!data.mobile) {
              wx.navigateTo({
                url: '/page/userCenter/pages/login/login',
              })

            } else {
              wx.navigateTo({
                url: '../applyPage/applyPage',
              })
            }
          }
        }
      }).catch(err => {
        console.log(err)
      })
        .finally(res => {
          wx.hideLoading()
        })

    }
  },
})