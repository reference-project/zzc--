// page/userCenter/pages/sellerInfo/sellerInfo.js

const app = getApp();
// const wxApi = require("../../utils/wxApi.js");
const data = require("./data.js");
const userMs = app.userMs;
const config = userMs.config;
// const util = require("../../utils/util.js");
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
      title: '店主信息',
    })
    let last_user_store_id = wx.getStorageSync("last_user_store_id");
    if (last_user_store_id) {
      this.getStoreIdAddress(last_user_store_id);
    }
  },
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
          if (data) {
            // if (data.contact.length>2){
            //   let shadowText = "";
            //   for (let i = 0; i < data.contact.length-2;i++){
            //     shadowText += "*";
            //   }
            //   data.canSeedName = data.contact.substr(0, 1) + shadowText + data.contact.substr(data.contact.length - 1);
            // } else if (data.contact.length == 2){
            //   data.canSeedName = data.contact.substr(0, 1) + "*";
            // }
            // let canSeedPhone = data.mobile.substr(0, 3) + '****' + data.mobile.substr(7);
            // data.canSeedPhone = canSeedPhone;
            data.canSeedName = utilActions.formateToShadowText(1, 1, data.contact);
            data.canSeedMobile = utilActions.formateToShadowText(3, 4, data.mobile);
            this.setData({
              "data.userInfo": data,
            })
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