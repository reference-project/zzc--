// page/index/pages/communitySearch/communitySearch.js
const data = require("./data.js");
const wxApi = require("../../../../utils/wxApi.js");
// const UtilActions = require("../../class/utilActions.js");
// let utilActions = new UtilActions;

//获取应用实例
const app = getApp()
var userMs = app.userMs;
var config = userMs.config;

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
    // this.onFetchHotCommunity();
    this.getLocationHandler();
  },
  getLocationHandler: function () {
    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        _this.latitude = res.latitude
        _this.longitude = res.longitude
      }
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
    // 当前选择定位
    let locationObj = wx.getStorageSync("locationObj");
    if (locationObj) {
      this.setData({
        "state.locationObj": JSON.parse(locationObj),
      })
      // this.onFetchCanSelectCommunity();
    }
    // 选择社区
    // let communityObj = wx.getStorageSync("communityObj");
    // if (communityObj) {
    //   this.setData({
    //     "state.communityObj": JSON.parse(communityObj),
    //   })
    // }
    // 微信定位
    let currentLocation = wx.getStorageSync("currentLocation");
    if (currentLocation) {
      this.setData({
        "state.currentLocation": JSON.parse(currentLocation),
      })
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
  onGoToLoCityHandler: function () {
    wx.navigateTo({
      url: '../locationCity/locationCity',
    })
  },
  onSearchInputHandler:function(e){
    this.keyWord = e.detail.value
  },
  onSearchHandler:function(){
    this.onFetchCanSelectCommunity();
  },
  // 获取可选城市
  onFetchHotCommunity: function () {
    let _this = this;
    let url = `${config.ApiRoot}/region/community-address`
    let locationObj = wx.getStorageSync("locationObj");
    if(locationObj){
      locationObj = JSON.parse(locationObj)
    }
    let data = {
      url,
      data: {
        adcode: locationObj.adcode,
        // all: 1
      }
    }
    wx.showLoading({
      title: '加载中',
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          this.setData({
            "data.hotComs": data
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
  // 获取可选城市
  onFetchCanSelectCommunity: function () {
    let _this = this;
    // let url = `${config.ApiRoot}/region/community-address`
    // let locationObj = wx.getStorageSync("locationObj");
    // if (locationObj) {
    //   locationObj = JSON.parse(locationObj)
    // }
    let url = `${config.ApiRoot}/store/list`
    let locationObj = this.data.state.locationObj;
    // let queryObj = {
    //   adcode: locationObj.adcode
    // };
    // if (locationObj.com) {
    //   queryObj.community_id = locationObj.com.id
    // }
    // let data = {
    //   url,
    //   data: queryObj
    // }
    let data = {
      url,
      header: {
        "version": '1'
      },
      data: {
        adcode: locationObj.adcode,
        community_name: _this.keyWord,
        limit:50,
        // all:1
      }
    }
    wx.showLoading({
      title: '加载中',
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          data.data.forEach(item => {
            item.distance = _this.distance(_this.latitude, _this.longitude, item.latitude, item.longitude)
          })
          data.data.sort(_this.compareArrBySort("distance"))
          this.setData({
            "data.coms": data.data
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
  compareArrBySort: function (property) {
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    }
  },
  onSelectComHandler: function (e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    let selectObj = this.data.data.coms[index];
    wx.setStorageSync("communityObj", JSON.stringify(selectObj));
    app.globalData.onChangeCommunityStatus = true;
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
    // const index = e.currentTarget.dataset.index;
    // const type = e.currentTarget.dataset.type;
    // let selectObj;
    // if(type == "hot"){
    //   selectObj = this.data.data.hotComs[index]
    // }else{
    //   selectObj = this.data.data.coms[index]
    // }
    // let locationObj = wx.getStorageSync("locationObj");
    // if (locationObj) {
    //   locationObj = JSON.parse(locationObj)
    // }
    // locationObj.com = selectObj;
    // wx.removeStorageSync("last_user_store_id");
    // wx.setStorageSync("locationObj", JSON.stringify(locationObj))
    // if (app.globalData.naviBackUrl){
    //   switch (app.globalData.naviBackUrl){
    //     case 'pickUpPoint':
    //       wx.navigateBack({
    //         delta: 2
    //       })
    //     default:
    //       // app.globalData.naviBackUrl = ""
    //       // 这里不重置 是因为，用户可能触发这个事件，可能不触发，所以在pickUpPoint 页面 的onshow 事件触发
    //   }
    // }else{
    //   wx.reLaunch({
    //     url: '/page/tabBar/index/index',
    //   })
    // }
  },
  distance: function (la1, lo1, la2, lo2) {
    la1 = la1 || 0;
    lo1 = lo1 || 0;
    la2 = la2 || 0;
    lo2 = lo2 || 0;

    var La1 = la1 * Math.PI / 180.0;

    var La2 = la2 * Math.PI / 180.0;

    var La3 = La1 - La2;

    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;

    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));

    s = s * 6378137;//地球半径

    s = Math.round(s / 1000);
    return s

    // console.log("计算结果",s)

  },
})