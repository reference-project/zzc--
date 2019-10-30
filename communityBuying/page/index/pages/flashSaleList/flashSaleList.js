// page/index/pages/flashSaleList/flashSaleList.wxml.js
const data = require("./data.js");
const pageContorlMixin = require("../../../../class/pageControl.js");
let util = require("../../../../utils/util.js");
const wxApi = require("../../../../utils/wxApi.js");
// const UtilActions = require("../../../class/utilActions.js");
// let utilActions = new UtilActions;
//获取应用实例
const app = getApp()
const userMs = app.userMs;
let config = userMs.config;

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
      title: '限时秒杀',
    })

    if (options.queryObj) {
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
              url: `../compareCommunity/compareCommunity?queryObj=${queryObjN}`,
            })
          }
        }
      }
    }

    this.getSystemInfoHandler();
  },
  // 判断是否授权，请求全局的登录事件
  onFetchUserInfoHandler: function () {
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        userMs.onFetchUserData();
      } else {
      }
    })
  },
  // 获取system 信息
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
  onFetchFlashTimeList:function(){
    let _this = this;
    let url = `${config.ApiRoot}/seckill/time-points`;
    let data = {
      header: {
        "version": '1'
      },
      url,
      data:{
        adcode: this.data.state.locationObj.adcode ? this.data.state.locationObj.adcode : "",
      }
    }
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          if(data.length == 0){
            this.setData({
              "data.filters":[]
            })
            return false;
          }
          this.data.data.filters = data;
          let selectFilterIndex = 0;
          let nearNum = ""; // 用于判断谁的开始时间更接近于当前时间
          this.data.data.filters.forEach((item,index)=>{
            // // 先判断是否到达结束时间
            // if (item.end_time != null) {
            //   if (new Date() - item.end_time * 1000 > 0) {
            //     item.endStatus = true
            //     item.featureStatus = false
            //     item.startStatus = false
            //     return;
            //   }
            // }
            // 再判断是否到达开始时间
            if (new Date() - item.start_time * 1000 < 0) {
              item.featureStatus = true
              item.endStatus = false
              item.startStatus = false
              return;
            }else{
              item.startStatus = true
            }

            
            let duringTime = new Date() - item.start_time * 1000;
            if (duringTime > 0 ){
              if ((duringTime < nearNum || !nearNum)){
                selectFilterIndex = index;
                nearNum = duringTime;
              }
            }
            
          })
          let currentFilterItem = this.data.data.filters[selectFilterIndex];
          let nextFilterItem = this.data.data.filters[selectFilterIndex + 1];
          currentFilterItem.timeDescStatus = true

          // 如果当前filterItem 是即将开始的，则拿当前filterItem 的开始时间倒计时
          if (currentFilterItem.featureStatus){
            this.onSetFilterItemTime(currentFilterItem, currentFilterItem.start_time)
          }else{
            // 如果当前filterItem 不是即将开始的，则看下一个filterItem 是否存在
            if (nextFilterItem) {
              this.onSetFilterItemTime(currentFilterItem, nextFilterItem.start_time)
            }else{
              currentFilterItem.timeDescStatus = false
            }
          }
          // 优化为上面的代码
          
          // // 如果有即将开始的时间段
          // if (nextFilterItem){
          //   // 如果当前时间段还未开始，则拿当前filterItem 的开始时间倒计时
          //   if (currentFilterItem.featureStatus){
          //     this.onSetFilterItemTime(currentFilterItem, currentFilterItem.start_time)
          //   }else{
          //     // 如果当前时间段已经开始，则拿下一个filterItem 的开始时间倒计时
          //     this.onSetFilterItemTime(currentFilterItem, nextFilterItem.start_time)
          //   }
          // }else{
          //   // 如果没有其他时间段了，本身时间是即将开始的，则倒计时
          //   if (currentFilterItem.featureStatus){
          //     this.onSetFilterItemTime(currentFilterItem, currentFilterItem.start_time)
          //   }else{
          //     currentFilterItem.timeDescStatus = false
          //   }
            
          // }
          let scrollLeft=0;
          // selectFilterIndex 是下标
          // 如果是第二个是选中状态
          if(selectFilterIndex==1){
            scrollLeft = this.WidthRadio*94;
          } else if (selectFilterIndex>1){
            scrollLeft = this.WidthRadio * (selectFilterIndex-1)*188;
          }
          // this.onSetFilterItemTime(item)
          this.setData({
            "data.selectFilterIndex": selectFilterIndex,
            "data.filters": this.data.data.filters,
            "data.scrollLeft": scrollLeft
          })
          
          // this.setData({
          //   "data.filters":data
          // })
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
  // 秒杀商品列表请求
  onFetchFlashSaleList: function () {
    let _this = this;
    let url = `${config.ApiRoot}/seckill/goods`;
    let selectFilterIndex = this.data.data.selectFilterIndex;
    let filters = this.data.data.filters;
    let data = {
      header: {
        "version": '1'
      },
      url,
      data: {
        adcode: this.data.state.locationObj.adcode ? this.data.state.locationObj.adcode:"",
        start_time: filters[selectFilterIndex].start_time,
        limit: 20,
        page:this.data.state.page
      }
    }
    this.loading = true;
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          // 只要是加载第一页的数据，则触发商品加载动画
          if (_this.data.state.page == 1) {
            // this.setData({
            //   "state.loading": true,
            // })
            // this.data.state.firstLoading = false
            setTimeout(() => {
              this.setData({
                "state.loading": false
              })
            }, 500)
          }
          this.setData({
            "data.flashSaleList": data.data,
            "data.totalPage": data.last_page,
            "data.qiniuDomain": userMs.config["qiniuDomain"]
          })
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        this.loading = false
        // this.setData({
        //   "state.loading":false
        // })
      })
  },
  onSetFilterItemTime: function (item, start_time) {
    let _this = this;
    if (item.interval){
      clearTimeout(item.interval);
    }
    

    
    // item.startStatus = true
    // var totalSecond = item.end_time - new Date() / 1000;
    // if (totalSecond < 0) {
    //   item.activityEnd = true
    //   this.setData({
    //     "productDetail": this.data.productDetail
    //   })
    // }
    var totalSecond = start_time - new Date() / 1000;
    if (totalSecond < 0) {
      item.startStatus = true;
      item.timeDescStatus = false;
      _this.setData({
        "data.filters": _this.data.data.filters
      })
      return false;
    }
    function setTimeHandler(){
      // 先判断是否到达结束时间
      // if (item.end_time != null) {
      //   if (new Date() - item.end_time * 1000 > 0) {
      //     item.endStatus = true
      //     item.featureStatus = false
      //     item.startStatus = false
      //     _this.setData({
      //       "data.filters": _this.data.data.filters
      //     })
      //     return false;
      //   }
      // } else {
      //   // 已经开始的，并且没有结束时间
      //   item.hasEndStatus = false
      // }

      // let totalSecond;
      // // 再判断是否到达开始时间
      // if (new Date() - item.start_time * 1000 < 0) {
      //   item.featureStatus = true
      //   item.endStatus = false
      //   item.startStatus = false
      //   _this.setData({
      //     "data.filters": _this.data.data.filters
      //   })
      //   return false;
      //   // totalSecond = item.start_time - new Date() / 1000;

      // } else {
      //   item.startStatus = true
      //   totalSecond = item.end_time - new Date() / 1000;
      // }

      // 秒数   
      var second = start_time - new Date() / 1000;

      // 天数位   
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位   
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位   
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位   
      var sec = Math.floor(second - day * 3600 * 24 - hr * 3600 - min * 60);
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;
      item.countDownDay = dayStr;
      item.countDownHour = hrStr;
      item.countDownMinute = minStr;
      item.countDownSecond = secStr;
      _this.setData({
        "data.filters": _this.data.data.filters
      });
      second--;
      if (second <= 0) {
        clearInterval(item.interval);
        // item.endStatus = true
        // item.timeDescStatus = false;
        _this.setData({
          "data.filters": _this.data.data.filters
        })
        // 当一个倒计时结束时，请求一次时间段列表数据，相当于刷新一次页面
        _this.onFetchFlashTimeList();
      }
    }
    setTimeHandler();
    item.interval = setInterval(setTimeHandler, 1000);
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
    let locationObj = wx.getStorageSync("communityObj");
    if (locationObj) {
      this.setData({
        "state.locationObj": JSON.parse(locationObj),
      })
      this.onFetchFlashTimeList();
    } else {
      this.setData({
        "state.needLocation": true
      })
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
    if (this.data.data.flashSaleList && this.data.data.flashSaleList.length > 0 && !this.loading) {
      this.fetchNextPage(this.onFetchFlashSaleList);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    const _this = this;
    let queryObj = {
      // 这里loacationObj 必须先JSON.parse，因为用户存的时候JSON.toString()了一下
      // locationObj: wx.getStorageSync("locationObj") ? JSON.parse(wx.getStorageSync("locationObj")) : "",
      // storeId: wx.getStorageSync("self_store_id") ? wx.getStorageSync("self_store_id") : (wx.getStorageSync("last_user_store_id") ? wx.getStorageSync("last_user_store_id") : "")
      communityObj: wx.getStorageSync("communityObj") ? JSON.parse(wx.getStorageSync("communityObj")) : "",
    }
    queryObj = encodeURIComponent(JSON.stringify(queryObj))
    console.log(`/page/index/pages/flashSaleList/flashSaleList?queryObj=${queryObj}`)
    return {
      title: "壹手仓秒杀，甄选尖货底价限时限量秒！", // 分享标题
      // title: _this.data.productDetail.name, // 分享标题
      // desc: _this.data.productDetail.short_name, // 分享描述
      imageUrl: "",
      path: `/page/index/pages/flashSaleList/flashSaleList?queryObj=${queryObj}`, // 分享路径
      success: function (res) {
        console.log(`/page/index/pages/flashSaleList/flashSaleList?queryObj=${queryObj}`)
      },
      fail: function (res) {
      }
    }
  },
  onSelectFilterHandler:function(e){
    const index = e.currentTarget.dataset.index;
    if (index == this.data.data.selectFilterIndex){
      return;
    }
    let scrollLeft = 0;
    // selectFilterIndex 是下标
    // 如果是第二个是选中状态
    if (index == 1) {
      scrollLeft = this.WidthRadio * 94;
    } else if (index > 1) {
      scrollLeft = this.WidthRadio * (index - 1) * 188;
    }
    this.setData({
      "data.selectFilterIndex":index,
      "data.scrollLeft":scrollLeft,
      "state.page":1,
      "state.loading": true,
    })
    this.onFetchFlashSaleList();
  },
  onGoToHomeHandler:function(){
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  },
  onSwiperScrollHandler:function(e){
    if (e.detail.source == "touch"){
      let index = e.detail.current;
      let scrollLeft = 0;
      // selectFilterIndex 是下标
      // 如果是第二个是选中状态
      if (index == 1) {
        scrollLeft = this.WidthRadio * 94;
      } else if (index > 1) {
        scrollLeft = this.WidthRadio * (index - 1) * 188;
      }
      this.setData({
        "data.selectFilterIndex": index,
        "data.scrollLeft": scrollLeft,
        "state.page": 1,
        "state.loading": true,
      })
      this.onFetchFlashSaleList();
    }
  }
}

pageObj = util.mixin(pageObj, pageContorlMixin);

Page(pageObj)