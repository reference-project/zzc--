module.exports={
  data:{
    userInfo:{},
    orderNumObj:{},
    radarImg:''
    // saleDataOrders:[]
  },
  state:{
    // selectType:"user",
    canUseFeedBackStatus: wx.canIUse('button.open-type.feedback'),
    saleTypeFilters:[
      {name:"销售订单", type: "all",},
      { name: "已付款", type: "pay", value:2},
      { name: "已结算", type: "check",value:7 },
      { name: "已失效", type: "timeout",value:8 },
    ],
    clickNum:0,
    // selectSaleType:"all",
    // selectSaleTypeIndex:0,
    // savePicBoxStatus: false,
    // posterId: "posterId",
    // openSavePicBoxTimes: 1
    qRCodeBoxStatus:false,
    orderNeedAuthorize:false,
  },
  others:{
    pageUrl:"userCenterPage"
  }
}