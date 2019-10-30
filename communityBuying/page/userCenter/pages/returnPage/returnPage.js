// pages/returnPage/returnPage.js
const app = getApp();
// const wxApi = require("../../utils/wxApi.js");
const data = require("./data.js");
const userMs = app.userMs;
const config = userMs.config;
// const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data:data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '售后服务',
    });
    if (options.orderDetail){
      let orderDetail = JSON.parse(decodeURIComponent(options.orderDetail));
      if (orderDetail.currentItem.has_after_sale) {
        this.setData({
          "data.orderDetail": orderDetail,
          "state.chooseReturnTypeStatus":false
        })
        this.fetchReturnData(orderDetail.currentItem.application_id);
      }else{
        this.setData({
          "data.orderDetail": orderDetail
        })
      }
    }
  },
  fetchReturnData: function(id){
    let _this = this;
    // let order_item_id = this.data.state.order_item_id;
    // let order_id = this.data.state.order_id;
    let url = `${config.ApiRoot}/after-sale/application/${id}`;
    let data={
      url
    }
    wx.showLoading({
      title: '加载中',
    })
    userMs
    .request(data)
    .then( res=>{
      let {code, data, msg} = res.data;
      if(code === 10000){
        // if (data.refund_apply_time > 0){
        //   // data.refund_format_time = util.formatTime(new Date(data.refund_apply_time*1000))
        // }
        let selectReturnTypeItem;
        this.data.state.returnTypes.forEach(item=>{
          item.type == data.type && (selectReturnTypeItem = item)
        })
        // let netPics = [];
        // if (data.apply_images){
        //   data.apply_images=data.apply_images.split(",");
          
        //   data.apply_images.forEach((item,index)=>{
        //     netPics[index] = _this.data.data.orderDetail.qiniuDomain+item
        //   })
        // }
        
        _this.setData({
          "data.returnItem":data,
          "state.selectReturnTypeItem": selectReturnTypeItem,
          "data.tempFilePathsNet": data.apply_images ? data.apply_images.split(","):[],
          "data.tempFilePathsLocal": [],
          "state.remark": data.remark,
          "state.apply_reason": data.apply_reason,
          // "state.returnMoney": data.refund_amount
        })
      }else{
        throw res;
      }
    })
    .catch( err=>{
      console.log(err)
    })
    .finally(
      res=>{
        wx.hideLoading();
        // _this.setData({
        //   "state.loadingStatus": false
        // })
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
    // 把formId取出来，然后触发事件
    this.formId = e.detail.formId;
    
    let _this = this;
    // this.onNowPay();
    console.log('form发生了submit事件，携带数据为：', e.detail)
    if (!this.data.state.selectReturnTypeItem.type) {
      this.alertHandler("请选择售后类型");
      return false;
    }
    if (!this.data.state.apply_reason){
      this.alertHandler("请填写申请原因");
      return false;
    }
    // if (!this.data.state.returnMoney && this.data.state.selectReturnTypeItem.type !=3) {
    //   this.alertHandler("请填写退款金额");
    //   return false;
    // }
    // if (this.data.state.returnMoney > (this.data.data.orderDetail.currentItem.real_price / 100) && this.data.state.selectReturnTypeItem.type != 3) {
    //   this.alertHandler("退款金额不能大于商品金额");
    //   return false;
    // }
    this.refundRequest();
    
  },
  refundRequest:function() {
    let _this = this;
    let order_id = this.data.data.orderDetail.order_id;
    let order_item_id = this.data.data.orderDetail.currentItem.id;
    let tempFilePathsLocal = this.data.data.tempFilePathsLocal;
    let tempFilePathsNet = this.data.data.tempFilePathsNet;
    let url;
    let method;
    let queryObj;
    if (this.data.data.orderDetail.currentItem.has_after_sale){
      url = `${config.ApiRoot}/after-sale/application/${this.data.data.orderDetail.currentItem.application_id}`;
      method="PUT";
      queryObj = {
        apply_reason: _this.data.state.apply_reason,
        type: _this.data.state.selectReturnTypeItem.type,
        remark: _this.data.state.remark,
        apply_images: ""
      }
    }else{
      url = `${config.ApiRoot}/after-sale/application`;
      method="POST";
      queryObj = {
        order_id,
        order_item_id,
        apply_reason: _this.data.state.apply_reason,
        type: _this.data.state.selectReturnTypeItem.type,
        remark: _this.data.state.remark,
        apply_images: ""
      }
    }
    let data = {
      url,
      method:method,
      data: queryObj
    }
    wx.showLoading({
      title: '提交中...',
    })
    
    if (tempFilePathsLocal.length){
      userMs.uploadFile(tempFilePathsLocal)
        .then(res => {
          if (tempFilePathsNet.length){
            data.data.apply_images = tempFilePathsNet.join(",")+","+res.join(",");
          }else{
            data.data.apply_images = res.join(",");
          }
          userMs
            .request(data)
            .then(res => {
              let { code, data, msg } = res.data;
              if (code === 10000) {
                !this.data.data.orderDetail.currentItem.application_id && (this.data.data.orderDetail.currentItem.application_id = data.id) && (this.data.data.orderDetail.currentItem.has_after_sale = 1);
                wx.redirectTo({
                  url: `../returnDetailPage/returnDetailPage?orderDetail=${encodeURIComponent(JSON.stringify(this.data.data.orderDetail))}`,
                })
              } else {
                _this.alertHandler(msg)
                throw res;
              }
            })
        })
        .catch(err => {
          console.log(err)
        })
        .finally(
          res => {
            wx.hideLoading();
          })
    }else{
      tempFilePathsNet.length && (data.data.apply_images = tempFilePathsNet.join(","));
      userMs
      .request(data)
      .then(res => {
        let { code, data, msg } = res.data;
        if (code === 10000) {
          !this.data.data.orderDetail.currentItem.application_id && (this.data.data.orderDetail.currentItem.application_id = data.id) && (this.data.data.orderDetail.currentItem.has_after_sale = 1);
          wx.redirectTo({
            url: `../returnDetailPage/returnDetailPage?orderDetail=${encodeURIComponent(JSON.stringify(this.data.data.orderDetail))}`,
          })
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
      })
    }
    
  },
  // agreeOrDisagree:function(e){
  //   let index = e.currentTarget.dataset.index;
  //   let currentIndex = this.data.state.selectIndex;
    
  //   if(index === currentIndex) return false;
  //   // this.data.state.returnTypes[agreeOrDisagree].selected = !this.data.state.returnTypes[agreeOrDisagree].selected;
  //   this.setData({
  //     "state.selectIndex":index,
  //   })

  // },
  onCallPhone: function (e) {
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
  // 发布图片
  onChooseImageHandler() {
    const _this = this;
    const count = this.data.data.tempFilePathsLocal.length;

    wx.chooseImage({
      count: 4 - count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        _this.setData({
          "data.tempFilePathsLocal": _this.data.data.tempFilePathsLocal.concat(res.tempFilePaths),
        })

        // var tempFilePath = res.tempFilePaths[0];
      }
    })

  },
  onPreviewImageHandler:function(e){
    let netPics = [];
    let _this = this;
    this.data.data.tempFilePathsNet.forEach((item,index)=>{
      netPics[index] = _this.data.data.orderDetail.qiniuDomain+item
    })
    var srcData = netPics.concat(this.data.data.tempFilePathsLocal);
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    if(type == "local"){
      index = this.data.data.tempFilePathsNet.length+index;
    }
    wx.previewImage({
      current: srcData[index],
      urls: srcData,

    })
  },
  //删除图片
  onDeleteImageHandler: function (event) {

    const _this = this;
    const imageIndex = event.currentTarget.dataset.index;
    const tempFilePathsLocal = this.data.data.tempFilePathsLocal;
    const tempFilePathsNet = this.data.data.tempFilePathsNet;
    const type = event.currentTarget.dataset.type;
    if(type == "net"){
      tempFilePathsNet.splice(imageIndex, 1);
    }else{
      tempFilePathsLocal.splice(imageIndex, 1);
    }
    // console.log(tempFiles);
    
    _this.setData({
      "data.tempFilePathsLocal": tempFilePathsLocal,
      "data.tempFilePathsNet": tempFilePathsNet
    })

  },
  onOpenReturnTypeHandler:function(){
    this.setData({
      "state.chooseReturnTypeStatus":true
    })
  },
  onSelectReturnTypeHandler:function(e){
    let index = e.currentTarget.dataset.index;
    let selectReturnTypeItem = this.data.state.returnTypes[index];
    this.setData({
      "state.chooseReturnTypeStatus": false,
      "state.selectReturnTypeItem": selectReturnTypeItem
    })
  },
  onInputReasonHandler:function(e){
    this.data.state.apply_reason = e.detail.value
  },
  onInputMoneyHandler:function(e){
    this.data.state.returnMoney = e.detail.value
  },
  onInputRemarkHandler: function (e) {
    this.data.state.remark = e.detail.value
  },
  onSaveLogistics: function (e) {
    this.data.state.logisticsNumber = e.detail.value
  },
  onGoToLogisticsHandler: function (e) {
    const id = e.currentTarget.dataset.tradeNo;
    wx.navigateTo({
      url: `../logistics/logistics?id=${id}`,
    })
  },
})