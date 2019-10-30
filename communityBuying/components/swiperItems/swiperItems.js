// components/swiperItems/swiperItems.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgsList:{
      type: Array,
      value: []
    },
    widthSize:{
      type: Number,
      value:750
    },
    userDots:{
      type: String,
      value: ""
    },
    domain:{
      type:String,
      value:""
    },
    heightSize:{
      type: Number,
      value: 240
    },
    radiusSize:{
      type: Number,
      value: 0
    },
    autoplay:{
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgheights: [],
    current: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    imageLoad: function (e) {
      //获取图片真实宽度  
      var imgwidth = e.detail.width,
        imgheight = e.detail.height,
        //宽高比  
        ratio = imgwidth / imgheight;
      console.log(imgwidth, imgheight)
      //计算的高度值  
      var viewHeight = this.properties.widthSize / ratio;
      var imgheight = viewHeight
      var imgheights = this.data.imgheights
      //把每一张图片的高度记录到数组里  
      imgheights.push(imgheight)
      this.setData({
        "imgheights": imgheights
      })
    },
    bindchange: function (e) {
      // console.log(e.detail.current)
      this.setData({
        "current": e.detail.current
      })
    },
    onGotoPage:function(e){
      let index = e.currentTarget.dataset.index;
      let item = this.properties.imgsList[index];
      let {url} = item;
      if(url){
        wx.navigateTo({
          url: "/"+url,
        })
      }
    }
  }
})
