// page/cart/cart.js
const data = require("./data.js");
const wxApi = require("../../utils/wxApi.js")
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

const UtilActions = require("../../class/utilActions.js");
let utilActions = new UtilActions;

var startX, endX;
var moveFlag = true;// 判断执行滑动事件

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
      title: '购物车',
    })
    // wxApi.getSetting().then(res => {
    //   if (res.authSetting["scope.userInfo"]) {
        
    //   } else {
    //     wx.navigateTo({
    //       url: '/page/userCenter/pages/login/login',
    //     })
    //     this.setData({
    //       "state.needAuthorize": true,
    //       "state.isLoading": false
    //     })
    //   }
    // }).catch(err => {
    //   console.log(err)
    // });
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
    wxApi.getSetting().then(res=>{
      if (res.authSetting["scope.userInfo"]) {
        this.setData({
          "state.needAuthorize": false
        })
        this.onFetchCartList(()=>{
           this.getLikeData(this.data.data.goodsIdAarry);//获取你喜欢的产品数量
        });
      } else {
        this.setData({
          "state.needAuthorize": true,
          "state.isLoading": false
        })
      }
    }).catch(err => {
      console.log(err)
    });

    setTimeout(() => {
      //判断是否授权 设置导航背景颜色
      if (this.data.state.needAuthorize) {
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#FFCE38',
        });
      } else {
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#fff',
        });
      }
    }, 600);

    // this.onComputePriceAndCheckAll();
  },
  touchStart: function (e) {

       var idNum = e.currentTarget.dataset.id;
       var index = e.currentTarget.dataset.index;
       var type = e.currentTarget.dataset.type;

    if (type=='now'){
      if (idNum == this.data.data.prosNow[index].id) {
        startX = e.touches[0].pageX; // 获取触摸时的原点
        moveFlag = true;
      }
    }else{
      if (idNum == this.data.data.prosOut[index].id) {
        startX = e.touches[0].pageX; // 获取触摸时的原点
        moveFlag = true;
      }
    }

    
  },
  // 触摸移动事件
  touchMove: function (e) {
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    endX = e.touches[0].pageX; // 获取触摸时的原点
    if (moveFlag) {
      if (endX - startX > 50) {
        console.log("move right");
        moveFlag = false;
        if (type=='now'){
          this.data.data.prosNow[index].moveState = false;
          this.setData({
            "data.prosNow": this.data.data.prosNow
          });
        }else{
          this.data.data.prosOut[index].moveState = false;
          this.setData({
            "data.prosOut": this.data.data.prosOut
          });
        }
      }
      if (startX - endX > 50) {
        console.log("move left");
        moveFlag = false;

        if(type=='now'){
          this.data.data.prosNow[index].moveState = true;
          this.setData({
            "data.prosNow": this.data.data.prosNow
          });
        }else{
          this.data.data.prosOut[index].moveState = true;
          this.setData({
            "data.prosOut": this.data.data.prosOut
          });
        }
    
      }
    }

  },
  // 触摸结束事件
  touchEnd: function (e) {
    moveFlag = true; // 回复滑动事件

  },
  //猜你喜欢数据
  getLikeData:function(arry){

    let queryObj = {
        being_browsed_goods_id: 0, // 正在浏览的商品id
        search_page: 0,   // 是否在搜索页
        search_result_goods_ids: [] // 搜索页搜索结果商品id列表]
    };

    let url = `${config.ApiRoot}/marketing/recommend`;
    if (wx.getStorageSync("communityObj")) {
        queryObj.adcode = JSON.parse(wx.getStorageSync("communityObj")).adcode
    }
   
    queryObj.cart_goods_ids = arry;

    let data = {
      url,
      method: "POST",
      data: queryObj
    }

    userMs.request(data)
    .then(res=>{

      const { data, code, msg } = res.data;
      if (code == 10000) { //
           
        data.forEach((item)=>{
          if (item.goods_logo) {
               item.goods_logo = userMs.config["qiniuDomain"] + item.goods_logo;
          }
          item.num = 0;
          item.recommend_from = 1;//来自购物车
        });

          this.setData({
            "data.likeProData": data,
            "state.likeProStaus": data.length>0?true:false
          });
      }

      }).catch(err => {
         console.log(err)
      }).finally((res)=>{

      })
  },
  //跳转去团长端 加盟页面
  onGoToMiniProgram: function () {
    wx.navigateToMiniProgram({
      appId: 'wx05fc0deb15e72f0f',//团长端appId
      path: 'page/userCenter/pages/merchantIntroduction/merchantIntroduction',
      extarData: {
        open: ''
      },
      envVersion: 'release',//develop 开发版 trial 体验版 release正式版
      success(res) {
        // 打开成功
      }
    })
  },
  //父级自定义方法
  onParentEvent: function (e){
    let detailIndex = e.detail.index;//子级传过来的点击当前产品
    this.onFetchCartList(()=>{
      let prosNowNum=0;
        this.data.data.prosNow.forEach((item)=>{
          if (item.activity_goods_id == this.data.data.likeProData[detailIndex].activity_goods_id){
               prosNowNum = item.num;
          }
        })

      this.data.data.likeProData[detailIndex].num = prosNowNum;
      this.setData({
        "data.likeProData": this.data.data.likeProData
      });
    });
  },
  //获取购物车产品数据
  onFetchCartList:function(callback){
    let _this = this;
  
    let prosNow = [];
    let prosOut = [];
    let id = this.data.data.id;
    let url = `${config.ApiRoot}/cart`;
    let queryObj={};
    if(wx.getStorageSync("communityObj")){
      queryObj.adcode = JSON.parse(wx.getStorageSync("communityObj")).adcode
    }
    let data = {
      url,
      data:queryObj
    }
    wx.showLoading({
      title: '加载中',
    })
    
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
      
          let goodsIdAarry = [];//传入猜你喜欢的购买ID

          let [arrySeckill, arryPresell, arryActivityGoods] =[[],[],[]];//有用产品
          let [invalidArrySeckill, invalidArryPresell, invalidArryActivityGoods] = [[],[],[]]//无效产品

          data.forEach(item=>{
            item['moveState'] = false;
            // 有效商品 库存大于0 并且未下架 旧的判断
            // 次日达 预售商品 未下架判断 goods_status sku_status 均不为0
            // 秒杀商品 未下架判断 goods_status sku_status seckill_status 均不为0
           //       if (item.sku_stock > 0 && ((item.type != 3 && item.goods_status && item.sku_status) || (item.type == 3 && item.goods_status && item.seckill_status && item.sku_status)))//旧的判断

            //goods_status
            //sku_status
            //activity_goods_status
            // presell_status
            //seckill_status

            //type==1 次日达  type==2 预售  3秒杀
           let flag = false;
           if (item.goods_status == 1 && item.sku_status == 1){
             
              if (item.type == 1 && item.activity_goods_status==1){
                    flag = true
              }
              if (item.type == 2 && item.presell_status == 1){
                 flag = true
              }
              if (item.type == 3 && item.seckill_status == 1){
                  flag = true
              }  

              if(flag){
                  if (item.sku_stock > 0) {
                    prosNow.push(item);
                  } else {
                    prosOut.push(item);
                  }
                } else {
                  prosOut.push(item);
              }
            }else{
                 prosOut.push(item);
            }

          });

            // console.log('prosNow',prosNow);
            // console.log('prosOut', prosOut);

          let allNum = 0;
          data.forEach(item => {
            allNum += item.num
          })
            app.globalData.cartItemNumber = allNum;
          if (allNum > 0) {
            wx.setTabBarBadge({
              index: 1,
              text: allNum.toString()
            })
          }else{
            wx.removeTabBarBadge({
              index: 1,
            })
          }
          //获取全部有效产品的good_id
          prosNow.forEach((item)=>{
            if (item.goods_id) goodsIdAarry.push(item.goods_id);
          })


          _this.setData({
            "data.products": data,
            "data.goodsIdAarry": goodsIdAarry, //有效产品activey_id
            "data.prosNow": prosNow,
            "data.prosOut": prosOut,
            "data.qiniuDomain": userMs.config["qiniuDomain"]
          })
          this.onComputePriceAndCheckAll();

           setTimeout(()=>{
             if (callback && typeof callback =='function'){
                   callback();
             }
           },100)

        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        _this.setData({
          "state.isLoading": false
        })
        wx.hideLoading();
      })
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

  changeManageStatus:function(){
    this.setData({
      "state.manageStatus": !this.data.state.manageStatus
    })
  },
  // 删除请求，删除成功后，重新setData  data.products
  onDeleteRequest: function (deleteIds) {
    const _this = this;
    wx.showLoading({
      title: '删除中',
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
          _this.onFetchCartList(()=>{
            //data.activityGoodsId
           // _this.data.data.likeProData[detailIndex].num = 0;
            _this.data.data.likeProData.forEach((item)=>{
              if (item.activity_goods_id == _this.data.data.activityGoodsId){
                    item.num = 0
               }
            })
            _this.setData({
              "data.likeProData": _this.data.data.likeProData
            });
          });

          app.globalData.isCarUpdateStatus = true;
        };
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
        // wx.hideNavigationBarLoading();
      });
  },
  onDeleteOnehandler: function (e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;

    if (type =='now'){
       var activitygoodsid = this.data.data.prosNow[index].activity_goods_id;//删除当前产品的 
    }else{
      var activitygoodsid = this.data.data.prosOut[index].activity_goods_id;//删除当前产品的 
    }

    this.setData({
      "data.activityGoodsId": activitygoodsid,
      "state.deleteComfirm":true,
      "state.deleteIndex":index,
      "state.isDeleteOne":true,
      "state.deleteArrType": type
    })
  },
  onDeleteAllhandler:function(){
    this.setData({
      "state.deleteComfirm": true,
      "state.isDeleteOne": false
    })
  },
  onCancelDeleteHandler:function(){
    this.setData({
      "state.deleteComfirm": false,
      "state.isDeleteOne": false
    })
  },
  onConfirmDeleteHandler:function(){
    let deleteIds= [];
    let deleteArrType = this.data.state.deleteArrType;
    if (this.data.state.isDeleteOne){
      deleteArrType == "out" ? deleteIds.push(this.data.data.prosOut[this.data.state.deleteIndex].id) : deleteIds.push(this.data.data.prosNow[this.data.state.deleteIndex].id);
      
      this.onDeleteRequest(deleteIds);
    }else{
      // 这里需要筛选下，打勾的全删除，目前没去筛选
      this.data.data.products.forEach(item=>{
        if (item.selected){
          deleteIds.push(item.id)
        }
      })
      this.onDeleteRequest(deleteIds);
    }
    this.setData({
      "state.deleteComfirm": false,
      "state.isDeleteOne": false
    })
  },
  onNumAddHandler: function (e) {
    let index = e.currentTarget.dataset.index;
    this.onUpdateCartData(index, "add"); 
  },
  onNumDescHandler: function (e) {

    let index = e.currentTarget.dataset.index;
    if (this.data.data.prosNow[index].num<=1){

      this.setData({
        "state.deleteComfirm": true,
        "state.deleteIndex": index,
        "state.isDeleteOne": true,
        "state.deleteArrType": e.currentTarget.dataset.type
      })
        
    }else{
       this.onUpdateCartData(index, "desc");
    }

    
  },
  onSeleteHandler: function (e) {
    let index = e.currentTarget.dataset.index;
    this.onUpdateCartData(index,"select");
  },

  changeSelectAllStatus:function(){
    this.data.data.prosNow.length > 0 && this.onUpdateAll(!this.data.state.selectAllStatus);
  },

  // 统一计算价格函数
  onComputePriceAndCheckAll: function () {
    let allPrice = 0; //总价格
    let marketPrice = 0; //市场价
    let selectAllStatus = true;
    let selectIds = [];
    let selectLength = 0;
    if (!this.data.data.prosNow.length) {
      this.setData({
        "state.allPrice": 0,
        "state.marketPrice": 0,
        "state.selectAllStatus": false,
        "state.selectIds": selectIds
      })
    } else {
      this.data.data.prosNow.forEach(item => {
        if (item.selected) {
          allPrice += item.our_price * item.num;
          marketPrice += item.market_price * item.num;
          allPrice = Number(allPrice.toFixed(2));
          marketPrice = Number(marketPrice.toFixed(2));
          selectLength += item.num;
          selectIds.push(item);
        } else {
          selectAllStatus = false;
        }
      })
      setTimeout(()=>{
        this.setData({
          "state.allPrice": allPrice,
          "state.favouredPrice": ((marketPrice-allPrice) / 100).toFixed(2),
          "state.marketPrice": marketPrice,
          "state.selectAllStatus": selectAllStatus,
          "state.selectIds": selectIds,
          "state.selectLength": selectLength
        })
      },200)
   
    }
  },
  // 结算
  onCreateOrderRequest: function () {
    let _this = this;
    if (!this.data.state.selectIds.length > 0) {
      this.setData({
        "state.alertingStatus": true,
        "state.alertingWords": "请选择商品"
      })
      setTimeout(function () {
        _this.setData({
          "state.alertingStatus": false
        })
      }, 2000)
      return false;
    }

    let queryObj = {
      products: _this.data.state.selectIds,
      isFromCart: true,
      isFormProductDetail: false
    }

    console.log("购物车结算数据", queryObj);

    wx.navigateTo({
      url: '../purchase/purchase?queryObj=' + encodeURIComponent(JSON.stringify(queryObj)),
    })
  },
  onUpdateCartData: function (index,type) {
    const _this = this;
    const skuDataItem = this.data.data.prosNow[index];
    let queryObj={
      activity_goods_id: skuDataItem.activity_goods_id,
      "goods_id": skuDataItem.goods_id,
      "sku_id": skuDataItem.sku_id,
      "type": skuDataItem.type,
      adcode: skuDataItem.adcode
    }
    switch(type){
      case "add":
        queryObj.num = 1;
        break;
      case "desc":
         queryObj.num = -1;
        break;
      case "select":
        queryObj.selected = !skuDataItem.selected;
        break;
    }
    let queryArr = [];       
    queryArr.push(queryObj); 
    wx.showLoading({
      title: '加载中',
    })
    // 这里必须做状态判断，否则，用户连续点击，就会连续触发请求
    if (this.data.state.updateLoading) return;
    this.data.state.updateLoading = true;
    const url = `${config.ApiRoot}/cart`;

    userMs.request({
      url,
      method: 'POST',
      data: queryArr
    })
      .then(res => {
        const { code, data, msg } = res.data;
        // 购物车列表 数量加减，更新底部导航栏购物车数量，不请求接口情况下更新
        let cartItemNumber = app.globalData.cartItemNumber;
        if (code === 10000) {
          console.log("更新成功")
          switch (type) {
            case "add":
              skuDataItem.num++;
              cartItemNumber++;
              break;
            case "desc":
              skuDataItem.num--;
              cartItemNumber--;
              break;
            case "select":
              skuDataItem.selected = !skuDataItem.selected;
              break;
          }
          app.globalData.cartItemNumber = cartItemNumber;
          app.globalData.isCarUpdateStatus = true;
          if (cartItemNumber > 0) {
            wx.setTabBarBadge({
              index: 1,
              text: cartItemNumber.toString()
            })
          } else {
            wx.removeTabBarBadge({
              index: 1,
            })
          }

         
          this.setData({
            "data.prosNow": this.data.data.prosNow
          })


          // let prosNowNum = 0;
          // this.data.data.prosNow.forEach((item) => {
          //   if (item.activity_goods_id == this.data.data.likeProData[detailIndex].activity_goods_id) {
          //     prosNowNum = item.num;
          //   }
          // })

          // this.data.data.likeProData[detailIndex].num = prosNowNum;
          // this.setData({
          //   "data.likeProData": this.data.data.likeProData
          // });

          // if (skuDataItem.activity_goods_id==)

          this.data.data.likeProData.forEach((item)=>{
            if (skuDataItem.activity_goods_id == item.activity_goods_id){
                   item.num = skuDataItem.num;
            }
          });

          this.setData({
            "data.likeProData": this.data.data.likeProData
          });


          this.onComputePriceAndCheckAll();


        }else{
          this.alertHandler(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        this.data.state.updateLoading = false;
        wx.hideLoading();
      });
  },
  onUpdateAll: function (selectAllStatus) {
    const _this = this;
    const queryArr = [];
    this.data.data.prosNow.forEach((item, index) => {
      queryArr[index] = {
        goods_id: item.goods_id,
        sku_id: item.sku_id,
        type: item.type,
        selected: selectAllStatus ? 1 : 0,
        activity_goods_id: item.activity_goods_id,
        adcode:item.adcode
      }
    });
    
    wx.showLoading({
      title: '加载中',
    })
    const url = `${config.ApiRoot}/cart`;

    userMs.request({
      url,
      method: 'POST',
      data: queryArr
    })
      .then(res => {
        const { code, data, msg } = res.data;
        console.log(res.data)
        if (code === 10000) {
          console.log("更新成功")
          if (selectAllStatus) {
            this.data.data.prosNow.forEach(item => {
              item.selected = true
            })
          } else {
            this.data.data.prosNow.forEach(item => {
              item.selected = false
            })
          }

          this.setData({
            "data.prosNow": this.data.data.prosNow
          })
          this.onComputePriceAndCheckAll();
        }else{
          this.alertHandler(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        wx.hideLoading();
      });
  },

  onGoToProductDetail: function (e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    let proObj;
    if(type == "now"){
      proObj = this.data.data.prosNow[index];
    }else{
      proObj = this.data.data.prosOut[index];
    }
    let queryObj={
      isGroupBuyStatus: false,
      activityId: proObj.activity_goods_id,
      type: proObj.type ? proObj.type:1
    }
    wx.navigateTo({
      url: `../productDetail/productDetail?queryObj=${encodeURIComponent(JSON.stringify(queryObj))}`,
    })
  },
  userInfoHandler: function (e) {
    let _this = this;
    if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {

      this.alertHandler("授权才可查看购物车信息");

    } else {
      wx.showLoading({
        title: '加载中',
      })

      // 当用户允许授权时，调用登录，保存token
      wx.showLoading({
        title: '授权中...',
      });
      let url = `${config.ApiRoot}/auth/me`;
      let data = {
        url,
        method: "POST"
      };
      userMs.request(data).then(res => {
        const { data, code } = res.data;
        if (code === 10000) {

          if (data) {

              wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#fed402',
              });

              _this.setData({
                "state.needAuthorize": false,
                "state.isLoading": false
              });
           
          }
        }
      }).catch(err => {
        this.alertHandler(err);
        console.log(err)
      })
        .finally(res => {
          wx.hideLoading()
        })

    }
  },
  onPreventDefault: function () {
    return false;
  },
  onGoToLoginPage:function(){
    wx.navigateTo({
      url: '/page/userCenter/pages/login/login',
    })
  },
  onGoToHomeHandler:function(){
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  },
  alertHandler: utilActions.alertHandler,
})