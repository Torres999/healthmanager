// index.js
const app = getApp();
import * as echarts from '../../utils/echarts-min';

// 初始化图表
function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  
  const option = {
    backgroundColor: 'transparent',
    color: ['#4F6EF6'],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: {
        lineStyle: {
          color: '#94A3B8'
        }
      },
      axisLabel: {
        color: '#94A3B8'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#94A3B8'
        }
      },
      axisLabel: {
        color: '#94A3B8'
      },
      splitLine: {
        lineStyle: {
          color: ['#1A2235']
        }
      }
    },
    series: [{
      data: [30, 40, 35, 50, 45, 60, 70],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(79, 110, 246, 0.3)'
        }, {
          offset: 1,
          color: 'rgba(79, 110, 246, 0)'
        }])
      }
    }]
  };
  
  chart.setOption(option);
  return chart;
}

Page({
  data: {
    userInfo: {
      nickName: 'David'
    },
    healthData: {
      steps: 0,
      stepsChange: 0,
      heartRate: 0,
      calories: 0,
      sleep: 0
    },
    tasks: [
      {
        id: 1,
        title: '晨间跑步',
        description: '30分钟有氧运动',
        completed: false
      },
      {
        id: 2,
        title: '冥想放松',
        description: '15分钟正念冥想',
        completed: false
      }
    ],
    ec: {
      onInit: initChart
    },
    heartbeat: false,
    headerHeight: 0,
    contentTop: 0
  },

  // 心跳动画定时器
  heartbeatTimer: null,

  onLoad() {
    // 加载用户信息
    this.loadUserInfo();
    
    // 加载健康数据
    this.loadHealthData();
    
    // 启动心跳动画
    this.startHeartbeat();
  },
  
  // 页面显示时
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
    
    // 更新健康数据
    this.loadHealthData();
  },
  
  // 页面隐藏时清除定时器
  onHide() {
    this.clearHeartbeatTimer();
  },
  
  // 页面卸载时清除定时器
  onUnload() {
    this.clearHeartbeatTimer();
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    } else {
      // 使用默认数据
      this.setData({
        userInfo: {
          nickName: 'David'
        }
      });
    }
  },

  // 加载健康数据
  loadHealthData() {
    const app = getApp();
    
    // 获取健康数据
    const healthData = app.globalData.healthData || {};
    
    // 计算步数变化百分比（模拟数据）
    const stepsChange = Math.floor(Math.random() * 15) + 5;
    
    this.setData({
      healthData: {
        steps: healthData.steps || 6890,
        stepsChange: stepsChange,
        heartRate: healthData.heartRate || 72,
        calories: healthData.calories || 1250,
        sleep: healthData.sleepHours || 7.5
      }
    });
  },

  // 开始任务
  startTask(e) {
    const taskId = e.currentTarget.dataset.id;
    
    // 根据任务ID跳转到不同页面
    if (taskId === 1) {
      wx.switchTab({
        url: '/pages/sport/sport'
      });
    } else if (taskId === 2) {
      wx.switchTab({
        url: '/pages/meditation/meditation'
      });
    }
  },

  // 查看所有任务
  viewAllTasks() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  onHeaderHeightChange(e) {
    // 接收页面头部组件传递的高度和内容顶部位置
    this.setData({
      headerHeight: e.detail.height,
      contentTop: e.detail.contentTop
    });
  },
  
  startHeartbeat() {
    // 清除可能存在的定时器
    this.clearHeartbeatTimer();
    
    // 创建新的定时器，模拟心跳效果
    this.heartbeatTimer = setInterval(() => {
      this.setData({
        heartbeat: true
      });
      
      setTimeout(() => {
        this.setData({
          heartbeat: false
        });
      }, 1000);
    }, 2000);
  },
  
  clearHeartbeatTimer() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
})
