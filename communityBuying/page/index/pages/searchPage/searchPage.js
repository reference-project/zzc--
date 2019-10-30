// page/index/pages/searchPage/searchPage.js
const data = require("./data.js");
const pageContorlMixin = require("../../../../class/pageControl.js");
let util = require("../../../../utils/util.js");
const wxApi = require("../../../../utils/wxApi.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

const UtilActions = require("../../../../class/utilActions.js");
let utilActions = new UtilActions;

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
      title: '搜索',
    })
    let locationObj = wx.getStorageSync("communityObj");
    if (locationObj) {
      this.setData({
        "state.locationObj": JSON.parse(locationObj),
      })
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
    this.onGetSearchHistoriesHandler();
    this.getLikeData([]);//猜你喜欢数据获取
  },
  // 分割数字整数小数部分函数
  splitIntFloat: util.splitIntFloat,
  onFetchGoodsList:function(){
    let keyWord = this.inputValue;
    let _this = this;
    let url = `${config.ApiRoot}/activity/detail`;
    let data = {
      url,
      data: {
        page: _this.data.state.page,
        limit: 10,
        adcode: this.data.state.locationObj ? this.data.state.locationObj.adcode:"",
        type:1,
        keyword: keyWord
      }
    }
    this.setData({
      "state.loading": true
    })
    wx.showLoading({
      title: '加载中',
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          let [products,arrygoodsId] =[[],[]];
          if (data.activity.goods){

            products = _this.data.state.page > 1 ? this.data.data.products.concat(data.activity.goods.data) : data.presale_goods.concat(data.activity.goods.data)

        
            if (_this.data.state.page == 1 || _this.data.state.page > 1) {
                  data.activity.goods.data.forEach(item => {
                    let splitArr = this.splitIntFloat(item.our_price / 100);
                    item['intValue'] = splitArr[1];
                    item['floatValue'] = splitArr[2] ? splitArr[2] : '';
                  });
            }


            _this.setData({
              "data.activity": data.activity,
              "data.products": products,
              "data.is_open": data.is_open,
              "data.totalPage": data.activity.goods ? data.activity.goods.last_page : 1,
              "data.qiniuDomain": userMs.config["qiniuDomain"]
            });

            products.forEach((item)=>{
              if (item.goods_id) arrygoodsId.push(item.goods_id);//遍历获取搜索出的产品
            });
            setTimeout(()=>{
               this.getLikeData(arrygoodsId);//猜你喜欢数据获取
            },100)
            
       }

       
        } else {
          throw res;
        }
      })
      .catch(err => {
        this.alertHandler(JSON.stringify(err))
        console.log(err)
      })
      .finally(res => {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        _this.setData({
          "state.loading": false
        })
      })
  },
  //父级自定义方法
  onParentEvent:function(e){
    let detailIndex = e.detail.index;//子级传过来的点击当前产品
    this.data.data.likeProData[detailIndex].num++;
    this.setData({
      "data.likeProData": this.data.data.likeProData
    })
  },
  //猜你喜欢数据
  getLikeData: function (arryData) {
    let queryObj = {
      cart_goods_ids:[],//购物车页面
      being_browsed_goods_id: 0, // 正在浏览的商品id
      search_page: 1,   // 是否在搜索页
      search_result_goods_ids: arryData // 搜索页搜索结果商品id列表
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
            if (arryData.length > 0) {
              item.recommend_from = 4;//来自搜索结果页
            } else {
              item.recommend_from = 3;//来自搜索结果页
            }
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
  alertHandler: utilActions.alertHandler,
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
    if (this.data.data.products && this.data.data.products.length > 0 && !this.loading) {
      this.fetchNextPage(this.onFetchGoodsList);
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },
  onGetSearchHistoriesHandler: function () {
    let searchHistories = wx.getStorageSync("searchHistories");
    if (searchHistories) {
      searchHistories = JSON.parse(searchHistories)
      this.setData({
        "state.searchHistories": searchHistories
      });
    }
  },
  onSearchHandler: function (e) {
    let inputValue = e.detail.value;
    let searchHistories = wx.getStorageSync("searchHistories");
    if(/\s+/.test(inputValue) || inputValue == ""){
      // this.onFetchGoodsList();
      // this.setData({
      //   "state.firstStep": false,
      //   "state.page":1
      // })
      return;
    }
    if (searchHistories) {
      searchHistories = JSON.parse(searchHistories);
      let sameIndex;
      let hasSome = searchHistories.some((item, index) => {
        if (item === inputValue) {
          sameIndex = index
        }
        return item === inputValue
      })
      if (hasSome) {
        searchHistories.splice(sameIndex, 1)
      }
      searchHistories.unshift(inputValue)
    } else {
      searchHistories = [];
      searchHistories.unshift(inputValue);
    }
    wx.setStorageSync("searchHistories", JSON.stringify(searchHistories));
    this.setData({
      "state.searchHistories": searchHistories,
      "state.firstStep": false,
      "state.page": 1
    })
    this.onFetchGoodsList();
  },
  onSearchInputHandler: function (e) {
    this.inputValue = e.detail.value;
  },
  onClickBtnItem: function (e) {
    const value = e.currentTarget.dataset.keyValue;
    this.inputValue = e.currentTarget.dataset.keyValue;
    this.setData({
      "state.firstStep": false,
      "state.searchValue": value,
      "state.page": 1
    });
    this.onFetchGoodsList();
  },
  onClearHistoryHandler: function () {
    wx.removeStorageSync("searchHistories");
    this.setData({
      "state.searchHistories": ""
    })
  }
}
pageObj = util.mixin(pageObj,pageContorlMixin);

Page(pageObj)