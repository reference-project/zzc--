module.exports = {
  data: {
    // rotation: [
    //   {
    //     logo: "https://bir.langnadujia.cn/upload/admin/20180705/72bf77bf077cc141_thumb_750.jpg"
    //   },
    //   {
    //     logo: "https://bir.langnadujia.cn/upload/products/20180419/295c541c30b85f25_thumb_750.jpg"
    //   },
    //   {
    //     logo: "https://bir.langnadujia.cn/upload/admin/20180705/72bf77bf077cc141_thumb_750.jpg"
    //   }
    // ], // 轮播图
    classifies: [],// 分类
    products:[], // 商品
    packages:[],  //红包
    flashSaleList:[], // 秒杀列表
    timeFilters:[], // 秒杀时间列表
    presale_goods:[], // 预售商品列表
    selectFilterTimeIndex:0, // 默认秒杀时间选择项
    cartList:[], // 购物车数据列表
  },
  state: {
    authorizePic: "/imgs/pic-authorized.png",
    selectTabType:"now",
    authorizePic:"/imgs/icon-authorize-default.png",
    needAuthorize: false,
    officialAccount: wx.canIUse("official-account"),
    firstLoading:true,
    needLocation:true,//没定位
    filters:[
      // {label:"全部",type:"all"},
      // { label: "水果", type: "fruit" },
      // { label: "蔬菜", type: "ve" },
      // { label: "海鲜", type: "sea" },
      // { label: "肉类", type: "you" },
      // { label: "全部", type: "a" }
    ],
    selectFilterId:0,
    isNewUserStatus:false,
    barrageIndex:0
  },
  others: {
    pageUrl: "index"
  }
}