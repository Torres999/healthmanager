const app = getApp();
const { api } = require('../../utils/request');
const echarts = require('../../utils/echarts-min');

let chart = null;

// 模拟数据生成函数
function getMockData() {
  return {
    overview: {
      exercise: '120',
      meditation: '45',
      steps: '6,890',
      calories: '328'
    },
    exerciseData: {
      dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      values: [30, 45, 20, 60, 35, 40, 50]
    },
    meditationStats: {
      totalSessions: 12,
      totalMinutes: 180,
      streak: 5
    },
    healthMetrics: {
      weight: { value: '65.5', unit: 'kg', trend: 0.5 },
      sleep: { value: '7.5', unit: '小时', trend: 2.1 },
      heart: { value: '72', unit: 'bpm', trend: -1.2 },
      pressure: { value: '85', unit: '', trend: -5.3 }
    }
  };
}

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  const mockData = getMockData().exerciseData;
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: mockData.dates,
      axisLine: {
        lineStyle: {
          color: '#8F9BB3'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#8F9BB3'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#1A2235'
        }
      }
    },
    series: [{
      name: '运动时长',
      type: 'line',
      smooth: true,
      data: mockData.values,
      itemStyle: {
        color: '#4F6EF6'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(79,110,246,0.3)'
        }, {
          offset: 1,
          color: 'rgba(79,110,246,0.1)'
        }])
      }
    }]
  };
  chart.setOption(option);
  return chart;
}

Page({
  data: {
    overviewData: [
      {
        type: 'exercise',
        icon: '/assets/icons/exercise.png',
        value: '0',
        label: '本周运动(分钟)'
      },
      {
        type: 'meditation',
        icon: '/assets/icons/meditation.png',
        value: '0',
        label: '本周冥想(分钟)'
      },
      {
        type: 'steps',
        icon: '/assets/icons/search.png',
        value: '0',
        label: '今日步数'
      },
      {
        type: 'calories',
        icon: '/assets/icons/calories.png',
        value: '0',
        label: '消耗(千卡)'
      }
    ],
    periods: ['周', '月', '年'],
    currentPeriod: 0,
    meditationStats: {
      totalSessions: 0,
      totalMinutes: 0,
      streak: 0
    },
    healthMetrics: [
      {
        type: 'weight',
        icon: '/assets/icons/weight.png',
        label: '体重',
        value: '0',
        unit: 'kg',
        trend: 0
      },
      {
        type: 'sleep',
        icon: '/assets/icons/sleep.png',
        label: '睡眠',
        value: '0',
        unit: '小时',
        trend: 0
      },
      {
        type: 'heart',
        icon: '/assets/icons/heart.png',
        label: '心率',
        value: '0',
        unit: 'bpm',
        trend: 0
      },
      {
        type: 'pressure',
        icon: '/assets/icons/pressure.png',
        label: '压力指数',
        value: '0',
        unit: '',
        trend: 0
      }
    ],
    ec: {
      onInit: initChart
    },
    contentTop: 0,
    headerHeight: 0,
    scrollOffset: 0
  },

  onLoad() {
    this.lastOffset = 0;
    this.lastPageOffset = 0;
    this.scrollThrottleTimer = null;
    this.pageScrollThrottleTimer = null;
    this.loadMockData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      });
    }
  },

  // 加载模拟数据
  loadMockData() {
    const mockData = getMockData();
    
    // 更新概览数据
    const overviewData = this.data.overviewData.map(item => ({
      ...item,
      value: mockData.overview[item.type] || '0'
    }));

    // 更新冥想统计
    const meditationStats = mockData.meditationStats;

    // 更新健康指标
    const healthMetrics = this.data.healthMetrics.map(item => {
      const metricData = mockData.healthMetrics[item.type] || {};
      return {
        ...item,
        value: metricData.value || '0',
        trend: metricData.trend || 0
      };
    });

    this.setData({
      overviewData,
      meditationStats,
      healthMetrics
    });
  },

  // 切换时间周期
  changePeriod(e) {
    this.setData({
      currentPeriod: e.detail.value
    });
    // 这里可以根据不同时间周期加载不同的模拟数据
    if (chart) {
      const mockData = getMockData().exerciseData;
      chart.setOption({
        xAxis: {
          data: mockData.dates
        },
        series: [{
          data: mockData.values
        }]
      });
    }
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