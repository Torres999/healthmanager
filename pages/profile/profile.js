const app = getApp();
import { api } from '../../utils/request';

Page({
  data: {
    userInfo: {
      nickName: 'David',
      avatarUrl: '/assets/images/avatar.png',
      signature: '健康生活，快乐每一天'
    },
    userStats: {
      exerciseDays: 15,
      meditationMinutes: 180,
      achievements: 3
    },
    healthProfile: {
      height: 178,
      weight: 68,
      bmi: 21.5,
      bloodType: 'A型'
    },
    menuItems: [
      {
        icon: '/assets/icons/activity.svg',
        text: '健康数据',
        path: '/pages/health/health'
      },
      {
        icon: '/assets/icons/history.svg',
        text: '活动历史',
        path: '/pages/activity/history'
      },
      {
        icon: '/assets/icons/settings.svg',
        text: '隐私设置',
        path: '/pages/settings/privacy'
      }
    ],
    healthGoals: [
      {
        icon: '/assets/icons/steps.svg',
        title: '每日步数',
        current: 8547,
        target: 10000,
        unit: '步'
      },
      {
        icon: '/assets/icons/calories.svg',
        title: '消耗卡路里',
        current: 356,
        target: 500,
        unit: '千卡'
      },
      {
        icon: '/assets/icons/running.svg',
        title: '运动时间',
        current: 25,
        target: 30,
        unit: '分钟'
      },
      {
        icon: '/assets/icons/meditation.svg',
        title: '冥想时间',
        current: 10,
        target: 15,
        unit: '分钟'
      }
    ],
    achievements: [
      {
        icon: '/assets/icons/medal.svg',
        title: '连续运动达人',
        description: '连续运动30天'
      },
      {
        icon: '/assets/icons/star.svg',
        title: '早起冠军',
        description: '连续5天6:00前起床'
      },
      {
        icon: '/assets/icons/trophy.svg',
        title: '冥想专家',
        description: '累计冥想时间超过10小时'
      }
    ],
    hasUserInfo: false,
    headerHeight: 0,
    contentTop: 0
  },

  onLoad() {
    this.loadUserInfo();
    this.loadUserStats();
    this.loadHealthGoals();
    this.loadAchievements();
    this.loadHealthProfile();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      });
    }
  },

  loadUserInfo() {
    // 检查用户数据是否存在
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          userInfo: userInfo
        });
      } else {
        // 如果不存在，使用默认值
        const defaultUserInfo = {
          nickName: 'David',
          avatarUrl: '/assets/images/avatar.png',
          signature: '健康生活，快乐每一天'
        };
        wx.setStorageSync('userInfo', defaultUserInfo);
        this.setData({
          userInfo: defaultUserInfo
        });
      }
    } catch (e) {
      console.error('获取用户信息失败', e);
      // 出错时使用默认值
      this.setData({
        userInfo: {
          nickName: 'David',
          avatarUrl: '/assets/images/avatar.png',
          signature: '健康生活，快乐每一天'
        }
      });
    }
  },

  loadUserStats() {
    // 检查用户统计数据是否存在
    try {
      const userStats = wx.getStorageSync('userStats');
      if (userStats) {
        this.setData({
          userStats: userStats
        });
      } else {
        // 如果不存在，使用默认值
        const defaultUserStats = {
          exerciseDays: 15,
          meditationMinutes: 180,
          achievements: 3
        };
        wx.setStorageSync('userStats', defaultUserStats);
        this.setData({
          userStats: defaultUserStats
        });
      }
    } catch (e) {
      console.error('获取用户统计数据失败', e);
      // 出错时使用默认值
      this.setData({
        userStats: {
          exerciseDays: 15,
          meditationMinutes: 180,
          achievements: 3
        }
      });
    }
  },

  loadHealthProfile() {
    // 检查健康档案数据是否存在
    try {
      const healthProfile = wx.getStorageSync('healthProfile');
      if (healthProfile) {
        this.setData({
          healthProfile: healthProfile
        });
      } else {
        // 如果不存在，使用默认值
        const defaultHealthProfile = {
          height: 178,
          weight: 68,
          bmi: 21.5,
          bloodType: 'A型'
        };
        wx.setStorageSync('healthProfile', defaultHealthProfile);
        this.setData({
          healthProfile: defaultHealthProfile
        });
      }
    } catch (e) {
      console.error('获取健康档案数据失败', e);
      // 出错时使用默认值
      this.setData({
        healthProfile: {
          height: 178,
          weight: 68,
          bmi: 21.5,
          bloodType: 'A型'
        }
      });
    }
  },

  loadHealthGoals() {
    // 检查健康目标数据是否存在
    try {
      const healthGoals = wx.getStorageSync('healthGoals');
      if (healthGoals) {
        this.setData({
          healthGoals: healthGoals
        });
      } else {
        // 如果不存在，使用默认值
        const defaultHealthGoals = [
          {
            icon: '/assets/icons/steps.svg',
            title: '每日步数',
            current: 8547,
            target: 10000,
            unit: '步'
          },
          {
            icon: '/assets/icons/calories.svg',
            title: '消耗卡路里',
            current: 356,
            target: 500,
            unit: '千卡'
          },
          {
            icon: '/assets/icons/running.svg',
            title: '运动时间',
            current: 25,
            target: 30,
            unit: '分钟'
          },
          {
            icon: '/assets/icons/meditation.svg',
            title: '冥想时间',
            current: 10,
            target: 15,
            unit: '分钟'
          }
        ];
        wx.setStorageSync('healthGoals', defaultHealthGoals);
        this.setData({
          healthGoals: defaultHealthGoals
        });
      }
    } catch (e) {
      console.error('获取健康目标数据失败', e);
      // 出错时使用默认值
      this.setData({
        healthGoals: [
          {
            icon: '/assets/icons/steps.svg',
            title: '每日步数',
            current: 8547,
            target: 10000,
            unit: '步'
          },
          {
            icon: '/assets/icons/calories.svg',
            title: '消耗卡路里',
            current: 356,
            target: 500,
            unit: '千卡'
          },
          {
            icon: '/assets/icons/running.svg',
            title: '运动时间',
            current: 25,
            target: 30,
            unit: '分钟'
          },
          {
            icon: '/assets/icons/meditation.svg',
            title: '冥想时间',
            current: 10,
            target: 15,
            unit: '分钟'
          }
        ]
      });
    }
  },

  loadAchievements() {
    // 检查成就数据是否存在
    try {
      const achievements = wx.getStorageSync('achievements');
      if (achievements) {
        this.setData({
          achievements: achievements
        });
      } else {
        // 如果不存在，使用默认值
        const defaultAchievements = [
          {
            icon: '/assets/icons/medal.svg',
            title: '连续运动达人',
            description: '连续运动30天'
          },
          {
            icon: '/assets/icons/star.svg',
            title: '早起冠军',
            description: '连续5天6:00前起床'
          },
          {
            icon: '/assets/icons/trophy.svg',
            title: '冥想专家',
            description: '累计冥想时间超过10小时'
          }
        ];
        wx.setStorageSync('achievements', defaultAchievements);
        this.setData({
          achievements: defaultAchievements
        });
      }
    } catch (e) {
      console.error('获取成就数据失败', e);
      // 出错时使用默认值
      this.setData({
        achievements: [
          {
            icon: '/assets/icons/medal.svg',
            title: '连续运动达人',
            description: '连续运动30天'
          },
          {
            icon: '/assets/icons/star.svg',
            title: '早起冠军',
            description: '连续5天6:00前起床'
          },
          {
            icon: '/assets/icons/trophy.svg',
            title: '冥想专家',
            description: '累计冥想时间超过10小时'
          }
        ]
      });
    }
  },

  editProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit/edit',
    });
  },

  navigateTo(e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path,
    });
  },
  
  editGoals() {
    wx.navigateTo({
      url: '/pages/profile/goals/goals',
    });
  },
  
  viewAllAchievements() {
    wx.navigateTo({
      url: '/pages/profile/achievements/achievements',
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