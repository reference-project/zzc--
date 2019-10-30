// page/userCenter/pages/applyPage/applyPage.js
const app = getApp()
const userMs = app.userMs;
const config = userMs.config;
const wxApi = require("../../../../utils/wxApi.js");
const data = require("./data.js");
const addressActionClass = require("../../../../class/addressActions.js");
const addressAction = new addressActionClass();
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
      title: '补充门店信息',
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
        this.onFetchUserData();
        // this.setData({
        //   "state.needAuthorize": false
        // })
      } else {
        this.setData({
          "data.firstStep": true
        })
      }
    });
    this.onFetchRegionsList();
  },
  onFetchUserData: function () {
    let _this = this;
    let url = `${config.ApiRoot}/auth/me`;
    let data = {
      url,
      method: "POST"
    };
    wx.showLoading({
      title: '登录中',
      mask:true
    })
    return new Promise((resolve,reject)=>{
      return userMs.request(data).then(res => {
        const { data, code, msg } = res.data;
        if (code === 10000) {
          if (data.merchant === null){
            _this.setData({
              "data.userInfo": data,
              'data.firstStep': true,
            });
            wxApi.login().then(res => {
              _this.loginCode = res.code;
            })
          }else{
            if (data.merchant.stores.length > 0){
              _this.setData({
                "data.userInfo": data,
                'data.firstStep':false,
                'data.successStatus': true
              });
            }else{
              _this.setData({
                "data.userInfo": data,
                "data.firstStep":false,
                "data.secondStep":true
              });
            }
            
          }
          
          resolve("success")
        } else {
          this.alertHandler(msg)
          throw res;
        }
      })
    })
    .catch(
      err => {
        console.log(err)
      }
    ).finally(() => wx.hideLoading());
  },
  onFetchRegionsList: function () {
    let _this = this;
    let url = `${config.ApiRoot}/region/all`;
    let data = {
      url,
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          let arr = [];
          let cityArr = [];
          let countyArr = [];
          // 如果是修改地址，则遍历
          if (this.data.data.id) {
            data[0].children.forEach((item, index) => {
              arr.push(item.name)
              if (item.id == _this.data.data.provinceObj.id) {
                _this.data.data.provinceObj.name = item.name
                _this.data.data.multiIndex[0] = index
                item.children.forEach((cityItem, cityIndex) => {
                  cityArr.push(cityItem.name)
                  if (cityItem.id == _this.data.data.cityObj.id) {
                    _this.data.data.cityObj.name = item.name
                    _this.data.data.multiIndex[1] = cityIndex
                    cityItem.children.forEach((countyItem, countyIndex) => {
                      countyArr.push(countyItem.name)
                      if (countyItem.id == _this.data.data.countyObj.id) {
                        _this.data.data.countyObj.name = item.name
                        _this.data.data.multiIndex[2] = countyIndex
                      }
                    })
                  }
                })
              }
            })
            
          } else {
            data[0].children.forEach(item => {
              arr.push(item.name)
            });
            data[0].children[0].children.forEach(item => {
              cityArr.push(item.name)
            });
            data[0].children[0].children[0].children.forEach(item => {
              countyArr.push(item.name)
            });
          }

          _this.data.data.multiArray = [arr, cityArr, countyArr];


          _this.setData({
            data: this.data.data,
            "data.regions": data
          })
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        wx.hideLoading();
      })
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
  onGoToHomeHandler:function(){
    wx.reLaunch({
      url: '/page/tabBar/index/index',
    })
  },
  onClickSendCodeHandler:function(){
    this.onSendCodeHandler();
  },
  userInfoHandler: function (e) {
    let _this = this;
    if (e.detail && e.detail.errMsg === "getUserInfo:fail auth deny") {
      wx.navigateTo({
        url: '/page/userCenter/pages/login/login',
      })
    } else {
      if (!this.data.data.userInfo){
        this.onFetchUserData().then(res=>{
          if(res == "success"){
            this.onSendCodeHandler();
          }
        })
      }else{
        this.onSendCodeHandler();
      }
      // wx.showLoading({
      //   title: '加载中',
      // })

      // 当用户允许授权时，调用登录，保存token
      // userMs.PLogin().then(res => {
      //   const { code, data, msg } = res.data;
      //   const { resData } = data;
      //   if (resData.mobileFlag) {
      //     _this.setData({
      //       "state.needAuthorize": false
      //     })
      //     _this.onFetchUserData();
      //   } else {
      //     wx.hideLoading()
      //     wx.navigateTo({
      //       url: '/page/userCenter/pages/login/login',
      //     })
      //   }
      // }).catch(error => {
      //   console.log(error)
      // })

    }
  },
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
  onInputMobileHandler:function(e){
    this.data.data.mobile = e.detail.value;
    let reg = /^1[3456789]\d{9}$/;

    if (e.detail.value.length>=11 && !reg.test(e.detail.value)) {
      this.setData({
        "state.canPhoneSubmit":false,
        "state.phoneWrongStatus":true
      })
    }else{
      if(e.detail.value.length == 11) {
        this.setData({ "state.canPhoneSubmit": true })
      }else{
        this.setData({ "state.canPhoneSubmit": false })
      }
      this.setData({
        "state.phoneWrongStatus": false
      })
    }
  },
  onInputCodeHandler: function (e) {
    this.data.data.code = e.detail.value;
    if (e.detail.value.length>6){
      this.setData({
        "state.canCodeSubmit":false,
        "state.codeWrongStatus": true
      })
    }else{
      if(e.detail.value.length == 6) {
        this.setData({ "state.canCodeSubmit": true })
      }else{
        this.setData({ "state.canCodeSubmit": false })
      }
      this.setData({
        "state.codeWrongStatus": false
      })
    }
  },
  onInputShopNameHandler:function(e){
    this.data.data.shopName = e.detail.value;
  },
  onInputComNameHandler:function(e){
    this.data.data.comName = e.detail.value;
  },
  onInputAddressDetailHandler:function(e){
    this.data.data.addressDetail = e.detail.value;
  },
  onInputChatNameHandler:function(e){
    this.data.data.chatName = e.detail.value;
  },
  // 发送验证码事件
  onSendCodeHandler:function(){
    let reg = /^1[3456789]\d{9}$/;
    if (!reg.test(this.data.data.mobile)){
      this.alertHandler("手机号不合法");
    }else{
      let _this = this;
      let url = `${config.ApiRoot}/verify-code/get`;
      let data = {
        url,
        method: "POST",
        data:{
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
            let timer = 59;
            this.setData({
              "data.timer": timer
            })
            let timerInterval = setInterval(function(){
              let descTime = --timer;
              this.setData({
                "data.timer": descTime
              })
              descTime == 0 && clearInterval(timerInterval)
              
            }.bind(this),1000)
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
  // 开店申请事件
  formSubmit: function (e) {
    this.formId = e.detail.formId;
    // this.onGotoProductDetail();
    this.onOpenShopHandler();
    console.log('form发生了submit事件，携带数据为：', e)
  },
  onOpenShopHandler:function(){
    // if (!this.data.data.agreeStatus){
    //   this.alertHandler("请同意用户协议");
    // } else 
    // if (!this.data.data.mobile){
    //   this.alertHandler("请填写手机号");
    // } else if (!this.data.data.code) {
    //   this.alertHandler("请填写验证码");
    // } else{
      this.onOpenShopRequest(1);
    // }
  },
  onOpenShopRequest:function(mode){
    let _this = this;
    let url = `${config.ApiRoot}/merchant/apply`;
    let queryObj;
    if(mode == 1){
      queryObj = {
        mobile: this.data.data.mobile,
        verify_code: this.data.data.code,
        mode: 1
      }
    }else{
      queryObj= {
        iv: _this.phoneSecretObj.iv,
        encryptedData: _this.phoneSecretObj.encryptedData,
        code: _this.loginCode,
        mode: 2
      }
    }
    let data = {
      url,
      method: "POST",
      data: queryObj
    }
    wx.showLoading({
      title: '验证中',
      mask: true
    })
    if (this.loadingStatus) return;
    this.loadingStatus = true
    userMs.request(data)
    .then(res => {
      const { data, code, msg } = res.data
      if (code == 10000) {
        // this.alertHandler("验证成功，请继续完善门店信息");
        this.setData({
          "data.firstStep":false,
          "data.secondStep":true
        })
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
  },
  // onAgreeProtocolHandler:function(){
  //   this.setData({
  //     "data.agreeStatus": !this.data.data.agreeStatus
  //   })
  // },
  onAgreeTrueHandler:function(){
    this.setData({
      "data.isTrueStatus": !this.data.data.isTrueStatus
    })
  },
  onAddShopDetailHandler:function(){
    if (!this.data.data.chatName){
      this.alertHandler("请输入您的姓名");
    }else if (!this.data.data.countyObj.name) {
      this.alertHandler("请选择所在地区");
    } else if (!this.data.data.selectCom.name) {
      this.alertHandler("请输入小区名称");
    } else if(!this.data.data.shopName) {
      this.alertHandler("请填写店铺名称");
    } else if (!this.data.data.addressDetail) {
      this.alertHandler("请填写详细地址");
    } else {
      this.onAddShopDetailRequest();
    }
  },
  onAddShopDetailRequest:function(){
    let _this = this;
    let url = `${config.ApiRoot}/store/apply`;
    let data = {
      url,
      method: "POST",
      data: {
        contact: this.data.data.chatName,
        name: this.data.data.shopName,
        county: this.data.data.countyObj.id,
        community_id: this.data.data.selectCom.id,
        address: this.data.data.addressDetail,
      }
    }
    wx.showLoading({
      title: '验证中',
      mask: true
    })
    if (this.loadingStatus) return;
    this.loadingStatus = true
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          // this.alertHandler("门店信息已登记");
          // 申请成功只是到达审核步骤，这里不能设置
          // wx.setStorageSync("self_store_id", data.id);
          wx.removeStorageSync("last_user_store_id")
          this.onFetchUserData();
          this.setData({
            "data.secondStep": false,
          })
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
  },
  bindMultiPickerChange: addressAction.bindMultiPickerChange,
  bindMultiPickerColumnChange: addressAction.bindMultiPickerColumnChange,
  changeAddressCallback:function(){
    this.setData({
      "data.selectCom":{}
    })
    this.onFetchComsList();
  },
  onFetchComsList:function(){
    let _this = this;
    let url = `${config.ApiRoot}/region/community-address`
    let countyObj = this.data.data.countyObj
    let data = {
      url,
      data: {
        adcode: countyObj.code,
        all: 0
      }
    }
    wx.showLoading({
      title: '加载中',
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          let comsArr = [];
          data.forEach(item=>{
            comsArr.push(item.name)
          })
          this.setData({
            "data.coms": data,
            "data.comsArr": comsArr
          })
        } else {
          throw res;
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(res => {
        wx.hideLoading();
      })
  },
  bindSingalPickerChange:function(e){
    let selectCom = this.data.data.coms[e.detail.value];
    if(!selectCom) return;
    this.setData({
      "data.comIndex": e.detail.value,
      "data.selectCom": selectCom
    })
  },
  //获取手机号wxapi
  getPhoneNumber: function (e) {
    let _this = this;
    if (e.detail.errMsg === "getPhoneNumber:fail user deny") {
      // this.setData({
      //   "state.secondStepStatus": false,
      //   "state.thirdStepStatus": true
      // })
    } else {
      wx.showLoading({
        title: '绑定中',
      });
      _this.phoneSecretObj = e.detail
      _this.onOpenShopRequest(2);
      console.log(e.detail.errMsg)
      console.log(e.detail.iv)
      console.log(e.detail.encryptedData)
    }

  },
  onBindPhone: function (obj) {
    let _this = this;
    let url = `${config.ApiRoot}/auth/mobile/bind`;
    let data = {
      url,
      data: {
        iv: obj.iv,
        encryptedData: obj.encryptedData,
        code: userMs.state.code,
        from_wechat: 1
      },
      method: "POST"
    };

    userMs.request(data).then(res => {
      const { data, code } = res.data;

      if (code === 10000) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        throw res;
      }
    })
      .catch(
        err => {
          console.log(err)
        }
      ).finally(() => wx.hideLoading());
  },
})