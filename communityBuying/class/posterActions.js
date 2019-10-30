const wxApi = require("../utils/wxApi.js");
function PosterActions() {
  this.getSystemInfoHandler= function() {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.windowWidth = res.windowWidth;
        _this.WidthRadio = res.windowWidth / 750;
        // console.log(res.model)
        // console.log(res.pixelRatio)
        // console.log(res.windowWidth)
        // console.log(res.windowHeight)
        // console.log(res.language)
        // console.log(res.version)
        // console.log(res.platform)
      }
    })
  },
  this.onChangeShareBoxHandler = function () {
    this.setData({
      "state.shareBoxStatus": !this.data.state.shareBoxStatus
    })
  }
  this.onOpenSavePicStatus =  function () {
    this.onOpenSettingNeedBtn();
    this.onRequestCodePic();
    this.setData({
      "state.savePicBoxStatus": true,
      "state.shareBoxStatus": false,
      "state.openSavePicBoxTimes": ++this.data.state.openSavePicBoxTimes
    })
  },
  this.onCloseSavePicStatus= function () {
    this.setData({
      "state.savePicBoxStatus": false,
      "state.posterId": this.data.state.posterId + this.data.state.openSavePicBoxTimes
    })
  },
  // this.onDrawCanvasHandler= function () {
  //   if (this.data.state.posterHasCreateStatus) return;
  //   let windowWidth = this.windowWidth;
  //   let WidthRadio = this.WidthRadio;
  //   let picRadio = 500 / 750;
  //   let { userInfo } = userMs.config;
  //   console.log("userInfo", userInfo)
  //   const ctx = wx.createCanvasContext(this.data.state.posterId);
  //   ctx.clearRect(0, 0, 500 * WidthRadio, 840 * windowWidth);
  //   ctx.setFillStyle("#fff");
  //   ctx.fillRect(0, 0, 500 * WidthRadio, 840 * windowWidth);

  //   // 这里保存为圆角 canvas 函数，但是如果跟fillrect一起用，好像行不通，以后优化
  //   // ctx.save()
  //   // ctx.beginPath()
  //   // ctx.arc(50, 50, 25, 0, 2 * Math.PI)
  //   // ctx.clip()
  //   // ctx.drawImage("http://is5.mzstatic.com/image/thumb/Purple128/v4/75/3b/90/753b907c-b7fb-5877-215a-759bd73691a4/source/50x50bb.jpg", 25, 25)
  //   // ctx.restore()



  //   var path;
  //   path = "../../imgs/icon-logo-poster-top.png";
  //   ctx.drawImage(path, (425 * picRadio * WidthRadio), 48 * picRadio * WidthRadio, (275 * picRadio * WidthRadio), (77 * picRadio * WidthRadio));

  //   if (userInfo) {

  //     path = userInfo.avatarPath;

  //     ctx.drawImage(path, (50 * picRadio * WidthRadio), (135 * picRadio * WidthRadio), (80 * picRadio * WidthRadio), (80 * picRadio * WidthRadio));
  //     ctx.setFillStyle("#000000");
  //     ctx.setFontSize(14 * picRadio);
  //     ctx.setTextBaseline('middle')
  //     ctx.fillText(userInfo.nickname, (140 * picRadio * WidthRadio), (175 * picRadio * WidthRadio));
  //   } else {
  //     // var path = "https://bir.langnadujia.cn/static/images/kefu.jpg";
  //     path = "../../imgs/icon-user-avatar-default.png";
  //     // ctx.clearRect(0, 0, 0, 0);
  //     // ctx.setFillStyle("#ffe200");
  //     // ctx.fillRect(0, 0, windowWidth, 667);
  //     ctx.drawImage(path, (50 * picRadio * WidthRadio), (135 * picRadio * WidthRadio), (80 * picRadio * WidthRadio), (80 * picRadio * WidthRadio));
  //     ctx.setFillStyle("#000000");
  //     ctx.setFontSize(14 * picRadio);
  //     ctx.setTextBaseline('middle')
  //     ctx.fillText("未登录用户", (140 * picRadio * WidthRadio), (175 * picRadio * WidthRadio));
  //   }
  //   // text tips 
  //   path = "../../imgs/icon-share-product-tips.png";
  //   ctx.drawImage(path, (50 * picRadio * WidthRadio), (230 * picRadio * WidthRadio), (570 * picRadio * WidthRadio), (76 * picRadio * WidthRadio));
  //   // 商品logo
  //   path = this.data.data.logoPath;
  //   ctx.drawImage(path, (50 * picRadio * WidthRadio), (343 * picRadio * WidthRadio), (650 * picRadio * WidthRadio), (520 * picRadio * WidthRadio));

  //   // 左边价格新
  //   ctx.setFillStyle("#FF593A");
  //   ctx.setFontSize(18 * picRadio);
  //   ctx.setTextBaseline('middle')
  //   ctx.fillText("¥", (50 * picRadio * WidthRadio), (945 * picRadio * WidthRadio));
  //   ctx.setFillStyle("#FF593A");
  //   ctx.setFontSize(35 * picRadio);
  //   ctx.setTextBaseline('middle')
  //   ctx.fillText(this.data.data.productDetail.our_price / 100, (70 * picRadio * WidthRadio), (935 * picRadio * WidthRadio));
  //   //左边价格旧
  //   ctx.setFillStyle("#999");
  //   ctx.setFontSize(11 * picRadio);
  //   ctx.setTextBaseline('middle')
  //   ctx.fillText("¥" + this.data.data.productDetail.market_price / 100, (160 * picRadio * WidthRadio), (950 * picRadio * WidthRadio));
  //   let priceLength = (this.data.data.productDetail.market_price / 100).toString().length;
  //   ctx.setStrokeStyle("#999")
  //   ctx.beginPath()
  //   ctx.moveTo((160 * picRadio * WidthRadio), (950 * picRadio * WidthRadio))
  //   ctx.lineTo(((160 + priceLength * 16) * picRadio * WidthRadio), (950 * picRadio * WidthRadio))
  //   ctx.stroke()

  //   // 左下角的title 这里需要限制次数啊。。
  //   let descLength = this.data.data.productDetail.name.length;
  //   let desc = this.data.data.productDetail.name;
  //   let descOne;
  //   let descTwo;
  //   if (descLength >= 20) {
  //     descOne = desc.substr(0, 10);
  //     descTwo = desc.substr(10, 8);
  //     descTwo = descTwo + "..."
  //   } else if (descLength < 20 && descLength >= 10) {
  //     descOne = desc.substr(0, 10);
  //     descTwo = desc.substr(10, 10);
  //   } else {
  //     descOne = desc
  //   }

  //   ctx.setFontSize(14 * picRadio);
  //   ctx.setTextBaseline('middle')
  //   ctx.fillText(descOne, (50 * picRadio * WidthRadio), (1031 * picRadio * WidthRadio));
  //   // ctx.setFontSize(14 * picRadio);
  //   // ctx.setTextBaseline('middle')
  //   if (descTwo) {
  //     ctx.fillText(descTwo, (50 * picRadio * WidthRadio), (1066 * picRadio * WidthRadio));
  //   }


  //   // 右下角二维码
  //   path = this.data.data.logoPath;
  //   ctx.drawImage(path, (480 * picRadio * WidthRadio), (931 * picRadio * WidthRadio), (220 * picRadio * WidthRadio), (220 * picRadio * WidthRadio));
  //   ctx.setFillStyle("#999");
  //   ctx.setFontSize(10 * picRadio);
  //   ctx.setTextBaseline('middle')
  //   ctx.fillText("长按识别小程序", (520 * picRadio * WidthRadio), (1176 * picRadio * WidthRadio));
  //   ctx.draw()
  //   // this.setData({
  //   //   "state.posterHasCreateStatus":true
  //   // })
  //   // ctx.draw(true, setTimeout(function () {

  //   // }, 100))

  // },
  // 初始判断 按钮打开设置还是wxapi打开设置页
  this.onOpenSettingNeedBtn = function () {
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
  this.openSettingHandler = function (e) {
    if (e.detail.authSetting && e.detail.authSetting["scope.writePhotosAlbum"]) {
      const pic = e.currentTarget.dataset.pic;
      this.saveWeChatPicHandler();
    } else {
      wx.showToast({
        title: "授权保存图片失败",
        image: "/imgs/icon-fail-default.png",
        duration: 2000
      });
    }
    console.log(e)
  },
  this.saveWeChatPicHandler = function () {
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
      })
        .catch(err => {
          // 这里的思路是，先让用户授权地址，用户拒绝以后，先进入一次设置页
          // 如果 opensetting api 报错，返回一个对象
          // 如果是 用户自己取消授权，则把报错值自定义为字符串，则不是api 报错
          // 否则使用button open-type 为 opensetting

          if (typeof err === "string") {
            throw "授权失败！";
          } else {
            _this.setData({
              "state.needOpenSettingBtn": true
            })
          }
        })

    }).then(() => {
      return wxApi.canvasToTempFilePath({ x: 0, y: 0, canvasId: this.data.state.posterId })
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
      .then(res => {
        this.alertHandler("保存成功，请前往微信扫描二维码")
        // _this.setData({
        //   "state.alertingStatus": true,
        //   "state.alertingWords": "保存成功，请前往微信扫描二维码"
        // })
        // setTimeout(function () {
        //   _this.setData({
        //     "state.alertingStatus": false
        //   })
        // }, 2000);
        _this.setData({
          "state.savePicBoxStatus": false,
          "state.posterId": this.data.state.posterId + this.data.state.openSavePicBoxTimes
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
}
module.exports = PosterActions;