// page/tabBar/userCenter/userCenter.js
const data = require("./data.js");
// const pageContorlMixin = require("../../../class/pageControl.js");
// let util = require("../../../utils/util.js");
const wxApi = require("../../../utils/wxApi.js");
//获取应用实例
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;

// const PosterActionsClass = require("../../../class/posterActions.js");
// let PosterActions = new PosterActionsClass;
import drawQrcode from "../../../utils/weapp.qrcode.esm.js";

let pageObj = {

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '个人中心'
    });


    this.getSystemInfoHandler();
  },
  // 获取设备信息，设备宽
  getSystemInfoHandler: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.windowWidth = res.windowWidth;
        _this.WidthRadio = res.windowWidth / 750;
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
    // 我们目前的后台登录，必须用code，iv，enctyData
    // 所以我们需要用户授权，所以这里需要判断
    // 如果用户关闭授权，就提示用户登录
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        this.onCallHandlers();
        this.setData({
          "state.needAuthorize": false
        })
      } else {
        this.setData({
          "state.needAuthorize": true
        })
      }
    });
 
    this.setData({
      "state.canLookOtherStore": wx.getStorageSync("last_user_store_id")?true:false,
    });

  
   setTimeout(()=>{
     //判断是否授权 设置导航背景颜色
     if (this.data.state.needAuthorize) {
       wx.setNavigationBarColor({
         frontColor: '#000000',
         backgroundColor: '#FFCE38',
       });
     } else {
       wx.setNavigationBarColor({
         frontColor: '#000000',
         backgroundColor: '#fed402',
       });
     }
   },600);
  },
  //跳转去团长端 加盟页面
  onGoToMiniProgram:function(){
      wx.navigateToMiniProgram({
        appId: 'wx05fc0deb15e72f0f',//团长端appId
        path: 'page/userCenter/pages/merchantIntroduction/merchantIntroduction',
        extarData: {
          open: ''
        },
        envVersion: 'release',//develop 开发版 trial 体验版 release正式版
        success(res) {
          // 打开成功
        }
      })
  },
  onCallHandlers:function(){
    this.onFetchUserData();
    this.onFetchOrdersCounter();
    this.fetchPackageList();
    this.onFetchDeliveryCode();
  },
  onFetchUserData: function () {
    let _this = this;
    let url = `${config.ApiRoot}/auth/me`;
    let data = {
      url,
      method:"POST"
    };
    wx.showLoading({
      title: '登录中',
    })
    userMs.request(data).then(res => {
      const { data, code } = res.data;
      if (code === 10000) {

        wx.hideLoading();

        if (data) {
          if (!data.mobile) {

            _this.setData({
              "data.userInfo": data,
            });

          } else {
            let canSeedPhone = data.mobile.substr(0, 3) + '****' + data.mobile.substr(7);
            data.canSeedPhone = canSeedPhone;
            _this.setData({
              "data.userInfo": data,
            });
            return;
          }
        }
      } else {
        throw res;
      }
    })
      .catch(
        err => {
          this.alertHandler(err);
          console.log(err);
          wx.hideLoading();
        }
      ).finally(() => wx.hideLoading());
  },
  onFetchOrdersCounter:function(){
    let _this = this;
    let url = `${config.ApiRoot}/orders/counter`;
    let data = {
      url,
      method: "GET"
    };
    userMs.request(data).then(res => {
      const { data, code } = res.data;
      if (code === 10000) {
        this.setData({
          "data.orderNumObj":data
        })
      } else {
        throw res;
      }
    })
      .catch(
        err => {
          this.alertHandler(err);
          console.log(err)
        }
      ).finally(() => wx.hideLoading());
  },
  fetchPackageList: function () {
    const _this = this;
    const url = `${config.ApiRoot}/red-envelop/list`;
    let queryObj = {
      page: 1,
      limit: 1,
      used: 2
    }

    userMs.request({
      url,
      data: queryObj,
      method: 'GET',
    })
      .then(res => {
        const {
          code,
          data
        } = res.data;
        if (code === 10000) {
          this.setData({
            "data.packageNum":data.total
          })
        }
      })
      .catch(error => {
        this.alertHandler(err);
        console.log(error)
      })
      .finally(() => {
      });
  },

  // 获取提货码接口
  onFetchDeliveryCode:function(){
    const _this = this;
    const url = `${config.ApiRoot}/pickup-code/get`;

    userMs.request({
      url,
      method: 'GET',
    })
      .then(res => {
        const {
          code,
          data
        } = res.data;
        if (code === 10000) {
          this.setData({
            "state.qrCode": data.code,
            "state.interval": data.interval
          })
           // this.getSystemInfoHandler() 得到的设备宽高比，在这里要用
          drawQrcode({
            width: 200 * _this.WidthRadio,
            height: 200 * _this.WidthRadio,
            canvasId: 'myQrcode',
            text: data.code
          })
          setTimeout(()=>{
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: 200 * _this.WidthRadio,
              height: 200 * _this.WidthRadio,
              canvasId: 'myQrcode',
              success: function (res) {
                _this.setData({
                  "data.radarImg": res.tempFilePath
                });
              }
            });
          },200)
        }
      })
      .catch(error => {
        this.alertHandler(err);
        console.log(error)
      })
      .finally(() => {
      });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.setData({
    //   "state.selectType": "user"
    // })
    this.data.state.clickNum = 0
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
  // onShareAppMessage: function (e) {
    
  // },
  userInfoHandler: function (e) {
    let _this = this;
    if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {
      // wx.navigateTo({
      //   url: '/page/userCenter/pages/login/login',
      // })
      this.alertHandler("授权才可查看信息");

    } else {
      wx.showLoading({
        title: '加载中',
      })

      // 当用户允许授权时，调用登录，保存token
      wx.showLoading({
        title: '授权中...',
      });

      let url = `${config.ApiRoot}/auth/me`;
      let data = {
        url,
        method: "POST"
      };
      userMs.request(data).then(res => {
        const { data, code } = res.data;
        if (code === 10000) {

          if (data) {
            if (!data.mobile) {
                  wx.navigateTo({
                    url: '/page/userCenter/pages/login/login'
                  });
                  // this.alertHandler("授权获取电话号码");
            } else {
            
              wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#fed402',
              });
               
              this.onCallHandlers();
              let canSeedPhone = data.mobile.substr(0, 3) + '****' + data.mobile.substr(7);
              data.canSeedPhone = canSeedPhone;
              _this.setData({
                "data.userInfo": data,
                "state.needAuthorize": false,
                "state.orderNeedAuthorize": false,
                "state.canLookOtherStore": wx.getStorageSync("last_user_store_id") ? true : false,
              });
            }
          }
        }
      }).catch(err=>{
        this.alertHandler(err);
        console.log(err);
        wx.hideLoading();
      })
      .finally(res=>{
        wx.hideLoading()
      })

    }
  },
  // 当没有手机号则需要进入绑定页
  getPhoneStatus: function () {
    const { userInfo } = this.data.data;
    return !!userInfo.mobile
  },
  onGoToOrders: function (e) {
    if (!this.getPhoneStatus()) {

      wx.navigateTo({
        url: '/page/userCenter/pages/login/login',
      });

        // this.setData({
        //     "state.orderNeedAuthorize":true
        // })

    } else {
          const type = e.currentTarget.dataset.type;
          wx.navigateTo({
            url: `/page/userCenter/pages/orderList/orderList?type=${type}`
          })
    }
  },
  onGotoAddressListHandler: function () {
    if (!this.getPhoneStatus()) {
      wx.navigateTo({
        url: '/page/userCenter/pages/login/login',
      })
    } else {
      wx.navigateTo({
        url: `/page/userCenter/pages/addressList/addressList?comeFromPage=${this.data.others.pageUrl}`,
      })
    }
  },
  // ...PosterActions,
  // onRequestCodePic:function(){
  //   let _this = this;
  //   let url = `${config.ApiRoot}/wxacode/get?type=store&store_id=${wx.getStorageSync("self_store_id")}`;
  //   if(this.hasCodePicStatus){
  //     this.onDrawCanvasHandler();
  //   }else{
  //     wx.showLoading({
  //       title: '生成中...',
  //       mask: true
  //     })
  //     wx.downloadFile({
  //       url: url, //仅为示例，并非真实的资源
  //       header: {
  //         Authorization: `Bearer ${storageHandler.getStorage("token")}`
  //       },
  //       success(res) {
  //         // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
  //         if (res.statusCode === 200) {
  //           _this.setData({
  //             "data.qrCode": res.tempFilePath
  //           })
  //           _this.onDrawCanvasHandler();
  //         }
  //       }
  //     })
  //     this.hasCodePicStatus = true;
  //   }
    
  // },
  // onDrawCanvasHandler: function () {
  //   let windowWidth = this.windowWidth;
  //   let WidthRadio = this.WidthRadio;
  //   let picRadio = 500 / 750;
  //   let { userInfo } = userMs.config;
  //   console.log("userInfo", userInfo);
  //   const ctx = wx.createCanvasContext(this.data.state.posterId);
  //   // ctx.clearRect(0, 0, 500 * WidthRadio, 840 * windowWidth);
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
  //   path = "../../../imgs/icon-logo-poster-top.png";
  //   ctx.drawImage(path, (425 * picRadio * WidthRadio), 48 * picRadio * WidthRadio, (275 * picRadio * WidthRadio), (77 * picRadio * WidthRadio));

  //   if (userInfo) {

  //     path = userInfo.avatarPath;

  //     ctx.drawImage(path, (50 * picRadio * WidthRadio), (135 * picRadio * WidthRadio), (80 * picRadio * WidthRadio), (80 * picRadio * WidthRadio));
  //     ctx.setFillStyle("#000000");
  //     ctx.setFontSize(14 * picRadio);
  //     ctx.setTextBaseline('middle')
  //     ctx.fillText(userInfo.nickname, (140 * picRadio * WidthRadio), (175 * picRadio * WidthRadio));
  //   } else {
  //     path = "../../../imgs/icon-user-avatar-default.png";
  //     ctx.drawImage(path, (50 * picRadio * WidthRadio), (135 * picRadio * WidthRadio), (80 * picRadio * WidthRadio), (80 * picRadio * WidthRadio));
  //     ctx.setFillStyle("#000000");
  //     ctx.setFontSize(14 * picRadio);
  //     ctx.setTextBaseline('middle')
  //     ctx.fillText("未登录用户", (140 * picRadio * WidthRadio), (175 * picRadio * WidthRadio));
  //   }
  //   // text tips 
  //   path = "../../../imgs/icon-share-shop-me-tips.png";
  //   ctx.drawImage(path, (50 * picRadio * WidthRadio), (230 * picRadio * WidthRadio), (480 * picRadio * WidthRadio), (76 * picRadio * WidthRadio));

  //   // 二维码
  //   path = this.data.data.qrCode;
  //   ctx.drawImage(path, (265 * picRadio * WidthRadio), (347 * picRadio * WidthRadio), (220 * picRadio * WidthRadio), (220 * picRadio * WidthRadio));

  //   ctx.setFillStyle("#999");
  //   ctx.setFontSize(10 * picRadio);
  //   ctx.setTextBaseline('top')
  //   ctx.fillText("长按识别小程序", (305 * picRadio * WidthRadio), (587 * picRadio * WidthRadio));

  //   //我的小店描述
  //   path = "../../../imgs/icon-share-shop-me-desc.png";
  //   ctx.drawImage(path, (50 * picRadio * WidthRadio), (663 * picRadio * WidthRadio), (677 * picRadio * WidthRadio), (544 * picRadio * WidthRadio));

    
  //   ctx.draw(true, setTimeout(function () {
  //     wx.hideLoading()
  //   }, 100))

  // },
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
  },
  onPreventHandler:function(){
    return false;
  },
  // onGoTowithdrawPage:function(){
  //   wx.navigateTo({
  //     url: '/page/userCenter/pages/withdrawPage/withdrawPage',
  //   })
  // },
  onSeedSellerInfoHandler:function(){
    wx.navigateTo({
      url: '/page/userCenter/pages/sellerInfo/sellerInfo',
    })
  },
  onSeedSellerSaleDataHandler:function(){
    wx.navigateTo({
      url: '/page/userCenter/pages/saleData/saleData',
    })
  },
  onCallHandler: function (e) {
    wx.showActionSheet({
      itemList: ['4000585825'],
      success: function (res) {
        wx.makePhoneCall({
          phoneNumber: '4000585825' //仅为示例，并非真实的电话号码
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  onGoToDebugPageHandler:function(){
    ++this.data.state.clickNum;
    if (this.data.state.clickNum >20){
      wx.navigateTo({
        url: '/page/userCenter/pages/debug/debug',
      })
    }
  },
  onGoToRedPackageHandler: function () {
    wx.navigateTo({
      url: '/page/userCenter/pages/redPackage/redPackage',
    })
  },
  onChangeQRCodeBoxStatusHandler:function(){
    this.setData({
      "state.qRCodeBoxStatus": !this.data.state.qRCodeBoxStatus
    })
  }
}

// pageObj = util.mixin(pageObj);

Page(pageObj)