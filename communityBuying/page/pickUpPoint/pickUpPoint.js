// page/pickUpPoint/pickUpPoint.js
const data = require("./data.js");
const wxApi = require("../../utils/wxApi.js");

//获取应用实例
const app = getApp()
var userMs = app.userMs;
var config = userMs.config;

const UtilActions = require("../../class/utilActions.js");
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
      title: '门店地址',
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
    // 这里重置一下，在pickUpPoint 页面 的onshow 事件触发
    app.globalData.naviBackUrl = ""
    let locationObj = wx.getStorageSync("locationObj");
    if (locationObj) {
      this.setData({
        "state.locationObj": JSON.parse(locationObj)
      })
      this.onFetchStoreList();
    }
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
  onFetchStoreList:function(){
    let _this = this;
    let url = `${config.ApiRoot}/store/list`
    let locationObj = this.data.state.locationObj;
    let queryObj={
      adcode:locationObj.adcode
    };
    if(locationObj.com){
      queryObj.community_id = locationObj.com.id
    }
    let data = {
      header: {
        "version": '1'
      },
      url,
      data: queryObj
    }
    wx.showLoading({
      title: '加载中',
    })
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          let localAddress = wx.getStorageSync("address");
          let address;
          if (localAddress) {
            localAddress = JSON.parse(localAddress)
          }
          data.forEach((item,index)=>{
            item.canSeedName = utilActions.formateToShadowText(1, 1, item.contact);
            item.canSeedMobile = utilActions.formateToShadowText(3, 4, item.mobile);
            if(item.id == localAddress.id){
              // wx.setStorageSync("address", JSON.stringify(item))
              address = item
            }
            // let canSeedPhone = item.mobile.substr(0, 3) + '****' + item.mobile.substr(7);
            // data[index].utilMobile= canSeedPhone;
            // if (item.contact.length > 2) {
            //   let shadowText = "";
            //   for (let i = 0; i < item.contact.length - 2; i++) {
            //     shadowText += "*";
            //   }
            //   item.canSeedName = item.contact.substr(0, 1) + shadowText + item.contact.substr(item.contact.length - 1);
            // } else if (item.contact.length == 2) {
            //   item.canSeedName = item.contact.substr(0, 1) + "*";
            // }
          })
          if(address){
            this.setData({
              "data.address": address
            })
          }
          this.setData({
            "data.coms":data
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
  onSelectAddressHandler:function(e){
    let type = e.currentTarget.dataset.type;
    let index = e.currentTarget.dataset.index;
    if(type == "current"){
      wx.navigateBack({
        delta:1
      })
    }else{
      let selectObj = this.data.data.coms[index];
      wx.removeStorageSync("last_user_store_id");
      wx.setStorageSync("address", JSON.stringify(selectObj))
      wx.navigateBack({
        delta: 1
      })
    }
  },
  onGoToLocationPageHandler:function(){
    app.globalData.naviBackUrl = "pickUpPoint"
    wx.navigateTo({
      url: '/page/index/pages/location/location',
    })
  }
})