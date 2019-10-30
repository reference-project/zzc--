// page/userCenter/pages/withdrawPage/withdrawPage.js
const data = require("./data.js");
let util = require("../../../../utils/util.js");
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const wxApi = require("../../../../utils/wxApi.js");
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
      title: '提现',
    });
    this.fetchMoney();
    this.fetchWithdrawHistory();
  },
  fetchMoney: function () {
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    const url = `${config.ApiRoot}/sales/balance`;
    userMs.request({
      url,
      method: 'GET',
    })
      .then(res => {
        const { code, data } = res.data;
        console.log(res.data)
        if (code === 10000) {
          data.balance = (data.balance/100).toFixed(2);
          _this.setData({
            "data.balance":data
          })
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        // wx.hideNavigationBarLoading();
        // wx.stopPullDownRefresh();
      });
  },
  fetchWithdrawHistory: function () {
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    const url = `${config.ApiRoot}/sales/withdraw-log`;
    userMs.request({
      url,
      method: 'GET',
    })
      .then(res => {
        const { code, data } = res.data;
        console.log(res.data)
        if (code === 10000) {
          data.forEach(item=>{
            item.create_time_util = util.formatTimeToDay(new Date(item.create_time*1000))
          })
          _this.setData({
            "data.widthdrawLists": data
          })
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        // wx.hideNavigationBarLoading();
        // wx.stopPullDownRefresh();
      });
  },
  onSecondHandler:function(){
    // const page = this.data.state.page;
    if (this.data.data.amount > this.data.data.balance.balance) {
      this.alertHandler("提现金额不能大于可提现金额")
      return;
    }
    if (this.data.data.amount < 1) {
      this.alertHandler("提现金额必须大于等于1元")
      return;
    }
    this.setData({
      "data.amount": this.data.data.amount,
      "state.secondStep":true
    })
  },
  onCancelWithDrawHandler:function(){
    this.setData({
      "state.secondStep": false
    })
  },
  onGoToBackHandler:function(){
    wx.navigateBack({
      delta:1
    })
  },
  onGoToWithdrawPageHandler:function(){
    wx.navigateTo({
      url: '../withdrawIntroPage/withdrawIntroPage',
    })
  },
  onInputMoneyHandler:function(e){
    this.data.data.amount = e.detail.value;
  },
  onWidthdrawHandler:function(){
    const _this = this;
    wx.showLoading({
      title: '申请中',
    })
    const url = `${config.ApiRoot}/sales/withdraw`;
    userMs.request({
      url,
      method: 'POST',
      data:{
        amount: Number((this.data.data.amount * 100).toFixed(2))
      }
    })
      .then(res => {
        const { code, data, msg} = res.data;
        console.log(res.data)
        if (code === 10000) {
          this.setData({
            "state.firstStep": false,
            "state.secondStep":false,
            "state.thirdStep":true
          })
        }else{
          this.alertHandler(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        // wx.hideNavigationBarLoading();
        // wx.stopPullDownRefresh();
      });
  },
  alertHandler: utilActions.alertHandler,
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
})