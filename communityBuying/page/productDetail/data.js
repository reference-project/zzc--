module.exports={
  data:{
    groups:[
      { user_nickname:"1"},
      { user_nickname:"2"},
      { user_nickname:"3"},
      { user_nickname: "3" }
    ],
    productDetail:{}
  },
  state:{
    shopCartBoxStatus: false,
    groupsBoxStatus: false,
    scrollTop:0,
    returnBack:false,
    scrollI:0,
    timer:3000,
    groupBuyingStatus:false,
    selectIds:[],
    totalBuyNum:1,
    selectSkuItem:{},
    savePicBoxStatus:false,
    posterId:"posterId",
    openSavePicBoxTimes:1,
    // hasAddToCartStatus:true,
    cartItemNumber:0
  },
  others:{
    pageUrl: "productDetailPage"
  }
}