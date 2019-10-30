const data = {
  data: {

  },
  state: {
    saleTypeFilters: [
      { label: "全部订单", type: "all", value: -2 },
      { label: "已付款", type: "pay", value: 2 },
      { label: "已结算", type: "check", value: 5 },
      { label: "已失效", type: "timeout", value: -1 },
    ],
    selectSaleType: "all",
    selectSaleTypeIndex: 0,
    saleTimeFilters: [
      { label: "全部", type: "all", value: 0 },
      { label: "七天内", type: "week", value: 1 },
      { label: "本月", type: "month", value: 2 },
      { label: "上月", type: "lastMonth", value: 3 },
    ],
    selectSaleTime: "all",
    selectSaleTimeIndex: 0,
  },
  others: {
    pageUrl: "saleOrderListPage"
  }
}
module.exports = data;