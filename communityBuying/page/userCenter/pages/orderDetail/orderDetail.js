// page/userCenter/pages/orderDetail/orderDetail.js
let utils = require("../../../../utils/util.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const data = require("./data.js");
const wxApi = require("../../../../utils/wxApi.js");
const OrderActionsClass = require("../../../../class/orderActions.js");
const UtilActions = require("../../../../class/utilActions.js");
// console.log(OrderActionsClass)
let OrderActions = new OrderActionsClass;
let utilActions = new UtilActions;
// console.log(OrderActions)
let pageObj = {

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
    const id = options.id;
    this.setData({
      "data.orderId": id,
      "state.isIphoneX": app.globalData.isIphoneX
    })
    this.getOrderDetailData(id);

  },
  getOrderDetailData: function(id) {
    const _this = this;
    //const url = `${config.ApiRoot}/orders/${id}`;//老接口
    const url = `${config.ApiRoot}/v2/orders/${id}`;
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    userMs.request({
        url,
        data: {},
        method: 'GET',
      })
      .then(res => {
        const {
          code,
          data
        } = res.data;
        if (code === 10000) {
          if (data.create_time) {
            if (data.status === 0) _this.countDown(data.create_time); //倒计时
            data.create_time = utils.formatTime(new Date(Number(data.create_time) * 1000)); //修改下单时间格式
          }
          if (data.cancel_time) data.cancel_time = utils.formatTimeOblique(new Date(Number(data.cancel_time) * 1000),2);
          // if (data.deliver_time) data.deliver_time = utils.formatTime(new Date(Number(data.deliver_time) * 1000));
          if (data.agent) data.agent_mask = utilActions.formateToShadowText(1, 1, data.agent);
          if (data.agent_mobile) data.agent_mobile_mask = utilActions.formateToShadowText(3, 4, data.agent_mobile);


          //修改产品图片路径，在wxml中拼接会报错
          const doMain = userMs.config["qiniuDomain"]
          if (data.items) data.items.forEach((obj) => {
              obj.goods_logo = doMain + obj.goods_logo;
              obj.sku_logo = doMain + obj.sku_logo;
          });


          let arryProdetail = [];
          let proAdvanceChild = [];
          let proNextChild = [];
          let [proNext, proAdvance, proAdvanceClassif, proNextClassif] = [[],[],[],[]];//定义次日达 预售 预售分类数组
          let [goodsNumber0,goodsNumber1, goodsNumber2, goodsNumber3] = [0,0,0,0];//商品总数

            data.items.forEach((value)=>{

              if (value.arrive_time) value.arrive_time = utils.formatTimeOblique(new Date(Number(value.arrive_time) * 1000),2);
              if (value.refund_time) value.refund_time = utils.formatTimeOblique(new Date(Number(value.refund_time) * 1000), 2);
              if (value.deliver_time) value.deliver_time = utils.formatTimeOblique(new Date(Number(value.deliver_time) * 1000),2)

              if (value.expected_deliver_time) value.expected_deliver_time = utils.formatTimeOblique(new Date(Number(value.expected_deliver_time) * 1000),1)

              if (value.expected_reach_time) value.expected_reach_time = utils.formatTimeOblique(new Date(Number(value.expected_reach_time) * 1000),1)

              if (value.reach_time) value.reach_time = utils.formatTimeOblique(new Date(Number(value.reach_time) * 1000),2)
                
              if (value.type == 1 || value.type == 3) {//次日达和秒杀合并一起
                if (value.number) goodsNumber1 += value.number;
                   proNext.push(value);
              }

              if (value.type == 2) {//预售
                if (value.number) goodsNumber2 += value.number;
                     proAdvance.push(value);
                }
            });
            //数组去重
              function dedupe(array) {
                return Array.from(new Set(array));
              }

            //次日达产品重组数据
            proNext.forEach((item)=>{
              proNextClassif.push(item.status);
            });
             var newproNextClassif = dedupe(proNextClassif);

              newproNextClassif.forEach((item, index)=>{
                  proNextChild.push([]);
                    proNext.forEach((value, i)=>{
                      if (value.status == item) {
                          proNextChild[index].push(value);
                      }
                    })
              });

            //预售产品重组数据
            proAdvance.forEach((item)=>{
               proAdvanceClassif.push(item.status);
            });

           var newproAdvanceClassif = dedupe(proAdvanceClassif);

          newproAdvanceClassif.forEach((item,index)=>{
               proAdvanceChild.push([]);
                proAdvance.forEach((value,i)=>{
                  if (value.status == item){
                       proAdvanceChild[index].push(value);
                  }
                })
          });

            arryProdetail.push(proNextChild, proAdvanceChild);


            data['goods_umber1'] = goodsNumber1;//次日达所以产品的总个数
            data['goods_umber2'] = goodsNumber2;//预售所以产品的总个数
            data['list_data'] = arryProdetail;
           
          console.log("重组数据", data);

          _this.setData({
            "data.qiniuDomain": doMain,
            "data.orderDetail": data
          });
          // 判断是否生成红包，status为2，3，4
          let redStatus = (data.status == 2 || data.status == 3 || data.status == 4 || data.status == 6) && data.shared == 0;
          console.log("红包状态", data.status, redStatus);
          if (redStatus) {
                 this.onCreatePackageRequest();
          }
          if (data.shared && data.current_sharing_red_envelop_activity) {

            let timer = data.current_sharing_red_envelop_activity.end_time - new Date().getTime()/1000;        
            if (timer > 0) {
                data.red_package_status = true;
                _this.setData({
                  "data.orderDetail.red_package_status": true 
                });
            }

          }
        }
      })
      .catch(error => console.log(error))
      .finally(() => wx.hideLoading());
  },
  // 生成订单红包请求
  onCreatePackageRequest: function () {
    const _this = this;
    const id = this.data.data.orderId;
    let orderDetail = this.data.data.orderDetail;
    const url = `${config.ApiRoot}/red-envelop/pool/create`;
    userMs.request({
      url,
      data: {
        order_no:id
      },
      method: 'POST',
    })
      .then(res => {
        const {
          code,
          data,
          msg
        } = res.data;
        if (code === 10000) {
          if (data.has_activity){
            orderDetail.user_id = data.creator;
            orderDetail.shared = 1;
            orderDetail.current_sharing_red_envelop_activity = data.activity;
            orderDetail.red_package_status = true;
            orderDetail.best_envelop_key = data.best_key;
            this.setData({
              "state.shareGroupStatus":true,
              "data.orderDetail": orderDetail
            })
          }
        } else if (code === 10003){
          this.alertHandler(msg);
        }
      })
      .catch(error => console.log(error))
      .finally(() => wx.hideLoading());
  },
  // 分享事件
  onShareAppMessage: function (e) {
    const _this = this;
    let title; // 分享标题
    let path; // 分享路径
    let queryObj; // 分享参数
    if(e.from == "button"){
      queryObj = {
        order_no: this.data.data.orderDetail.no,
        creator: this.data.data.orderDetail.user_id,
        activity_id: this.data.data.orderDetail.current_sharing_red_envelop_activity.id,
        best_envelop_key:this.data.data.orderDetail.best_envelop_key
      }
      queryObj = encodeURIComponent(JSON.stringify(queryObj))
      path = `/page/userCenter/pages/sharePackage/sharePackage?queryObj=${queryObj}`
      title = `大吉大利拼手气，第${this.data.data.orderDetail.best_envelop_key}个领取的人得大红包`
      console.log(queryObj)
    }else{
      queryObj = {
        // 这里loacationObj 必须先JSON.parse，因为用户存的时候JSON.toString()了一下
        locationObj: wx.getStorageSync("locationObj") ? JSON.parse(wx.getStorageSync("locationObj")) : "",
        storeId: wx.getStorageSync("self_store_id") ? wx.getStorageSync("self_store_id") : (wx.getStorageSync("last_user_store_id") ? wx.getStorageSync("last_user_store_id") : "")
      }
      queryObj = encodeURIComponent(JSON.stringify(queryObj))
      path = `/page/tabBar/index/index?queryObj=${queryObj}`
      title = "壹手仓鲜品・严选品质社区团购"
    }
    return {
      title: title, // 分享标题
      // desc: _this.data.productDetail.short_name, // 分享描述
      imageUrl: "/imgs/share-package-bg.png",
      path: path, // 分享路径
      success: function (res) {

      },
      fail: function (res) {
      }
    }
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
    let _this = this;
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

  },
  onCopyHandler: function(e) {
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
  onCallHandler: function(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.showActionSheet({
      itemList: [phone],
      success: function(res) {
        wx.makePhoneCall({
          phoneNumber: phone //仅为示例，并非真实的电话号码
        })
      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  },
  onGoToLogisticsHandler: function(e) {
    const id = e.currentTarget.dataset.tradeNo;
    wx.navigateTo({
      url: `../logistics/logistics?id=${id}`,
    })
  },
  onGoToReturnPageHandler: function(e) {
    wx.navigateTo({
      url: '../returnPage/returnPage',
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
        _this.getOrderDetailData(_this.data.data.orderId);
        app.globalData.isOrderDetailUpdata = true;

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
  onDeleteCallBackHandler: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  onNormalCallBackHandler: function() {
    app.globalData.isOrderDetailUpdata = true;
    this.getOrderDetailData(this.data.data.orderId);
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
  onGoToReturnPageHandler: function(e) {
    let hasReturn = e.currentTarget.dataset.hasReturn;
    let orderDetail = this.data.data.orderDetail;
    let itemIndex = e.currentTarget.dataset.index;
    let currentItem = e.currentTarget.dataset.currentItem;
    orderDetail.currentItem = currentItem;
    orderDetail.qiniuDomain = this.data.data.qiniuDomain;
    if (hasReturn) {
      wx.navigateTo({
        url: `../returnDetailPage/returnDetailPage?orderDetail=${encodeURIComponent(JSON.stringify(orderDetail))}`,
      })
    } else {
      wx.navigateTo({
        url: `../returnPage/returnPage?orderDetail=${encodeURIComponent(JSON.stringify(orderDetail))}`,
      })
    }

  },

  countDown(time) {
    const lastTime = (time + 30 * 60) * 1000 - new Date().getTime();
    if (lastTime > 0) {
      this.setData({
        'data.countDown': utils.formatTime2(new Date(Number(lastTime)))
      });
      setTimeout(() => {
        this.countDown(time);
      }, 1000);
    } else {
      //进入取消状态，并且显示超时
      this.setData({
        'data.orderDetail.status': -1,
        'data.orderDetail.cancel_type': 1
      });
      app.globalData.isOrderDetailUpdata = true;
    }
  },
  ...OrderActions,
  onChangeShareGroupStatusHandler:function(){
    this.setData({
      "state.shareGroupStatus": !this.data.state.shareGroupStatus
    })
  }
}
Page(pageObj)