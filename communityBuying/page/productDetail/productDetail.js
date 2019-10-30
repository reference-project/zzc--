// page/productDetail/productDetail.js
const data = require("./data.js");
const wxApi = require("../../utils/wxApi.js");
const UtilActions = require("../../class/utilActions.js");
let utilActions = new UtilActions;

//获取应用实例
const app = getApp()
var userMs = app.userMs;
var config = userMs.config;
const storageHandler = require("../../utils/localStorage.js");
const util = require("../../utils/util.js");
const eventHandler = require("../../utils/event.js");

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
      title: '商品详情',
    })
    
    if(options.queryObj){
      let queryObj = JSON.parse(decodeURIComponent(options.queryObj));
      console.log('跳转带过来的参数', queryObj)
      // 这个字段，给debug页面，判断点击的卡片，携带的数据有哪些
      wx.setStorageSync("last_query_obj", JSON.stringify(queryObj))
      this.setData({
        "data.isGroupBuyStatus": queryObj.isGroupBuyStatus ? queryObj.isGroupBuyStatus:false,
        "data.activityId": queryObj.activityId,
        "data.type": queryObj.type ? queryObj.type:1, // 2为预售商品，1为正常商品
      });
      // queryObj.storeId && (userMs.config.storeId = queryObj.storeId)
      // queryObj.locationObj && (userMs.config.locationObj = queryObj.locationObj)
      // if (queryObj.storeId || queryObj.locationObj){
      //    this.onFetchUserInfoHandler();
      // }
      
      // 本地社区信息
      let communityLocal = wx.getStorageSync("communityObj");
      // 如果分享的参数有社区信息
      if (queryObj.communityObj){
        // 如果本地没有社区信息，则被覆盖
        if (!communityLocal){
          wx.setStorageSync("communityObj",JSON.stringify(queryObj.communityObj))
        }else{
          // 如果本地的社区id 跟 参数的社区id 不同，则前往选择页面
          if (JSON.parse(communityLocal).id != queryObj.communityObj.id){
            // this.data.state.communityCur = queryObj.communityObj;
            let queryObjN = {
              communityObj: queryObj.communityObj
            }
            queryObjN = encodeURIComponent(JSON.stringify(queryObjN))
            wx.navigateTo({
              url: `../index/pages/compareCommunity/compareCommunity?queryObj=${queryObjN}`,
            })
          }
          
          
        }
      }
      // console.log(userMs.config)
      // queryObj.storeId && wx.setStorageSync("last_user_store_id", queryObj.storeId);
      // userMs.config.isonLunchStatus && this.onSetStorageHandler();
      this.onFetchProductDetail();
    }
    // options.scene = encodeURIComponent("sid=255")
    /**
         * 新场景值
         * a => adcode
         * g => activity_goods_id
         * t => type
         * s => store_id
         * c => community_id
         *
         * a=120100&g=11612&t=1&s=13&c=1
         */
    // 扫描小程序码进入页面，获取参数
    if (options.scene) {
      let sceneString = decodeURIComponent(options.scene);
      let arr = sceneString.split("&");
      let obj = {};
      for (let i = 0; i < arr.length; i++) {
        obj[arr[i].split("=")[0]] = arr[i].split("=")[1]
      }
      console.log(obj)
      // 扫码进入的参数 保存到本地，方便排查线上问题
      wx.setStorageSync("sceneObj", JSON.stringify(obj))
      this.setData({
        "data.activityId": obj.g,
        "data.type":obj.t,
        "data.isGroupBuyStatus": false
      });

      // 定位地址id
      // if (obj.a){
      //   this.onFetchLocationRequest(obj.a,obj.c)
      // }
      // 门店id
      // obj.s && (userMs.config.storeId = obj.s)
      if(obj.s){
        this.getStoreIdAddress(obj.s);
      }
      // userMs.config.isonLunchStatus && this.onSetStorageHandler();
      this.onFetchProductDetail();
    }
    // 获取系统信息
    this.getSystemInfoHandler();
    this.checkArriveTimeHandler(); // 判断送达时间函数
  },

  // 通过门店id 获取门店地址函数
  getStoreIdAddress: function (id) {
    let _this = this;
    let url = `${config.ApiRoot}/store/related-merchant`;

    let data = {
      url,
      data: {
        store_id: id
      }
    }
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          if (data && data.store_status == 1) {
            // data.canSeedName = utilActions.formateToShadowText(1, 1, data.contact);
            // data.canSeedMobile = utilActions.formateToShadowText(3, 4, data.mobile);
            let address = {
              ...data,
              id: id,
              address: data.store_address + data.community_name,
              name: data.store_name
            }
            // 本地社区信息
            let communityLocal = wx.getStorageSync("communityObj");
            // 如果本地没有社区门店信息，则直接被覆盖
            if(!communityLocal){
              wx.setStorageSync("communityObj", JSON.stringify(address))
            }else{
              // 如果本地的社区id跟此次卡片的不同，则进入选择页面
              if (JSON.parse(communityLocal).id != address.id) {
                // this.data.state.communityCur = address;
                let queryObjN = {
                  communityObj: address
                }
                queryObjN = encodeURIComponent(JSON.stringify(queryObjN))
                wx.navigateTo({
                  url: `../index/pages/compareCommunity/compareCommunity?queryObj=${queryObjN}`,
                })
              }
            }
            // this.setData({
            //   "state.address": address
            // })
            // 必须本地先选择了地址，因为可用红包需要判断门店id
            // this.onFetchPackageAbleListHandler();
          } else {
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
  //父级定义函数
  onParentEvent:function(e){
    let detailIndex = e.detail.index;//子级传过来的点击当前产品
    this.data.data.likeProData[detailIndex].num++;

    this.setData({
      "data.likeProData": this.data.data.likeProData,
      "state.cartItemNumber": app.globalData.cartItemNumber//更新详情页面底部小红点数量
    });

  },
  //猜你喜欢数据
  getLikeData: function (goodsId) {
    let queryObj = {
      cart_goods_ids: [],//购物车页面
      being_browsed_goods_id: goodsId, // 正在浏览的商品id
      search_page: 0,   // 是否在搜索页
      search_result_goods_ids: [] // 搜索页搜索结果商品id列表
    };

    let url = `${config.ApiRoot}/marketing/recommend`;
    if (wx.getStorageSync("communityObj")) {
      queryObj.adcode = JSON.parse(wx.getStorageSync("communityObj")).adcode
    }

    let data = {
      url,
      method: "POST",
      data: queryObj
    }

    wxApi.request(data)
      .then(res => {

        const { data, code, msg } = res.data;

        if (code == 10000) { //

          data.forEach((item) => {
            if (item.goods_logo) {
                item.goods_logo = userMs.config["qiniuDomain"] + item.goods_logo;
            }
            item.num = 0;
            item.recommend_from = 2;
          });

          this.setData({
            "data.likeProData": data,
            "state.likeProStaus": data.length > 0 ? true : false
          });
        }

      }).catch(err => {
        console.log(err)
      })
  },
  // 判断送达时间函数
  checkArriveTimeHandler:function(){
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let arriveDay = "";
    let arriveMonth = "";
    let afterTomorrowStatus = false
    if (currentHour >= 22) {
      afterTomorrowStatus = true;
      let afterTomorrowDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 2 * 1000);
      arriveDay = afterTomorrowDate.getDate();
      arriveMonth = afterTomorrowDate.getMonth() + 1;
    } else {
      let nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      arriveDay = nextDate.getDate();
      arriveMonth = nextDate.getMonth() + 1;
    }
    this.setData({
      "data.afterTomorrowStatus": afterTomorrowStatus,
      "data.arriveMonth": arriveMonth,
      "data.arriveDay": arriveDay
    })
  },
  onFetchUserInfoHandler: function () {
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        userMs.onFetchUserData();
      } else {
      }
    })
  },

  // 逆向获取地址事件
  onFetchLocationRequest:function(adcode,cid){
    let _this = this;
    let id = this.data.data.id;
    let url = `${config.ApiRoot}/region/county/get`;
    let queryObj = {
      adcode:adcode,
      community_id:cid?cid:""
    };
    let data={
      url,
      data:queryObj
    }
    wxApi.request(data)
    .then(res => {
      const { data, code, msg } = res.data
      if (code == 10000) {
        (userMs.config.locationObj = data)
        this.onFetchUserInfoHandler();
      }
    })
    .catch(err => {
      console.log(err)
    });
  },

  // 获取购物车数量事件
  onFetchCarListNumHandler: function () {
    let _this = this;
    let id = this.data.data.id;
    let url = `${config.ApiRoot}/cart`;
    let queryObj = {};
    if (wx.getStorageSync("communityObj")) {
      queryObj.adcode = JSON.parse(wx.getStorageSync("communityObj")).adcode
    }
    let data = {
      url,
      data: queryObj
    }
    wxApi.getSetting().then(res => {
      if (res.authSetting["scope.userInfo"]) {
        userMs.request(data)
          .then(res => {
            const { data, code, msg } = res.data
            if (code == 10000) {
              let allNum = 0;
              data.forEach(item => {
                allNum += item.num
              })
              app.globalData.cartItemNumber = allNum;
              this.setData({
                "state.cartItemNumber": allNum
              })
            }
          })
      } else {
        // this.setData({
        //   "state.needAuthorize": true,
        // })
      }
    }).catch(err => {
      console.log(err)
    });

  },
  // onSetStorageHandler: function () {
  //   let { config } = userMs
  //   let { userInfo } = userMs.config
  //   if (userInfo.merchant && userInfo.merchant.stores) {
  //     wx.setStorageSync("self_store_id", userInfo.merchant.stores[0].id);
  //   } else {
  //     console.log(config.storeId)
  //     config.storeId && wx.setStorageSync("last_user_store_id", config.storeId)
  //   }
  // },

  // 获取system 信息
  getSystemInfoHandler:function(){
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.windowWidth = res.windowWidth;
        _this.WidthRadio = res.windowWidth / 750;
        // console.log(res.model)
        // console.log(res.pixelRatio)
        // console.log(res.windowWidth)
        // console.log(res.windowHeight)
        // console.log(res.language)
        // console.log(res.version)
        // console.log(res.platform)
      }
    })
  },

  // 请求商品信息事件
  onFetchProductDetail:function(){
    let _this = this;
    let id = this.data.data.id;
    let url;
    if (this.data.data.activityId && this.data.data.type == 1){
      url = `${config.ApiRoot}/activity/goods/${this.data.data.activityId}`
    } else if (this.data.data.activityId && this.data.data.type == 2){
      url = `${config.ApiRoot}/presale/goods/detail/${this.data.data.activityId}`
    }
    else if (this.data.data.activityId && this.data.data.type == 3) {
      url = `${config.ApiRoot}/seckill/goods/${this.data.data.activityId}`
    }
    else{
      url = `${config.ApiRoot}/goods/${id}`
    }
    let data = {
      url,
    }
    wx.showLoading({
      title: '加载中',
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          // if (data.plans && data.plans.length >0){
          //   data.plans.forEach(itemplan =>{
          //     if (itemplan.values && itemplan.values.length>0){
          //       itemplan.values.forEach(item=>{
          //         item.canSelect = true
          //       })
          //     }
          //   })
          // }
          if(data.images){
            data.images = data.images.split(",");
          }
          if (data.des_images) {
            data.des_images.reverse();
          }
          // 当plans 只有一列的时候，
          // 这时候 skus 可能不存在匹配plans 的sku，这个时候，应该让plans变成不可选状态
          // if(data.plans.length == 1){
          //   data.plans.forEach((itemPlan, index) => {
          //       itemPlan.values.forEach(item => {
          //         let canSelectStatus = false;
          //         data.skus.forEach(skuItem => {
          //           if (skuItem.attr_value_items == item.attr_val_id) {
          //             canSelectStatus = true;
          //           }
          //         })
          //         item.canSelect = canSelectStatus
          //       })
          //   })
          // }
          _this.setData({
            "data.productDetail": data,
            "data.qiniuDomain": userMs.config["qiniuDomain"],
            "state.isIphoneX": app.globalData.isIphoneX,
            "state.cartItemNumber": app.globalData.cartItemNumber.toString().length >= 3 ? "..." : app.globalData.cartItemNumber
          });
         
          setTimeout(()=>{
              console.log("请求猜你喜欢数据");
              this.getLikeData(data.goods_id);//获取猜你喜欢数据
          },200)
          
          // this.oncomputedHandler(); // 计算总价
          
          // 预售时间计算
          if(this.data.data.type==2){
            // 预售商品 判断是否下架
            if (!data.goods_status || !data.sku_status || !data.presale_goods_status){
              data.isUnderStatus = true;
              this.setData({
                "data.productDetail": data,
              })
            }else{
              this.onComputeBookingTimeHandler();
            }
            
          }else{

            // 次日达1 秒杀商品3 判断是否下架
            if ((this.data.data.type == 3 && (!data.goods_status || !data.sku_status || !data.seckill_status)) || (this.data.data.type == 1 && (!data.goods_status || !data.sku_status || !data.activity_goods_status))){
              data.isUnderStatus = true;
              this.setData({
                "data.productDetail": data,
              })
            }else{
              // 次日达 秒杀商品时间计算
              let featureActivity = false;
              if (data.start_time - new Date().getTime() / 1000 > 0) {
                this.setData({
                  "state.featureActivity": true
                })
                this.onSetTimeDesc(new Date().getTime(), data.start_time * 1000, this.onSetFeatureTimeDescCallBack)
              } else {
                this.setData({
                  "state.featureActivity": false
                })
                this.onSetTimeDesc(new Date().getTime(), data.end_time * 1000, this.onSetTimeDescCallBack)
              }
            }
          }
          
          // 这里先把商品logo图。转换为本地图片。方便canvas 绘图
          let logoPath = this.data.data.qiniuDomain + data.goods_logo;
          wx.getImageInfo({
            src: logoPath,
            success: function (res) {
              _this.setData({
                "data.logoPath":res.path
              })
            }
          })
        } else {
          this.alertHandler(msg);
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res=>{
        wx.hideLoading();
      })
  },

  // 计算预售商品的时间节点事件
  onComputeBookingTimeHandler:function(){
    let timer = new Date().getTime();
    let productDetail = this.data.data.productDetail;
    productDetail.arrive_time_util = util.formatTimeToDayWithoutYear(new Date(productDetail.arrive_time*1000))
    productDetail.deliver_time_util = util.formatTimeToDayWithoutYear(new Date(productDetail.deliver_time * 1000))
    productDetail.end_time_util = util.formatTimeToDayWithoutYear(new Date(productDetail.end_time * 1000))
    productDetail.start_time_util = util.formatTimeToDayWithoutYear(new Date(productDetail.start_time * 1000))

    // 判断是否活动结束
    if (timer - productDetail.arrive_time*1000 > 0){
      this.setData({
        "state.activityEnd":true
      })
    } 

    // 判断是否没结束，配送状态
    else if (timer - productDetail.deliver_time * 1000 > 0){
      this.setData({
        "state.deliverStatus": true
      })
      this.onSetTimeDesc(new Date().getTime(), productDetail.arrive_time * 1000, this.onSetBookingProCallBack)
      let hasDuringTime = timer - productDetail.deliver_time * 1000;
      let allDuringHours = Math.floor(new Date(productDetail.arrive_time * 1000 - productDetail.deliver_time * 1000) / (1000 * 60 * 60));
      let hasDuringHours = Math.floor(hasDuringTime / (1000 * 60 * 60));
      this.setData({
        "state.hasDuringHours": hasDuringHours,
        "state.allDuringHours": allDuringHours
      })
    } 

    // 判断是否没结束，没配送，而是待发货状态
    else if (timer - productDetail.end_time*1000 > 0) {
      this.setData({
        "state.endStatus": true,
        "state.startStatus": false, //担心用户卡着时间，抢购，需要重置下startStatus由true转为false
      })
      this.onSetTimeDesc(new Date().getTime(), productDetail.deliver_time * 1000, this.onSetBookingProCallBack)
      let hasDuringTime = timer - productDetail.end_time * 1000;
      let allDuringHours = Math.floor(new Date(productDetail.deliver_time * 1000 - productDetail.end_time * 1000) / (1000 * 60 * 60));
      let hasDuringHours = Math.floor(hasDuringTime / (1000 * 60 * 60));
      this.setData({
        "state.hasDuringHours": hasDuringHours,
        "state.allDuringHours": allDuringHours
      })
    } 
    
    // 判断是否没结束，没配送，没结束而是进行中状态
    else if (timer - productDetail.start_time*1000 > 0) {
      this.onSetTimeDesc(new Date().getTime(), productDetail.end_time * 1000, this.onSetBookingProCallBack)
      this.setData({
        "state.startStatus": true,
        "state.featureActivity": false 
        // 这次进来页面，还未到达开始时间，然后到达开始时间点，需要重置下，因为没有页面的刷新事件，只能通过数据驱动
        //担心用户卡着时间，抢购，需要重置下featureActivity由true转为false
      })
      let hasDuringTime = timer - productDetail.start_time * 1000;
      let allDuringHours = Math.floor(new Date(productDetail.end_time * 1000 - productDetail.start_time * 1000) / (1000 * 60 * 60));
      let hasDuringHours = Math.floor(hasDuringTime / (1000 * 60 * 60));
      this.setData({
        "state.hasDuringHours": hasDuringHours,
        "state.allDuringHours": allDuringHours
      })
    }else{
      this.setData({
        "state.featureActivity":true
      })
      this.onSetTimeDesc(new Date().getTime(), productDetail.start_time * 1000, this.onSetBookingProCallBack)
    }

    // 计算预售时间红色进度条
    // if (timer - productDetail.start_time * 1000 > 0){
    //   let hasDuringTime = timer - productDetail.start_time * 1000;
    //   let allDuringDay = new Date(productDetail.arrive_time * 1000 - productDetail.start_time * 1000)/(1000*24*60*60);
    //   let hasDuringDay = Math.floor(hasDuringTime / (1000 * 24 * 60 * 60));
    //   this.setData({
    //     "state.hasDuringDay": hasDuringDay,
    //     "state.allDuringDay": allDuringDay
    //   })
    // }
    this.setData({
      "data.productDetail": productDetail
    })
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
    // 判断是不是从团长端跳转过来的
    if (app.globalData.isFormMerchant){
      this.setData({
        "data.isFormMerchant":true
      })
    }
    // let _this = this;
    // wx.getSystemInfo({
    //   success: function(res) {
    //     _this.radio = res.windowWidth/750;
    //     _this.setData({
    //       "scrollBoxHeight": 360 * _this.radio
    //     })
    //   },
    // })
    // this.onScrollFunction();

    // 如果不是先进入首页，再进入这个页面，触发请求购物车数量函数
    if (!app.globalData.onFetchCarListStatus) {
      this.onFetchCarListNumHandler();
    }

    // 商品详情页 不需要做提示更换社区弹窗处理
    // let communityObj = wx.getStorageSync("communityObj");
    // if (!communityObj) {
    //   // this.setData({
    //   //   "state.needCommunityStatus": true
    //   // })
    // } else {
    //   eventHandler.on("selectComCallBack", () => {
    //     this.data.state.communityCur = "";
    //     this.setData({
    //       "state.needCommunityStatus": false,
    //     })
    //   })
    //   // 如果卡片的社区id 跟本地的社区id 不同，则弹窗 提示需要选择社区
    //   if (this.data.state.communityCur && this.data.state.communityCur.id != JSON.parse(communityObj).id) {
    //     // 如果用户到达选择社区页面，但是点了左上角返回按钮，则直接默认不替换
    //     if (!app.globalData.onGoToCompareCommunityPage){
    //       this.setData({
    //         "state.needCommunityStatus": true,
    //       })
    //     }else{
    //       this.data.state.communityCur = "";
    //       this.setData({
    //         "state.needCommunityStatus": false,
    //       })
    //       app.globalData.onGoToCompareCommunityPage = false;
    //     }
        
    //   } else {
    //     this.setData({
    //       "state.needCommunityStatus": false,
    //       // "state.communityObj": JSON.parse(communityObj)
    //     })
    //   }

    // }
  },
  onScrollFunction:function(){
    let _this = this;
    if (this.data.data.groups && this.data.data.groups.length && this.data.data.groups.length > 2){
      let maxLength = this.data.data.groups.length;
      let timer = this.data.state.timer;
      function onDongHua(){
        let currentNum = ++_this.data.state.scrollI;
        _this.setData({
          "state.scrollTop": 90 * currentNum,
          "state.returnBack": false,
        })
        if (currentNum == _this.data.data.groups.length){
          setTimeout(function () {
            _this.setData({
              "state.returnBack": true,
              "state.scrollTop": 0
            })
            
            _this.data.state.scrollI=0;
            _this.data.state.timer = 2500;
            _this.onScrollFunction();
          }, 500)
        }else{
          _this.data.state.timer = 3000;
          _this.onScrollFunction();
        }
      }
      setTimeout(onDongHua, timer)
    } 
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
  onShareAppMessage: function () {
    const _this = this;
    let queryObj = encodeURIComponent(JSON.stringify({
      id: _this.data.data.id,
      isGroupBuyStatus: _this.data.data.isGroupBuyStatus,
      activityId: _this.data.data.activityId,
      type: _this.data.data.type,
      communityObj: wx.getStorageSync("communityObj") ? JSON.parse(wx.getStorageSync("communityObj")) : "",
      // 这里loacationObj 必须先JSON.parse，因为用户存的时候JSON.toString()了一下
      // locationObj: wx.getStorageSync("locationObj") ? JSON.parse(wx.getStorageSync("locationObj")) : "",
      // storeId: wx.getStorageSync("self_store_id") ? wx.getStorageSync("self_store_id") : (wx.getStorageSync("last_user_store_id") ? wx.getStorageSync("last_user_store_id"):"")
    }))
    let imageUrl="";
    if (_this.data.data.productDetail.goods_logo){
      imageUrl = `${_this.data.data.qiniuDomain}${_this.data.data.productDetail.goods_logo}`
    }
    return {
      title: '抢购价:¥'+(_this.data.data.productDetail.our_price/100).toFixed(2)+" | "+_this.data.data.productDetail.goods_name, // 分享标题
      desc: _this.data.data.productDetail.sellpoint, // 分享描述
      imageUrl: imageUrl,
      path: `/page/productDetail/productDetail?queryObj=${queryObj}`, // 分享路径
      success: function (res) {
        console.log(`/page/productDetail/productDetail?queryObj=${queryObj}`)
      },
      fail: function (res) {
      }
    }
  },
  // onSetScrollItemTime: function (item) {
  //   var totalSecond = item.end_time - new Date() / 1000;
  //   if (totalSecond < 0) {
  //     item.activityEnd = true
  //     this.setData({
  //       "productDetail": this.data.productDetail
  //     })
  //   }

  //   var interval = setInterval(function () {
  //     // 秒数   
  //     var second = totalSecond;

  //     // 天数位   
  //     var day = Math.floor(second / 3600 / 24);
  //     var dayStr = day.toString();
  //     if (dayStr.length == 1) dayStr = '0' + dayStr;

  //     // 小时位   
  //     var hr = Math.floor((second - day * 3600 * 24) / 3600);
  //     var hrStr = hr.toString();
  //     if (hrStr.length == 1) hrStr = '0' + hrStr;

  //     // 分钟位   
  //     var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
  //     var minStr = min.toString();
  //     if (minStr.length == 1) minStr = '0' + minStr;

  //     // 秒位   
  //     var sec = Math.floor(second - day * 3600 * 24 - hr * 3600 - min * 60);
  //     var secStr = sec.toString();
  //     if (secStr.length == 1) secStr = '0' + secStr;
  //     item.countDownDay = dayStr;
  //     item.countDownHour = hrStr;
  //     item.countDownMinute = minStr;
  //     item.countDownSecond = secStr;
  //     this.setData({
  //       data: this.data.data
  //     });
  //     totalSecond--;
  //     if (totalSecond < 0) {
  //       clearInterval(interval);
  //       item.activityEnd = true
  //       this.setData({
  //         data: this.data.data
  //       })
  //       // this.setData({
  //       //   countDownDay: '00',
  //       //   countDownHour: '00',
  //       //   countDownMinute: '00',
  //       //   countDownSecond: '00',
  //       // });
  //     }
  //   }.bind(this), 1000);
  // },
  onChangeGroupsBoxStatus: function () {
    this.setData({
      "state.groupsBoxStatus": !this.data.state.groupsBoxStatus
    })
  },

  // 回到首页事件
  onGoToHomePageHandler:function(){
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  },

  // 前往购物车页面
  onGoToCartPageHandler:function(){
    wx.reLaunch({
      url: '/page/cart/cart',
    })
  },


  onChangeGroupBuyingStatus:function(e){
    const item = e.currentTarget.dataset.item;
    if(item){
      this.setData({
        "state.currentGroupBuyingItem": item
      })
    }
    this.setData({
      "state.groupBuyingStatus": !this.data.state.groupBuyingStatus
    })
  },

  // 选择分享类型事件
  onChangeShareBoxHandler: function () {
    this.setData({
      "state.shareBoxStatus": !this.data.state.shareBoxStatus
    })
  },

  // 选择生成海报事件
  onOpenSavePicStatus: function () {
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        this.onOpenSettingNeedBtn();
        this.onRequestCodePic();
        this.setData({
          "state.savePicBoxStatus": true,
          "state.shareBoxStatus": false,
          // "state.openSavePicBoxTimes": ++this.data.state.openSavePicBoxTimes
        })
      } else {
        this.alertHandler("需要用户授权才能使用这个功能")
        wx.navigateTo({
          url: '../userCenter/pages/login/login',
        })
        return false;
      }
    })
    
  },

  
  onCloseSavePicStatus: function () {
    this.setData({
      "state.savePicBoxStatus": false,
      // "state.posterId": this.data.state.posterId + this.data.state.openSavePicBoxTimes
    })
  },

  // 请求获得小程序二维码事件
  onRequestCodePic: function () {
    let _this = this;
    let storeId = "";
    if (wx.getStorageSync("communityObj")){
      storeId = JSON.parse(wx.getStorageSync("communityObj")).id
    }
    // if(wx.getStorageSync("self_store_id") ){
    //   storeId = wx.getStorageSync("self_store_id")
    // } else if (wx.getStorageSync("last_user_store_id")){
    //   storeId = wx.getStorageSync("last_user_store_id")
    // }
    let adcode = "";
    let community_id = "";
    let locationObj = wx.getStorageSync("communityObj");
    if(locationObj){
      locationObj = JSON.parse(locationObj);
      adcode = locationObj.adcode;
      locationObj.com && (community_id = locationObj.com.id)
    }
    let url = `${config.ApiRoot}/product-code/get?activity_goods_id=${this.data.data.activityId}&store_id=${storeId}&adcode=${adcode}&community_id=${community_id}&type=${this.data.data.type}`;
    if (this.hasCodePicStatus) {
      this.onDrawCanvasHandler();
    } else {
      wx.showLoading({
        title: '生成中...',
        mask: true
      })
      wx.downloadFile({
        url: url, //仅为示例，并非真实的资源
        header: {
          Authorization: `Bearer ${storageHandler.getStorage("token")}`
        },
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            _this.hasCodePicStatus = true;
            _this.setData({
              "data.qrCode": res.tempFilePath
            })
            console.log("保存二维码到本地成功")
            _this.onDrawCanvasHandler();
          }else{
            _this.alertHandler(JSON.stringify(res))
            wx.hideLoading();
          }
        },
        fail(res){
          _this.alertHandler(JSON.stringify(res))
          wx.hideLoading();
        }
      })
    }

  },

  // 计算canvas text长度
  // onComputeTextWidth:function(ctx,str,maxWidth,maxLine){
  //   let lineWidth;
  //   var lastSubStrIndex = 0; //每次开始截取的字符串的索引
  //   let lineNum = 1; // 初始化行数 为1
  //   for (let i = 0; i < str.length; i++) {
  //     lineWidth += ctx.measureText(str[i]).width;
  //     if (lineWidth > maxWidth) {
  //       ctx.fillText(str.substring(lastSubStrIndex, i), 0, initHeight);//绘制截取部分
  //       lineWidth = 0;
  //       lastSubStrIndex = i;
  //     }
  //     if (i == str.length - 1) {//绘制剩余部分
  //       ctx.fillText(str.substring(lastSubStrIndex, i + 1), 0, initHeight);
  //     }
  //   }
  // },


  // canvas 绘图圆角function
  drawRoundRect(cxt, x, y, width, height, radius){
    cxt.beginPath();
    cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    cxt.lineTo(width - radius + x, y);
    cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    cxt.lineTo(width + x, height + y - radius);
    cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    cxt.lineTo(radius + x, height + y);
    cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    cxt.closePath();
  },


  circleImg(ctx, img, x, y, r) {
    ctx.save();
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.restore();
  },

  // canvas 绘图事件
  onDrawCanvasHandler: function () {
    // if (this.data.state.posterHasCreateStatus) return;
    let productDetail = this.data.data.productDetail;
    let windowWidth = this.windowWidth;
    let WidthRadio = this.WidthRadio;
    let picRadio = 500/750;
    // let userInfo;
    // if (userMs){
    //   userInfo = userMs.config.userInfo
    // }
    // let {userInfo} = userMs.config;
    // console.log("userInfo",userInfo)
    const ctx = wx.createCanvasContext(this.data.state.posterId);
    ctx.clearRect(0, 0, 500 * WidthRadio, 840 * windowWidth);
    ctx.setFillStyle("#fff");
    ctx.fillRect(0, 0, 500*WidthRadio, 840*windowWidth);

    // 这里保存为圆角 canvas 函数，但是如果跟fillrect一起用，好像行不通，以后优化
    // ctx.save()
    // ctx.beginPath()
    // ctx.arc(50, 50, 25, 0, 2 * Math.PI)
    // ctx.clip()
    // ctx.drawImage("http://is5.mzstatic.com/image/thumb/Purple128/v4/75/3b/90/753b907c-b7fb-5877-215a-759bd73691a4/source/50x50bb.jpg", 25, 25)
    // ctx.restore()
    
    
    
    var path;
    // 背景图片
    path = "../../imgs/icon-share-poster-bg.png";
    ctx.drawImage(path, 0 , 0, (500 * WidthRadio), (957 * picRadio * WidthRadio));
    path = "../../imgs/icon-logo-share.png";
    ctx.drawImage(path, (258 * picRadio * WidthRadio), 46 * picRadio * WidthRadio, (234 * picRadio * WidthRadio), (138 * picRadio* WidthRadio));
    // this.circleImg(ctx, path, 20, 20, 10)
    // if(userInfo){
    //   console.log("userInfo.avatarPath", userInfo.avatarPath)
    //   if (userInfo.avatarPath){
    //     path = userInfo.avatarPath
    //     ctx.drawImage(path, (50 * picRadio * WidthRadio), (135 * picRadio * WidthRadio), (80 * picRadio * WidthRadio), (80 * picRadio * WidthRadio));
    //   }
    //   ctx.setFillStyle("#000000");
    //   ctx.setFontSize(14 * picRadio);
    //   ctx.setTextBaseline('middle')
    //   ctx.fillText(userInfo.nickname, (140 * picRadio * WidthRadio), (175 * picRadio * WidthRadio));
    // }else{
    //   path = "../../imgs/icon-user-avatar-default.png";
    //   ctx.drawImage(path, (50 * picRadio * WidthRadio), (135 * picRadio * WidthRadio), (80 * picRadio * WidthRadio), (80 * picRadio * WidthRadio));
    //   ctx.setFillStyle("#000000");
    //   ctx.setFontSize(14 * picRadio);
    //   ctx.setTextBaseline('middle')
    //   ctx.fillText("未登录用户", (140 * picRadio * WidthRadio), (175 * picRadio *  WidthRadio));
    // }

    // text tips 
    // path = "../../imgs/icon-share-product-tips.png";
    // ctx.drawImage(path, (50 * picRadio * WidthRadio), (230 * picRadio * WidthRadio), (570 * picRadio * WidthRadio), (76 * picRadio * WidthRadio));

    // 商品logo
    path = this.data.data.logoPath;
    if(path){
      ctx.drawImage(path, (151 * picRadio * WidthRadio), (214 * picRadio * WidthRadio), (448 * picRadio * WidthRadio), (448 * picRadio * WidthRadio));
    }

    // ctx.arc((137 * picRadio * WidthRadio), (244 * picRadio * WidthRadio), (613 * picRadio * WidthRadio), (720 * picRadio * WidthRadio), (100 * picRadio * WidthRadio))

    if (productDetail.goods_name){
      // 左下角的title 这里需要限制次数啊。。
      let titleLength = productDetail.goods_name.length;
      let title = productDetail.goods_name;
      let titleOne;
      let titleTwo;
      if (titleLength >= 36) {
        titleOne = title.substr(0, 18);
        titleTwo = title.substr(18, 16);
        titleTwo = titleTwo + "..."
      } else if (titleLength < 36 && titleLength >= 18) {
        titleOne = title.substr(0, 18);
        titleTwo = title.substr(18, 18);
      } else {
        titleOne = title
      }
      ctx.setFillStyle("#333");
      ctx.setFontSize(19 * picRadio);
      ctx.setTextBaseline('top');
      ctx.setTextAlign('center')
      ctx.fillText(titleOne, (375 * picRadio * WidthRadio), (692 * picRadio * WidthRadio));
      if(titleTwo){
        ctx.fillText(titleTwo, (375 * picRadio * WidthRadio), (740 * picRadio * WidthRadio));
      }
    }
    // 我们的价格
    if (productDetail.our_price) {
      let our_price = productDetail.our_price;
      ctx.setFillStyle("#FF5e53");
      ctx.setTextBaseline('bottom')
      ctx.setTextAlign('right')
      // 让新价格 && 旧价格 中间对齐
      ctx.setFontSize(24 * picRadio);
      ctx.fillText(our_price / 100, ((365) * picRadio * WidthRadio), (848 * picRadio * WidthRadio));
      let prefixWidth = ctx.measureText(`${our_price / 100}`).width;
      let widthMargin = 10;
      ctx.setFontSize(16 * picRadio);
      ctx.fillText("¥", ((365 - widthMargin) * picRadio * WidthRadio-prefixWidth), (848 * picRadio * WidthRadio));

    }
    // 市场价格
    if (productDetail.market_price) {
      ctx.setFillStyle("#d6d6d6");
      ctx.setTextBaseline('bottom')
      ctx.setTextAlign('left')
      // 让新价格 && 旧价格 中间对齐
      ctx.setFontSize(14 * picRadio);

      ctx.fillText("¥", ((385) * picRadio * WidthRadio), (838 * picRadio * WidthRadio));
      let prefixWidth = ctx.measureText(`¥`).width;
      let market_price = productDetail.market_price;
      
      ctx.fillText(market_price / 100, ((385) * picRadio * WidthRadio + prefixWidth), (838 * picRadio * WidthRadio));
      let marketPriceWidth = ctx.measureText(`${market_price / 100}`).width;
      ctx.setStrokeStyle("#999")
      ctx.beginPath()
      ctx.moveTo(((385) * picRadio * WidthRadio), (824 * picRadio * WidthRadio))
      ctx.lineTo(((385) * picRadio * WidthRadio + marketPriceWidth+prefixWidth), (824 * picRadio * WidthRadio))
      ctx.stroke()
    }
    
    if (productDetail.sell_count){
      let sell_count = productDetail.sell_count;
      // let length = productDetail.sell_count.toString().length;
      // ctx.setFillStyle('#ff0700')
      // ctx.fillRect((560 * picRadio * WidthRadio), (845 * picRadio * WidthRadio), ((78+11*length) * picRadio * WidthRadio), (40 * picRadio * WidthRadio))

      let marketPriceWidth = ctx.measureText(`${sell_count / 100}`).width;
      ctx.setFillStyle('#ff5e53')
      // ctx.fillRect((230 * picRadio * WidthRadio), (888 * picRadio * WidthRadio), ((290) * picRadio * WidthRadio), (88 * picRadio * WidthRadio))
      ctx.setStrokeStyle('#ff5e53')
      this.drawRoundRect(ctx, (230 * picRadio * WidthRadio), (888 * picRadio * WidthRadio), ((290) * picRadio * WidthRadio), (88 * picRadio * WidthRadio), 44 * picRadio * WidthRadio);
      ctx.stroke()
      ctx.fill()
      ctx.setFillStyle("#fff");
      ctx.setFontSize(16 * picRadio);
      ctx.setTextBaseline('bottom')
      ctx.setTextAlign('center')
      ctx.fillText(`已售${sell_count}件`, (375 * picRadio * WidthRadio), (950 * picRadio * WidthRadio));
    }
    

    // 右下角二维码
    path = this.data.data.qrCode;
    if(path){
      ctx.drawImage(path, (80 * picRadio * WidthRadio), (994 * picRadio * WidthRadio), (220 * picRadio * WidthRadio), (220 * picRadio * WidthRadio));
    }
    ctx.setFillStyle("#333");
    ctx.setFontSize(16*picRadio);
    ctx.setTextBaseline('bottom');
    ctx.setTextAlign('left')
    ctx.fillText("长按识别小程序二维码", (328 * picRadio * WidthRadio), (1117 * picRadio * WidthRadio));

    ctx.setFillStyle("#999");
    ctx.setFontSize(13 * picRadio);
    ctx.fillText("好货要和朋友一起分享", (328 * picRadio * WidthRadio), (1164 * picRadio * WidthRadio));
    // ctx.draw()
    // this.setData({
    //   "state.posterHasCreateStatus":true
    // })
    ctx.draw(true, setTimeout(function () {
      wx.hideLoading()
    }, 100))
    
  },

  // 初始判断 按钮打开设置还是wxapi打开设置页
  onOpenSettingNeedBtn: function () {
    wxApi.getSetting().then(res => {
      if (res.authSetting && res.authSetting["scope.writePhotosAlbum"] === false) {
        if (wx.canIUse("button.open-type.openSetting")) {
          this.setData({
            "state.needOpenSettingBtn": true
          })
        } else {
          console.log("使用wx.opensetting")
        }
      }
    })
  },

  // 打开设置页事件
  openSettingHandler: function (e) {
    if (e.detail.authSetting && e.detail.authSetting["scope.writePhotosAlbum"]) {
      const pic = e.currentTarget.dataset.pic;
      this.saveWeChatPicHandler();
    } else {
      wx.showToast({
        title: "授权保存图片失败",
        image: "/imgs/icon-fail-default.png",
        duration: 2000
      });
    }
    console.log(e)
  },

  // 保存canvas图片到手机事件
  saveWeChatPicHandler: function () {
    const _this = this;
    wxApi.authorize({
      scope: "scope.writePhotosAlbum"
    }).catch(e => {
      return wxApi.openSetting().then(res => {
        if (res.authSetting["scope.writePhotosAlbum"]) {
          return;
        } else {
          throw "授权失败！";
        }
      })
      .catch(err => {
        // 这里的思路是，先让用户授权地址，用户拒绝以后，先进入一次设置页
        // 如果 opensetting api 报错，返回一个对象
        // 如果是 用户自己取消授权，则把报错值自定义为字符串，则不是api 报错
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
      return wxApi.canvasToTempFilePath({ x: 0, y: 0, canvasId: this.data.state.posterId })
      // return wxApi.getImageInfo({
      //   src: "https://bir.langnadujia.cn/static/images/kefu.jpg",
      // })
    })
      .then(res => {
        console.log(res)
        return wxApi.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
        // return wxApi.saveImageToPhotosAlbum({ filePath: res.path})


        // wx.saveImageToPhotosAlbum({
        //   filePath: res.path,
        //   success: function () {
        //     _this.setData({
        //       "state.alertingStatus": true,
        //       "state.alertingWords": "保存成功，请前往微信扫描二维码"
        //     })
        //     setTimeout(function () {
        //       _this.setData({
        //         "state.alertingStatus": false
        //       })
        //     }, 2000);
        //     _this.setData({
        //       "state.qrcodeBoxStatus": !_this.data.state.qrcodeBoxStatus
        //     })
        //   }
        // })
      })
      .then(res => {
        this.alertHandler("保存成功，请前往微信扫描二维码")
        // _this.setData({
        //   "state.alertingStatus": true,
        //   "state.alertingWords": "保存成功，请前往微信扫描二维码"
        // })
        // setTimeout(function () {
        //   _this.setData({
        //     "state.alertingStatus": false
        //   })
        // }, 2000);
        _this.setData({
          "state.savePicBoxStatus": false,
          // "state.posterId": this.data.state.posterId + this.data.state.openSavePicBoxTimes
        })
      })
      .catch(err => {
        if (typeof err === "string") {
          wx.showToast({
            title: err,
            image: "/imgs/cancel.png",
            duration: 2000
          });
        }
        console.log(err)
      });
  },


  sortAdd:function(a,b){
    return a-b;
  },

  // sku 选择事件
  onSelectSkuItemHandler:function(e){
    let _this = this;
    const attrId = e.currentTarget.dataset.attrId;
    const attrValId = e.currentTarget.dataset.attrValId;
    const indexPlan = e.currentTarget.dataset.indexPlan;
    const skus = this.data.data.productDetail.skus;
    const plans = this.data.data.productDetail.plans;
    let selectIds = this.data.state.selectIds;
    
    if (indexPlan == 0){
      selectIds=[];
      this.setData({
        "state.selectSkuItem": {}
      })
    }else{
      // if (!selectIds[indexPlan-1]){
      //   _this.setData({
      //     "state.alertingStatus": true,
      //     "state.alertingWords": `请从上往下选择规格`
      //   })
      //   setTimeout(function () {
      //     _this.setData({
      //       "state.alertingStatus": false
      //     })
      //   }, 2000)
      //   // console.log("请从上往下选择规格");
      //   return;
      // }
    }
    selectIds[indexPlan] = attrValId;
    
    let canSelectIds=[];
    let isSameObj={}
    

    //解释
    // 先选了一个规格，去遍历sku中，所有包含该规格的匹配项，把可以选择的id放在一个ids数组中
    // 这里需要注意，第二次选择时，需要遍历已经选择的规格ids，需要被sku完全包含，才能找到可以选择的规格item
    skus.forEach(item=>{
      let hasAll = true;
      selectIds.forEach(selectId =>{
        if (item.attr_value_items.indexOf(selectId) < 0 ){
          hasAll = false
        }
      })
      
      if(!hasAll) return;
      // if (item.attr_value_items.indexOf(attrValId) > -1){
      let arr = item.attr_value_items.split(",");
      arr.forEach( arrItem => {
        if (!isSameObj[arrItem] && attrValId != arrItem){
          isSameObj[arrItem] = true;
          canSelectIds.push(arrItem)
        }
      })
      // }
    })
    plans.forEach((itemPlan,index)=>{
      if (index > 0 && !selectIds[index]){
        itemPlan.values.forEach(item=>{
          let canSelectStatus = false;
          canSelectIds.forEach(id => {
            if (id == item.attr_val_id){
              canSelectStatus = true;
            }
          })
          item.canSelect = canSelectStatus
        })
      }
    })
    this.setData({
      "state.selectIds": selectIds,
      "state.canSelectIds": canSelectIds,
      "data.productDetail.plans": plans
    })
    // 当选择plans 只有一列
    // if(plans.length == 1){
    //   let hasAll = true;
    //   selectIds.forEach(selectId =>{
    //     if (item.attr_value_items.indexOf(selectId) < 0 ){
    //       hasAll = false
    //     }
    //   })
      
    //   if(!hasAll) return;
    // }
    // 判断是否选择了最后一个，然后显示sku的图片，价格，stock限制
    if (!this.onCheckSkuStatus()) return;
    var originUp = this.data.state.selectIds.concat([]);
    let sortSku = originUp.sort(this.sortAdd);
    let selectSkuItem;
    skus.forEach(item =>{
      if (item.attr_value_items == sortSku.toString()){
        selectSkuItem=item
      }
    })
    this.setData({
      "state.selectSkuItem": selectSkuItem
    })
  },

  // 判断sku选择 是否已经全选
  onCheckSkuStatus:function(){
    let _this = this;
    if (this.data.data.productDetail.plans.length > this.data.state.selectIds.length){
        return false;
    }else{
      let hasEmptyStatus;
      for (let i = 0; i < this.data.state.selectIds.length;i++){
        if(this.data.state.selectIds[i] === undefined ) {
          hasEmptyStatus = true
        }
      }
      // let hasEmptyStatus = this.data.state.selectIds.some(item =>{
      //   return item === undefined
      // })
      if(hasEmptyStatus){
        return false;
      }else{
        return true;
      } 
    }
  },

  // 加入购物车请求事件
  onAddToCartRequest:function(){
    let _this = this;
    let {productDetail} = this.data.data;
    let url = `${config.ApiRoot}/cart`;
    let locationObj = wx.getStorageSync("communityObj");
    if (locationObj){
      locationObj = JSON.parse(locationObj)
    }
    let data = {
      url,
      method: "POST",
      data:[
        {
          "activity_goods_id": productDetail.id,
          "goods_id": productDetail.goods_id,
          "sku_id": productDetail.sku_id,
          "num": this.data.state.totalBuyNum,
          "selected": 1,
          "adcode": locationObj.adcode,
          "type": this.data.data.type ? this.data.data.type:1
        }
      ]
    }
    wx.showLoading({
      title: '加入购物车中',
    })
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          _this.setData({
            "state.alertingStatus": true,
            "state.alertingWords": `加入购物车成功`,
            "state.shopCartBoxStatus": false,
            "state.isAddToCartStatus": false,
            // "state.hasAddToCartStatus":true,
            "state.cartItemNumber": data.cart_item_number.toString().length >= 3 ? "..." : data.cart_item_number
          })
          // 商品详情加入购物车，设置app.globalData.cartItemNumber
          // 这里判断显示一下
          // wx.setTabBarBadge 这个方法只能设置当前看得到的页面，
          // 即只能在tabBar页面进行设置，否则跳回到tabBar页就看不到了
          app.globalData.cartItemNumber = data.cart_item_number
          setTimeout(function () {
            _this.setData({
              "state.alertingStatus": false
            })
          }, 2000)
        } else {
          this.alertHandler(msg)
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

  // 加入购物车事件
  onAddToCartHandler:function(){
    this.onAddToCartRequest();
  },

  // 商品选择弹窗 确认事件
  onSubmitHandler:function(){
    let _this = this;
    wxApi.getSetting().then(res => {
      if (res.authSetting["scope.userInfo"]) {
        if (this.data.data.productDetail.stock == 0) {
          this.alertHandler("该商品库存为0")
          return;
        }
        if (this.data.state.activityEnd){
          this.alertHandler("该商品的活动时间已结束")
          return;
        }
        if (this.data.state.isAddToCartStatus){
          this.onAddToCartHandler();
        }else{
          let arr = [];
          let productDetail = this.data.data.productDetail;
          let selectSkuItem={
            sku_stock: productDetail.stock,
            num: this.data.state.totalBuyNum,
            picture: productDetail.goods_logo,
            our_price:productDetail.our_price,
            market_price:productDetail.market_price,
            sku_name:productDetail.sku_name,
            sku_id:productDetail.sku_id,
            goods_name:productDetail.goods_name,
            goods_id:productDetail.goods_id,
            activity_goods_id:productDetail.id,
            type:this.data.data.type
          }
          arr.push(selectSkuItem)
          let queryObj = {
            products: arr,
            isFromCart: false,
            isFormProductDetail: true
          }
          this.setData({
            "state.shopCartBoxStatus": false,
          })
          wx.navigateTo({
            url: '../purchase/purchase?queryObj=' + encodeURIComponent(JSON.stringify(queryObj)),
          })


        }
        
      } else {
        wx.navigateTo({
          url: '../userCenter/pages/login/login',
        })
      }
    })
  },

  // 数量加事件
  onNumAddHandler:function(){
    let _this = this;
    let totalBuyNum = this.data.state.totalBuyNum+1;
    if (totalBuyNum <= this.data.data.productDetail.stock){
      this.setData({
        "state.totalBuyNum": totalBuyNum
      })
    }
    // this.oncomputedHandler(); // 计算总价
  },

  // 数量减事件
  onNumDescHandler:function(){
    if (this.data.state.totalBuyNum >1){
      this.setData({
        "state.totalBuyNum": --this.data.state.totalBuyNum
      })
    }
    // this.oncomputedHandler(); // 计算总价
  },

  // 加入购物车按钮 触发的 打开商品选择弹窗事件
  onOpenShopCartBoxStatusHandler:function(){
    this.setData({
      "state.shopCartBoxStatus": true,
      "state.isAddToCartStatus": true
    })
  },

  // 关闭商品选择弹窗事件
  onCloseShopCartBoxStatusHandler:function(){
    this.setData({
      "state.shopCartBoxStatus": !this.data.state.shopCartBoxStatus,
      "state.isAddToCartStatus": false,
      "state.isBuyNowStatus":false
    })
  },

  // 立即购买按钮事件
  onNowBuyHandler:function(){
    this.setData({
      "state.shopCartBoxStatus": true,
      "state.isBuyNowStatus": true
    })
  },

  // 团购按钮事件
  onGroupBuyHandler:function(){
    this.setData({
      "state.shopCartBoxStatus": true,
      "state.onGroupBuyStatus": true
    })
  },

  // 报错弹窗封装事件
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

  // 阻止默认事件函数
  onPreventHandler: function () {
    return false;
  },

  //到计时函数，接受一个回调函数
  onSetTimeDesc: utilActions.onSetTimeDesc,

  // 正在进行的活动，倒计时函数回调函数
  onSetTimeDescCallBack: function (status, timeObj) {
    if (!status) {
      this.setData({
        "state.activityEnd": true
      })
    } else {
      this.setData({
        "state.countDownDay": timeObj.countDownDay,
        "state.countDownHour": timeObj.countDownHour,
        "state.countDownMinute": timeObj.countDownMinute,
        "state.countDownSecond": timeObj.countDownSecond
      })
    }
  },

  // 即将开始的活动，倒计时函数回调函数
  onSetBookingProCallBack: function (status, timeObj) {
    // 如果即将开始的活动，倒计时到0，则转为剩余时间的倒计时
    if (!status) {
      // 这个时候，要把 state.featureActivity 设置为false 才可以
      this.onComputeBookingTimeHandler();
    } else {
      this.setData({
        "state.countDownDay": timeObj.countDownDay,
        "state.countDownHour": timeObj.countDownHour,
        "state.countDownMinute": timeObj.countDownMinute,
        "state.countDownSecond": timeObj.countDownSecond
      })
    }
  },


  // 即将开始的活动，倒计时函数回调函数
  onSetFeatureTimeDescCallBack: function (status, timeObj) {
    // 如果即将开始的活动，倒计时到0，则转为剩余时间的倒计时
    if (!status) {
      // 这个时候，要把 state.featureActivity 设置为false 才可以
      this.setData({
        "state.featureActivity": false
      })
      this.onSetTimeDesc(new Date().getTime(), this.data.data.productDetail.end_time * 1000, this.onSetTimeDescCallBack)
    } else {
      this.setData({
        "state.countDownDay": timeObj.countDownDay,
        "state.countDownHour": timeObj.countDownHour,
        "state.countDownMinute": timeObj.countDownMinute,
        "state.countDownSecond": timeObj.countDownSecond
      })
    }
  },

  // 计算商品数量*单价的总价
  oncomputedHandler: function () {
    let goodPrice = this.data.data.productDetail.our_price/100;
    let number = this.data.state.totalBuyNum
    this.setData({
      "state.totalPrice": (goodPrice * number).toFixed(2)
    })
  },
})