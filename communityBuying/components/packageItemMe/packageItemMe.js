// components/packageItem/packageItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    packageItem:{
      type:Object,
      value:{},
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
    onGoToIndexHandler:function(){
      if (this.properties.packageItem.status == 1 || this.properties.packageItem.isTimeOut){
        return;
      }else{
        wx.reLaunch({
          url: '/page/tabBar/index/index',
        })
      }
    },
    onChangeLimitBoxStausHandler:function(){
      this.setData({
        showLimitBoxStatus: !this.data.showLimitBoxStatus
      })
    }
  }
})
