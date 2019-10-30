// components/loadMore/loadMore.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loadMoreStatus:{
      type: Boolean,
      value: true
    },
    backgroundColor:{
      type: String,
      value: ""
    }, 
    loadingStatus: {
      type: Boolean,
      value: false
    },
    pagaUrl:{
      type:String,
      value:""
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

  }
})
