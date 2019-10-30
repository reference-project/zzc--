// page/index/pages/locationCity/locationCity.js
const data = require("./data.js");
const wxApi = require("../../../../utils/wxApi.js");
// const UtilActions = require("../../class/utilActions.js");
// let utilActions = new UtilActions;

//获取应用实例
const app = getApp()
var userMs = app.userMs;
var config = userMs.config;

var QQMapWX = require('../../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
qqmapsdk = new QQMapWX({
  key: 'NXWBZ-KT4W6-W4LS2-ELIF6-IWC36-JPFUB'
});

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
      title: '壹手仓鲜品',
    })
    let locationObj = wx.getStorageSync("locationObj");
    let currentLocation = wx.getStorageSync("currentLocation");
    if (locationObj) {
      this.setData({
        "state.locationObj": JSON.parse(locationObj),
      })
    }
    if (currentLocation){
      this.setData({
        "state.currentLocation": JSON.parse(currentLocation),
      })
    }
    this.onFetchCanSelectCity();
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
  onFetchCanSelectCity:function(){
    let _this = this;
    let url = `${config.ApiRoot}/region/available-cities`
    let data = {
      url,
    }
    wx.showLoading({
      title: '加载中',
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          this.setData({
            "data.citys":data
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
  onSelectCityHandler:function(e){
    let locationObj = wx.getStorageSync("locationObj");
    const index = e.currentTarget.dataset.index;
    let selectObj = this.data.data.citys[index];
    let newLocationObj = {
      city: selectObj.city,
      adcode: selectObj.code
    }
    if(newLocationObj.city != locationObj.city){
      app.globalData.onChangeLocationStatus = true;
    }
    wx.removeStorageSync("last_user_store_id");
    wx.setStorageSync("locationObj", JSON.stringify(newLocationObj))
    wx.navigateBack({
      delta: 1
    })
  },
  // 选择当前选择城市
  onGoBackHandler:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  // 选择当前定位城市
  onSelectCurrrentLocationCityHandler:function(){
    let currentLocation = this.data.state.currentLocation;
    let locationObj = wx.getStorageSync("locationObj");
    if (currentLocation.city != locationObj.city) {
      app.globalData.onChangeLocationStatus = true;
    }
    wx.removeStorageSync("last_user_store_id");
    wx.setStorageSync("locationObj", JSON.stringify(currentLocation))
    wx.navigateBack({
      delta: 1
    })
  },
  //刷新定位用户地理位置
  onGetLocationHandler: function () {
    let _this = this;
    wx.getLocation({
      success: function (res) {
        //第三方接口获取城市名字
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (ret) {
            console.log("ret", ret)
            if (ret.status === 0 && ret.result) {
              var currentLocation = {
                city: ret.result.address_component.city,
                adcode: ret.result.ad_info.adcode
              }
              wx.setStorageSync("currentLocation", JSON.stringify(currentLocation));
              _this.setData({
                'state.currentLocation':currentLocation
              })
            }
          },
          fail: function (err) {
            console.log(err);

          }
        });
      },
      fail: function (err) {
        if (wx.canIUse("button.open-type.openSetting")) {
          _this.setData({
            "state.needOpenSettingBtn": true,
            'state.needLocation': true,
          })
        } else {
          _this.setData({
            'state.needLocation': true,
            "state.needOpenSettingBtn": false
          })
        }

      }
    })
  },
})