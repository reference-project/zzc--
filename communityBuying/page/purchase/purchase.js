// page/purchase/purchase.js
const data = require("./data.js");
const wxApi = require("../../utils/wxApi.js");

//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const UtilActions = require("../../class/utilActions.js");
let utilActions = new UtilActions;

// 引用封装的本地存储函数
const storageHandler = require("../../utils/localStorage.js");
const util = require("../../utils/util.js");
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
        title: '订单确认',
      });

    if (options.queryObj){
      let queryObj = JSON.parse(decodeURIComponent(options.queryObj));
      let arryProducts = []
      let arryTime = [];

      queryObj.products.forEach((item)=>{
        arryTime.push(this.getTimeDays(item.expected_reach_time))
      });

     function formatDedupeArr(array) {
        return Array.from(new Set(array))
      }

      arryTime = formatDedupeArr(arryTime);
      console.log("遍历出来的时间", arryTime);
      //相同时间的数据重新分组
      arryTime.forEach((item,num)=>{
         arryProducts.push([]);
        queryObj.products.forEach((v, index)=>{
          if (this.getTimeDays(v.expected_reach_time) == item) { //判断日期相等的数据
            if (v.expected_reach_time) v.expected_reach_time = util.formatTimeWithoutYear2(new Date(Number(v.expected_reach_time) * 1000));
               arryProducts[num].push(v);
          }
        })
      });

        console.log("订单确认页面数据", arryProducts);

        this.setData({
          "data.productsRecom": arryProducts,
          "data.products": queryObj.products,
          "state.isFromCart": queryObj.isFromCart,
          "state.isFormProductDetail": queryObj.isFormProductDetail,
          "state.isIphoneX": app.globalData.isIphoneX,
          "data.qiniuDomain": userMs.config["qiniuDomain"]
        })
        this.oncomputedHandler();
    }
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
    // this.getAddress();
    // let self_store_id = wx.getStorageSync("self_store_id");
    // let last_user_store_id = wx.getStorageSync("last_user_store_id");
    // let localAddress = wx.getStorageSync("address");
    // if(self_store_id && !localAddress){
    //   this.getStoreIdAddress(self_store_id)
    // } else if (last_user_store_id && !localAddress){
    //   this.getStoreIdAddress(last_user_store_id)
    // }else{
    //   this.onGetAddressList();
    // }
    let communityObj = wx.getStorageSync("communityObj");
    if (communityObj){
      this.setData({
        "state.address": JSON.parse(communityObj)
      })
      // 必须本地先选择了地址，因为可用红包需要判断门店id
      this.onFetchPackageAbleListHandler();
    }

    let pickUpUserInfo = storageHandler.getStorage("pickUpUserInfo");
    if (pickUpUserInfo){
      pickUpUserInfo = JSON.parse(pickUpUserInfo);
      this.setData({
        "data.buyerName": pickUpUserInfo.buyerName,
        "data.buyerPhone": pickUpUserInfo.buyerPhone,
        "data.buyerText": pickUpUserInfo.buyerText
      })
    }else{
      // 看后台报错，userInfo有时候为undefined，
      // 猜测是 网络原因，导致拿不到
      // 所以多加一层判断
      let userInfo = config.userInfo;
      if(userInfo){
        this.setData({
          "data.buyerName": userInfo.nickname,
          "data.buyerPhone": userInfo.mobile,
        })
      }
    }
    // this.onOpenSettingNeedBtn();
    // this.onFetchFree();
  },
   //获取时间搓时间day
  getTimeDays: function (tamp){
    var now = new Date(Number(tamp)*1000); 
    var day = now.getDate(); 
    var month = now.getMonth()+1; 
    return month + '/' + day;   
   },
  // 通过门店id 获取门店地址函数
  getStoreIdAddress:function(id){
    let _this = this;
    let url = `${config.ApiRoot}/store/related-merchant`;
    
    let data = {
      url,
      data:{
        store_id:id
      }
    }
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          if(data && data.store_status == 1){
            data.canSeedName = utilActions.formateToShadowText(1,1,data.contact);
            data.canSeedMobile = utilActions.formateToShadowText(3, 4, data.mobile);
            let address = {
              ...data,
              id:id,
              address: data.store_address + data.community_name,
              name: data.store_name
            }
            this.setData({
              "state.address": address
            })
            // 必须本地先选择了地址，因为可用红包需要判断门店id
            this.onFetchPackageAbleListHandler();
          }else{
            // this.onGetAddressList();
          }
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        wx.hideLoading();
      })
  },
  //点击件数按钮下拉出产品
  onSwitchHeightHandler:function(){

      this.setData({
        "state.switchHeight": !this.data.state.switchHeight
      });
  },
  // 获取配送费接口 目前没用上
  onFetchFree:function(){
    let _this = this;
    let id = this.data.data.id;
    let url = `${config.ApiRoot}/freight/calculate`;
    let arr = [];
    this.data.data.products.forEach(item =>{
      arr.push(item.goods_id)
    })
    let data = {
      url,
      method: "POST",
      data:{
        goods_ids: arr
      }
    }
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          
          _this.setData({
            "data.fee": data.fee,
          })

          this.oncomputedHandler();
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        wx.hideLoading();
      })
  },

  // 获取可用红包请求
  onFetchPackageAbleListHandler: function () {
    if (!this.data.state.address){
      return false;
    }
    let _this = this;
    let id = this.data.data.id;
    let url = `${config.ApiRoot}/red-envelop/available-items`;
    let queryObj = {
      store_id:this.data.state.address.id
    };
    let arr = [];
    this.data.data.products.forEach(item => {
      let obj={
        activity_goods_id: item.activity_goods_id,
        goods_id: item.goods_id,
        sku_id: item.sku_id,
        number: item.num,
        type:item.type
      }
      arr.push(obj)
    })
    queryObj.goods = arr;
    if (wx.getStorageSync("communityObj")) {
      queryObj.adcode = JSON.parse(wx.getStorageSync("communityObj")).adcode
    }
    
    let data = {
      url,
      method:"POST",
      data: queryObj
    }
    userMs.request(data)
    .then(res => {
    const { data, code, msg } = res.data
    if (code == 10000) {
      let canUsePackageNum = 0;
      data.forEach(item=>{
        item.deadlineUtil = util.formatTimeToDay(new Date(item.deadline * 1000));
        let matchArr = this.splitIntFloat(item.amount / 100);
        item.amountInt = matchArr[1];
        item.amountFloat = matchArr[2] ? matchArr[2] : "";
        item.available && ++canUsePackageNum;
      })
      this.setData({
        "data.packageList":data,
        "data.canUsePackageNum": canUsePackageNum
      })
    }
    }).catch(err => {
      console.log(err)
    });

  },
  // 切割整数小数部分函数
  splitIntFloat: util.splitIntFloat,
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

  // alert 提示function
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
    this.formId=e.detail.formId;
    // this.onGotoProductDetail();
    this.onCheckValueHandler();
    console.log('form发生了submit事件，携带数据为：', e)
  },

  // 判断字段是否合法
  onCheckValueHandler:function(){
    if (!this.data.state.address) {
      this.alertHandler("请选择收货地址");
      return;
    }
    if (!this.data.data.buyerName) {
      this.alertHandler("请填写提货人姓名");
      return;
    }
    if (!this.data.data.buyerPhone) {
      this.alertHandler("请填写提货人电话");
      return;
    }
    let reg = /^1[3456789]\d{9}$/;

    if (!reg.test(this.data.data.buyerPhone)) {
      this.alertHandler("请填写合法手机号");
      return;
    }
    this.setData({
      "state.onComfirmBoxStatus":true,
      "data.buyerName": this.data.data.buyerName,
      "data.buyerPhone": this.data.data.buyerPhone,
      "data.buyerText": this.data.data.buyerText
    })
  },

  // 创建订单 && 支付事件
  onSureOrderComfirmHandler: function () {
    const _this = this;
    if (this.payingStatus) return;
    this.payingStatus = true;
    wx.showLoading({
      title: '支付中...',
    })
    let queryObj = {
      pay_type: 1,
      from_type: 1,
      store_id: this.data.state.address.id,
      channel_id: 1,
      // activity_id: 0,
      // integral: 0,
      // coupon_id: 0,
      adcode: 440106,
      // invoice_apply: 0,
      remark: this.data.data.buyerText,
      items: [],
      form_id: _this.formId,
      from_cart:0,
      receiver: this.data.data.buyerName,
      mobile: this.data.data.buyerPhone,
      red_envelop_id: this.data.data.selectPackageItem ? this.data.data.selectPackageItem.id:0
    }

    if(this.data.state.isFromCart){//购物车来源
      queryObj.from_cart = 1;
      this.data.data.products.forEach(item => {
        queryObj.items.push({
          cart_id: item.id,
          activity_goods_id: item.activity_goods_id,
          number: item.num,
          type:item.type,
          recommend_from: item.recommend_from// 推荐来源
        })
      })
    }else{
      this.data.data.products.forEach(item => {
        queryObj.items.push({
          number: item.num,
          activity_goods_id: item.activity_goods_id,
          type: item.type,
          recommend_from: item.recommend_from// 推荐来源
        })
      })
    }
    const url = `${config.ApiRoot}/orders`;
    //请求创建订单
    userMs.request({
      url,
      data: queryObj,
      method: 'post',
    })
      .then(res => {
        const {data,code,msg} = res.data;
        const url = `${config.ApiRoot}/orders/pay`;
        // 有时候报错，返回的字段不符合规则，此时code 为undefined
        // 比如不兼容旧接口 导致报错
        if(code > 10000 || code == undefined){
          _this.alertHandler(msg);
          throw res;
        }
        
        this.setData({
          "data.order_no": data.order_no
        })
        // 下完订单，把收货人跟收获电话备注等保存本地
        let pickUpUserInfo={
          buyerName: this.data.data.buyerName,
          buyerPhone: this.data.data.buyerPhone,
          buyerText: this.data.data.buyerText
        }
        storageHandler.setStorage('pickUpUserInfo',JSON.stringify(pickUpUserInfo));

        // 如果是店主，下完单判断下，是否删除本地address
        let self_store_id =  wx.getStorageSync("self_store_id");
        if (self_store_id){
          let localAddress = this.data.state.address;
          localAddress.id != self_store_id && wx.removeStorageSync("address");
        }
        

        userMs.request({
          url,
          data: {
            order_no: data.order_no, //订单号
          },
          method: 'post',
        })
          .then(res => {
            const {code,data,msg} = res.data
            
            
            if (code == 10000) {
              // 这个字段判断红包抵扣大于商品金额
              if (data.free) {
                return;
              }
              var sign = data
              return wxApi.requestPayment({
                timeStamp: sign.timeStamp,
                nonceStr: sign.nonceStr,
                package: sign.package,
                signType: sign.signType,
                paySign: sign.paySign
              })
            } else { 
              msg && _this.alertHandler(msg);
              throw res;
              }
          }).then(res => {
            //支付成功
            wx.showToast({
              title: '支付成功!',
            })

            setTimeout(function () {
              wx.redirectTo({
                url: '/page/userCenter/pages/orderDetail/orderDetail?id=' + _this.data.data.order_no
              })
            }, 1000);

          })
          .catch(error => {
            console.log(error)
            
            
            //支付失败或者取消
            if (error.errMsg === "requestPayment:fail cancel" || error.errMsg === "requestPayment:fail 等待超时，请重试") {
              wx.redirectTo({
                url: '/page/userCenter/pages/orderDetail/orderDetail?id=' + this.data.data.order_no,
                mask: 'true'
              })
            }else{
              if (error && error.data && error.data.msg) {
                this.alertHandler(error.data.msg)
              } else {
                this.alertHandler(JSON.stringify(error).substr(0, 200))
              }
            }
          })
      })
      .catch(err => {
        if (err && err.data && err.data.msg) {
          this.alertHandler(err.data.msg)
        }
        else if (err && err.message) {
          this.alertHandler(err.message)
        }  
        else {
          this.alertHandler(JSON.stringify(err).substr(0, 200))
        }
        console.log(err)
      })
      .finally(() => {
        this.payingStatus = false
        wx.hideLoading()
      });
  },

  // 之前地址直接保存在本地，现在每次都请求接口，获取地址列表
  // 当用户本地没有地址时，则提示点击添加收获地址
  // 当用户本地有地址，则拿地址列表遍历一遍，如果该地址未被删除，则显示，否则提示点击添加收获地址
  onGetAddressList:function(){
    let _this = this;
    let url = `${config.ApiRoot}/store/list`;
    let locationObj = wx.getStorageSync("locationObj")
    if(locationObj){
      locationObj = JSON.parse(locationObj)
    }
    let queryObj = {
      adcode: locationObj.adcode
    };
    if (locationObj.com) {
      queryObj.community_id = locationObj.com.id
    }
    let data = {
      url,
      data: queryObj
    }
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          let localAddress = wx.getStorageSync("address");
          let address=""; // 判断本地地址是否可用，再赋值给该变量
          if(!localAddress){

          }else{
            localAddress = JSON.parse(localAddress);
            data.forEach(item=>{
              if(item.id== localAddress.id){
                // 如果接口的地址跟本地地址 id相同，则更新接口地址到本地
                item.canSeedName = utilActions.formateToShadowText(1, 1, item.contact);
                item.canSeedMobile = utilActions.formateToShadowText(3, 4, item.mobile);
                
                wx.setStorageSync("address", JSON.stringify(item))
                address=item
              }
            })
          }
          this.setData({
            "state.address": address
          })
          // 必须本地先选择了地址，因为可用红包需要判断门店id
          this.onFetchPackageAbleListHandler();
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        wx.hideLoading();
      })
  },

  // 获取本地地址
  getAddress: function () {
    const _this = this;

    wxApi.getStorage({ key: 'address' })
      .then(res => {
        const address = JSON.parse(res.data);
        _this.setData({
          "state.address": address
        });
      })
      .catch(error => console.log(error));
  },

  // 
  onOpenSettingNeedBtn:function(){
    wxApi.getSetting().then(res => {
      console.log(res)
      if (res.authSetting["scope.address"] !== undefined && res.authSetting["scope.address"] === false) {
        if (wx.canIUse("button.open-type.openSetting")) {
          this.setData({
            "state.needOpenSettingBtn": true
          })
        } else {

        }
      }

    })
  },

  // 第一次调用获取地址授权事件
  onSelectAddress: function () {

    const _this = this;

    wxApi.authorize({
      scope: "scope.address"
    }).catch(e => {
      return wxApi.openSetting().then(res => {
        if (res.authSetting["scope.address"]) {
          return;
        } else {
          throw "授权失败！";
        }
      }).catch(err => {
        // 这里的思路是，先让用户授权地址，用户拒绝以后，先进入一次设置页
        // 如果 opensetting api 报错，
        // 如果是 用户自己取消授权，则不是api 报错
        // 否则使用button open-type 为 opensetting
        if (typeof err === "string") {
          throw "授权失败！";
        } else {
          _this.setData({
            "state.needOpenSettingBtn": true
          })
        }
      })

    }).then(() => {
      return wxApi.chooseAddress()
        .then(res => {
          delete res.errMsg;

          _this.setData({
            "state.address": res
          });

          return wxApi.setStorage({
            key: "address",
            data: JSON.stringify(res)
          })
        });
    }).catch(err => {
      if (typeof err === "string") {
        wx.showToast({
          title: err,
          image: "/imgs/cancel.png",
          duration: 2000
        });
      }
    });
  },

  // 打开设置页面回调函数判断地址
  // openSettingHandler: function (e) {
  //   let _this = this;
  //   if (e.detail.authSetting && e.detail.authSetting["scope.address"]) {
  //     this.setData({
  //       "state.needOpenSettingBtn": false
  //     })
  //     wxApi.chooseAddress()
  //       .then(res => {
  //         delete res.errMsg;

  //         _this.setData({
  //           "state.address": res
  //         });

  //         return wxApi.setStorage({
  //           key: "address",
  //           data: JSON.stringify(res)
  //         })
  //       })
  //       .catch(err => {
  //         console.log(err)
  //       });
  //     console.log(e)
  //   } else {
  //     wx.showToast({
  //       title: "授权失败",
  //       image: "/imgs/cancel.png",
  //       duration: 2000
  //     });
  //   }
  // },

  // 数量减事件
  // onNumDescHandler:function(e){
  //   let index = e.currentTarget.dataset.index;
  //   this.data.data.products[index].num--;
  //   this.setData({
  //     "data.products": this.data.data.products
  //   })
  //   this.oncomputedHandler();
  // },

  // 数量加事件
  // onNumAddHandler: function(e){
  //   let index = e.currentTarget.dataset.index;
    
  //   this.data.data.products[index].num++;
  //   this.setData({
  //     "data.products": this.data.data.products
  //   })
  //   this.oncomputedHandler();
  // },

  // 计算商品总价function
  oncomputedHandler:function(){
    let goodsPrice=0;
    this.data.data.products.forEach(item => {
      goodsPrice = Number((item.num * item.our_price + goodsPrice).toFixed(2))
    })
    this.setData({
      "state.goodsPrice" : goodsPrice,
    })
  },

  // 选择门店事件
  onGotoLocationListHandler:function(){
    wx.navigateTo({
      url: `../index/pages/location/location`,
    })
  },

  // 输入买家姓名事件
  onInputBuyerNameHandler:function(e){
    this.data.data.buyerName = e.detail.value;
  },

  // 输入买家手机号事件
  onInputBuyerPhoneHandler: function (e) {
    this.data.data.buyerPhone = e.detail.value;
  },

  // 输入备注事件
  onInputBuyerTextHandler: function (e) {
    this.data.data.buyerText = e.detail.value;
  },

  // 关闭订单确认弹窗事件
  onCloseOrderComfirmHandler:function(e){
    this.setData({
      "state.onComfirmBoxStatus":false
    })
  },

  // 打开关闭选择红包弹窗
  onChangePackageBoxStatusHandler:function(){
    this.setData({
      "state.choosePackageStatus": !this.data.state.choosePackageStatus
    })
  },

  // 选择不用红包事件
  onCancelUsePackageHandler:function(){
    this.setData({
      "state.choosePackageStatus": false,
      "data.selectPackageItem": ""
    })
  },


  // 选择红包回调事件
  onChoosePackageItemHandler:function(e){
    if (this.data.data.selectPackageItem.id !== e.detail.id){
      this.setData({
        "data.selectPackageItem":e.detail
      })
    }
    let totalPrice = this.data.state.goodsPrice - this.data.data.selectPackageItem.amount;
    this.setData({
      "state.choosePackageStatus": false,
      "state.totalPrice": totalPrice > 0 ? totalPrice:0
    })
  }
}
Page(pageObj)