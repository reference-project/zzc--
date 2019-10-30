// pages/canvasTest/canvasTest.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    image: {
      src: "../../imgs/icon-share-poster-bg.png",
      width: 200,
      heigth: 200
    }
  },
  WidthRadio:1,
  windowWidth:375,
  num:1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setWidthRadio(res);
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
      }
    })
  },
  setWidthRadio:function(obj){
    this.windowWidth = obj.windowWidth;
    this.WidthRadio = obj.windowWidth/375;
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
    let that = this;
      var contex = wx.createCanvasContext('firstCanvas')
      contex.save(); // 先保存状态 已便于画完圆再用
      contex.beginPath(); //开始绘制
      //先画个圆
      contex.arc(100, 100, 100, 0, Math.PI * 2, false);
      contex.clip();//画了圆 再剪切 原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内
      contex.drawImage(that.data.image.src, 0, 0, that.data.image.width, that.data.image.heigth); // 推进去图片
      contex.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制
      contex.draw();
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

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },
  save:function(){
    
    
    // ctx.draw(true, setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        // width: windowWidth,
        // height: 667,
        // destWidth: 150,
        // destHeight: 100,
        canvasId: 'myCanvas',
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
          })
        }
      })
    // }, 100))
  },
  showHandler:function(){
    this.setData({
      showStatus:true
    })
    this.onDrawCanvasHandler()
    // setTimeout(this.onDrawCanvasHandler,20)
    
  },
  closeHandler:function(){
    this.setData({
      showStatus: false
    })
  },
  onDrawCanvasHandler:function(){
    let windowWidth = this.windowWidth;
    let WidthRadio = this.WidthRadio;
    console.log("windowWidth", windowWidth)
    console.log("WidthRadio", WidthRadio)
    let ctx = wx.createCanvasContext('myCanvas');
    console.log(ctx)
    // ctx.setFontSize(20)
    // ctx.fillText('Hello', 20, 20)
    // ctx.fillText('MINA', 100, 100)
    ctx.clearRect(0, 0, 0, 0);
    ctx.setFillStyle("#ffe200");
    ctx.fillRect(0, 0, windowWidth, 667);
    
    var path = "../../imgs/icon-logo-circle.png";
    ctx.drawImage(path, (30 * WidthRadio), (30 * WidthRadio), (315 * WidthRadio), 183);
    // var path2 = "../../imgs/erweima.jpg";
    ctx.drawImage(path, (windowWidth - 30 * WidthRadio - 120 * WidthRadio), (230), (120 * WidthRadio), (120 * WidthRadio));

    ctx.setTextAlign('left');

    ctx.setFillStyle("#000000");
    ctx.setFontSize(16);
    ctx.fillText("必燃特卖欢迎你", 20, 20);
    ctx.draw(false);
  }
})