const app = getApp();
import { getExerciseHistory, addExerciseRecord } from '../../utils/storage';
import * as request from '../../utils/request';

Page({
  data: {
    exerciseData: {
      minutes: 75,
      calories: 320,
      count: 3
    },
    sportTypes: [
      {
        id: 1,
        name: '跑步',
        description: '户外/室内',
        icon: '/assets/icons/running.png'
      },
      {
        id: 2,
        name: '骑行',
        description: '自行车',
        icon: '/assets/icons/cycling.png'
      },
      {
        id: 3,
        name: '瑜伽',
        description: '身心放松',
        icon: '/assets/icons/yoga.png'
      },
      {
        id: 4,
        name: '步行',
        description: '轻度运动',
        icon: '/assets/icons/walking.png'
      }
    ],
    records: [],
    contentTop: 0,
    headerHeight: 0,
    popularWorkouts: [
      {
        id: 1,
        title: '晨间拉伸',
        duration: '10分钟',
        level: '初级',
        calories: 50,
        image: '/images/workout-1.jpg'
      },
      {
        id: 2,
        title: '全身HIIT训练',
        duration: '20分钟',
        level: '中级',
        calories: 180,
        image: '/images/workout-2.jpg'
      },
      {
        id: 3,
        title: '柔韧性训练',
        duration: '15分钟',
        level: '初级',
        calories: 90,
        image: '/images/workout-3.jpg'
      }
    ],
    workoutHistory: [
      {
        id: 1,
        title: '有氧运动',
        date: '今天',
        duration: 30,
        calories: 150
      },
      {
        id: 2,
        title: '力量训练',
        date: '昨天',
        duration: 25,
        calories: 120
      },
      {
        id: 3,
        title: '柔韧性训练',
        date: '3天前',
        duration: 20,
        calories: 80
      }
    ],
    scrollOffset: 0
  },

  onLoad() {
    this.loadExerciseData();
    this.loadExerciseRecords();
    this.lastOffset = 0;
    this.lastPageOffset = 0;
    this.scrollThrottleTimer = null;
    this.pageScrollThrottleTimer = null;
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('运动页面下拉刷新');
    
    // 刷新数据
    Promise.all([
      this.loadExerciseData(),
      this.loadExerciseRecords()
    ]).then(() => {
      // 停止下拉刷新动画
      wx.stopPullDownRefresh();
    }).catch(err => {
      console.error('刷新数据失败:', err);
      // 停止下拉刷新动画
      wx.stopPullDownRefresh();
    });
  },

  // 加载运动数据
  async loadExerciseData() {
    try {
      // 使用模拟数据，因为api.exercise不存在
      const minutes = Math.floor(Math.random() * 60) + 30; // 30-90分钟
      const calories = Math.floor(Math.random() * 300) + 200; // 200-500卡路里
      const count = Math.floor(Math.random() * 3) + 1; // 1-3次运动
      
      const goal = app.globalData.goals?.exerciseMinutes || 60;
      const progress = Math.min(100, (minutes / goal) * 100);

      this.setData({
        exerciseData: {
          minutes,
          calories,
          count,
          progress,
          goal
        }
      });
    } catch (error) {
      console.error('加载运动数据失败:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 加载运动记录
  loadExerciseRecords() {
    try {
      const records = getExerciseHistory().slice(0, 5);
      this.setData({ records });
    } catch (error) {
      console.error('加载运动记录失败:', error);
    }
  },

  // 开始运动
  startExercise(e) {
    const type = e.currentTarget.dataset.type;
    const sportType = this.data.sportTypes.find(item => item.id === type);
    
    if (sportType) {
      wx.navigateTo({
        url: `/pages/sport/exercise/exercise?type=${type}&name=${sportType.name}`
      });
    }
  },

  // 查看所有记录
  viewAllRecords() {
    wx.navigateTo({
      url: '/pages/sport/records/records'
    });
  },

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