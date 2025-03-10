// 生成图表配置
export function getChartOption(type = 'line', data = [], config = {}) {
  const defaultConfig = {
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
      data: [],
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
    series: []
  };

  // 合并配置
  const option = {
    ...defaultConfig,
    ...config
  };

  // 根据图表类型设置系列
  switch (type) {
    case 'line':
      option.series = [{
        data,
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
      }];
      break;
    case 'bar':
      option.series = [{
        data,
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }];
      break;
    // 可以添加更多图表类型
  }

  return option;
}

// 格式化日期标签
export function formatDateLabels(type = 'week') {
  if (type === 'week') {
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  } else if (type === 'month') {
    return ['1日', '5日', '10日', '15日', '20日', '25日', '30日'];
  }
  return [];
}

// 生成模拟数据
export function generateMockData(min = 0, max = 1000, count = 7) {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

// 计算数据变化百分比
export function calculateChange(current, previous) {
  if (!previous) return 0;
  return Math.round((current - previous) / previous * 100);
}

// 格式化大数字
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * 简化版图表工具，用于绘制心率图表
 */
function drawLineChart(options) {
  const { canvasId, data, width, height } = options;
  
  // 获取canvas上下文
  const ctx = wx.createCanvasContext(canvasId);
  
  // 设置画布尺寸
  const canvasWidth = width || 300;
  const canvasHeight = height || 200;
  
  // 设置边距
  const padding = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 40
  };
  
  // 计算图表区域尺寸
  const chartWidth = canvasWidth - padding.left - padding.right;
  const chartHeight = canvasHeight - padding.top - padding.bottom;
  
  // 找出数据中的最大值和最小值
  const values = data.map(item => item.value);
  const maxValue = Math.max(...values) + 10; // 最大值加上一些空间
  const minValue = Math.max(0, Math.min(...values) - 10); // 最小值不小于0
  
  // 绘制坐标轴
  ctx.beginPath();
  ctx.setStrokeStyle('#444');
  ctx.setLineWidth(1);
  
  // Y轴
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, canvasHeight - padding.bottom);
  
  // X轴
  ctx.moveTo(padding.left, canvasHeight - padding.bottom);
  ctx.lineTo(canvasWidth - padding.right, canvasHeight - padding.bottom);
  ctx.stroke();
  
  // 绘制Y轴刻度
  const yStep = chartHeight / 5;
  const valueStep = (maxValue - minValue) / 5;
  
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + i * yStep;
    const value = Math.round(maxValue - i * valueStep);
    
    ctx.beginPath();
    ctx.setFontSize(10);
    ctx.setFillStyle('#94A3B8');
    ctx.fillText(value.toString(), padding.left - 25, y + 5);
    
    // 绘制网格线
    ctx.beginPath();
    ctx.setStrokeStyle('#333');
    ctx.setLineWidth(0.5);
    ctx.moveTo(padding.left, y);
    ctx.lineTo(canvasWidth - padding.right, y);
    ctx.stroke();
  }
  
  // 绘制X轴刻度
  const xStep = chartWidth / (data.length - 1);
  
  for (let i = 0; i < data.length; i++) {
    const x = padding.left + i * xStep;
    
    if (i % 5 === 0 || i === data.length - 1) {
      ctx.beginPath();
      ctx.setFontSize(10);
      ctx.setFillStyle('#94A3B8');
      ctx.fillText((i + 1).toString(), x - 5, canvasHeight - padding.bottom + 15);
    }
  }
  
  // 绘制数据线
  ctx.beginPath();
  ctx.setStrokeStyle('#4F6EF6');
  ctx.setLineWidth(2);
  
  for (let i = 0; i < data.length; i++) {
    const x = padding.left + i * xStep;
    const y = padding.top + chartHeight - ((data[i].value - minValue) / (maxValue - minValue)) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
  
  // 绘制数据点
  for (let i = 0; i < data.length; i++) {
    const x = padding.left + i * xStep;
    const y = padding.top + chartHeight - ((data[i].value - minValue) / (maxValue - minValue)) * chartHeight;
    
    ctx.beginPath();
    ctx.setFillStyle('#4F6EF6');
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  // 绘制标题
  ctx.beginPath();
  ctx.setFontSize(12);
  ctx.setFillStyle('#FFFFFF');
  ctx.fillText('心率 (bpm)', padding.left, padding.top - 10);
  
  // 绘制到画布
  ctx.draw();
}

module.exports = {
  drawLineChart
}; 