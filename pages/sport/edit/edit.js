const request = require('../../../utils/request');

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
        this.setData({
          record: res.data,
          loading: false
        });
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

  changeType: function(e) {
    const type = e.currentTarget.dataset.type;
    const typeNames = {
      'running': '跑步',
      'cycling': '骑行',
      'walking': '步行'
    };
    
    this.setData({
      'record.type': type,
      'record.name': typeNames[type]
    });
  },

  dateChange: function(e) {
    this.setData({
      'record.date': e.detail.value
    });
  },

  timeChange: function(e) {
    this.setData({
      'record.time': e.detail.value
    });
  },

  durationChange: function(e) {
    this.setData({
      'record.duration': e.detail.value
    });
  },

  distanceChange: function(e) {
    this.setData({
      'record.distance': e.detail.value
    });
  },

  caloriesChange: function(e) {
    this.setData({
      'record.calories': e.detail.value
    });
  },

  notesChange: function(e) {
    this.setData({
      'record.notes': e.detail.value
    });
  },

  saveRecord: function() {
    const record = this.data.record;
    
    // 表单验证
    if (!record.type) {
      wx.showToast({
        title: '请选择运动类型',
        icon: 'none'
      });
      return;
    }
    
    if (!record.duration || record.duration <= 0) {
      wx.showToast({
        title: '请输入有效的运动时长',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '保存中...',
      mask: true
    });
    
    // 使用request工具更新运动记录
    request.put(`/api/exercise/records/${this.data.recordId}`, record)
      .then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(err => {
        console.error('保存运动记录失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      });
  },

  cancelEdit: function() {
    wx.navigateBack();
  }
}) 