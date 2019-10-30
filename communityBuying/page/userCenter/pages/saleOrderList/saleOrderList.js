// page/userCenter/pages/saleOrder/saleOrderList.js

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
  onLoad: function (options) {

    const {
      type
    } = options;
    if (type) {
      if (type == "detailList"){
        wx.setNavigationBarTitle({
          title: '订单明细'
        });
      }else{
        wx.setNavigationBarTitle({
          title: '销售订单'
        });
      }
      this.setData({
        "state.selectedLabel": type
      })
      this.onFetchSaleOrdersData();
    }
    // this.fetchOrderList();

  },
  onFetchSaleOrdersData: function () {
    if (this.loading) return;
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
    if (this.data.state.selectedLabel == 'detailList'){
      data.data.status = this.data.state.saleTypeFilters[this.data.state.selectSaleTypeIndex].value;
    }else{
      data.data.range = this.data.state.saleTimeFilters[this.data.state.selectSaleTimeIndex].value;
    }
    

    wx.showLoading({
      title: '加载中',
      mask:true,
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
          "data.totalPage": data.last_page,
          "data.qiniuDomain": userMs.config["qiniuDomain"],
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
  fetchOrderList: function () {
    app.globalData.isOrderDetailUpdata = false;
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    if (this.loading) return;
    this.loading = true;
    const filterItem = _this.data.state.filters[_this.data.state.selectedFilterItemIndex];
    const url = `${config.ApiRoot}/orders`;
    this.setData({
      "state.loading": true
    });
    let queryObj = {
      page: _this.data.state.page,
      limit: 10,
    }
    if (filterItem.type === "all") {
      queryObj.status = -2;
    } else if (filterItem.type === "afterSale") {
      queryObj.after_sale = 1;
    } else {
      queryObj.status = filterItem.value;
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
        console.log(res.data)
        if (code === 10000) {
          _this.setData({
            'data.products': _this.data.state.page > 1 ? _this.data.data.products.concat(data.data) : _this.checkTime(data.data),
            'data.totalPage': data.last_page,
            "state.loading": false,
            "data.qiniuDomain": userMs.config["qiniuDomain"]
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

  /**检查时间格式 */
  checkTime(list) {
    list.forEach((item) => {
      item['create_time'] = util.formatTime(new Date(item['create_time'] * 1000));
    });
    return list;
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
    if (this.data.data.saleDataOrders && this.data.data.saleDataOrders.length > 0 && !this.loading) {
      this.fetchNextPage(this.onFetchSaleOrdersData);
    }
  },

  formSubmit: function (e) {
    this.onNowPayHandler(e);
    console.log('form发生了submit事件，携带数据为：', e)
  },


  onCloseComfirmHandler: function () {
    this.setData({
      "state.comfirmBoxStatus": false
    })
  },
  
  onSureReciveHandler: function (e) {
    let orderId = e.currentTarget.dataset.orderId;
    let actionObj = {
      submitHandler: "onSureReciveRequest",
      cancelHandler: "onCloseComfirmHandler",
      cancelWord: "关闭",
      submitWord: "确认取货"
    }
    this.setData({
      "state.actionObj": actionObj,
      "state.comfirmBoxStatus": true,
      "state.selectOrderId": orderId
    })
  },
  onSureReciveRequest: function () {
    const _this = this;
    // const page = this.data.state.page;
    wx.showLoading({
      title: '加载中',
    })
    if (this.loading) return;
    this.loading = true;
    const url = `${config.ApiRoot}/sales/orders/confirm`;

    userMs.request({
      url,
      method: 'POST',
      data: {
        'order_no': this.data.state.selectOrderId
      }
    })
      .then(res => {
        const {
          code,
          data
        } = res.data;
        console.log(res.data)
        this.alertHandler(res.data.msg)
        if (code === 10000) {
          _this.loading = false;
          _this.onFetchSaleOrdersData();
          this.setData({
            "state.comfirmBoxStatus": false
          })
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  },
  onPreventDefaultHandler: function () {
    return;
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
  onSelectSaleTypeHandler: function (e) {
    wx.pageScrollTo({
      scrollTop: 0
    })
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;
    if (type == this.data.state.selectSaleType) return;
    this.setData({
      "state.selectSaleType": type,
      "state.selectSaleTypeIndex": index,
      "state.page":1
    })
    this.onFetchSaleOrdersData();
  },
  onSelectSaleTimeHandler: function (e) {
    wx.pageScrollTo({
      scrollTop: 0
    })
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;
    if (type == this.data.state.selectSaleTime) return;
    this.setData({
      "state.selectSaleTime": type,
      "state.selectSaleTimeIndex": index,
      "state.page": 1
    })
    this.onFetchSaleOrdersData();
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
}
pageObj = util.mixin(pageObj, pageContorlMixin);

Page(pageObj)