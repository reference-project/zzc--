// page/userCenter/pages/returnDetailPage/returnDetailPage.js
const app = getApp();
const wxApi = require("../../../../utils/wxApi.js");
const data = require("./data.js");
const userMs = app.userMs;
const config = userMs.config;
// const util = require("../../utils/util.js");
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
      title: '售后服务详情',
    })
    if (options.orderDetail) {
      let orderDetail = JSON.parse(decodeURIComponent(options.orderDetail));
      this.setData({
        "data.orderDetail": orderDetail
      })
      this.fetchReturnData(orderDetail.currentItem.application_id);
      // this.fetchData();
    }
  },
  fetchReturnData: function (id) {
    let _this = this;
    // let order_item_id = this.data.state.order_item_id;
    // let order_id = this.data.state.order_id;
    let url = `${config.ApiRoot}/after-sale/application/${id}`;
    let data = {
      url
    }
    wx.showLoading({
      title: '加载中',
    })
    userMs
      .request(data)
      .then(res => {
        let { code, data, msg } = res.data;
        if (code === 10000) {
          // if (data.refund_apply_time > 0){
          //   // data.refund_format_time = util.formatTime(new Date(data.refund_apply_time*1000))
          // }
          _this.setData({
            "data.returnItem": data
          })
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(
        res => {
          wx.hideLoading();
          // _this.setData({
          //   "state.loadingStatus": false
          // })
        }
      )
  },
  onAddTrackingNumberRequest: function () {
    let _this = this;
    let id = this.data.data.orderDetail.currentItem.application_id;
    let url = `${config.ApiRoot}/after-sale/application/log-tracking-number/${id}`;
    let queryObj ={
      type: this.data.data.returnItem.type,
      tracking_number: this.LNumber
    };
    let data = {
      url,
      method: "PUT",
      data: queryObj
    }
    wx.showLoading({
      title: '提交中',
    })
    userMs
      .request(data)
      .then(res => {
        let { code, data, msg } = res.data;
        if (code === 10000) {
          this.fetchReturnData(id);
        } else {
          _this.alertHandler(msg)
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(
        res => {
          wx.hideLoading();
        }
      )
  },
  onSureReceiveHandler:function(){
    let _this = this;
    let id = this.data.data.orderDetail.currentItem.application_id;
    let url = `${config.ApiRoot}/after-sale/application/${id}`;
    let queryObj = {
      type: this.data.data.returnItem.type,
      status:15
    };
    let data = {
      url,
      method: "PUT",
      data: queryObj
    }
    wx.showLoading({
      title: '提交中',
    })
    userMs
      .request(data)
      .then(res => {
        let { code, data, msg } = res.data;
        if (code === 10000) {
          this.fetchReturnData(id);
        } else {
          _this.alertHandler(msg)
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(
        res => {
          wx.hideLoading();
        }
      )
  },
  onCancelRefundRequest: function () {
    let _this = this;
    // let order_id = this.data.data.orderDetail.order_id;
    let application_id = this.data.data.orderDetail.currentItem.application_id;
    let url = `${config.ApiRoot}/after-sale/application/cancel/${application_id}`;
    let data = {
      url,
      method: "PUT"
    }
    wx.showLoading({
      title: '取消中',
    })
    userMs
      .request(data)
      .then(res => {
        let { code, data, msg } = res.data;
        if (code === 10000) {
          _this.fetchReturnData(application_id);
        } else {
          _this.alertHandler(msg)
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(
        res => {
          wx.hideLoading();
        }
      )
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
  alertHandler: function (alertText) {
    const _this = this;
    _this.setData({
      "state.alertingStatus": true,
      "state.alertingWords": alertText
    })
    setTimeout(function () {
      _this.setData({
        "state.alertingStatus": false
      })
    }, 2000)
  },
  formSubmit: function (e) {
    // console.log(e)
    // 把formId取出来，然后触发下单事件
    this.formId = e.detail.formId;

    let _this = this;
    // this.onNowPay();
    console.log('form发生了submit事件，携带数据为：', e.detail)
    // if (!this.LCompany) {
    //   this.alertHandler("请填写快递公司");
    //   return false;
    // }
    if (!this.LNumber) {
      this.alertHandler("请填写快递编号");
      return false;
    }
    this.onAddTrackingNumberRequest();

  },
  onInputLCompanyHandler:function(e){
    this.LCompany=e.detail.value
  },
  onInputLNumberHandler: function(e) {
    this.LNumber = e.detail.value
  },
  onGoToReturnPage:function(e){
    let orderDetail = this.data.data.orderDetail;
    let banEdit = e.currentTarget.dataset.banEdit;
    banEdit && (orderDetail.banEdit =true);
    wx.navigateTo({
      url: `../returnPage/returnPage?orderDetail=${encodeURIComponent(JSON.stringify(orderDetail))}`,
    })
  },
  onCopyHandler: function (e) {
    const _this = this;
    let value = e.currentTarget.dataset.no || "";
    wxApi.setClipboardData({
      data: value
    }).then(res => {
      // 现在的复制api，默认成功有提示框了
      // this.setData({
      //   "state.alertingStatus": true,
      //   "state.alertingWords": "复制成功"
      // })
      // setTimeout(function () {
      //   _this.setData({
      //     "state.alertingStatus": false
      //   })
      // }, 2000)
    })
  },
  onCallHandler: function (e) {
    wx.showActionSheet({
      itemList: ['4000585825'],
      success: function (res) {
        wx.makePhoneCall({
          phoneNumber: '4000585825' //仅为示例，并非真实的电话号码
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
})