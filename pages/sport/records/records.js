const request = require('../../../utils/request');

Page({
  data: {
    records: [],
    filteredRecords: [],
    currentFilter: 'all',
    loading: true
  },

  onLoad: function() {
    this.loadRecords();
  },

  onPullDownRefresh: function() {
    this.loadRecords();
    wx.stopPullDownRefresh();
  },

  loadRecords: function() {
    this.setData({ loading: true });
    
    // 使用request工具获取运动记录
    request.get('/api/exercise/records')
      .then(res => {
        const records = res.data || [];
        
        // 处理记录数据，添加图标和格式化日期
        const processedRecords = records.map(record => {
          // 设置图标
          record.icon = `/assets/icons/${record.type}.png`;
          
          // 格式化日期
          const date = new Date(record.timestamp);
          record.date = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          
          return record;
        });
        
        this.setData({
          records: processedRecords,
          loading: false
        });
        this.filterRecords(this.data.currentFilter);
      })
      .catch(err => {
        console.error('获取运动记录失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取记录失败',
          icon: 'none'
        });
      });
  },

  filterRecords: function(type) {
    let filtered = this.data.records;
    
    if (type !== 'all') {
      filtered = this.data.records.filter(record => record.type === type);
    }
    
    this.setData({
      filteredRecords: filtered,
      currentFilter: type
    });
  },

  changeFilter: function(e) {
    const type = e.currentTarget.dataset.filter;
    this.filterRecords(type);
  },

  viewRecordDetail: function(e) {
    const recordId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/sport/detail/detail?id=${recordId}`
    });
  },

  addNewRecord: function() {
    wx.navigateTo({
      url: '/pages/sport/sport'
    });
  },

  // 格式化日期显示
  formatDate: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  // 格式化时间显示
  formatTime: function(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? hours + '小时' : ''}${mins}分钟`;
  }
}) 