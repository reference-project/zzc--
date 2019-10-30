// pages/logistics/logistics.js
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emptyTips:"暂无物流信息"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '物流信息'
    })
    let _this = this;
    if(options.id){
      this.setData({
        "state.tracking_number": options.id
      })
      this.fetchData(options.id);
    }
    
  },
  fetchData: function (id) {
    let url = `${config.ApiRoot}/orders/logistic/${id}`;
    const _this = this;
    wx.showLoading({
      title: '查询中',
    })
    let data = {
      url,
      method: 'GET'
    }
    userMs.request(data).then(res => {
      const {code,data,msg} = res.data;
      if(code === 10000){
        _this.setData({
          "logistics": data
        })
      }else{
        _this.setData({
          "emptyTips": msg
        })
      }
      

    }).catch(
      err => {
        console.log(err)
      }
      ).finally(() => wx.hideLoading());

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

  onCallPhone:function(e){
    wx.showActionSheet({
      itemList: ['18813750848'],
      success: function (res) {
        wx.makePhoneCall({
          phoneNumber: '18813750848' //仅为示例，并非真实的电话号码
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
    
  }
})