// page/userCenter/pages/closeShop/closeShop.js

const data = require("./data.js");
//获取应用实例
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
    wx.setNavigationBarTitle({
      title: '退出合作申请',
    })
    this.onFetchUserData();
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
  
  // }
  onSubmitHandler:function(){

  },
  onInputReasonHandler:function(e){
    if (e.detail.value.length <= 200){
      this.setData({
        "state.canSubmitStatus": true
      })
    }else{
      this.setData({
        "state.canSubmitStatus": false
      })
    }
    this.setData({
      "state.reason": e.detail.value
    })
  },
  onFetchUserData: function () {
    let _this = this;
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

            _this.setData({
              "data.userInfo": data,
            });
          } else {
            let canSeedPhone = data.mobile.substr(0, 3) + '****' + data.mobile.substr(7);
            data.canSeedPhone = canSeedPhone;
            _this.setData({
              "data.userInfo": data,
            });
            return;
          }
        }
      } else {
        throw res;
      }
    })
      .catch(
        err => {
          console.log(err)
        }
      ).finally(() => wx.hideLoading());
  },
})