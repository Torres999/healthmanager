const request = require('../../../utils/request');

Page({
  data: {
    categoryId: '',
    category: {},
    courses: [],
    loading: true
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        categoryId: options.id
      });
      this.loadCategoryData(options.id);
    } else {
      wx.showToast({
        title: '分类ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  loadCategoryData: function(id) {
    this.setData({ loading: true });
    
    // 获取分类信息
    request.get(`/api/meditation/categories/${id}`)
      .then(res => {
        this.setData({
          category: res.data || {},
          loading: false
        });
        
        // 获取该分类下的课程
        return request.get(`/api/meditation/courses`, { categoryId: id });
      })
      .then(res => {
        this.setData({
          courses: res.data || []
        });
      })
      .catch(err => {
        console.error('获取冥想分类数据失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      });
  },

  viewCourseDetail: function(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/meditation/course/course?id=${courseId}`
    });
  },

  onPullDownRefresh: function() {
    this.loadCategoryData(this.data.categoryId);
    wx.stopPullDownRefresh();
  },

  onShareAppMessage: function() {
    return {
      title: this.data.category.name || '冥想分类',
      path: `/pages/meditation/category/category?id=${this.data.categoryId}`
    };
  }
}) 