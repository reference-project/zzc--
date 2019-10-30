// page/userCenter/pages/redPackage/redPackage.js
const data = require("./data.js");

const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

const pageContorlMixin = require("../../../../class/pageControl.js");
let util = require("../../../../utils/util.js");

let pageObj = {

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的红包',
    })
    this.fetchPackageList();
  },

  fetchPackageList: function () {
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    // if (this.loading) return; // 这里不需要再多判断一次
    this.loading = true;
    const filterItem = _this.data.state.filters[_this.data.state.selectFilterIndex];
    const url = `${config.ApiRoot}/red-envelop/list`;
    this.setData({
      "state.loading": true
    });
    let queryObj = {
      page: _this.data.state.page,
      limit: 20,
      used: filterItem.status
    }

    userMs.request({
      url,
      data: queryObj,
      method: 'GET',
    })
      .then(res => {
        const {
          code,
          data
        } = res.data;
        if (code === 10000) {
          data.data.forEach(item=>{
            item.deadlineUtil =  util.formatTimeToDay(new Date(item.deadline*1000));
            if (item.deadline - new Date() / 1000 > 0) {
              item.isTimeOut = false
            }else{
              item.isTimeOut = true
            }
            let matchArr = this.splitIntFloat(item.amount/100);
            item.amountInt = matchArr[1];
            item.amountFloat = matchArr[2] ? matchArr[2]:"";
          })
          _this.data.data.allData[filterItem.type].data = _this.data.state.page > 1 ? _this.data.data.allData[filterItem.type].data.concat(data.data) : data.data
          _this.setData({
            'data.allData': _this.data.data.allData,
            'data.totalPage': data.last_page,
            "state.loading": false,
            // "data.qiniuDomain": userMs.config["qiniuDomain"]
          });
        };
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  },
  splitIntFloat: util.splitIntFloat,
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
    if (this.data.data.allData[this.data.state.selectFilterType].data && this.data.data.allData[this.data.state.selectFilterType].data.length > 0 && !this.loading) {
      this.fetchNextPage(this.fetchPackageList);
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
  onNavItemPressHandler: function (e) {
    this.setData({
      "state.scrollTop": 0
    })
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    if (index == this.data.state.selectFilterIndex) return;
    this.setData({
      "state.page":1,
      "state.selectFilterIndex": index,
      "state.selectFilterType": type
    })
    this.fetchPackageList();
  }
}
pageObj = util.mixin(pageObj,pageContorlMixin);

Page(pageObj)