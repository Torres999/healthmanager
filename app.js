// app.js

// 导入存储工具
const storage = require('./utils/storage');

App({
  globalData: {
    userInfo: null,
    theme: 'dark',
    // 添加用户数据
    user: {
      profile: {
        nickname: '健康用户',
        avatar: '/assets/icons/user.png',
        gender: '保密',
        age: 30,
        height: 170,
        weight: 65
      },
      stats: {
        exerciseDays: 15,
        meditationDays: 10,
        totalSteps: 120000,
        totalCalories: 5600
      },
      achievements: [
        {
          id: 1,
          title: '运动达人',
          description: '连续7天完成运动目标',
          icon: '/assets/icons/achievement.png',
          completed: true
        },
        {
          id: 2,
          title: '冥想专家',
          description: '累计冥想时间超过10小时',
          icon: '/assets/icons/achievement.png',
          completed: false
        }
      ],
      goals: {
        steps: 10000,
        calories: 500,
        exerciseMinutes: 30,
        meditationMinutes: 15
      }
    },
    healthData: {
      steps: 6890,          // 硬编码步数
      heartRate: 72,        // 硬编码心率
      sleepHours: 7.5,      // 硬编码睡眠时间
      exerciseMinutes: 120  // 硬编码运动时间
    },
    goals: {
      dailySteps: 10000,
      exerciseMinutes: 30,
      sleepHours: 8
    },
    themeData: {},
    exercise: {
      recentActivities: [
        {
          id: 1,
          type: '跑步',
          duration: 30,
          distance: 3.5,
          calories: 320,
          date: '2023-05-15'
        },
        {
          id: 2,
          type: '骑行',
          duration: 45,
          distance: 12,
          calories: 450,
          date: '2023-05-14'
        }
      ],
      weeklyGoal: {
        target: 150,
        current: 75
      },
      stats: {
        totalDistance: 25.5,
        totalCalories: 2250,
        totalDuration: 240
      }
    },
    meditation: {
      recentCourses: [
        {
          id: 1,
          title: '晨间冥想',
          duration: 15,
          image: '/assets/icons/meditation.png',
          completed: true,
          date: '2023-05-15'
        },
        {
          id: 2,
          title: '睡前放松',
          duration: 20,
          image: '/assets/icons/meditation.png',
          completed: false,
          date: '2023-05-14'
        }
      ],
      weeklyProgress: {
        target: 7,
        current: 3,
        days: [true, true, true, false, false, false, false]
      },
      stats: {
        totalSessions: 24,
        totalMinutes: 360,
        longestStreak: 5
      }
    },
    tabBar: null
  },

  onLaunch() {
    // 修复 __route__ 未定义问题
    if (typeof global !== 'undefined' && !global.__route__) {
      global.__route__ = '';
    }
    
    // 设置主题颜色
    wx.setStorageSync('theme', 'dark');
    this.updateTheme();
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo;
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            }
          });
        }
      }
    });

    // 模拟获取健康数据
    this.mockHealthData();

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查token是否存在且未过期
    if (!storage.getToken() || storage.isTokenExpired()) {
      this.login();
    }
  },

  // 登录方法
  login() {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 token
          wx.request({
            url: 'http://localhost:8080/hm/auth/login',
            method: 'POST',
            data: {
              code: res.code
            },
            success: (result) => {
              // 输出完整的响应数据，用于调试
              console.log('登录响应数据:', result);
              
              // 检查响应状态码
              if (result.statusCode === 200) {
                // 检查响应数据结构
                if (result.data.token) {
                  // 标准格式：直接包含token字段
                  storage.saveToken(result.data.token, result.data.expireIn || 7200);
                  console.log('登录成功，token已保存');
                  
                  // 保存用户ID
                  if (result.data.userId) {
                    storage.saveUserId(result.data.userId);
                    console.log('用户ID已保存:', result.data.userId);
                  }
                } else if (result.data.data && result.data.data.token) {
                  // 嵌套格式：token在data字段内
                  storage.saveToken(result.data.data.token, result.data.data.expireIn || 7200);
                  console.log('登录成功，token已保存(嵌套格式)');
                  
                  // 保存用户ID
                  if (result.data.data.userId) {
                    storage.saveUserId(result.data.data.userId);
                    console.log('用户ID已保存:', result.data.data.userId);
                  }
                } else if (typeof result.data === 'string') {
                  // 字符串格式：整个响应可能是token字符串
                  storage.saveToken(result.data, 7200);
                  console.log('登录成功，token已保存(字符串格式)');
                } else {
                  // 无法识别的格式，但状态码是200，尝试继续
                  console.warn('登录成功但无法识别token格式:', result.data);
                }
              } else {
                console.error('登录失败:', result);
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('登录请求失败:', err);
              wx.showToast({
                title: '网络请求失败，请检查网络',
                icon: 'none'
              });
            }
          });
        } else {
          console.error('登录失败:', res);
          wx.showToast({
            title: '微信登录失败，请重试',
            icon: 'none'
          });
        }
      }
    });
  },

  // 模拟获取健康数据
  mockHealthData() {
    // 模拟每小时更新一次数据
    setInterval(() => {
      const mockData = {
        steps: Math.floor(Math.random() * 2000) + 5000,        // 5000-7000步
        heartRate: Math.floor(Math.random() * 10) + 65,        // 65-75次/分
        sleepHours: (Math.random() * 2 + 6.5).toFixed(1),     // 6.5-8.5小时
        exerciseMinutes: Math.floor(Math.random() * 60) + 90   // 90-150分钟
      };
      this.updateHealthData(mockData);
    }, 3600000); // 每小时更新一次
  },

  // 更新健康数据
  updateHealthData(data) {
    Object.assign(this.globalData.healthData, data);
  },

  // 更新目标设置
  updateGoals(goals) {
    Object.assign(this.globalData.goals, goals);
  },

  // 更新主题
  updateTheme() {
    const theme = wx.getStorageSync('theme') || 'dark';
    if (theme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#0B1121'
      });
      this.globalData.themeData = {
        '--background-color': '#0B1121',
        '--card-background': '#151B2E',
        '--text-color': '#FFFFFF',
        '--text-secondary': '#94A3B8',
        '--primary-color': '#4F6EF6',
        '--tab-bar-background': '#151B2E'
      };
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#FFFFFF'
      });
      this.globalData.themeData = {
        '--background-color': '#F8FAFC',
        '--card-background': '#FFFFFF',
        '--text-color': '#0F172A',
        '--text-secondary': '#64748B',
        '--primary-color': '#4F6EF6',
        '--tab-bar-background': '#FFFFFF'
      };
    }
    this.setThemeData();
  },
  
  // 设置CSS变量
  setThemeData() {
    const themeData = this.globalData.themeData;
    
    // 将主题变量保存到Storage
    for (const key in themeData) {
      wx.setStorageSync(key, themeData[key]);
    }
  },

  // 重写Page方法，为每个页面添加onShow方法来更新tabBar选中状态
  onShow() {
    // 获取当前页面路径
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      // 更新tabBar选中状态
      if (typeof this.globalData.tabBar !== 'undefined') {
        this.globalData.tabBar.setData({
          selected: this.globalData.tabBar.getTabBarIndex()
        });
      }
    }
  }
})
