// components/flashSaleItem/flashSaleItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    domain: {
      type: String,
      value: ""
    },
    productItem: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        // newVal.proportion = ((newVal.stock / (newVal.invented_sell + newVal.stock)) * 236).toFixed(0);
        // this.setData({
        //   productItem:newVal
        // })
      }
    },
    endStatus: {
      type: Boolean,
      value:false
    },
    featureStatus: {
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
    onGoToProductDetail: function () {
      // if (this.properties.proType=="next") {
      //   this.alertHandler("活动还未开始，尽情期待");
      //   return false;
      // }
      // if (this.properties.productItem.stock == 0) {
      //   this.alertHandler("该商品已售罄");
      //   return false;
      // }
      // if(this.properties.activityEnd){
      //   this.alertHandler("本期活动已结束");
      //   return false;
      // }
      let queryObj = {
        isGroupBuyStatus: false,
        activityId: this.properties.productItem.id,
        type: 3
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
    }
  }
})
