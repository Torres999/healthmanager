const app = getApp();
import { getExerciseHistory, addExerciseRecord } from '../../utils/storage';
import * as request from '../../utils/request';

Page({
  data: {
    exerciseData: {
      minutes: 0,
      calories: 0,
      count: 0,
      progress: 0,
      goal: 30
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
    headerHeight: 0
  },

  onLoad() {
    this.loadExerciseData();
    this.loadExerciseRecords();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
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
  }
}); 