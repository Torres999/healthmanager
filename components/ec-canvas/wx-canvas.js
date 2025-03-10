// 完全重写的 WxCanvas 实现
// 用于解决微信小程序中 ECharts 的兼容性问题

function WxCanvas(ctx, canvasId, isNew, canvasNode) {
  // 保存基本属性
  this.ctx = ctx;
  this.canvasId = canvasId;
  this.chart = null;
  this.isNew = isNew;
  this.canvasNode = canvasNode;
  
  // 添加必要的属性
  this.id = canvasId;
  this.width = canvasNode ? canvasNode.width : 300;
  this.height = canvasNode ? canvasNode.height : 225;
  
  console.log('WxCanvas 构造函数被调用', { 
    canvasId, 
    isNew,
    width: this.width,
    height: this.height
  });
  
  // 初始化上下文
  this.initContext();
}

// 初始化上下文
WxCanvas.prototype.initContext = function() {
  console.log('WxCanvas initContext 方法被调用');
  
  // 确保上下文存在
  if (!this.ctx) {
    console.error('Canvas 上下文不存在');
    return;
  }
  
  // 不要尝试设置 ctx.canvas，它是只读的
  // 而是保存对 canvasNode 的引用，以便在需要时使用
  if (this.isNew && this.canvasNode) {
    console.log('Canvas 2D 模式，保存节点引用');
    // 不要设置 this.ctx.canvas = this.canvasNode;
  }
};

// 获取上下文
WxCanvas.prototype.getContext = function() {
  console.log('WxCanvas getContext 方法被调用');
  return this.ctx;
};

// 设置图表实例
WxCanvas.prototype.setChart = function(chart) {
  console.log('WxCanvas setChart 方法被调用');
  this.chart = chart;
};

// 获取节点 ID - 关键方法，解决 getNodeId 错误
WxCanvas.prototype.getNodeId = function() {
  console.log('WxCanvas getNodeId 方法被调用，返回:', this.canvasId);
  return this.canvasId;
};

// 获取 DOM 节点 - 模拟浏览器环境
WxCanvas.prototype.getDomNode = function() {
  console.log('WxCanvas getDomNode 方法被调用');
  return {
    width: this.width,
    height: this.height,
    style: {}
  };
};

// 添加事件监听器 - 空实现
WxCanvas.prototype.addEventListener = function() {
  console.log('WxCanvas addEventListener 方法被调用');
};

// 移除事件监听器 - 空实现
WxCanvas.prototype.removeEventListener = function() {
  console.log('WxCanvas removeEventListener 方法被调用');
};

// 附加事件 - 空实现
WxCanvas.prototype.attachEvent = function() {
  console.log('WxCanvas attachEvent 方法被调用');
};

// 分离事件 - 空实现
WxCanvas.prototype.detachEvent = function() {
  console.log('WxCanvas detachEvent 方法被调用');
};

// 模拟 requestAnimationFrame
WxCanvas.prototype.requestAnimationFrame = function(callback) {
  console.log('WxCanvas requestAnimationFrame 方法被调用');
  return setTimeout(callback, 16);
};

// 模拟 cancelAnimationFrame
WxCanvas.prototype.cancelAnimationFrame = function(id) {
  console.log('WxCanvas cancelAnimationFrame 方法被调用');
  clearTimeout(id);
};

// 导出模块
module.exports = WxCanvas; 