// page/userCenter/pages/addressEdit/addressEdit.js

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
      title: '填写收货地址',
    })
    if (options.selectItem){
      let selectItem = JSON.parse(decodeURIComponent(options.selectItem));
      this.data.data.zipCode = selectItem.zip_code;
      this.data.data.provinceObj.id = selectItem.province_id;
      this.data.data.cityObj.id = selectItem.city_id;
      this.data.data.countyObj.id = selectItem.county_id;
      this.data.data.detailAddress = selectItem.address;
      this.data.data.contact = selectItem.contact;
      this.data.data.mobile = selectItem.mobile;
      this.data.data.isDefault = selectItem.is_default;
      this.data.data.id = selectItem.id;
      this.setData({
        "data": this.data.data
      })
    }
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
    // this.onFetchProvincesList();
    this.onFetchRegionsList();
  },
  onFetchRegionsList: function () {
    let _this = this;
    let url = `${config.ApiRoot}/regions`;
    let data = {
      url,
    }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wxApi.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          let arr = [];
          let cityArr = [];
          let countyArr = [];
          // 如果是修改地址，则遍历
          if(this.data.data.id){
            data[0].children.forEach((item,index)=>{
              arr.push(item.name)
              if (item.id == _this.data.data.provinceObj.id){
                _this.data.data.provinceObj.name = item.name
                _this.data.data.multiIndex[0] = index
                item.children.forEach((cityItem,cityIndex)=>{
                  cityArr.push(cityItem.name)
                  if (cityItem.id == _this.data.data.cityObj.id){
                    _this.data.data.cityObj.name = item.name
                    _this.data.data.multiIndex[1] = cityIndex
                    cityItem.children.forEach((countyItem,countyIndex)=>{
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
            
          }else{
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
  onAddAddressRequest:function(){
    let _this = this;
    let url;
    if(this.data.data.id){
      url = `${config.ApiRoot}/shipping-address/${this.data.data.id}`;
    }else{
      url = `${config.ApiRoot}/shipping-address`;
    }
    let queryObj = {
      province_id: this.data.data.provinceObj.id,
      city_id: this.data.data.cityObj.id,
      county_id: this.data.data.countyObj.id,
      zip_code: this.data.data.zipCode,
      address: this.data.data.detailAddress,
      contact: this.data.data.contact,
      mobile: this.data.data.mobile,
      is_default:this.data.data.isDefault?"1":"0"
    }
    let data = {
      url,
      method: this.data.data.id?"PUT":"POST",
      data:queryObj
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if(this.loadingStatus) return;
    this.loadingStatus = true
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          wx.navigateBack({
            delta:1
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
        this.loadingStatus = false;
      })
  },
  onDeleteHandler:function(){
    let _this = this;
    let url = `${config.ApiRoot}/shipping-address/${this.data.data.id}`;
    let data = {
      url,
      method: "DELETE",
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (this.loadingStatus) return;
    this.loadingStatus = true
    userMs.request(data)
      .then(res => {
        const { data, code, msg } = res.data
        if (code == 10000) {
          wx.navigateBack({
            delta: 1
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
        this.loadingStatus = false;
      })
  },
  // onFetchProvincesList: function () {
  //   let _this = this;
  //   let url = `${config.ApiRoot}/address/provinces`;
  //   let data = {
  //     url,
  //   }
  //   wx.showLoading({
  //     title: '加载中',
  //   })
  //   userMs.request(data)
  //     .then(res => {
  //       const { data, code, msg } = res.data
  //       if (code == 10000) {
  //         let arr = ["全部"];
  //         data.forEach(item => {
  //           arr.push(item.name)
  //         });
          
  //         _this.data.data.multiArray[0] = arr;

  //         _this.setData({
  //           data: _this.data.data,
  //           "data.provinces": data
  //         })
  //       } else {
  //         throw res;
  //       }
  //     })
  //     .catch(err => {
  //       console.log(err)
  //     })
  //     .finally(res => {
  //       wx.hideLoading();
  //     })
  // },
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
  
  // }
  onInputUserNameHandler:function(e){
    this.data.data.contact = e.detail.value
  },
  onInputPhoneHandler: function (e) {
    this.data.data.mobile = e.detail.value
  },
  onSelectAddressTypeHandler:function(e){
    const type = e.currentTarget.dataset.type;
    if (type == this.data.state.addressType) return;
    this.setData({
      "state.addressType": type,
      "data.addressType": type
    })
  },
  onInputAddressDetailHandler: function (e) {
    this.data.data.detailAddress = e.detail.value
    console.log(this.data.data.detailAddress)
  },
  onInputZipCodeHandler:function(e){
    this.data.data.zipCode = e.detail.value
    console.log(this.data.data.zipCode)
  },
  onsetDefaultHandler:function(){
    this.setData({
      "data.isDefault": !this.data.data.isDefault
    })
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
  onSubmitHandler:function(){
    if (!this.data.data.contact){
      this.alertHandler("收货人不能为空");
      return;
    } 
    else if (!this.data.data.mobile){
      this.alertHandler("手机号不能为空");
      return;
    }
    else if (!this.data.data.provinceObj.name){
      this.alertHandler("请选择所在地区");
      return;
    }
    // else if (!this.data.data.cityObj.name) {
    //   console.log("city")
    //   return;
    // }
    // else if (!this.data.data.countyObj.name) {
    //   console.log("city")
    //   return;
    // }
    else if (!this.data.data.detailAddress) {
      this.alertHandler("请输入详细地址");
      return;
    }
    // else if (!this.data.data.addressType) {
    //   this.alertHandler("请选择所在地区");
    //   return;
    // }
    else{
      // 全部不为空值以后，检测手机号是否合法
      let reg = /^1[3456789]\d{9}$/;
      if (!reg.test(this.data.data.mobile)) {
        this.alertHandler("手机号格式不合法");
      }else{
        this.onAddAddressRequest();
      }
      
    }
  },
  // bindRegionChange: function (e) {
  //   console.log('picker发送选择改变，携带值为', e);
  //   this.data.data.provinceName = e.detail.value[0];
  //   this.data.data.cityName = e.detail.value[1];
  //   this.data.data.countyName = e.detail.value[2];
  //   this.setData({
  //     "data.region": e.detail.value,
  //     // "data.provinceName": e.detail.value[0],
  //     // "data.cityName": e.detail.value[1],
  //     // "data.countyName": e.detail.value[2]
  //   })
  // },
  bindMultiPickerColumnChange: function (e) {
    let _this = this;
    let regions = this.data.data.regions;
    console.log(e)
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);

    switch (e.detail.column) {
      case 0:
        let currentIndex = e.detail.value;
        // if(currentIndex < 1) {
        //   _this.data.data.multiArray = [_this.data.data.multiArray[0], ["全部"], ["全部"]];
        //   _this.data.data.multiIndex = [0, 0, 0];
        //   this.setData({
        //     data: _this.data.data
        //   })
        //   return;
        // };
        let selectWord = regions[0].children[currentIndex].name;
        let childrens = regions[0].children[currentIndex].children;
        let arr = childrens.map(item=>{
          return item.name
        });
        // arr.unshift("全部")
        let arrThird = []
        arrThird = childrens[0].children.map(item =>{
          return item.name
        }) 
        
        _this.data.data.multiArray = [_this.data.data.multiArray[0], arr,arrThird];
        _this.data.data.multiIndex = [currentIndex,0,0];
        // this.setData({
        //   data: _this.data.data
        // })
        console.log(arr)
        console.log("第一列")
        break;
      case 1:
        let firstIndex = _this.data.data.multiIndex[0];
        currentIndex = e.detail.value;
        // if (currentIndex < 1) {

        //   _this.data.data.multiArray = [_this.data.data.multiArray[0], _this.data.data.multiArray[1], ["全部"]];
        //   _this.data.data.multiIndex = [_this.data.data.multiIndex[0], currentIndex, 0];
        //   console.log(currentIndex)
        //   this.setData({
        //     data: _this.data.data
        //   })
        //   return;
          
        // }
        console.log(currentIndex)
        // console.log(regions[0].children[firstIndex ])
        selectWord = regions[0].children[firstIndex ].children[currentIndex].name;
        childrens = regions[0].children[firstIndex ].children[currentIndex ].children;
        arr = childrens.map(item => {
          return item.name
        });
        // arr.unshift("全部")
        _this.data.data.multiArray = [_this.data.data.multiArray[0], _this.data.data.multiArray[1], arr];
        _this.data.data.multiIndex = [_this.data.data.multiIndex[0],currentIndex, 0];
        // this.setData({
        //   data: _this.data.data
        // })
        console.log(arr)
        console.log("第二列")
        break;
      case 2: 
        firstIndex = _this.data.data.multiIndex[0];
        currentIndex = e.detail.value;
        _this.data.data.multiIndex = [_this.data.data.multiIndex[0], _this.data.data.multiIndex[1], currentIndex];
        // this.setData({
        //   data: _this.data.data
        // })
        console.log("第三列")
      break;
    }
    this.setData({
      data: _this.data.data
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let indexs = e.detail.value;
    let provinces = this.data.data.regions[0].children;
    let selectProvinceObj = provinces[indexs[0] ];
    let citys = selectProvinceObj.children;
    let selectCityObj = citys[indexs[1] ];
    let countys = selectCityObj.children;
    let selectCountyObj = countys[indexs[2]];

    this.data.data.provinceObj = {
      name:selectProvinceObj.name,
      id: selectProvinceObj.id
    }
    this.data.data.cityObj = {
      name: selectCityObj.name,
      id: selectCityObj.id
    }
    this.data.data.countyObj = {
      name: selectCountyObj.name,
      id: selectCountyObj.id
    }
    this.setData({
      data:this.data.data
    })
  },
})