// page/user/pages/orderList/orderList.js

const data = require("./data.js");
const pageContorlMixin = require("../../../../class/pageControl.js");
let util = require("../../../../utils/util.js");

const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const wxApi = require("../../../../utils/wxApi.js");

let pageObj = {

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    const {
      type
    } = options;
    if (type) {
      let selectedFilterItemIndex = this.data.state.selectedFilterItemIndex || 0;

      this.data.state.filters.forEach((filter, index) => {
        if (filter.type === type) {
          selectedFilterItemIndex = index;
        }
      });

      this.setData({
        "state.selectedLabel": type,
        "state.selectedFilterItemIndex": selectedFilterItemIndex
      })
    }
    wx.setNavigationBarTitle({
      title: '我的订单'
    });
    this.fetchOrderList();

  },

  fetchOrderList: function() {
    app.globalData.isOrderDetailUpdata = false;
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    // if (this.loading) return; // 这里不需要再多判断一次
    this.loading = true;
    const filterItem = _this.data.state.filters[_this.data.state.selectedFilterItemIndex];
    // const url = `${config.ApiRoot}/orders`; //老接口
    const url = `${config.ApiRoot}/v2/orders`; //新接口
    this.setData({
      "state.loading": true
    });
    let queryObj = {
      page: _this.data.state.page,
      limit: 10, 
      status: filterItem.value
    }
    // if (filterItem.type === "all") {
    //   queryObj.status = -2;
    // } else if (filterItem.type === "afterSale") {
    //   queryObj.after_sale = 1;
    // } else {
    //   queryObj.status = filterItem.value;
    // }

    userMs.request({
        url,
        data: queryObj,
        method: 'GET',
      })
      .then(res => {
        const {
          code,
          data,
          msg
        } = res.data;
        if (code === 10000) {
          _this.data.data.allData[filterItem.type].orders = _this.data.state.page > 1 ? _this.data.data.allData[filterItem.type].orders.concat(_this.checkTime(data.data)) : _this.checkTime(data.data);
          var ordersNumber = 0;//每条数据的件数
          _this.data.data.allData[filterItem.type].orders.forEach((item) => {
            // console.log("数据");
            // console.log(item);
            if (item.goods_num) ordersNumber += item.goods_num-0;
              item["totalNumber"] = ordersNumber;//创造一个总件数字段
          });

          console.log('总订单', _this.data.data.allData);

          _this.setData({
            // 'data.products': _this.data.state.page > 1 ? _this.data.data.products.concat(data.data) : _this.checkTime(data.data),
            'data.allData': _this.data.data.allData,
            'data.totalPage': data.last_page,
            "state.loading": false,
            "data.qiniuDomain": userMs.config["qiniuDomain"]
          });
        }else{
          this.alertHandler(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  },

  /**检查时间格式 */
  checkTime(list) {
    list.forEach((item) => {
      //创建时间
      item['create_time'] = util.formatTimeOblique(new Date(item['create_time'] * 1000));
      //预计送达时间
      item['expected_arrive_time'] = util.formatTimeOblique(new Date(item['expected_arrive_time'] * 1000),1);
      //预计发货时间
      item['expected_deliver_time'] = util.formatTimeOblique(new Date(item['expected_deliver_time'] * 1000), 1);     //取消时间
      item['cancel_time'] = util.formatTimeOblique(new Date(item['cancel_time'] * 1000))
      //退款时间
      item['refund_time'] = util.formatTimeOblique(new Date(item['refund_time'] * 1000))
      //成交时间
      item['arrive_time'] = util.formatTimeOblique(new Date(item['arrive_time'] * 1000))
      //送达时间
      item['reach_time'] = util.formatTimeOblique(new Date(item['reach_time'] * 1000))
    });
    return list;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.isOrderDetailUpdata) {
      this.fetchOrderList();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.data.allData[this.data.state.selectedLabel].orders && this.data.data.allData[this.data.state.selectedLabel].orders.length > 0 && !this.loading) {
      this.fetchNextPage(this.fetchOrderList);
    }
  },
  // onShareAppMessage: function (res) {


  //   if (res.from === 'button') {
  //     // 来自页面内转发按钮
  //     if(res.target.dataset){
  //       var parent_id = res.target.dataset.groupId
  //       var order_no = res.target.dataset.orderId
  //     }
  //   }
  //   return {
  //     title: 'Bir必燃特卖',
  //     imageUrl: "https://bir.langnadujia.cn/static/images/card/card-share.jpg",
  //     path: `/pages/invitePage/invitePage?activity_id=1&sign=0&parent_id=${parent_id}&order_no=${order_no}`,
  //     success: function (res) {
  //       console.log(`/pages/invitePage/invitePage?activity_id=1&sign=0&parent_id=${parent_id}&order_no=${order_no}`)
  //       //记录分享数
  //       const url = `${config.ApiRoot}/activities/share-log/update`;
  //       if (parent_id) {
  //         userMs.request({
  //           url,
  //           data: {
  //             group_id: parent_id,  //拼团ID
  //           },
  //           method: 'post',
  //         })
  //           .then(res => {
  //             console.log(res)

  //           })
  //           .catch(error => {

  //             // console.log(error)
  //           })
  //       }
  //     },
  //   }

  // },

  onNavBarItemPress: function(event) {
    // wx.pageScrollTo({
    //   scrollTop: 0
    // })
    this.setData({
      "state.scrollTop":0
    })
    let currenIndex = event.currentTarget.dataset.index;
    let selectedFilterItemIndex = this.data.state.selectedFilterItemIndex || 0;
    if (currenIndex == selectedFilterItemIndex) return;
    this.data.state.selectedLabel = this.data.state.filters[currenIndex].type;
    console.log(this.data.state.selectedLabel)
    this.setData({
      "state.selectedFilterItemIndex": currenIndex,
      "state.selectedLabel": this.data.state.selectedLabel,
      "state.page": 1,
    });

    this.fetchOrderList();
  },

  onOrderItemPress: function(event) {
    const id = event.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: `../orderDetail/orderDetail?id=${id}`,
    })
  },

  formSubmit: function(e) {
    this.onNowPayHandler(e);
    console.log('form发生了submit事件，携带数据为：', e)
  },

  onNowPayHandler: function(event) {
    let _this = this;

    const orderId = event.detail.target.dataset.orderId;
    // const orderFrom = event.detail.orderFrom;
    const formId = event.detail.formId;
    // if (orderFrom == 1) {
    //   _this.setData({
    //     "state.alertingStatus": true,
    //     "state.alertingWords": "请在微信公众号付款"
    //   })
    //   setTimeout(function () {
    //     _this.setData({
    //       "state.alertingStatus": false
    //     })
    //   }, 2000)
    //   return false;
    // }
    if (this.loading) return;
    this.loading = true;
    const url = `${config.ApiRoot}/orders/pay`;

    wx.showLoading({
      title: '加载中',
    })
    userMs.request({
        url,
        data: {
          order_no: orderId, //订单号
          // form_id: formId
        },
        method: 'post',
      })
      .then(res => {
        // console.log(res.data.code)

        if (res.data.code == 10000) {
          var sign = res.data.data
          return wxApi.requestPayment({
            timeStamp: sign.timeStamp,
            nonceStr: sign.nonceStr,
            package: sign.package,
            signType: sign.signType,
            paySign: sign.paySign
          })
        } else {
          this.alertHandler(res.data.msg)
          throw res
        }
      }).then(res => {
        //支付成功
        wx.showToast({
          title: '支付成功!',
        })
        this.loading = false;
        _this.fetchOrderList();


      })
      .catch(error => {
        //支付失败或者取消
        console.log(error)
      })
      .finally(() => {
        wx.hideLoading();
        this.loading = false;
      });
  },

  onCloseComfirmHandler: function() {
    this.setData({
      "state.comfirmBoxStatus": false
    })
  },

  onCancelOrderHandler: function(e) {
    let orderId = e.currentTarget.dataset.orderId;
    let actionObj = {
      submitHandler: "onCancelOrderRequest",
      cancelHandler: "onCloseComfirmHandler",
      cancelWord: "犹豫一下",
      submitWord: "确定取消"
    }
    this.setData({
      "state.actionObj": actionObj,
      "state.comfirmBoxStatus": true,
      "state.selectOrderId": orderId
    })
  },

  onCancelOrderRequest: function() {
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    if (this.loading) return;
    this.loading = true;
    const url = `${config.ApiRoot}/orders/cancel`;

    userMs.request({
        url,
        method: 'PUT',
        data: {
          'order_no': this.data.state.selectOrderId
        }
      })
      .then(res => {
        const {
          code,
          data,
          msg
        } = res.data;
        console.log(res.data)
        
        if (code === 10000) {
          _this.loading = false;
          this.fetchOrderList();
          this.setData({
            "state.comfirmBoxStatus": false
          })
        }else{
          this.alertHandler(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  },
  onDeleteOrderHandler: function(e) {
    let orderId = e.currentTarget.dataset.orderId;
    let actionObj = {
      submitHandler: "onDeleteOrderRequest",
      cancelHandler: "onCloseComfirmHandler",
      cancelWord: "犹豫一下",
      submitWord: "确定删除"
    }
    this.setData({
      "state.actionObj": actionObj,
      "state.comfirmBoxStatus": true,
      "state.selectOrderId": orderId
    })
  },
  onDeleteOrderRequest: function() {
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    if (this.loading) return;
    this.loading = true;
    const url = `${config.ApiRoot}/orders/${this.data.state.selectOrderId}`;

    userMs.request({
        url,
        method: 'DELETE',
      })
      .then(res => {
        const {
          code,
          data,
          msg
        } = res.data;
        console.log(res.data)
        
        if (code === 10000) {
          _this.loading = false;
          this.fetchOrderList();
          this.setData({
            "state.comfirmBoxStatus": false
          })
        }else{
          this.alertHandler(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  },
  onSureReciveHandler: function(e) {
    let orderId = e.currentTarget.dataset.orderId;
    let actionObj = {
      submitHandler: "onSureReciveRequest",
      cancelHandler: "onCloseComfirmHandler",
      cancelWord: "关闭",
      submitWord: "确定收货"
    }
    this.setData({
      "state.actionObj": actionObj,
      "state.comfirmBoxStatus": true,
      "state.selectOrderId": orderId
    })
  },
  onSureReciveRequest: function() {
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    if (this.loading) return;
    this.loading = true;
    const url = `${config.ApiRoot}/orders/confirm`;

    userMs.request({
        url,
        method: 'POST',
        data: {
          'order_no': this.data.state.selectOrderId,
          'version':2
        }
      })
      .then(res => {
        const {
          code,
          data,
          msg
        } = res.data;
        console.log(res.data)
        if (code === 10000) {
          _this.loading = false;
          this.fetchOrderList();
          this.setData({
            "state.comfirmBoxStatus": false
          })
        }else{
          this.alertHandler(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  },
  onPreventDefaultHandler: function() {
    return;
  },
  alertHandler: function(alertText) {
    const _this = this;
    _this.setData({
      "state.alertingStatus": true,
      "state.alertingWords": alertText
    })
    setTimeout(function() {
      _this.setData({
        "state.alertingStatus": false
      })
    }, 2000)
  },
}
pageObj = util.mixin(pageObj, pageContorlMixin);

Page(pageObj)