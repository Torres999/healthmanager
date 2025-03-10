const request = require('../../../utils/request');
const chart = require('../../../utils/chart');

Page({
  data: {
    record: null,
    recordId: '',
    loading: true
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        recordId: options.id
      });
      this.loadRecordDetail(options.id);
    } else {
      wx.showToast({
        title: '记录ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  loadRecordDetail: function(id) {
    this.setData({ loading: true });
    
    // 使用request工具获取运动记录详情
    request.get(`/api/exercise/records/${id}`)
      .then(res => {
        const record = res.data;
        
        // 处理图标背景色
        const iconBgColors = {
          'running': '#4F6EF6',
          'cycling': '#22C55E',
          'walking': '#F59E0B'
        };
        
        record.iconBg = iconBgColors[record.type] || '#4F6EF6';
        
        this.setData({
          record: record,
          loading: false
        });
        
        // 如果有心率数据，绘制心率图表
        if (record.heartRate && record.heartRate.length > 0) {
          this.drawHeartRateChart(record.heartRate);
        }
      })
      .catch(err => {
        console.error('获取运动记录详情失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取记录详情失败',
          icon: 'none'
        });
      });
  },

  drawHeartRateChart: function(heartRateData) {
    // 使用我们的简化版图表工具绘制心率图表
    chart.drawLineChart({
      canvasId: 'heartRateChart',
      data: heartRateData,
      width: 320,
      height: 200
    });
  },

  shareRecord: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  editRecord: function() {
    wx.navigateTo({
      url: `/pages/sport/edit/edit?id=${this.data.recordId}`
    });
  },

  onShareAppMessage: function() {
    return {
      title: `我完成了${this.data.record.name}运动`,
      path: `/pages/sport/detail/detail?id=${this.data.recordId}`,
      imageUrl: '/assets/images/share-sport.png'
    };
  }
}) 