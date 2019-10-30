// page/index/pages/activityPage/activityPage.js
const pageContorlMixin = require("../../../../class/pageControl.js");
let util = require("../../../../utils/util.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;


let pageObj = {

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '活动名称',
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
  // 获取评论内容
  fetchActivityData: function () {
    let _this = this;
    let url = `${config.ApiRoot}/activities?type=2`;
    let productData = {
      url,
      method: "GET",
    }
    wx.showLoading({
      title: '加载中',
    })
    userMs.request(productData).then(res => {
      let { data, code } = res.data
      if (code == 1) {
        _this.setData({
          'data.activities': data
        })
      }
    }).catch(
      err => {
        console.log(err)
      }
      ).finally(() => {
        wx.hideLoading();
      });

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
    if (this.data.data.products.length > 0 && !this.loading) {
      this.fetchNextPage(this.fetchRecommendData);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  
}
pageObj = util.mixin(pageObj,pageContorlMixin);

Page(pageObj);