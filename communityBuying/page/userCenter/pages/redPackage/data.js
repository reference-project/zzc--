module.exports = {
  data:{
    allData:{
      actived:{
        data:[
          // {
          //   isUsed:false
          // }
        ]
      },
      used: {
        data: [
          // {
          //   isUsed: true
          // },
          // {
          //   isUsed: true
          // }
        ]
      }
    }
  },
  state:{
    filters:[
      { label: "未使用", status: 2, type:"actived" },
      { label: "使用记录", status: 1,type:"used" }
    ],
    selectFilterIndex:0,
    selectFilterType:"actived",
    emptyIcon:"/imgs/icon-empty-package.png",
    emptyTips:"您还没有该状态红包哦~"
  },
  others:{
    pageUrl:"redPackage"
  }
}