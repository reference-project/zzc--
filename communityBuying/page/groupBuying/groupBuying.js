// page/groupBuying/groupBuying.js
const data = require("./data.js");
const pageContorlMixin = require("../../class/pageControl.js");
let util = require("../../utils/util.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

let pageObj = {

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    console.log("ground")
    if (this.data.data.products.length > 0 && !this.loading) {
      this.fetchNextPage(this.fetchRecommendData);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
}
pageObj = util.mixin(pageObj, pageContorlMixin);

Page(pageObj);