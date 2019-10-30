// components/packageItemShare/packageItemShare.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    packageItem: {
      type: Object,
      value: {},
    },
    packageType:{
      type:String,
      value:""
    },
    selectPackageId:{
      type:Number,
      value:0
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
    onGoToIndexHandler: function () {
      if (this.properties.packageType == "newUser") {
        this.triggerEvent("oncloseevent")
      } else if (this.properties.packageType == "choose") {
        if (this.properties.packageItem.available){
          this.triggerEvent("onchooseevent", this.properties.packageItem)
        }
      } else {
        wx.reLaunch({
          url: '/page/tabBar/index/index',
        })
      }
    }
  }
})
