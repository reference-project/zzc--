// components/rushBuyingItem/rushBuyingItem.js

const wxApi = require("../../utils/wxApi.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
let config = userMs.config;
// 通过监测properties 的productItem 的totalBuyNum值
// 本地setData一个totalBuyNum值，在组件内部处理购物车逻辑
// 在每次处理完购物车逻辑后，触发父组件更新底部导航栏的数量显示逻辑

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    domain: {
      type: String,
      value: ""
    },
    productItem:{
      type: Object,
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        // newVal.proportion = ((newVal.stock / (newVal.invented_sell + newVal.stock)) * 236).toFixed(0);
        // this.setData({
        //   productItem:newVal
        // })
        if (newVal != oldVal) {
          this.setData({
            totalBuyNum: newVal.totalBuyNum ? newVal.totalBuyNum:0,
            cartId: newVal.cartId ? newVal.cartId:0
          })
        }
      }
    },
    activityEnd:{
      type: Boolean,
      value: false
    },
    proType:{
      type: String,
      value: "now"
    },
    pageUrl:{
      type:String,
      value:""
    }
    // totalBuyNum:{
    //   type:Number,
    //   value:0,
    //   observer: function (newVal, oldVal){
    //     if(newVal != oldVal){
    //       this.setData({
    //         totalBuyNum:1
    //       })
    //     }
    //   }
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
    totalBuyNum:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGoToProductDetail: function () {
      let queryObj = {
        isGroupBuyStatus: false,
        activityId: this.properties.productItem.id,
        type: this.properties.productItem.type ? this.properties.productItem.type:1
      };
  
      wx.navigateTo({
        url: `/page/productDetail/productDetail?queryObj=${encodeURIComponent(JSON.stringify(queryObj))}`,
      })
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
    onAddHandler:function(){
      this.onUpdateCartData("add")
    },
    onDescHandler:function(){
      if (this.properties.totalBuyNum>1){
        this.onUpdateCartData("desc");
      }else{
        this.onDeleteRequest([this.data.cartId]);
      }
      
    },
    // 删除请求，删除成功后
    onDeleteRequest: function (deleteIds) {
      const _this = this;
      wx.showLoading({
        title: '加载中',
      })
      const url = `${config.ApiRoot}/cart`;

      userMs.request({
        url,
        method: 'delete',
        data: {
          ids: deleteIds
        }
      })
        .then(res => {
          const { code, data } = res.data;
          console.log(res.data)
          if (code === 10000) {
            app.globalData.cartItemNumber = app.globalData.cartItemNumber -1;
            this.setData({
              totalBuyNum: 0
            })
            this.triggerEvent("cartevent")
          };
        })
        .catch(error => console.log(error))
        .finally(() => {
          wx.hideLoading();
        });
    },
    onAddToCartHandler:function(){
      this.onUpdateCartData("add")
    },
    // 加入购物车请求事件
    onUpdateCartData: function (type) {
      wxApi.getSetting().then(res => {
        if (res.authSetting["scope.userInfo"]) {
          let _this = this;
          let { productItem } = this.properties;
          let url = `${config.ApiRoot}/cart`;
          // let locationObj = wx.getStorageSync("locationObj");
          let locationObj = wx.getStorageSync("communityObj");
          if (locationObj) {
            locationObj = JSON.parse(locationObj)
          }
          let queryObj = {
            "activity_goods_id": productItem.id,
            "goods_id": productItem.goods_id,
            "sku_id": productItem.sku_id,
            "selected": 1,
            "adcode": locationObj.adcode,
            "type": productItem.type ? productItem.type : 1
          }
          switch (type) {
            case "add":
              queryObj.num = 1;
              break;
            case "desc":
              queryObj.num = -1;
              break;
            // case "select":
            //   queryObj.selected = !skuDataItem.selected;
            //   break;
          }
          let data = {
            url,
            method: "POST",
            data: [
              queryObj
            ]
          }
          // 这里必须做状态判断，否则，用户连续点击，就会连续触发请求
          if (this.data.updateLoading) return;
          this.data.updateLoading = true;
          wx.showLoading({
            title: '加入购物车中',
          })
          userMs.request(data)
            .then(res => {
              const { data, code, msg } = res.data
              if (code == 10000) {
                
                let totalBuyNum = type == "add" ? this.data.totalBuyNum + 1 : this.data.totalBuyNum-1;
                wx.hideLoading(); // showToast 之前必须hideLoading
                if (type == "add" && totalBuyNum ==1){
                  wx.showToast({
                    title: '已加入购物车',
                    duration:2000
                  })
                }
                _this.setData({
                  "totalBuyNum": totalBuyNum,
                  "cartId": data.cart_ids?data.cart_ids[0]:0
                })
                // 首页加入购物车，设置app.globalData.cartItemNumber
                // 这里判断显示一下
                // wx.setTabBarBadge 这个方法只能设置当前看得到的页面，导航栏页面触发，才有效
                // 即只能在tabBar页面进行设置，否则跳回到tabBar页就看不到了
                app.globalData.cartItemNumber = data.cart_item_number
                this.triggerEvent("cartevent")
              } else {
                this.alertHandler(msg)
                throw res;
              }
            })
            .catch(err => {
              console.log(err)
            })
            .finally(res => {
              this.data.updateLoading = false;
              wx.hideLoading();
            })
        }else{
          wx.navigateTo({
            url: '/page/userCenter/pages/login/login',
          })
        }
      })

      
    },
  }
})
