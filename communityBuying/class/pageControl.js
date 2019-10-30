module.exports = {
  data: {
    data: {
      totalPage: 0
    },
    state: {
      page: 1
    }
  },
  getNextPageNum:  function () {
    const data = this.data.data;
    const state = this.data.state;
    const nextPageNum = state.page + 1;

    return nextPageNum <= data.totalPage ? nextPageNum : 0;
  },

  haveNextPage: function () {
    return this.getNextPageNum() !== 0;
  },

  fetchNextPage: function (fetchDataFunc) {
    const nextPageNum = this.getNextPageNum();

    if (nextPageNum !== 0) {
      wx.showNavigationBarLoading();
      // 以后可能要优化，不然会有时间差
      // this.data.state.page=nextPageNum
      this.setData({
        "state.page": nextPageNum
      });
      fetchDataFunc && fetchDataFunc();
    }
  }
}