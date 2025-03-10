const echarts = require('./echarts');

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },

    ec: {
      type: Object
    }
  },

  data: {
    isUseNewCanvas: true
  },

  ready: function () {
    console.log('ec-canvas 组件 ready，isUseNewCanvas:', this.data.isUseNewCanvas);
    
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>');
      return;
    }

    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },

  methods: {
    init: function (callback) {
      console.log('ec-canvas init 方法被调用');
      
      // 直接使用 Canvas 2D
      this.initByCanvas2d(callback);
    },
    
    initByCanvas2d: function(callback) {
      console.log('使用 Canvas 2D 初始化');
      
      const self = this;
      const canvasId = this.data.canvasId;
      
      // 使用 SelectorQuery 获取 Canvas 节点
      wx.createSelectorQuery()
        .in(this)
        .select('.ec-canvas')
        .fields({
          node: true,
          size: true
        })
        .exec(function(res) {
          console.log('Canvas 查询结果:', res);
          
          if (!res || !res[0] || !res[0].node) {
            console.error('获取不到 Canvas 节点');
            return;
          }
          
          const canvasNode = res[0].node;
          const canvasWidth = res[0].width;
          const canvasHeight = res[0].height;
          
          const ctx = canvasNode.getContext('2d');
          
          // 设置 Canvas 尺寸
          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvasNode.width = canvasWidth * dpr;
          canvasNode.height = canvasHeight * dpr;
          ctx.scale(dpr, dpr);
          
          console.log('Canvas 2D 准备完成:', {
            width: canvasWidth,
            height: canvasHeight,
            dpr: dpr
          });
          
          // 直接使用简化版的绘图方法，不使用 echarts
          try {
            // 创建简单的适配器对象
            const canvas = {
              ctx: ctx,
              canvasId: canvasId,
              node: canvasNode,
              width: canvasWidth,
              height: canvasHeight,
              getContext: function() { return ctx; },
              getNodeId: function() { return canvasId; }
            };
            
            // 创建图表实例
            const chart = self._createSimpleChart(canvas, {
              width: canvasWidth,
              height: canvasHeight,
              devicePixelRatio: dpr
            });
            
            // 保存图表实例
            self.chart = chart;
            
            // 调用回调函数
            if (callback) {
              callback(chart);
            }
          } catch (e) {
            console.error('创建图表实例失败:', e);
          }
        });
    },
    
    // 创建简单的图表实例
    _createSimpleChart: function(canvas, opts) {
      console.log('创建简单图表实例');
      
      // 创建图表实例
      const chart = {
        canvas: canvas,
        ctx: canvas.ctx,
        canvasId: canvas.canvasId,
        width: opts.width,
        height: opts.height,
        option: null,
        
        // 设置选项并绘制图表
        setOption: function(option) {
          console.log('设置图表选项:', option);
          this.option = option;
          this._render();
          return this;
        },
        
        // 渲染图表
        _render: function() {
          if (!this.ctx || !this.option) {
            console.error('无法渲染图表：上下文或选项无效');
            return;
          }
          
          try {
            // 清除画布
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // 绘制图表
            this._drawChart();
          } catch (e) {
            console.error('渲染图表出错:', e);
          }
        },
        
        // 绘制图表
        _drawChart: function() {
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
          
          // 绘制坐标轴
          ctx.beginPath();
          ctx.moveTo(drawArea.x, drawArea.y + drawArea.height);
          ctx.lineTo(drawArea.x + drawArea.width, drawArea.y + drawArea.height);
          ctx.moveTo(drawArea.x, drawArea.y);
          ctx.lineTo(drawArea.x, drawArea.y + drawArea.height);
          ctx.strokeStyle = '#999';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // 获取数据
          if (!option.series || !option.series.length || !option.series[0].data) {
            return;
          }
          
          const series = option.series[0];
          const data = series.data;
          const xData = option.xAxis && option.xAxis.data ? option.xAxis.data : [];
          
          // 计算数据范围
          let max = Math.max(...data);
          let min = Math.min(...data);
          const range = max - min;
          max = max + range * 0.1;
          min = Math.max(0, min - range * 0.1);
          
          // 绘制数据
          if (series.type === 'line') {
            // 绘制折线
            ctx.beginPath();
            const xStep = drawArea.width / (data.length - 1 || 1);
            
            for (let i = 0; i < data.length; i++) {
              const x = drawArea.x + i * xStep;
              const y = drawArea.y + drawArea.height - (data[i] - min) / (max - min) * drawArea.height;
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            
            ctx.strokeStyle = '#4F6EF6';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制数据点
            for (let i = 0; i < data.length; i++) {
              const x = drawArea.x + i * xStep;
              const y = drawArea.y + drawArea.height - (data[i] - min) / (max - min) * drawArea.height;
              
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fillStyle = '#4F6EF6';
              ctx.fill();
              
              // 绘制标签
              if (xData[i]) {
                ctx.fillStyle = '#666';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(xData[i], x, drawArea.y + drawArea.height + 8);
              }
            }
          } else if (series.type === 'bar') {
            // 绘制柱状图
            const xStep = drawArea.width / data.length;
            const barWidth = xStep * 0.6;
            
            for (let i = 0; i < data.length; i++) {
              const x = drawArea.x + i * xStep + (xStep - barWidth) / 2;
              const height = (data[i] - min) / (max - min) * drawArea.height;
              const y = drawArea.y + drawArea.height - height;
              
              ctx.beginPath();
              ctx.rect(x, y, barWidth, height);
              ctx.fillStyle = '#4F6EF6';
              ctx.fill();
              
              // 绘制标签
              if (xData[i]) {
                ctx.fillStyle = '#666';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(xData[i], x + barWidth / 2, drawArea.y + drawArea.height + 8);
              }
            }
          }
          
          // 绘制 Y 轴刻度
          const yStep = drawArea.height / 5;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#666';
          
          for (let i = 0; i <= 5; i++) {
            const y = drawArea.y + i * yStep;
            const value = max - (i / 5) * (max - min);
            
            ctx.beginPath();
            ctx.moveTo(drawArea.x, y);
            ctx.lineTo(drawArea.x - 5, y);
            ctx.stroke();
            
            ctx.fillText(Math.round(value), drawArea.x - 8, y);
          }
        },
        
        // 必要的方法
        getWidth: function() { return this.width; },
        getHeight: function() { return this.height; },
        getZr: function() {
          if (!this._zr) {
            this._zr = {
              handler: {
                dispatch: function() {},
                processGesture: function() {}
              }
            };
          }
          return this._zr;
        },
        getNodeId: function() { return this.canvasId; },
        dispose: function() { return this; },
        resize: function() { return this; },
        on: function() { return this; },
        off: function() { return this; }
      };
      
      return chart;
    },

    canvasToTempFilePath(opt) {
      const canvasId = opt.canvasId || this.data.canvasId;
      
      if (!opt.canvasId) {
        opt.canvasId = canvasId;
      }
      
      const query = wx.createSelectorQuery().in(this);
      query.select('.ec-canvas')
        .fields({ node: true, size: true })
        .exec(function(res) {
          const canvasNode = res[0].node;
          opt.canvas = canvasNode;
          wx.canvasToTempFilePath(opt);
        });
    },

    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        const handler = this.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'start');
      }
    },

    touchMove(e) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        const handler = this.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'change');
      }
    },

    touchEnd(e) {
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        const handler = this.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'end');
      }
    }
  }
});

// 辅助函数，用于处理触摸事件
function wrapTouch(event) {
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touch.offsetX = touch.x;
    touch.offsetY = touch.y;
  }
  return event;
} 