Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },
  data: {
    statusBarHeight: 0,
    capsuleHeight: 0,
    headerHeight: 0,
    contentTop: 0
  },
  lifetimes: {
    attached() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      // 获取胶囊按钮位置信息
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      
      // 计算状态栏高度
      const statusBarHeight = systemInfo.statusBarHeight;
      // 胶囊按钮顶部位置
      const capsuleTop = menuButtonInfo.top;
      // 计算胶囊按钮高度
      const capsuleHeight = menuButtonInfo.height;
      // 计算头部区域总高度（胶囊按钮底部位置）
      const headerHeight = menuButtonInfo.bottom;
      // 计算内容区域的顶部位置（与胶囊按钮底部精确对齐）
      const contentTop = menuButtonInfo.bottom;
      
      this.setData({
        statusBarHeight,
        capsuleHeight,
        headerHeight,
        contentTop
      });
      
      // 将头部高度和内容顶部位置传递给页面
      this.triggerEvent('heightChange', { 
        height: headerHeight,
        contentTop: contentTop
      });
    }
  },
  methods: {
    goBack() {
      if (this.properties.showBack) {
        wx.navigateBack({
          fail: () => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        });
      }
    }
  }
}) 