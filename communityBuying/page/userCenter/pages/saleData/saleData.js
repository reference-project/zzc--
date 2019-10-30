// page/userCenter/pages/saleData/saleData.js

const data = require("./data.js");
// const pageContorlMixin = require("../../../../class/pageControl.js");
// let util = require("../../../../utils/util.js");

const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

let pageObj ={

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onFetchSaleData();
    // this.onFetchSaleOrdersData();
    wx.setNavigationBarTitle({
      title: '店主帐户中心'
    });
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
    // if (this.data.data.saleDataOrders && this.data.data.saleDataOrders.length > 0 && !this.loading) {
    //   this.fetchNextPage(this.onFetchSaleOrdersData);
    // }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // }
  onFetchSaleData: function () {
    let _this = this;
    let url = `${config.ApiRoot}/sales/volumes`;
    let data = {
      url,
      method: "GET"
    };
    userMs.request(data).then(res => {
      const { data, code } = res.data;
      if (code === 10000) {
        this.setData({
          "data.saleData": data,
          "data.userInfo":  userMs.config.userInfo,
          "data.qiniuDomain": userMs.config.qiniuDomain,
        })
      } else {
        throw res;
      }
    })
      .catch(
        err => {
          console.log(err)
        }
      ).finally(() => wx.hideLoading());
  },
  onFetchSaleOrdersData: function () {
    if(this.loading) return;
    this.loading = true;
    let _this = this;
    let url = `${config.ApiRoot}/sales/orders`;
    let data = {
      url,
      method: "GET",
      data: {
        page: this.data.state.page,
        limit: 10,
      }
    };
    data.data.status = this.data.state.saleTypeFilters[this.data.state.selectSaleTypeIndex].value;

    wx.showLoading({
      title: '加载中',
    })
    userMs.request(data).then(res => {
      const { data, code } = res.data;
      if (code === 10000) {
        data.data.forEach(item => {
          item.create_time_util = util.formatTime(new Date(item.create_time * 1000))
          item.settlement_time_util = util.formatTime(new Date(item.settlement_time * 1000))
          item.confirm_time_util = util.formatTime(new Date(item.confirm_time * 1000))
        })
        this.setData({
          "data.saleDataOrders": this.data.state.page > 1 ? this.data.data.saleDataOrders.concat(data.data) : data.data,
          "data.totalPage": data.last_page
        })
      } else {
        throw res;
      }
    })
      .catch(
        err => {
          console.log(err)
        }
      ).finally(() => {
        this.loading = false;
        wx.hideLoading();
        wx.hideNavigationBarLoading();
      });
  },
  onSelectSaleTypeHandler:function(e){
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;
    if(type == this.data.state.selectSaleType) return;
    this.setData({
      "state.selectSaleType":type,
      "state.selectSaleTypeIndex":index
    })
    this.onFetchSaleOrdersData();
  },
  onGoTowithdrawPage:function(){
    wx.navigateTo({
      url: '../withdrawPage/withdrawPage',
    })
  },
  onGoToSaleListHandler:function(e){
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `../saleOrderList/saleOrderList?type=${type}`,
    })
  },
}

// pageObj = util.mixin(pageObj, pageContorlMixin);

Page(pageObj)