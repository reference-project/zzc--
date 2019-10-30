// components/footerNav/footerNav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageUrl:{
      value:"",
      type: String
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
    onGoToDiscount:function(){
      if (this.properties.pageUrl === "discount") return;
      wx.reLaunch({
        url: '/page/tabBar/discount/discount',
      })
    },
    onGoToUserCenter:function(){
      if (this.properties.pageUrl === "userCenter") return;
      wx.reLaunch({
        url: '/page/tabBar/userCenter/userCenter',
      })
    }
  }
})
