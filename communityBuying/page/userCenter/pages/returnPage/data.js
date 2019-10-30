module.exports={
  data:{
    tempFilePathsLocal:[], // 本地图片
    orderDetail:{},
    returnItem:{},
    tempFilePathsNet:[], // 已经上传过的图片
  },
  state:{
    chooseReturnTypeStatus:true,
    returnTypes:[
      { name: "仅退款", type: 2, desc:"未收到货(包含未签收)" },
      { name: "退款退货", type: 1, desc:"因质量、错发等问题需要退货退款"},
      { name: "换货", type: 3, desc:"因尺寸、错发等问题需要换货" },
    ],
    selectReturnTypeItem:{},
    apply_reason:"",
    returnMoney:"",
    remark:""
  },
  others:{
    pageUrl:"returnPage"
  }
}