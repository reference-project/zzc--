// page/tabBar/index/index.js
const data = require("./data.js");
const pageContorlMixin = require("../../../class/pageControl.js");
let util = require("../../../utils/util.js");
const wxApi = require("../../../utils/wxApi.js");
const UtilActions = require("../../../class/utilActions.js");
let utilActions = new UtilActions;
//获取应用实例
const app = getApp()
const userMs = app.userMs;
let config = userMs.config;

var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
qqmapsdk = new QQMapWX({
  key: 'NXWBZ-KT4W6-W4LS2-ELIF6-IWC36-JPFUB'
});

// 引用封装的本地存储函数 区分正式环境测试环境
const storageHandler = require("../../../utils/localStorage.js");
const eventHandler = require("../../../utils/event.js");

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
      title: '壹手仓鲜品',
    })
    // this.checkUpdatehandler();
    this.getSystemInfoHandler();
    if(options.queryObj){
      let queryObj = JSON.parse(decodeURIComponent(options.queryObj));
      // queryObj.storeId && (userMs.config.storeId = queryObj.storeId) && this.onFetchUserInfoHandler();      
      // queryObj.storeId && (userMs.config.storeId = queryObj.storeId)
      // queryObj.locationObj && (userMs.config.locationObj = queryObj.locationObj)
      // if (queryObj.storeId || queryObj.locationObj) {
      //   this.onFetchUserInfoHandler();
      // }

      // 本地社区信息
      let communityLocal = wx.getStorageSync("communityObj");
      // 如果分享的参数有社区信息
      if (queryObj.communityObj) {
        // 如果本地没有社区信息，则被覆盖
        if (!communityLocal) {
          wx.setStorageSync("communityObj", JSON.stringify(queryObj.communityObj))
        } else {
          // 如果本地的社区id 跟 参数的社区id 不同，则前往选择页面
          if (JSON.parse(communityLocal).id != queryObj.communityObj.id) {
            // this.data.state.communityCur = queryObj.communityObj;
            let queryObjN = {
              communityObj: queryObj.communityObj
            }
            queryObjN = encodeURIComponent(JSON.stringify(queryObjN))
            wx.navigateTo({
              url: `../../index/pages/compareCommunity/compareCommunity?queryObj=${queryObjN}`,
            })
          }
        }
      }
    }

    // options.scene = encodeURIComponent("sid=255")
    // 扫描小程序码进入页面，获取参数
    if (options.scene) {
      let sceneString = decodeURIComponent(options.scene);
      let arr = sceneString.split("&");
      let obj = {};
      for (let i = 0; i < arr.length; i++) {
        obj[arr[i].split("=")[0]] = arr[i].split("=")[1]
      }   
    }
    // 触发一次
    this.onGetLocationHandler();

    // // 如果已经进入onload事件了，则不需要再进入onshow事件了
    // app.globalData.onChangeLocationStatus = false;

    // 触发一次 如果有社区信息，则开始请求接口
    let communityObj = wx.getStorageSync("communityObj");
    if (!communityObj) {

    } else {
      // 如果已经进入onload事件了，则不需要再进入onshow事件了
      app.globalData.onChangeCommunityStatus = false;
      this.setData({
        "state.communityObj": JSON.parse(communityObj)
      })
      this.onFetchHandlers();
    }
  },

  // 获取设备信息，设备宽
  getSystemInfoHandler: function () {
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

  // 获取新人红包请求
  onFetchNewUserPackageHandler: function () {
    if (app.globalData.onFetchPackageStatus){
      return;
    }
    let _this = this;
    let url = `${config.ApiRoot}/red-envelop/newcomer/get`;
    let data = {
      url,
    }
    userMs.request(data)
    .then(res => {
      const { data, code, msg } = res.data
      if (code == 10000) {
        app.globalData.onFetchPackageStatus = true;
        if(!data.has_red_envelop_activity){
          return ;
        }
        if (data.received_red_envelop){
          this.setData({
            "state.isNewUserStatus": !data.received_red_envelop
          })
        }else{
          data.red_envelops.forEach(item => {
            item.deadlineUtil = util.formatTimeToDay(new Date(item.deadline * 1000));
            let matchArr = this.splitIntFloat(item.amount / 100);
            item.amountInt = matchArr[1];
            item.amountFloat = matchArr[2] ? matchArr[2] : "";
          })
          this.setData({
            "state.isNewUserStatus": !data.received_red_envelop,
            "data.packages": data.red_envelops
          })
        }
        
      }
    })
      .catch(err => {
      console.log(err)
    });

  },

  // 分割数字整数小数部分函数
  splitIntFloat: util.splitIntFloat,

  // 获取购物车数量请求
  onFetchCarListNumHandler:function(e){
    let _this = this;
    let url = `${config.ApiRoot}/cart`;
    let queryObj = {};
    if (wx.getStorageSync("communityObj")) {
      queryObj.adcode = JSON.parse(wx.getStorageSync("communityObj")).adcode
    }
    let data = {
      url,
      data: queryObj
    }
    // 商品详情加入购物车，设置app.globalData.cartItemNumber
    // 这里判断显示一下
    // wx.setTabBarBadge 这个方法只能设置当前看得到的页面，
    // 即只能在tabBar页面进行设置，否则跳回到tabBar页就看不到了
    // 当重新进入小程序
    // 请求接口，否则拿该生命周期保存的值
    if (app.globalData.cartItemNumber) {
      wx.setTabBarBadge({
        index: 1,
        text: app.globalData.cartItemNumber.toString()
      })
      if (e && e.type == "cartevent"){
        return;
      }
    }
    userMs.request(data)
    .then(res => {
      const { data, code, msg } = res.data
      if (code == 10000) {
        
        app.globalData.onFetchCarListStatus = true;
        this.data.data.cartList = data
        if (data.length>0){
          let allNum = 0;
          data.forEach(item=>{
            allNum += item.num
          })
          app.globalData.cartItemNumber = allNum;
          wx.setTabBarBadge({
            index: 1,
            text: allNum.toString()
          })
          this.mapCarrDataToProducts();
        }else{
          wx.removeTabBarBadge({
            index: 1,
          })
        }
      }
    }).catch(err=>{
      console.log(err)
    })
      

  },
  mapCarrDataToProducts:function(){
    let presale_goods = this.data.data.presale_goods;// 预售商品列表

    let activity_goods =[];
    if (this.data.data.activity && this.data.data.activity.goods){
         activity_goods = this.data.data.activity.goods.data
    }
    let cartList = this.data.data.cartList;

    presale_goods.forEach(item => {
      cartList.forEach(cartItem => {
        if (cartItem.type == item.type && cartItem.activity_goods_id == item.id) {
          item.totalBuyNum = cartItem.num
          item.cartId = cartItem.id
        }
      })
    })
    activity_goods.forEach(item => {
      cartList.forEach(cartItem => {
        if (cartItem.type == item.type && cartItem.activity_goods_id == item.id) {
          item.totalBuyNum = cartItem.num
          item.cartId = cartItem.id
        }
      })
    })
    this.setData({
      data: this.data.data
    })
  },

  // 获取红包列表数量请求
  onFetchRedPackageHandler: function () {
    let indexHasRedPackageObj = storageHandler.getStorage("indexHasRedPackageObj");
    if (indexHasRedPackageObj){
      let time = JSON.parse(indexHasRedPackageObj).time;
      if(new Date().getTime() - time < 24 * 60 * 60 * 1000){
        return;
      }
    }
    let _this = this;
    const url = `${config.ApiRoot}/red-envelop/list`;
    let queryObj = {
      page: _this.data.state.page,
      limit: 20,
      used: 2
    }
    let data = {
      url,
      data:queryObj
    }
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          if(data.data.length>0){
            this.setData({
              "state.hasRedPackageStatus":true
            })
            let indexHasRedPackageObj = {
              time:new Date().getTime()
            }
            storageHandler.setStorage('indexHasRedPackageObj', JSON.stringify(indexHasRedPackageObj));
          }
        }
      })
    .catch(err => {
      console.log(err)
    });

  },


  //获取用户地理位置
  onGetLocationHandler: function () {
    let _this = this;
    // 判断用户是否选择了地址，如果有，则不需要再定位，否则继续定位当前位置
    let currentLocation = wx.getStorageSync("currentLocation");
    let locationObj = wx.getStorageSync("locationObj");
    console.log("是否选择了地址", currentLocation);
    if (currentLocation){
      this.setData({
        "state.locationObj": locationObj?JSON.parse(locationObj):JSON.parse(currentLocation),
        'state.needLocation': false
      });
     // console.log("进入页面查看定位", this.data.state.needLocation);
      // 获取当前地理位置信息，跟请求接口解耦，请求接口跟社区位置挂钩 2019-3-5
      // this.onFetchHandlers();
      return false;
    }

   
    wx.getLocation({
      success: function (res) {
        //第三方接口获取城市名字
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (ret) {
            console.log("ret", ret)
            if (ret.status === 0 && ret.result) {
              var currentLocation = {
                city: ret.result.address_component.city,
                adcode: ret.result.ad_info.adcode
              }
              // 当前定位 地址存在currentLocation
              wx.setStorageSync("currentLocation", JSON.stringify(currentLocation))
              if(locationObj){

              }else{
                // 如果本地没有地址，则把当前定位地址 赋值给选择地址
                wx.setStorageSync("locationObj", JSON.stringify(currentLocation))
              }
              // wx.setStorageSync('hasAllowLocation', true)
              setTimeout(()=>{
                  _this.setData({
                    'state.locationObj': locationObj ? JSON.parse(locationObj) : currentLocation,
                    'state.needLocation': false
                  });
               // console.log("进入页面查看定位", this.data.state.needLocation);
              },100)
           
         
              // 获取当前地理位置信息，跟请求接口解耦，请求接口跟社区位置挂钩 2019-3-5
              // _this.onFetchHandlers();
            }
          },
          fail: function (err) {
            console.log(err);

          }
        });
      },
      fail: function (err) {
        if (wx.canIUse("button.open-type.openSetting")) {
          _this.setData({
            "state.needOpenSettingBtn": true,
            'state.needLocation': true,
          })
        }else{
          _this.setData({
            'state.needLocation': true,
            "state.needOpenSettingBtn": false
          })
        }
        
      }
    })
  },
  // onOpenSettingNeedBtn:function () {
  //   wxApi.getSetting().then(res => {
  //     if (res.authSetting && res.authSetting["scope.writePhotosAlbum"] === false) {
  //       if (wx.canIUse("button.open-type.openSetting")) {
  //         this.setData({
  //           "state.needOpenSettingBtn": true
  //         })
  //       } else {
  //         console.log("使用wx.opensetting")
  //       }
  //     }
  //   })
  // },

  // 判断是否授权，请求全局的登录事件
  onFetchUserInfoHandler:function(){
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        userMs.onFetchUserData();
      } else {
      }
    })
  },

  //检查是否存在新版本 && 只支持6.5.5以上版本好像
  checkUpdatehandler:function(){
    // 检测是否可以调用getUpdateManager检查更新
    if (!wx.canIUse("getUpdateManager")) return;
    let updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {      // 请求完新版本信息的回调 
      console.log("是否有新版本："+res.hasUpdate);      
      if(res.hasUpdate){
        //如果有新版本                
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）        
        updateManager.onUpdateReady(function () {
          //当新版本下载完成，会进行回调          
          wx.showModal({            
            title: '更新提示',
            content: '新版本已经准备好，单击确定重启小程序',
            showCancel:false,
            success: function (res) {
              if (res.confirm) {                
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启                
                updateManager.applyUpdate();              
              }            
            }          
          })         
        })                
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）        
        updateManager.onUpdateFailed(function () {
          //当新版本下载失败，会进行回调          
          wx.showModal({        
            title: '提示',            
            content: '检查到有新版本，但下载失败，请检查网络设置',            
            showCancel: false,          
          })        
        })      
      }    
    });
  },
  // 当一些老机器扫码进入页面，可能先触发app 的onlunch 事件 并且在接口请求完成后，才触发页面的onload事件
  // 这个时候，门店的保存逻辑需要重新触发一次
  // onSetStorageHandler:function(){
  //   let {config} = userMs
  //   let { userInfo} = userMs.config
  //   if (userInfo.merchant && userInfo.merchant.stores) {
  //     wx.setStorageSync("self_store_id", userInfo.merchant.stores[0].id);
  //   } else {
  //     console.log(config.storeId)
  //     config.storeId && wx.setStorageSync("last_user_store_id", config.storeId)
  //   }
  // },
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
    if (app.globalData.isFormMerchant) {
      this.setData({
        "data.isFormMerchant": true
      })
    }
    // 给选择地址页面返回首页，触发一次事件
    // if(app.globalData.onChangeLocationStatus){
    //   app.globalData.onChangeLocationStatus = false
    //   // 2019-1-24 发现一个问题 切换地址的时候，不能拿到最新的购物车数量
    //   // 所以这里重制一下
    //   app.globalData.cartItemNumber = 0;
    //   this.setData({
    //     "state.page":1
    //   })
    //   // onGetLocationHandler事件，把本地地址，设置为页面appData中，+ 获取产品列表等请求
    //   this.onGetLocationHandler();
    // }

    // 一个生命周期触发一次
    if (!app.globalData.onFetchPackageStatus){
      wxApi.getSetting().then(res => {
        if (res.authSetting["scope.userInfo"]) {
          this.onFetchNewUserPackageHandler(); // 新人红包请求
          this.onFetchRedPackageHandler(); // 获取红包列表
        }else{
          // 如果没授权登录用户 ，绑定一个事件，等登陆完回调一下
          eventHandler.on("indexLoginCallBack", this.onFetchNewUserPackageHandler)
          eventHandler.on("indexLoginCallBack", this.onFetchCarListNumHandler)
        }
      }).catch(err => {
        console.log(err)
      })
    }
    
    // let last_user_store_id = wx.getStorageSync("last_user_store_id");
    let communityObj = wx.getStorageSync("communityObj");
    if (!communityObj){
      wx.showModal({
        title: '温馨提示',
        content: '需要您先选择社区哦～',
        showCancel:false,
        confirmColor:"#ffaa00",
        confirmText:"立即选择",
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/page/index/pages/location/location',
            })
        }
        }
      })
      // this.setData({
      //   "state.needCommunityStatus":true
      // })
    }else{
      this.setData({
        // "state.needCommunityStatus": false,
        "state.communityObj": JSON.parse(communityObj)
      })

      // eventHandler.on("selectComCallBack", () => {
      //   this.data.state.communityCur = "";
      //   this.setData({
      //     "state.needCommunityStatus": false,
      //   })
      // })
      // // 如果卡片的社区id 跟本地的社区id 不同，则弹窗 提示需要选择社区
      // if (this.data.state.communityCur && this.data.state.communityCur.id != JSON.parse(communityObj).id){
      //   // 如果用户到达选择社区页面，但是点了左上角返回按钮，则直接默认不替换
      //   if (!app.globalData.onGoToCompareCommunityPage) {
      //     this.setData({
      //       "state.needCommunityStatus": true,
      //     })
      //   } else {
      //     this.data.state.communityCur = "";
      //     this.setData({
      //       "state.needCommunityStatus": false,
      //     })
      //     app.globalData.onGoToCompareCommunityPage = false;
      //   }
      // }else{
      //   this.setData({
      //     "state.needCommunityStatus": false,
      //     "state.communityObj": JSON.parse(communityObj)
      //   })
      // }
      
    }
    //  onChangeCommunityStatus 判断是否更改了社区位置 
    //上面一个操作，判断communityObj 并且把communityObj 设置在本地
    if (app.globalData.onChangeCommunityStatus) {
      app.globalData.onChangeCommunityStatus = false
      // 2019-1-24 发现一个问题 切换地址的时候，不能拿到最新的购物车数量
      // 所以这里重制一下
      app.globalData.cartItemNumber = 0;
      this.setData({
        "state.page": 1
      })
      // onGetLocationHandler事件，把本地地址，设置为页面appData中，+ 获取产品列表等请求
      // this.onGetLocationHandler();
      this.onFetchHandlers();
    }

    if(app.globalData.isCarUpdateStatus){
      app.globalData.isCarUpdateStatus = false;
      this.onFetchCarListNumHandler();
    }
    
    // 判断是否需要用户授权userInfo
    // wxApi.getSetting()
    // .then(res =>{
    //   if (res.authSetting["scope.userInfo"]){
    //     this.setData({
    //       "state.needAuthorize":false
    //     })
    //   }else{
    //     this.setData({
    //       "state.needAuthorize": true
    //     })
    //   }
    // }).catch(err=>{
    //   console.log(err)
    // })
  },

  // 统一触发事件
  onFetchHandlers:function(){
    this.onFetchRotations(); // 轮播图
    this.onFetchCategorys(); // 分类列表
    // this.onFetchFlashTimeList(); // 秒杀时间列表
    this.onFetchFlashSaleList(); // 秒杀商品列表
    this.onFetchGoodsList(); // 商品列表
    this.onFetchPurchaseList();
    // 必须在拿到商品列表以后，再请求购物车列表，这个方法里面包括一些比对操作
    // wxApi.getSetting().then(res=>{
    //   if (res.authSetting["scope.userInfo"]) {
    //     this.onFetchCarListNumHandler(); // 购物车数量请求
    //   }
    // }).catch(err=>{
    //   console.log(err)
    // })
  },

  // 轮播图请求
  onFetchRotations: function () {
    let _this = this;
    let url = `${config.ApiRoot}/rotation`;
    let data = {
      url,
      data:{
        // adcode: this.data.state.locationObj?this.data.state.locationObj.adcode:"",
        adcode: this.data.state.communityObj ? this.data.state.communityObj.adcode : "",
      }
    }
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          _this.setData({
            "data.rotations": data,
            "data.qiniuDomain": userMs.config["qiniuDomain"]
          })
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
  },

  // 类型标签请求
  onFetchCategorys: function () {
    let _this = this;
    let url = `${config.ApiRoot}/activity/goods/category`;
    let data = {
      url,
    }
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          setTimeout(()=>{
            _this.setData({
              "state.filters": data
            })
          },100)
       
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
  },

  // 商品列表请求
  onFetchGoodsList:function(){
    let _this = this;
    let url = `${config.ApiRoot}/activity/detail`;

    let data = {
      url,
      data:{
        // adcode: this.data.state.locationObj?this.data.state.locationObj.adcode:"",
        adcode: this.data.state.communityObj ? this.data.state.communityObj.adcode : "",
        type: this.data.state.selectTabType == "now"?1:2,
        limit:20,
        page:this.data.state.page,
        category: this.data.state.selectFilterId
      }
    }
    this.loading = true;

    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          // 只要是加载第一页的数据，则触发商品加载动画,
          // 但是轮播图加载动画，只有第一次加载才需要，切换导航栏不触发

          this.setData({
            "data.is_open": data.is_open
          });

          console.log("第一页数据：", data);

          if (data.is_open && (_this.data.state.page == 1 || this.data.state.firstLoading)){

                  this.setData({
                    "state.loading": true,
                    "state.firstLoading":false,
                  })
                  setTimeout(()=>{
                      this.setData({
                        "state.loading":false
                      })
                    },700)
          }

          // 预售的商品，只有在第一页请求的时候，才setData 一次
          if (_this.data.state.page == 1){

            //没有数据就没必要往下加载了
            if (data.activity.length == 0 && data.presale_goods.length==0) {
                 _this.setData({
                   "data.activity":null,
                   "data.presale_goods":null
                 })
                 return
            }

            data.presale_goods.forEach((item,index)=>{
              let splitArr = this.splitIntFloat(item.our_price / 100);
              item['intValue'] = splitArr[1];
              item['floatValue'] = splitArr[2] ? splitArr[2] : '';
            });

            setTimeout(()=>{
                  this.setData({
                    "data.presale_goods": data.presale_goods
                  });
            },100);
            
          }
     
          if (data.activity && data.activity.goods && data.activity.goods.data && data.activity.goods.data.length){
            /*为何这样处理？
            因为从正在抢购切换到下期预告
            会有缓存，会先导致本期活动商品变成即将开抢状态，然后再被新数据渲染
            所以处理方案有两种
            1、使用同数据，不同组件
            2、使用同组件，用不同数据渲染
            */
            // if(this.data.state.selectTabType == "next"){
            //   data.activity.nextArr = _this.data.state.page > 1 ? this.data.data.activity.nextArr.concat(data.activity.goods.data) : data.activity.goods.data
            // } else{
            //   data.activity.nowArr = _this.data.state.page > 1 ? this.data.data.activity.nowArr.concat(data.activity.goods.data) : data.activity.goods.data
            // }

            // 当当前页面>1,此时需要在进行购物车数据比对，判断当前商品是否被加入购物车过，并拿到此商品在购物车中的数量

             //处理 our_price 价格 0.00格式
            // if (_this.data.state.page == 1 || _this.data.state.page >1){

            //       data.activity.goods.data.forEach(item => {
            //           let splitArr = this.splitIntFloat(item.our_price / 100);
            //           item['intValue'] = splitArr[1];
            //           item['floatValue'] = splitArr[2] ? splitArr[2] : '';
            //       })
            // }


         
            //处理 our_price 价格 0.00格式
            data.activity.goods.data.forEach(item => {
              let splitArr = this.splitIntFloat(item.our_price / 100);
              item['intValue'] = splitArr[1];
              item['floatValue'] = splitArr[2] ? splitArr[2] : '';
            });
          

            // 否则等购物车数量拿到值，再比对第一页
            if (_this.data.state.page>1){
              let cartList = this.data.data.cartList;
              if (cartList.length){
                data.activity.goods.data.forEach(item => {
                 
                  cartList.forEach(cartItem => {
                    if (cartItem.type == item.type && cartItem.activity_goods_id == item.id) {
                          item.totalBuyNum = cartItem.num
                          item.cartId = cartItem.id
                    }
                  })

                })
              }

            }

            

            // 2019-1-3改版，没有这一期，下一期活动区分
            data.activity.goods.data = _this.data.state.page > 1 ? this.data.data.activity.goods.data.concat(data.activity.goods.data) : data.activity.goods.data
          }

          //console.log('data', data.activity.goods.data);

      
          console.log("那里来的数据啊:",data.activity);
          _this.setData({
            "data.activity": data.activity,
            "data.is_open": data.is_open,
            // "data.products": _this.data.state.page > 1? _this.data.data.products.concat(data.data):data.data,
            "data.totalPage": data.activity.goods ? data.activity.goods.last_page:1,
            "data.qiniuDomain": userMs.config["qiniuDomain"]
          })
          //当是这一期活动的时候，才倒计时
          if (_this.data.state.selectTabType == "now" && data.has_activity) {
            this.onSetTimeDesc(new Date().getTime(), data.activity.end_time * 1000, this.onSetTimeDescCallBack)
          }
          if (_this.data.state.page == 1){
            wxApi.getSetting().then(res => {
              if (res.authSetting["scope.userInfo"]) {
                this.onFetchCarListNumHandler(); // 购物车数量请求
              }
            }).catch(err => {
              console.log(err)
            })
          }
          

        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally( res=>{
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        // _this.setData({
        //   "state.loading": true
        // })
        this.loading = false
      })
  },

  // 秒杀时间列表请求
  onFetchFlashTimeList: function () {
    let _this = this;
    let url = `${config.ApiRoot}/seckill/time-points`;
    let data = {
      url,
    }
    wxApi.request(data)
      .then(res => {
        let { data, code, msg } = res.data
        if (code == 10000) {
          if (data.length == 0) {
            this.setData({
              "data.timeFilters": [],
              "state.flashSaleLoading": false
            })
            return false;
          }
          // this.data.data.timeFilters = data;
          let selectFilterTimeIndex = 0;
          let nearNum = ""; // 用于判断谁的开始时间更接近于当前时间
          data.forEach((item, index) => {
            // // 先判断是否到达结束时间
            // if (item.end_time != null) {
            //   if (new Date() - item.end_time * 1000 > 0) {
            //     item.endStatus = true
            //     item.featureStatus = false
            //     item.startStatus = false
            //     return;
            //   }
            // }
            let duringTime = new Date() - item.start_time * 1000;
            // 再判断是否到达开始时间
            if (duringTime < 0) {
              item.featureStatus = true
              item.endStatus = false
              item.startStatus = false
              return;
            } else {
              item.startStatus = true
              if ((duringTime < nearNum || !nearNum)) {
                selectFilterTimeIndex = index;
                nearNum = duringTime;
              }
            }


            // let duringTime = new Date() - item.start_time * 1000;
            // if (duringTime > 0) {
            //   if ((duringTime < nearNum || !nearNum)) {
            //     selectFilterTimeIndex = index;
            //     nearNum = duringTime;
            //   }
            // }

          })

          // 如果时间列表长度大于3 需要做判断
          // 时间长度等于小于3，不需要处理
          if (data.length>3){
            // 时间列表长度-1 -当前所在时间下标 = 中间相隔多少个
            // 如果距离最后一个下标大于等于2个
            if ((data.length-1) - selectFilterTimeIndex >= 2 ){
              // 从当前下标开始截取 
              // 截取 包括自己在内1个加后面2个
              data = data.slice(selectFilterTimeIndex,selectFilterTimeIndex+3);
              // 原数组被截取过了，此时默认选中的item从原来数组中的第三个变为第1个
              // 对应下标从2改变为0
              selectFilterTimeIndex = 0;
            } // 当前时间段，是时间列表倒数第二个
            else if ((data.length - 1) - selectFilterTimeIndex == 1){
              // // 截取 包括自己在内的1个加前面1个加后面1个
              data = data.slice(selectFilterTimeIndex-1, selectFilterTimeIndex + 2);
              // 原数组被截取过了，这里的下标应该相对应改变为1
              selectFilterTimeIndex = 1;
            } // 当前时间段，是时间列表最后一个
            else if ((data.length - 1) - selectFilterTimeIndex == 0) {
              data = data.slice(selectFilterTimeIndex - 2);
              // 原数组被截取过了，这里的下标应该相对应改变为2
              selectFilterTimeIndex = 2;
            }
            
          }
          data[selectFilterTimeIndex].isNearTimeFilter = true;
          this.setData({
            "data.selectFilterTimeIndex": selectFilterTimeIndex,
            "data.timeFilters": data
          })
          this.onFetchFlashSaleList();
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
      })
  },
  onSelectTimeFilterHandler: function (e) {
    const index = e.currentTarget.dataset.index;
    if (index == this.data.data.selectFilterTimeIndex) {
      return;
    }
    this.setData({
      "data.selectFilterTimeIndex": index
    })
    this.onFetchFlashSaleList();
  },

  // 秒杀商品列表请求
  onFetchFlashSaleList: function () {
    let _this = this;
    let url = `${config.ApiRoot}/seckill/goods`;
    // let selectFilterTimeIndex = this.data.data.selectFilterTimeIndex;
    // let timeFilters = this.data.data.timeFilters;
    let data = {
      header: {
        "version": '1'
      },
      url,
      data: {
        // adcode: this.data.state.locationObj?this.data.state.locationObj.adcode:"",
        adcode: this.data.state.communityObj ? this.data.state.communityObj.adcode : "",
        // start_time: timeFilters[selectFilterTimeIndex].start_time,
        recommend:1,
        limit: 12,
      }
    }
    this.setData({
      "state.flashSaleLoading":true
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          data.data.forEach((item, index) => {
            // // 先判断是否到达结束时间
            // if (item.end_time != null) {
            //   if (new Date() - item.end_time * 1000 > 0) {
            //     item.endStatus = true
            //     item.featureStatus = false
            //     item.startStatus = false
            //     return;
            //   }
            // }
            let currentDate = new Date(item.start_time * 1000)
            let duringTime = new Date() - item.start_time * 1000;
            
            // 再判断是否到达开始时间
            if (duringTime < 0) {
              item.featureStatus = true;
              item.endStatus = false;
              item.startStatus = false;
              let minutes = currentDate.getMinutes();
              let hours = currentDate.getHours()
              item.timeText = [hours, minutes].map(this.formatNumber).join(":");
              if (currentDate.getDate() - new Date().getDate() > 0){
                item.tomorrowStatus = true;
              }
              return;
            } else {
              item.startStatus = true
              // if ((duringTime < nearNum || !nearNum)) {
              //   selectFilterTimeIndex = index;
              //   nearNum = duringTime;
              // }
            }
          })
          this.setData({
            "data.flashSaleList":data.data
          })
          if(!this.data.data.qiniuDomain){
            this.setData({
              "data.qiniuDomain": userMs.config["qiniuDomain"]
            })
          }
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        this.setData({
          "state.flashSaleLoading": false
        })
      })
  },
  formatNumber:(n) => {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  // 购买记录列表请求
  onFetchPurchaseList: function () {
    let _this = this;
    let url = `${config.ApiRoot}/goods/purchase-log`;
    let data = {
      url,
      data: {
        number: 10,
      }
    }
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          // 虚拟弹幕数据进行逻辑书写
          let barrageList = data;
          // 第一次渲染不需要等5s，后面才间隔5秒
          let barrageIndex = this.data.state.barrageIndex;
          let barrageItem = barrageList[barrageIndex];

          //console.log("购买记录", barrageItem);

          if (barrageItem) {
            this.setData({
              "state.barrageItem": barrageItem,
              "state.barrageIndex": ++barrageIndex
            })
          }
          let timer = setInterval(() => {
            let barrageIndex = this.data.state.barrageIndex;
            let barrageItem = barrageList[barrageIndex];

            if (barrageItem) {
              this.setData({
                "state.barrageItem": barrageItem,
                "state.barrageIndex": ++barrageIndex
              })
            } else {
              this.setData({
                "state.barrageItem": ""
              })
              clearInterval(timer)
            }
          }, 5000)
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
      })
  },
  // onGetUserInfoHandler:function(e){
  //   if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {
  //     this.setData({
  //       "state.needAuthorize": true
  //     });
  //     wx.navigateTo({
  //       url: '../../userCenter/pages/login/login',
  //     })
  //   } else {
  //     this.setData({
  //       "state.needAuthorize": false
  //     })
  //     userMs.PLogin().then(res=>{
  //       console.log(res)
  //     })
  //     .catch(err=>{
  //       console.log(err)
  //     })
  //   }
  // },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      "state.hasRedPackageStatus": false
    })
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
    this.data.state.page = 1;
    this.onFetchGoodsList();
    // this.onFetchFlashTimeList();
    this.onFetchFlashSaleList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.data.activity && this.data.data.activity.goods && this.data.data.activity.goods.data.length > 0 && !this.loading) {
      this.fetchNextPage(this.onFetchGoodsList);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    const _this = this;
    let queryObj = {
      communityObj: wx.getStorageSync("communityObj") ? JSON.parse(wx.getStorageSync("communityObj")) : "",
      // 这里loacationObj 必须先JSON.parse，因为用户存的时候JSON.toString()了一下
      // locationObj: wx.getStorageSync("locationObj") ? JSON.parse(wx.getStorageSync("locationObj")) : "",
      // storeId: wx.getStorageSync("self_store_id") ? wx.getStorageSync("self_store_id") : (wx.getStorageSync("last_user_store_id") ? wx.getStorageSync("last_user_store_id") : "")
    }
    queryObj = encodeURIComponent(JSON.stringify(queryObj))
    return {
      title: "壹手仓鲜品・严选品质社区团购", // 分享标题
      // title: _this.data.productDetail.name, // 分享标题
      // desc: _this.data.productDetail.short_name, // 分享描述
      imageUrl: "",
      path: `/page/tabBar/index/index?queryObj=${queryObj}`, // 分享路径
      success: function (res) {
        console.log(`/page/tabBar/index/index?queryObj=${queryObj}`)
      },
      fail: function (res) {
      }
    }
  },

  // 本期 && 下一期切换
  onClickTabHandler:function(e){
    const type = e.currentTarget.dataset.type;
    if (type == this.data.state.selectTabType) return;
    this.setData({
      "state.selectTabType":type,
      "state.page":1
    })
    this.onFetchGoodsList();
  },

  // 倒计时事件
  onSetTimeDesc: utilActions.onSetTimeDesc,

  //弹窗提示事件
  alertHandler: utilActions.alertHandler,

  // 倒计时回调事件
  onSetTimeDescCallBack:function(status,timeObj){
    if(!status){
      this.setData({
        "state.activityEnd":true
      })
    }else{
      // 十点更新的时候，如果用户停留在这个页面，会导致
      // activityEnd恒为true，这个时候需要设置activityEnd 为false
      // 避免多次setData，减少 性能损耗，这样处理
      if (this.data.state.activityEnd){
        this.setData({
          "state.activityEnd": false
        })
      }
      this.setData({
        "state.countDownDay": timeObj.countDownDay, 
        "state.countDownHour": timeObj.countDownHour,
        "state.countDownMinute": timeObj.countDownMinute, 
        "state.countDownSecond": timeObj.countDownSecond
      })
    }
  },

  // 手动选择地区页面
  onGotoLocationPageHandler:function(){

    if (this.data.state.needLocation){//没与定位
      this.alertHandler("请先点击开通定位")
    }else{
      // if (this.data.state.communityCur){
      //   let queryObjN = {
      //     communityObj: this.data.state.communityCur
      //   }
      //   queryObjN = encodeURIComponent(JSON.stringify(queryObjN))
      //   wx.navigateTo({
      //     url: `../../index/pages/compareCommunity/compareCommunity?queryObj=${queryObjN}`,
      //   })
      // }else{
        wx.navigateTo({
          url: '/page/index/pages/location/location',
        })
      // }
    }
  },

  // api打开设置页
  onAgreeLocation:function(){
    const _this = this;

    wxApi.openSetting().then(res => {
      if (res.authSetting["scope.address"]) {
        return;
      } else {
        throw "授权失败！";
      }
    })
    .then(() => {
      _this.onGetLocationHandler();
    })
    .catch(err => {
      if (typeof err === "string") {
        wx.showToast({
          title: err,
          image: "/imgs/cancel.png",
          duration: 2000
        });
      }
    });
  },

  // 按钮打开设置页
  openSettingHandler:function(e){
    let _this = this;
    console.log(e)
    if (e.detail.authSetting && e.detail.authSetting["scope.userLocation"]) {
        _this.onGetLocationHandler();
    } else {
      wx.showToast({
        title: "授权失败",
        image: "/imgs/icon-fail-default.png",
        duration: 2000
      });
    }
  },

  // 前往搜索页面
  onGoToSearchPageHandler:function(){
    if (this.data.state.needLocation) {
         this.alertHandler("请先点击开通定位")
    } else {
      wx.navigateTo({
        url: '/page/index/pages/searchPage/searchPage',
      })
    }
  },

  // 滚动监听事件
  onPageScroll({ scrollTop }) {
    if (scrollTop < 0) return;
    // 这个是计算 filterbar 到达顶部的距离
    // 头部内容 332rpx
    // 100rpx 正在抢购 倒计时栏 高度80rpx +margin-top 20rpx
    let headerHeight = 332;
    let nowBuyingTimeHeight = 100;
    let flashSaleHeight = 468;
    let changeHeight;
    // 如果秒杀接口还是loading状态，则下滑不触发逻辑函数
    if (this.data.state.flashSaleLoading !== false) return;
    if (this.data.data.flashSaleList.length){
      changeHeight = this.WidthRadio*(headerHeight + flashSaleHeight + nowBuyingTimeHeight);
    }else{
      changeHeight = this.WidthRadio*(headerHeight + nowBuyingTimeHeight);
    }
    this.changeHeight = changeHeight;
    // changeHeight = this.WidthRadio*(350);
    if (scrollTop - this.prevScrollTop >= 0 && this.prevDir !== "down") {
      // 向下滚
      //if (scrollTop < this.needScrollTop) return;
      if (scrollTop < changeHeight) return;
      this.setData({
        "state.filterBarFixStatus": true,
      });

      this.prevDir = "down";
    } else if (scrollTop - this.prevScrollTop < 0 && this.prevDir !== "up") {
      // 向上滚
      if (scrollTop > changeHeight) return;
      this.setData({
        "state.filterBarFixStatus": false,
      });

      this.prevDir = "up";
    }

    this.prevScrollTop = scrollTop;
  },

  // 滑动时选择产品分类
  onSelectFilterHandler:function(e){
    // this.setData({
    //   "state.filterBarFixStatus": false
    // })
    // setTimeout(function(){
    //   wx.pageScrollTo({
    //     scrollTop: 0,
    //   })
    // }.bind(this),100)
    let _this = this;
    
    
    const categoryId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    if (categoryId == this.data.state.selectFilterId) return;
    let scrollLeft = 0;
    if(index > 1){
      scrollLeft = 156 * (index - 2) * this.WidthRadio + 120 * this.WidthRadio;
    }
    if (this.prevScrollTop > this.changeHeight) {
      wx.pageScrollTo({
        scrollTop: this.changeHeight+1,
        duration:0, // 这个参数如果不为0，则会造成fixed 元素抖动
        // success,complete,fail函数不触发，不知道啥时候解决2019-1-28
        // success: function () {
        //   console.log("success")
        // },
        // complete: function () {
        //   console.log("complete aaa")
        // }
      })
    }
    this.setData({
      "state.selectFilterId":categoryId,
      "state.page":1,
      "data.scrollLeft": scrollLeft
    })
    this.onFetchGoodsList();
  },

  // 关闭新人红包弹窗
  onClosePackageBoxHandler:function(){
    this.setData({
      "state.isNewUserStatus":false
    })
  },

  // 前往我的红包页面
  onGotoPackageListPageHandler:function(){
    wx.navigateTo({
      url: '/page/userCenter/pages/redPackage/redPackage',
    })
    this.setData({
      "state.hasRedPackageStatus": false
    })
  },

  // 前往秒杀列表页面
  onGoToFlashSaleListPageHandler:function(){
    wx.navigateTo({
      url: '/page/index/pages/flashSaleList/flashSaleList',
    })
  },
  onCallHandler: function (e) {
    let number = e.currentTarget.dataset.number;
    wx.showActionSheet({
      itemList: [number],
      success: function (res) {
        wx.makePhoneCall({
          phoneNumber: number //仅为示例，并非真实的电话号码
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  onGotoProductDetailHandler:function(e){
    let item = e.currentTarget.dataset.item;
    let queryObj = {
      isGroupBuyStatus: false,
      activityId: item.id,
      type: item.type ? item.type : 1
    };
    
    wx.navigateTo({
      url: `/page/productDetail/productDetail?queryObj=${encodeURIComponent(JSON.stringify(queryObj))}`,
    })
  }
}
pageObj = util.mixin(pageObj, pageContorlMixin);

Page(pageObj)