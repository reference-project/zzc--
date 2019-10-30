// page/userCenter/pages/invitePage/invitePage.js
// let util = require("../../../../utils/util.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const data = require("./data.js");
const wxApi = require("../../../../utils/wxApi.js");
Page({

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '拼团详情',
    })
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.windowWidth = res.windowWidth;
        _this.WidthRadio = res.windowWidth / 750;
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        this.setData({
          "state.needAuthorize": false
        })
      } else {
        this.setData({
          "state.needAuthorize": true
        })
      }
    });
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
  onShareAppMessage: function () {
    // 必须加上这个，因为现在新版本，分享成功的回调函数不再执行
    this.setData({
      "state.shareBoxStatus": false
    })
    const _this = this;
    return {
      title: `222`, // 分享标题
      desc: "ddd", // 分享描述
      imageUrl: "",
      path: ``, // 分享路径
      success: function (res) {
        console.log(`222`)
        //记录分享数
        // const url = `${config.ApiRoot}/activities/share-log/update`;
        // if (_this.data.parent_id) {
        //   userMs.request({
        //     url,
        //     data: {
        //       group_id: _this.data.parent_id,  //拼团ID
        //     },
        //     method: 'post',
        //   })
        //     .then(res => {
        //       console.log(res)

        //     })
        //     .catch(error => {

        //     })
        // }

      },
      fail: function (res) {
      }
    }
  },
  userInfoHandler: function (e) {
    let _this = this;
    if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {
      wx.navigateTo({
        url: '../login/login',
      })
      return false;
    } else {
      
    }
  },
  onChangeShareBoxHandler:function(){
    this.setData({
      "state.shareBoxStatus": !this.data.state.shareBoxStatus
    })
  },
  onAddBuyingHandler:function(){

  },
  onSetCountTime: function (item) {
    var totalSecond = item.end_time - new Date() / 1000;
    if (totalSecond < 0) {
      item.activityEnd = true
      this.setData({
        "productDetail": this.data.productDetail
      })
    }

    var interval = setInterval(function () {
      // 秒数   
      var second = totalSecond;

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
      this.setData({
        data: this.data.data
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        item.activityEnd = true
        this.setData({
          data: this.data.data
        })
        // this.setData({
        //   countDownDay: '00',
        //   countDownHour: '00',
        //   countDownMinute: '00',
        //   countDownSecond: '00',
        // });
      }
    }.bind(this), 1000);
  },
  onGoHomeHandler:function(){
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  },
  onOpenSavePicStatus:function(){
    this.onOpenSettingNeedBtn();
    this.onDrawCanvasHandler();
    this.setData({
      "state.savePicBoxStatus": true,
      "state.shareBoxStatus": false
    })
  },
  onCloseSavePicStatus:function(){
    this.setData({
      "state.savePicBoxStatus": false,
    })
  },
  onDrawCanvasHandler: function () {
    let windowWidth = this.windowWidth;
    let WidthRadio = this.WidthRadio;
    const ctx = wx.createCanvasContext('posterId');
    // var path = "https://bir.langnadujia.cn/static/images/kefu.jpg";
    var path = "../../../../imgs/item.jpg";
    // ctx.clearRect(0, 0, 0, 0);
    // ctx.setFillStyle("#ffe200");
    // ctx.fillRect(0, 0, windowWidth, 667);
    ctx.drawImage(path, 0, 0, (480 * WidthRadio), (720 * WidthRadio));
    ctx.draw(true, setTimeout(function () {

    },100))
  },
  // 初始判断 按钮打开设置还是wxapi打开设置页
  onOpenSettingNeedBtn: function () {
    wxApi.getSetting().then(res => {
      if (res.authSetting && res.authSetting["scope.writePhotosAlbum"] === false) {
        if (wx.canIUse("button.open-type.openSetting")) {
          this.setData({
            "state.needOpenSettingBtn": true
          })
        } else {
          console.log("使用wx.opensetting")
        }
      }
    })
  },
  openSettingHandler:function(e){
    if (e.detail.authSetting && e.detail.authSetting["scope.writePhotosAlbum"]) {
      const pic = e.currentTarget.dataset.pic;
      this.saveWeChatPicHandler();
    }else{
      wx.showToast({
        title: "授权保存图片失败",
        image: "/imgs/cancel.png",
        duration: 2000
      });
    }
    console.log(e)
  },
  saveWeChatPicHandler:function(){
    const _this = this;
    wxApi.authorize({
      scope: "scope.writePhotosAlbum"
    }).catch(e => {
      return wxApi.openSetting().then(res => {
        if (res.authSetting["scope.writePhotosAlbum"]) {
          return;
        } else {
          throw "授权失败！";
        }
      }).catch(err => {
        // 这里的思路是，先让用户授权地址，用户拒绝以后，先进入一次设置页
        // 如果 opensetting api 报错，
        // 如果是 用户自己取消授权，则不是api 报错
        // 否则使用button open-type 为 opensetting
        
        if (typeof err === "string") {
          throw "授权失败！";
        }else{
          _this.setData({
            "state.needOpenSettingBtn": true
          })
        }
      })

    }).then(() => {
      return wxApi.canvasToTempFilePath({ x: 0, y: 0, canvasId: "posterId" })
      // return wxApi.getImageInfo({
      //   src: "https://bir.langnadujia.cn/static/images/kefu.jpg",
      // })
    })
    .then(res => {
      console.log(res)
      return wxApi.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
      // return wxApi.saveImageToPhotosAlbum({ filePath: res.path})


      // wx.saveImageToPhotosAlbum({
      //   filePath: res.path,
      //   success: function () {
      //     _this.setData({
      //       "state.alertingStatus": true,
      //       "state.alertingWords": "保存成功，请前往微信扫描二维码"
      //     })
      //     setTimeout(function () {
      //       _this.setData({
      //         "state.alertingStatus": false
      //       })
      //     }, 2000);
      //     _this.setData({
      //       "state.qrcodeBoxStatus": !_this.data.state.qrcodeBoxStatus
      //     })
      //   }
      // })
    })
    .then(res=>{
      _this.setData({
        "state.alertingStatus": true,
        "state.alertingWords": "保存成功，请前往微信扫描二维码"
      })
      setTimeout(function () {
        _this.setData({
          "state.alertingStatus": false
        })
      }, 2000);
      _this.setData({
        "state.savePicBoxStatus": false
      })
    })
    .catch(err => {
      if (typeof err === "string") {
        wx.showToast({
          title: err,
          image: "/imgs/cancel.png",
          duration: 2000
        });
      }
      console.log(err)
    });
  }
})