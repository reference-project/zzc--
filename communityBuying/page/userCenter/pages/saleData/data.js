// const app = getApp();
const data = {
  data: {

  },
  state: {
    saleTypeFilters: [
      { name: "全部订单", type: "all", value:-2},
      { name: "已付款", type: "pay", value: 2 },
      { name: "已结算", type: "check", value: 4 },
      { name: "已失效", type: "timeout", value: -1 },
    ],
    selectSaleType:"all",
    selectSaleTypeIndex:0,
  },
  others: {
    pageUrl: "saleDataPage"
  }
}
module.exports = data;