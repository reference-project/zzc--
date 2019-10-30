// pages/login/login.js
const data = require("./data.js");
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const wxApi = require("../../../../utils/wxApi.js");

const UtilActions = require("../../../../class/utilActions.js");
let utilActions = new UtilActions;

Page({

  /**
   * 页面的初始数据
   */
  data: data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 进入这个login页面的用户都是需要登录的，
    // 先判断用户是否授权过用户信息，
    // 如果授权过，直接绑定手机号码
    
    // 如果没授权，必须让用户授权，然后再拿手机号
    // 如果授权结束，发现存在手机号
    wxApi.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {

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
                wx.setNavigationBarTitle({
                  title: '绑定手机号码'
                });
                wxApi.login().then(res => {
                  this.data.loginCode = res.code;
                })
                this.setData({
                  "state.firstStepStatus": false,
                  "state.secondStepStatus": true
                })  
              } else {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          } else {
            throw res;
          }
        })
      } else {
        wx.setNavigationBarTitle({
          title: '微信授权'
        });
        this.setData({
          "state.firstStepStatus": true
        })
      }
    })
  },
  //获取手机号wxapi
  getPhoneNumber: function (e) {
    let _this = this;
    if (e.detail.errMsg === "getPhoneNumber:fail user deny") {

    } else {
      // wxApi.login().then(res => {
      //   _this.data.loginCode = res.code;
        _this.data.phoneSecretObj = e.detail
        _this.onBindMobileHandler(2);
      // })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**x
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
  // 发送验证码请求
  onSendCodeHandler: function () {
    let reg = /^1[3456789]\d{9}$/;
    if (!reg.test(this.data.data.mobile)) {
      this.alertHandler("手机号不合法");
    } else {
      let _this = this;
      let url = `${config.ApiRoot}/verify-code/get`;
      let data = {
        url,
        method: "POST",
        data: {
          mobile: this.data.data.mobile
        }
      }
      wx.showLoading({
        title: '发送中',
        mask: true
      })
      if (this.loadingStatus) return;
      this.loadingStatus = true
      userMs.request(data)
        .then(res => {
          const { data, code, msg } = res.data
          if (code == 10000) {
            let secondTime = 59;
            this.setData({
              "state.secondTime": secondTime
            })
            let timerInterval = setInterval(function () {
              let descTime = --secondTime;
              this.setData({
                "state.secondTime": descTime
              })
              descTime == 0 && clearInterval(timerInterval)

            }.bind(this), 1000)
          } else {
            this.alertHandler(msg);
            throw res;
          }
        })
        .catch(err => {
          console.log(err)
        })
        .finally(res => {
          wx.hideLoading();
          this.loadingStatus = false;
        })
    }
  },
  // 验证验证码是否成功
  onBindMobileHandler:function(mode) {
    let _this = this;
    // return new Promise((resolve,reject) => {
      let url = `${config.ApiRoot}/auth/mobile/bind`;
      let queryObj;
      if (mode == 1) {
        queryObj = {
          mobile: _this.data.data.mobile,
          verify_code: _this.data.data.code
        }
      } else {
        queryObj = {
          iv: _this.data.phoneSecretObj.iv,
          encryptedData: _this.data.phoneSecretObj.encryptedData,
          code: _this.data.loginCode,
          from_wechat: 1
        }
      }
      wx.showLoading({
        title: '绑定中',
      });
      let data = {
        url,
        method: "POST",
        data: queryObj
      }
      userMs.request(data).then(res => {
        // resolve(res)
        const {data,code,msg} = res.data;
        if(code == 10000){
          wx.navigateBack({
            delta: 1
          })
        }else{
          this.alertHandler(msg)
        }
        
      })
      .catch(
        err => {
          console.log(err)
          // reject(err)
        }
      ).finally(res=>{
        wx.hideLoading()
      })
    // })
  },
  // 授权用户信息
  userInfoHandler: function (e) {
    let _this = this;
    if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {
      this.alertHandler("需要微信授权才可以使用全部功能")
      return false;
    } else {
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
              wx.setNavigationBarTitle({
                title: '绑定手机号码'
              });
              wxApi.login().then(res => {
                this.data.loginCode = res.code;
              })
              this.setData({
                "state.firstStepStatus": false,
                "state.secondStepStatus": true
              })
            } else {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        }
      }).catch(err=>{
        console.log(err)
      })
      .finally(res=>{
        wx.hideLoading()
      })
    }
  },
  
  alertHandler:utilActions.alertHandler,
  onInputMobileHandler: function (e) {
    this.data.data.mobile = e.detail.value;
    let reg = /^1[3456789]\d{9}$/;

    if (e.detail.value.length >= 11 && !reg.test(e.detail.value)) {
      this.setData({
        "state.canPhoneSubmit": false,
        "state.phoneWrongStatus": true
      })
    } else {
      if (e.detail.value.length == 11) {
        this.setData({ "state.canPhoneSubmit": true })
      } else {
        this.setData({ "state.canPhoneSubmit": false })
      }
      this.setData({
        "state.phoneWrongStatus": false
      })
    }
  },
  onInputCodeHandler: function (e) {
    this.data.data.code = e.detail.value;
    if (e.detail.value.length > 6) {
      this.setData({
        "state.canCodeSubmit": false,
        "state.codeWrongStatus": true
      })
    } else {
      if (e.detail.value.length == 6) {
        this.setData({ "state.canCodeSubmit": true })
      } else {
        this.setData({ "state.canCodeSubmit": false })
      }
      this.setData({
        "state.codeWrongStatus": false
      })
    }
  },
  // 开店申请事件
  formSubmit: function (e) {
    this.formId = e.detail.formId;
    // this.onGotoProductDetail();
    this.onBindMobileHandler(1);
    console.log('form发生了submit事件，携带数据为：', e)
  },
})