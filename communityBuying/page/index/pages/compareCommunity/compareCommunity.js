// page/index/pages/compareCommunity/compareCommunity.js

const data = require("./data.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
let config = userMs.config;
const eventHandler = require("../../../../utils/event.js");
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
      title: '壹手仓',
    })

    // 传递该次门店id进来，与本地的对比
    if (options.queryObj) {
      let queryObj = JSON.parse(decodeURIComponent(options.queryObj));
      this.setData({
        "data.curCommunityObj": queryObj.communityObj
      })
      this.getLocationHandler();
      // queryObj.storeId && (userMs.config.storeId = queryObj.storeId) && this.onFetchUserInfoHandler();      
    }
    let communityObjLocal = wx.getStorageSync("communityObj");
    if (communityObjLocal){
      this.setData({
        "data.communityObjLocal": JSON.parse(communityObjLocal)
      })
    }
  },
  getLocationHandler: function () {
    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        _this.latitude = res.latitude
        _this.longitude = res.longitude
        let curCommunityObj = _this.data.data.curCommunityObj;
        if (curCommunityObj){
          curCommunityObj.distance = _this.distance(_this.latitude, _this.longitude, curCommunityObj.latitude, curCommunityObj.longitude)
          _this.setData({
            "data.curCommunityObj": curCommunityObj
          })
        }
        let communityObjLocal = wx.getStorageSync("communityObj");
        if (communityObjLocal) {
          communityObjLocal = JSON.parse(communityObjLocal)
          communityObjLocal.distance = _this.distance(_this.latitude, _this.longitude, communityObjLocal.latitude, communityObjLocal.longitude)
          _this.setData({
            "data.communityObjLocal": communityObjLocal
          })
        }
      }
    })
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
  // 通过门店id 获取门店地址函数
  getStoreIdAddress: function (id) {
    let _this = this;
    let url = `${config.ApiRoot}/store/related-merchant`;

    let data = {
      url,
      data: {
        store_id: id
      }
    }
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          if (data && data.store_status == 1) {
            data.canSeedName = utilActions.formateToShadowText(1, 1, data.contact);
            data.canSeedMobile = utilActions.formateToShadowText(3, 4, data.mobile);
            let address = {
              ...data,
              id: id,
              address: data.store_address + data.community_name,
              name: data.store_name
            }
            this.setData({
              "state.address": address
            })
            // 必须本地先选择了地址，因为可用红包需要判断门店id
            this.onFetchPackageAbleListHandler();
          } else {
            // this.onGetAddressList();
          }
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // app.globalData.onGoToCompareCommunityPage = true;
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
  onSelectComuHandler:function(e){
    eventHandler.emit("selectComCallBack")
    let type = e.currentTarget.dataset.type;
    if(type == "cur"){
      wx.setStorageSync("communityObj", JSON.stringify(this.data.data.curCommunityObj))
      app.globalData.onChangeCommunityStatus = true;
    }
    wx.navigateBack({
      delta:1
    })
  }

})