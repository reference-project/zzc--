const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

function OrderActions() {

  this.onCancelOrderHandler = function(e) {
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
    this.onCancelOrderRequest = function() {
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
            data
          } = res.data;
          console.log(res.data)
          this.alertHandler(res.data.msg)
          if (code === 10000) {
            _this.loading = false;
            this.onNormalCallBackHandler && this.onNormalCallBackHandler();
            this.setData({
              "state.comfirmBoxStatus": false
            })
          };
        })
        .catch(error => console.log(error))
        .finally(() => {
          wx.hideLoading();
          _this.loading = false;
          // wx.stopPullDownRefresh();
        });
    }

  this.onDeleteOrderHandler = function(e) {
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
  }
  this.onDeleteOrderRequest = function() {
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
          data
        } = res.data;
        console.log(res.data)
        this.alertHandler(res.data.msg)
        if (code === 10000) {
          _this.loading = false;
          this.onDeleteCallBackHandler();
          this.setData({
            "state.comfirmBoxStatus": false
          })
        };
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  }
  this.onSureReciveHandler = function(e) {
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
  }
  this.onSureReciveRequest = function() {
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
          this.onNormalCallBackHandler();
          this.setData({
            "state.comfirmBoxStatus": false
          })
        };
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        _this.loading = false;
        // wx.stopPullDownRefresh();
      });
  }
}
module.exports = OrderActions;