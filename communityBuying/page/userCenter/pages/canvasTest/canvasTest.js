// pages/canvasTest/canvasTest.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  WidthRadio:1,
  windowWidth:375,
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
    let windowWidth = this.windowWidth;
    let WidthRadio = this.WidthRadio;
    console.log("windowWidth", windowWidth)
    console.log("WidthRadio", WidthRadio)
    const ctx = wx.createCanvasContext('myCanvas');
    // ctx.setFontSize(20)
    // ctx.fillText('Hello', 20, 20)
    // ctx.fillText('MINA', 100, 100)
    ctx.clearRect(0, 0, 0, 0);
    ctx.setFillStyle("#ffe200");
    ctx.fillRect(0, 0, windowWidth, 667);
    var path = "../../imgs/item.jpg";
    ctx.drawImage(path, (30 * WidthRadio), (30 * WidthRadio), (315*WidthRadio), 183);
    // var path2 = "../../imgs/erweima.jpg";
    ctx.drawImage(path, (windowWidth - 30 * WidthRadio - 120 * WidthRadio), (230), (120 * WidthRadio), (120 * WidthRadio));

    ctx.setTextAlign('left');
    
    ctx.setFillStyle("#000000");
    ctx.setFontSize(16);
    ctx.fillText("必燃特卖欢迎你", 20, 20);
    
    ctx.draw(true, setTimeout(function () {
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
    }, 100))
  }
})