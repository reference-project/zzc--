// page/userCenter/pages/addressList/addressList.js

//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const data = require("./data.js");
const wxApi = require("../../../../utils/wxApi.js");

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
      title: '收货地址',
    })
    if(options.comeFromPage){
      this.data.data.comeFromPage = options.comeFromPage
    }
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
    this.onFetchAddressList();
  },
  onFetchAddressList:function(){
    let _this = this;
    let url = `${config.ApiRoot}/shipping-address`;
    let data = {
      url,
    }
    wx.showLoading({
      title: '加载中',
    })
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          _this.setData({
            "data.addressList": data
          })
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        wx.hideLoading();
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
  // onShareAppMessage: function () {
  
  // }
  onSelectAddressHandler:function(e){
    const index = e.currentTarget.dataset.index;
    let selectItem = this.data.data.addressList[index];
    if (this.data.data.comeFromPage == "purchasePage"){
      wx.setStorageSync("address", JSON.stringify(selectItem));
      wx.navigateBack({
        delta: 1
      })
    }
    // if (this.data.data.addressList[index].is_default) return;
    // this.onModifyAddressRequest(index);
  },
  onGoToAddressEditHandler:function(e){
    const index = e.currentTarget.dataset.index;
    if (index!==undefined){
      let selectItem = this.data.data.addressList[index];
      wx.navigateTo({
        url: `../addressEdit/addressEdit?selectItem=${encodeURIComponent(JSON.stringify(selectItem))}`
      })
    }else{
      wx.navigateTo({
        url: `../addressEdit/addressEdit`,
      })
    }
  }
})