Component({
  data: {
    selected: 0,
    color: "#8F9BB3",
    selectedColor: "#4F6EF6",
    list: [{
      pagePath: "/pages/index/index",
      iconName: "home",
      text: "首页"
    }, {
      pagePath: "/pages/sport/sport",
      iconName: "sport",
      text: "运动"
    }, {
      pagePath: "/pages/meditation/meditation",
      iconName: "meditation",
      text: "冥想"
    }, {
      pagePath: "/pages/analysis/analysis",
      iconName: "analysis",
      text: "数据"
    }, {
      pagePath: "/pages/profile/profile",
      iconName: "profile",
      text: "我的"
    }]
  },
  attached() {
    // 初始化选中状态
    this.setData({
      selected: this.getTabBarIndex()
    });
    
    // 保存tabBar引用到app.globalData
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.tabBar = this;
    }
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      
      // 切换到对应页面
      wx.switchTab({
        url
      });
      
      // 更新选中状态
      this.setData({
        selected: data.index
      });
    },
    
    // 获取当前页面对应的tabBar索引
    getTabBarIndex() {
      // 获取当前页面栈
      const pages = getCurrentPages();
      if (pages.length === 0) {
        return 0;
      }
      
      // 获取当前页面路径
      const currentPage = pages[pages.length - 1];
      const route = '/' + currentPage.route;
      
      // 查找对应的tabBar项索引
      const list = this.data.list;
      for (let i = 0; i < list.length; i++) {
        if (list[i].pagePath === route) {
          return i;
        }
      }
      
      return 0;
    },
    
    // 根据iconName获取对应的图标类型
    getIconType(iconName) {
      switch (iconName) {
        case 'home':
          return 'success';
        case 'sport':
          return 'info';
        case 'meditation':
          return 'waiting';
        case 'analysis':
          return 'download';
        case 'profile':
          return 'warn';
        default:
          return 'success';
      }
    }
  }
}) 