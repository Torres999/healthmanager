const app = getApp();
import { api } from '../../utils/request';

// 创建一个安全的日志对象，拦截可能导致无限递归的警告
const safeConsole = {
  log: console.log.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console)
};

// 安全的警告函数，防止无限递归
safeConsole.warn = function() {
  try {
    // 使用简单的日志记录，避免调用可能导致递归的原始warn
    console.log('[WARN]', Array.from(arguments).join(' '));
  } catch (e) {
    // 出错时不做任何处理，防止崩溃
  }
};

Page({
  data: {
    headerHeight: 0,
    contentTop: 0,
    featuredCourse: {
      title: '正念冥想',
      description: '提高专注力，缓解压力和焦虑',
      duration: 15,
      level: '初级'
    },
    categories: [
      {
        id: 1,
        name: '睡眠',
        iconType: 'success',
        courseCount: 8
      },
      {
        id: 2,
        name: '减压',
        iconType: 'info',
        courseCount: 12
      },
      {
        id: 3,
        name: '专注',
        iconType: 'waiting',
        courseCount: 6
      },
      {
        id: 4,
        name: '情绪',
        iconType: 'warn',
        courseCount: 9
      }
    ],
    recentCourses: [],
    weeklyProgress: {
      totalMinutes: 0,
      days: []
    },
    stats: {
      totalSessions: 0,
      totalMinutes: 0,
      longestStreak: 0
    },
    scrollOffset: 0
  },

  onLoad() {
    // 初始化滚动相关变量
    this.lastOffset = 0;
    this.lastPageOffset = 0;
    this.scrollThrottleTimer = null;
    this.pageScrollThrottleTimer = null;

    // 使用安全的日志对象替换全局console
    // 这种方法不会尝试修改console对象本身，而是在需要时使用安全版本
    if (typeof window !== 'undefined') {
      window.console = safeConsole;
    } else if (typeof global !== 'undefined') {
      global.console = safeConsole;
    }
    
    this.loadRecentCourses();
    this.loadWeeklyProgress();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  // 加载最近课程
  async loadRecentCourses() {
    try {
      const app = getApp();
      
      // 检查 meditation 数据是否存在，如果不存在则初始化
      if (!app.globalData.meditation) {
        app.globalData.meditation = {
          recentCourses: [],
          weeklyProgress: { target: 7, current: 0, days: [false, false, false, false, false, false, false] },
          stats: { totalSessions: 0, totalMinutes: 0, longestStreak: 0 }
        };
        console.log('初始化冥想数据');
      }
      
      // 获取冥想数据
      const meditationData = app.globalData.meditation;
      
      // 为每个课程添加 iconType 属性
      const iconTypes = ['info', 'success', 'waiting', 'warn'];
      const recentCourses = (meditationData.recentCourses || []).map((course, index) => {
        return {
          ...course,
          iconType: course.iconType || iconTypes[index % iconTypes.length]
        };
      });
      
      // 更新页面数据
      this.setData({
        recentCourses: recentCourses
      });
      
      console.log('最近课程加载成功');
    } catch (error) {
      console.log('加载最近课程失败:', error);
      
      // 设置默认数据，确保页面不会崩溃
      this.setData({
        recentCourses: []
      });
    }
  },

  // 加载每周进度
  async loadWeeklyProgress() {
    try {
      const app = getApp();
      
      // 检查 meditation 数据是否存在
      if (!app.globalData.meditation) {
        return; // 已在 loadRecentCourses 中初始化
      }
      
      // 获取冥想数据
      const meditationData = app.globalData.meditation;
      
      // 创建每日进度数据
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      const dailyData = [];
      
      // 如果有每周进度数据，则使用它
      if (meditationData.weeklyProgress && meditationData.weeklyProgress.days) {
        // 使用现有数据
        const maxMinutes = 30; // 默认最大值
        
        for (let i = 0; i < 7; i++) {
          dailyData.push({
            day: days[i],
            height: meditationData.weeklyProgress.days[i] ? 150 : 0,
            completed: meditationData.weeklyProgress.days[i]
          });
        }
      } else {
        // 创建默认数据
        for (let i = 0; i < 7; i++) {
          dailyData.push({
            day: days[i],
            height: 0,
            completed: false
          });
        }
      }
      
      // 更新页面数据
      this.setData({
        'weeklyProgress.totalMinutes': meditationData.stats?.totalMinutes || 0,
        'weeklyProgress.days': dailyData
      });
      
      console.log('每周进度加载成功');
    } catch (error) {
      console.log('加载每周进度失败:', error);
      
      // 设置默认数据，确保页面不会崩溃
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      const defaultData = days.map(day => ({
        day,
        height: 0,
        completed: false
      }));
      
      this.setData({
        'weeklyProgress.totalMinutes': 0,
        'weeklyProgress.days': defaultData
      });
    }
  },

  // 开始课程
  startCourse(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/meditation/player/player?id=${courseId}`
    });
  },

  // 导航到分类页面
  navigateToCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/meditation/category/category?id=${categoryId}`
    });
  },

  // 查看所有课程
  viewAllCourses() {
    wx.navigateTo({
      url: '/pages/meditation/courses/courses'
    });
  },

  // 处理页面头部高度变化
  onHeaderHeightChange(e) {
    // 接收页面头部组件传递的高度和内容顶部位置
    this.setData({
      headerHeight: e.detail.height,
      contentTop: e.detail.contentTop
    });
  },

  // 处理scroll-view的滚动事件
  onScrollView(e) {
    // 使用节流控制调用频率
    if (this.scrollThrottleTimer) {
      return;
    }
    
    this.scrollThrottleTimer = setTimeout(() => {
      this.scrollThrottleTimer = null;
    }, 5); // 5ms节流
    
    // 获取滚动距离
    const scrollTop = e.detail.scrollTop;
    
    // 计算合适的偏移量，并添加边界限制
    let offset = -scrollTop;
    
    // 限制最大偏移量，防止标题滑出顶部视图
    const maxOffset = 0; // 不允许向上位移超过初始位置
    
    // 限制最小偏移量，防止标题完全消失
    const minOffset = -this.data.headerHeight;
    
    // 应用边界限制
    offset = Math.min(maxOffset, Math.max(minOffset, offset));
    
    // 只有当偏移量变化超过阈值时才更新
    if (!this.lastOffset || Math.abs(offset - this.lastOffset) > 0.5) {
      this.lastOffset = offset;
      
      // 使用nextTick优化性能
      wx.nextTick(() => {
        this.setData({
          scrollOffset: offset
        });
      });
    }
  },

  // 处理整页滚动事件
  onPageScroll(e) {
    // 使用节流控制调用频率
    if (this.pageScrollThrottleTimer) {
      return;
    }
    
    this.pageScrollThrottleTimer = setTimeout(() => {
      this.pageScrollThrottleTimer = null;
    }, 5);
    
    // 获取滚动距离
    const scrollTop = e.scrollTop;
    
    // 计算合适的偏移量，并添加边界限制
    let offset = -scrollTop;
    const maxOffset = 0;
    const minOffset = -this.data.headerHeight;
    offset = Math.min(maxOffset, Math.max(minOffset, offset));
    
    // 只有当偏移量变化超过阈值时才更新
    if (!this.lastPageOffset || Math.abs(offset - this.lastPageOffset) > 0.5) {
      this.lastPageOffset = offset;
      
      this.setData({
        scrollOffset: offset
      });
    }
  }
}); 