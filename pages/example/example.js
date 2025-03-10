Page({
  data: {
    headerHeight: 0,
    contentTop: 0
  },
  onLoad() {
    // 页面加载时，可以进行一些初始化操作
  },
  onHeaderHeightChange(e) {
    // 接收页面头部组件传递的高度和内容顶部位置
    this.setData({
      headerHeight: e.detail.height,
      contentTop: e.detail.contentTop
    });
  }
}) 