module.exports = {
  data: {
    products:[
      // {
      //   name:"dd",
      //   price:222,
      //   num:2,
      //   selected:true
      // },
      // {
      //   name: "dd",
      //   price: 222,
      //   num: 1,
      //   selected: false
      // },
      // {
      //   name: "dd",
      //   price: 222,
      //   num: 1,
      //   selected: true
      // },
      // {
      //   name: "dd",
      //   price: 222,
      //   num: 1,
      //   selected: false
      // },
      // {
      //   name: "dd",
      //   price: 222,
      //   num: 1,
      //   selected: true
      // },
    ],
    likeProData: [],//猜你喜欢数据
  },
  state: {
    likeProStaus:false,//猜你喜欢
    manageStatus:false,
    selectAllStatus:false,
    selectIds:[],
    moveState:false,
    allPrice:0,//总价格
    favouredPrice:0,//优惠价格
    marketPrice:0,//市场价格
    deleteComfirm: false,
    isDeleteOne:false,
    deleteIndex:0,
    isLoading:true
  },
  others: {
    pageUrl: "cartPage"
  }
}