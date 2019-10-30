// components/alertingTips/alertingTips.js

const wxApi = require("../../utils/wxApi.js");

const UtilActions = require("../../class/utilActions.js");
let utilActions = new UtilActions;
//获取应用实例
const app = getApp()
const userMs = app.userMs;
let config = userMs.config;

Component({

  lifetimes:{
    attached() {
      // 在组件实例进入页面节点树时执行
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    likeStatus: {
      type: Boolean,
      value: false
    },
    likePageStyle:{
      type: String,
      value: '',
    },
    prosNowData:{//购物车有用产品的数据
      type: Array,
      value: [],
    },
    likeProData: {
      type: Array,
      value:[],
    },
    likeProData2:{
      type: Array,
      value: [],
    },
    likeStyle:{
      type: Number,
      value: " ",
    },
    likeProStaus:{
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
      
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGoToProductDetail: function (e) {
      var index = e.currentTarget.dataset.index;
      let queryObj = {
        isGroupBuyStatus: false,
        activityId: this.properties.likeProData[index].activity_goods_id,
        type: this.properties.likeProData[index].type ? this.properties.likeProData[index].type : 1
      };
      
    
      wx.navigateTo({
        url: `/page/productDetail/productDetail?queryObj=${encodeURIComponent(JSON.stringify(queryObj))}`,
      });
  
    },
    //加入购物车并刷新
    onAddGoodsCar:function(e){
      var index = e.currentTarget.dataset.index;
      let likePageStyle = this.properties.likePageStyle;//不同页面使用组件

  
      //点击猜你喜欢 购买是 判断是否授权登录过 登录了才能 购买
      wxApi.getSetting().then(res=>{
        if (res.authSetting["scope.userInfo"]) {
            if (likePageStyle =='goodsCar'){
              this.onUpdateCartData(index, 'goodsCar');//购物车页面调用
            }else{
              this.onUpdateCartData(index, likePageStyle);//其他页面调用
            }
          }else{
              wx.navigateTo({
                url: '/page/userCenter/pages/login/login',
              });
          }

     });
      
   },
    //请求购物车
    onUpdateCartData:function(index,style){

      let _this = this;

      let likeProDataItem=null;

      if (style =='productDetail'){
         likeProDataItem = this.properties.likeProData2[index];//详情页
      }else{
         likeProDataItem = this.properties.likeProData[index];
      }
    
      const url = `${config.ApiRoot}/cart`;
      let adcode=0;
      if (wx.getStorageSync("communityObj")) {
          adcode = JSON.parse(wx.getStorageSync("communityObj")).adcode
      }

      let queryObj = {
        activity_goods_id: likeProDataItem.activity_goods_id,
        goods_id: likeProDataItem.goods_id,
        sku_id: likeProDataItem.sku_id,
        type: likeProDataItem.type,
        adcode: adcode,
        num:1,
        recommend_from: likeProDataItem.recommend_from
      }

      let queryArr = [];
      queryArr.push(queryObj); 

      wx.showLoading({
        title: '加载中',
      })

      userMs.request({
        url,
        method: 'POST',
        data: queryArr
      })
      .then(res=>{
        const { code, data, msg } = res.data;
        // 购物车列表 数量加减，更新底部导航栏购物车数量，不请求接口情况下更新
        let cartItemNumber = app.globalData.cartItemNumber;

        if (code === 10000) {

             wx.hideLoading();
             cartItemNumber++;

             app.globalData.cartItemNumber = cartItemNumber;

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
          
             var myEventDetail = {
                index: index
            }
           //购物车页面才才执行   
          if (style =='goodsCar'){
               this.triggerEvent('parentEvent', myEventDetail);//触发父级来的方法购物车页面
          } else {//其他页面
              this.triggerEvent('parentEventOther', myEventDetail);//触发父级来的方法其他页面
          }
        
        }else{

            this.alertHandler(msg);
            console.log(msg);
        }
         
       })
        .catch(error => console.log(error))
        .finally(() => {
          wx.hideLoading();
        });


    },
    alertHandler: utilActions.alertHandler,
  }
 
})
