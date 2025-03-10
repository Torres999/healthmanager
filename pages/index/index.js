// index.js
const app = getApp();
// 导入节流函数，控制绘图频率
let drawTimer = null;
let canvasReady = false;
let chartDrawn = false;

// 直接在文件中实现formatDateLabels函数
function formatDateLabels(type = 'week') {
  if (type === 'week') {
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  } else if (type === 'month') {
    return ['1日', '5日', '10日', '15日', '20日', '25日', '30日'];
  }
  return [];
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
    heartbeat: false,
    headerHeight: 0,
    contentTop: 0,
    // 图表数据
    activityData: [30, 45, 60, 30, 45, 20, 30],
    heartbeatTimer: null,
    bloodPressure: {
      systolic: 120,
      diastolic: 80
    },
    bloodOxygen: 98,
    selectedTimeFrame: 'week',
    chartContext: null,
    activityChart: null,
    chartNeedsUpdate: false,
    chartLastUpdateTime: 0,
    chartReady: false,
    chartImagePath: '',
    // 滚动偏移量，用于控制header随页面滚动
    scrollOffset: 0
  },

  onLoad() {
    // 初始化滚动相关变量
    this.setData({
      scrollOffset: 0
    });
    this.lastOffset = 0;
    this.lastPageOffset = 0;
    this.scrollThrottleTimer = null;
    this.pageScrollThrottleTimer = null;
    this.chartUpdateTimer = null;
    
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
    
    // 在页面切换回来时重新绘制图表
    setTimeout(() => {
      if (!chartDrawn) {
        this.drawActivityChart();
      }
    }, 300);
  },
  
  // 页面就绪时（组件挂载完成）
  onReady() {
    canvasReady = true;
    // 在onReady中初始化绘制图表，确保Canvas组件已经渲染完毕
    setTimeout(() => {
      this.drawActivityChart();
    }, 500);
  },
  
  // 页面隐藏时清除定时器
  onHide() {
    this.clearHeartbeatTimer();
    chartDrawn = false;  // 标记图表需要重绘
  },
  
  // 页面卸载时清除定时器
  onUnload() {
    this.clearHeartbeatTimer();
    canvasReady = false;
    chartDrawn = false;
    if (drawTimer) {
      clearTimeout(drawTimer);
      drawTimer = null;
    }
  },
  
  // 页面滚动时不重绘图表，避免卡顿
  checkAndRedrawChart() {
    // 不在滚动时重绘图表
  },
  
  // 绘制活动图表
  drawActivityChart() {
    if (!canvasReady || chartDrawn) {
      return;
    }
    
    // 使用wx.createCanvasContext创建Canvas上下文
    const ctx = wx.createCanvasContext('activityChart', this);
    
    // 获取Canvas实际尺寸
    try {
      const query = wx.createSelectorQuery().in(this);
      query.select('.chart-container').boundingClientRect(rect => {
        if (!rect) {
          return;
        }
        
        const width = rect.width;
        const height = rect.height;
        
        // 绘制图表
        this.renderActivityChart(ctx, width, height, this.data.activityData);
        
        // 标记图表已绘制
        chartDrawn = true;
      }).exec();
    } catch (error) {
      console.error('获取Canvas尺寸出错:', error);
    }
  },
  
  // 渲染活动图表
  renderActivityChart(ctx, width, height, data) {
    if (!ctx || !width || !height || !data || data.length === 0) {
      return;
    }
    
    try {
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 设置绘图区域，为纵坐标留出空间
      const padding = {
        top: 20,
        right: 15,
        bottom: 30,
        left: 40  // 增加左侧空间以容纳纵坐标
      };
      
      const chartArea = {
        x: padding.left,
        y: padding.top,
        width: width - padding.left - padding.right,
        height: height - padding.top - padding.bottom
      };
      
      // 找出数据的最大值和最小值
      const maxValue = Math.max(...data) * 1.2; // 增加20%的空间
      const minValue = 0; // 假设数据始终为正
      
      // 计算每个数据点的位置
      const points = [];
      const xStep = chartArea.width / (data.length - 1);
      
      for (let i = 0; i < data.length; i++) {
        const x = chartArea.x + i * xStep;
        const y = chartArea.y + chartArea.height - ((data[i] - minValue) / (maxValue - minValue)) * chartArea.height;
        points.push({ x, y });
      }
      
      // 绘制水平虚线和纵坐标值
      ctx.beginPath();
      ctx.setLineDash([4, 4]);  // 使用更小的点划线
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.1)');
      ctx.setLineWidth(1);
      
      // 绘制5条水平虚线（均匀分布）
      const valueStep = maxValue / 4;
      for (let i = 0; i <= 4; i++) {
        const y = chartArea.y + (chartArea.height / 4) * i;
        
        // 绘制虚线
        ctx.moveTo(chartArea.x, y);
        ctx.lineTo(chartArea.x + chartArea.width, y);
        
        // 绘制纵坐标
        const value = Math.round(maxValue - i * valueStep);
        ctx.setFillStyle('#646C7B');
        ctx.setFontSize(10);
        ctx.setTextAlign('right');
        ctx.setTextBaseline('middle');
        ctx.fillText(value.toString(), chartArea.x - 8, y);
      }
      ctx.stroke();
      
      // 重置线型
      ctx.setLineDash([]);
      
      // 绘制平滑折线
      ctx.beginPath();
      ctx.setStrokeStyle('#8481ED');
      ctx.setLineWidth(2);
      ctx.setLineJoin('round');
      
      // 移动到第一个点
      ctx.moveTo(points[0].x, points[0].y);
      
      // 使用三次贝塞尔曲线创建平滑曲线
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        
        // 控制点
        const cp1x = curr.x + (next.x - curr.x) / 3;
        const cp1y = curr.y;
        const cp2x = next.x - (next.x - curr.x) / 3;
        const cp2y = next.y;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
      }
      
      ctx.stroke();
      
      // 绘制数据点
      for (const point of points) {
        ctx.beginPath();
        ctx.setFillStyle('#8481ED');
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // 绘制x轴标签
      const labels = formatDateLabels('week');
      ctx.setFillStyle('#646C7B');
      ctx.setFontSize(10);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('top');
      
      for (let i = 0; i < labels.length; i++) {
        const x = chartArea.x + i * xStep;
        const y = chartArea.y + chartArea.height + 10;
        ctx.fillText(labels[i], x, y);
      }
      
      // 绘制到Canvas
      ctx.draw(true);
    } catch (error) {
      console.error('绘制图表出错:', error);
    }
  },
  
  // 触摸图表开始
  touchChart(e) {
    this.touchStartX = e.touches[0].x;
    this.touchStartY = e.touches[0].y;
  },
  
  // 触摸图表移动
  touchMoveChart(e) {
    // 可以添加触摸交互逻辑，如显示具体数值等
  },
  
  // 触摸图表结束
  touchEnd(e) {
    this.touchStartX = null;
    this.touchStartY = null;
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
      // 使用try-catch防止setData可能出现的错误影响整体功能
      try {
        this.setData({
          heartbeat: true
        });
        
        setTimeout(() => {
          this.setData({
            heartbeat: false
          });
        }, 1000);
      } catch (error) {
        console.error('心跳动画设置出错:', error);
      }
    }, 2000);
  },
  
  clearHeartbeatTimer() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  },

  // 触摸事件处理
  touchStart(e) {
    // 记录触摸开始位置，可用于交互功能
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },
  
  touchMove(e) {
    // 可以在这里添加触摸交互逻辑，例如显示数据点信息
    const moveX = e.touches[0].clientX;
    const moveY = e.touches[0].clientY;
    
    // 计算移动距离
    const diffX = moveX - this.touchStartX;
    const diffY = moveY - this.touchStartY;
    
    // 可以根据移动距离实现交互效果
  },
  
  touchEnd(e) {
    // 触摸结束，可以在这里触发一些交互效果
    this.touchStartX = null;
    this.touchStartY = null;
  },

  // 处理scroll-view的滚动事件
  onScrollView(e) {
    // 使用节流控制调用频率
    if (this.scrollThrottleTimer) {
      return;
    }
    
    this.scrollThrottleTimer = setTimeout(() => {
      this.scrollThrottleTimer = null;
    }, 5); // 5ms节流，大约对应120fps
    
    // 获取滚动距离
    const scrollTop = e.detail.scrollTop;
    
    // 计算合适的偏移量，并添加边界限制
    let offset = -scrollTop;
    
    // 限制最大偏移量，防止标题滑出顶部视图
    const maxOffset = 0; // 不允许向上位移超过初始位置
    
    // 限制最小偏移量，防止标题完全消失
    // headerHeight是标题栏的高度，设置一个保留区域确保标题至少部分可见
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
    
    // 检查是否需要重绘图表，降低频率
    if (!this.chartUpdateTimer) {
      this.chartUpdateTimer = setTimeout(() => {
        this.checkAndRedrawChart();
        this.chartUpdateTimer = null;
      }, 100); // 100ms节流
    }
  },

  // 处理整页滚动事件，与scroll-view滚动保持一致
  onPageScroll(e) {
    // 使用相同的节流逻辑
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
  },
})
