export class CartActions{
  onUpdateCartData(index, type) {
    const _this = this;
    const skuDataItem = this.data.data.prosNow[index];
    let queryObj = {
      activity_goods_id: skuDataItem.activity_goods_id,
      "goods_id": skuDataItem.goods_id,
      "sku_id": skuDataItem.sku_id,
      "type": skuDataItem.type,
      adcode: skuDataItem.adcode
    }
    switch (type) {
      case "add":
        queryObj.num = 1;
        break;
      case "desc":
        queryObj.num = -1;
        break;
      case "select":
        queryObj.selected = !skuDataItem.selected;
        break;
    }

    let queryArr = [];
    queryArr.push(queryObj);
    wx.showLoading({
      title: '加载中',
    })
    // 这里必须做状态判断，否则，用户连续点击，就会连续触发请求
    if (this.data.state.updateLoading) return;
    this.data.state.updateLoading = true;
    const url = `${config.ApiRoot}/cart`;

    userMs.request({
      url,
      method: 'POST',
      data: queryArr
    })
    .then(res => {
      const { code, data, msg } = res.data;
      console.log(res.data)
      if (code === 10000) {
        console.log("更新成功")
        switch (type) {
          case "add":
            skuDataItem.num++;
            break;
          case "desc":
            skuDataItem.num--;
            break;
          case "select":
            skuDataItem.selected = !skuDataItem.selected;
            break;
        }
        this.setData({
          "data.prosNow": this.data.data.prosNow
        })
        this.onComputePriceAndCheckAll();

      } else {
        this.alertHandler(msg)
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      this.data.state.updateLoading = false;
      wx.hideLoading();
    });
  }
  // 删除请求，删除成功后，重新setData  data.products
  onDeleteRequest(deleteIds) {
    const _this = this;
    wx.showLoading({
      title: '删除中',
    })
    const url = `${config.ApiRoot}/cart`;

    userMs.request({
      url,
      method: 'delete',
      data: {
        ids: deleteIds
      }
    })
    .then(res => {
      const { code, data } = res.data;
      console.log(res.data)
      if (code === 10000) {
        _this.onFetchCartList();

      };
    })
    .catch(error => console.log(error))
    .finally(() => {
      wx.hideLoading();
      // wx.hideNavigationBarLoading();
    });
  }
}