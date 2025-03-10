// 这里需要引入完整的echarts库
// 由于文件较大，建议从官方下载最新的微信小程序版本的echarts.js文件
// 下载地址：https://github.com/ecomfe/echarts-for-weixin

// 极简版 ECharts 实现
// 只提供基本的折线图和柱状图功能

// 图表配置
let defaultOption = {
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [820, 932, 901, 934, 1290, 1330, 1320],
    type: 'line'
  }]
};

// 颜色配置
const colors = {
  line: '#4F6EF6',
  bar: '#4F6EF6',
  axis: '#999999',
  text: '#666666',
  grid: '#eeeeee'
};

// 图表实例
function Chart(canvas, opts) {
  this.canvas = canvas;
  this.ctx = canvas.getContext();
  this.canvasId = canvas.canvasId;
  this.width = opts.width || 300;
  this.height = opts.height || 225;
  this.option = null;
  this.dpr = opts.devicePixelRatio || 1;
  
  // 初始化事件处理
  this._initEvent();
}

// 初始化事件处理
Chart.prototype._initEvent = function() {
  this._zr = {
    handler: {
      dispatch: function() {
        console.log('事件分发');
      },
      processGesture: function() {
        console.log('手势处理');
      }
    }
  };
};

// 设置图表选项
Chart.prototype.setOption = function(option) {
  console.log('设置图表选项:', option);
  this.option = option || defaultOption;
  this._render();
  return this;
};

// 获取宽度
Chart.prototype.getWidth = function() {
  return this.width;
};

// 获取高度
Chart.prototype.getHeight = function() {
  return this.height;
};

// 获取 ZRender 实例
Chart.prototype.getZr = function() {
  return this._zr;
};

// 获取节点 ID
Chart.prototype.getNodeId = function() {
  return this.canvasId;
};

// 销毁实例
Chart.prototype.dispose = function() {
  return this;
};

// 调整大小
Chart.prototype.resize = function() {
  return this;
};

// 事件绑定
Chart.prototype.on = function() {
  return this;
};

// 事件解绑
Chart.prototype.off = function() {
  return this;
};

// 渲染图表
Chart.prototype._render = function() {
  if (!this.ctx || !this.option) {
    console.error('无法渲染图表：上下文或选项无效');
    return;
  }
  
  try {
    // 清除画布
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 绘制坐标轴和网格
    this._drawGrid();
    
    // 绘制数据
    this._drawSeries();
    
    // 绘制完成后调用 draw 方法（如果存在）
    if (typeof this.ctx.draw === 'function') {
      this.ctx.draw(true);
    }
  } catch (e) {
    console.error('渲染图表出错:', e);
  }
};

// 绘制网格和坐标轴
Chart.prototype._drawGrid = function() {
  const ctx = this.ctx;
  const option = this.option;
  const width = this.width;
  const height = this.height;
  
  // 设置边距
  const padding = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 40
  };
  
  // 计算绘图区域
  const drawArea = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom
  };
  
  // 绘制 X 轴
  ctx.beginPath();
  ctx.moveTo(drawArea.x, drawArea.y + drawArea.height);
  ctx.lineTo(drawArea.x + drawArea.width, drawArea.y + drawArea.height);
  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // 绘制 Y 轴
  ctx.beginPath();
  ctx.moveTo(drawArea.x, drawArea.y);
  ctx.lineTo(drawArea.x, drawArea.y + drawArea.height);
  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // 绘制 X 轴刻度和标签
  if (option.xAxis && option.xAxis.data) {
    const xData = option.xAxis.data;
    const step = drawArea.width / (xData.length - 1 || 1);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    
    for (let i = 0; i < xData.length; i++) {
      const x = drawArea.x + i * step;
      const y = drawArea.y + drawArea.height;
      
      // 绘制刻度
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
      
      // 绘制标签
      ctx.fillText(xData[i], x, y + 8);
    }
  }
  
  // 绘制 Y 轴刻度和网格线
  if (option.yAxis) {
    const yStep = drawArea.height / 5;
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    
    // 获取数据最大值和最小值
    let max = 100;
    let min = 0;
    
    if (option.series && option.series.length > 0) {
      const data = option.series[0].data;
      if (data && data.length > 0) {
        max = Math.max(...data);
        min = Math.min(...data);
        // 调整最大值和最小值，使图表更美观
        const range = max - min;
        max = max + range * 0.1;
        min = Math.max(0, min - range * 0.1);
      }
    }
    
    for (let i = 0; i <= 5; i++) {
      const y = drawArea.y + i * yStep;
      const value = max - (i / 5) * (max - min);
      
      // 绘制刻度
      ctx.beginPath();
      ctx.moveTo(drawArea.x, y);
      ctx.lineTo(drawArea.x - 5, y);
      ctx.stroke();
      
      // 绘制网格线
      ctx.beginPath();
      ctx.moveTo(drawArea.x, y);
      ctx.lineTo(drawArea.x + drawArea.width, y);
      ctx.strokeStyle = colors.grid;
      ctx.stroke();
      ctx.strokeStyle = colors.axis;
      
      // 绘制标签
      ctx.fillText(Math.round(value), drawArea.x - 8, y);
    }
  }
  
  return drawArea;
};

// 绘制数据系列
Chart.prototype._drawSeries = function() {
  const ctx = this.ctx;
  const option = this.option;
  const width = this.width;
  const height = this.height;
  
  // 设置边距
  const padding = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 40
  };
  
  // 计算绘图区域
  const drawArea = {
    x: padding.left,
    y: padding.top,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom
  };
  
  // 绘制数据系列
  if (option.series && option.series.length > 0) {
    for (let i = 0; i < option.series.length; i++) {
      const series = option.series[i];
      const data = series.data;
      const type = series.type || 'line';
      
      if (!data || data.length === 0) {
        continue;
      }
      
      // 获取数据最大值和最小值
      let max = Math.max(...data);
      let min = Math.min(...data);
      // 调整最大值和最小值，使图表更美观
      const range = max - min;
      max = max + range * 0.1;
      min = Math.max(0, min - range * 0.1);
      
      // 计算步长
      const xStep = drawArea.width / (data.length - 1 || 1);
      
      // 绘制折线图
      if (type === 'line') {
        ctx.beginPath();
        ctx.strokeStyle = series.color || colors.line;
        ctx.lineWidth = 2;
        
        for (let j = 0; j < data.length; j++) {
          const x = drawArea.x + j * xStep;
          const y = drawArea.y + drawArea.height - (data[j] - min) / (max - min) * drawArea.height;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        
        // 绘制数据点
        for (let j = 0; j < data.length; j++) {
          const x = drawArea.x + j * xStep;
          const y = drawArea.y + drawArea.height - (data[j] - min) / (max - min) * drawArea.height;
          
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = series.color || colors.line;
          ctx.fill();
        }
      }
      
      // 绘制柱状图
      else if (type === 'bar') {
        const barWidth = xStep * 0.6;
        
        for (let j = 0; j < data.length; j++) {
          const x = drawArea.x + j * xStep - barWidth / 2;
          const height = (data[j] - min) / (max - min) * drawArea.height;
          const y = drawArea.y + drawArea.height - height;
          
          ctx.beginPath();
          ctx.rect(x, y, barWidth, height);
          ctx.fillStyle = series.color || colors.bar;
          ctx.fill();
        }
      }
    }
  }
};

// 模块导出
const echarts = {
  // 初始化图表
  init: function(canvas, theme, opts) {
    console.log('echarts.init被调用', {
      hasCanvas: !!canvas,
      canvasId: canvas && canvas.canvasId,
      opts: opts
    });
    
    if (!canvas) {
      console.error('无效的canvas参数');
      return null;
    }
    
    try {
      // 创建图表实例
      const chart = new Chart(canvas, opts || {});
      
      console.log('图表实例创建成功', {
        canvasId: chart.canvasId,
        width: chart.width,
        height: chart.height
      });
      
      return chart;
    } catch (error) {
      console.error('创建图表实例失败:', error);
      
      // 返回一个最小化的实例，避免后续错误
      return {
        canvasId: canvas.canvasId,
        setOption: function() { return this; },
        getWidth: function() { return 300; },
        getHeight: function() { return 225; },
        dispose: function() { return this; },
        resize: function() { return this; },
        on: function() { return this; },
        off: function() { return this; },
        getNodeId: function() { return canvas.canvasId; },
        getZr: function() {
          return {
            handler: {
              dispatch: function() {},
              processGesture: function() {}
            }
          };
        }
      };
    }
  },
  
  // 设置Canvas创建器
  setCanvasCreator: function(creator) {
    console.log('设置Canvas创建器');
    this._canvasCreator = creator;
  },
  
  // 添加graphic命名空间
  graphic: {
    LinearGradient: function(x, y, x2, y2, colorStops) {
      return {
        type: 'linear',
        x: x,
        y: y,
        x2: x2,
        y2: y2,
        colorStops: colorStops,
        global: false
      };
    }
  }
};

module.exports = echarts; 