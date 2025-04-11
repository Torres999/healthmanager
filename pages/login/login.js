// pages/login/login.js

// 导入存储工具
const storage = require('../../utils/storage');
// 导入配置管理模块
const config = require('../../utils/config');

Page({
  data: {
    isLoading: false
  },

  onLoad: function (options) {
    // 设置主题
    const app = getApp();
    if (app.globalData && app.globalData.themeData) {
      this.setData({
        theme: app.globalData.themeData
      });
    }
    
    // 检查是否处于演示环境，如果是，自动跳过登录
    if (config.isDemoMode()) {
      console.log('演示环境下跳过登录流程');
      // 设置默认用户ID
      storage.saveUserId('1');
      
      // 延迟跳转，显示友好提示
      wx.showToast({
        title: '演示环境下自动登录',
        icon: 'success',
        duration: 1500
      });
      
      setTimeout(() => {
        // 返回上一页或首页
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }, 1500);
    }
  },

  // 获取用户信息并登录
  onGetUserInfo: function (e) {
    // 如果是演示环境，直接跳过登录
    if (config.isDemoMode()) {
      console.log('演示环境下跳过登录流程');
      // 设置默认用户ID
      storage.saveUserId('1');
      
      // 返回上一页或首页
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
      return;
    }
    
    if (this.data.isLoading) return;
    
    // 检查是否授权
    if (e.detail.userInfo) {
      this.setData({ isLoading: true });
      
      // 保存用户信息
      storage.saveUserInfo(e.detail.userInfo);
      
      // 调用登录方法
      this.login();
    } else {
      wx.showToast({
        title: '需要授权才能使用',
        icon: 'none'
      });
    }
  },

  // 登录方法
  login: function () {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 token
          wx.request({
            url: 'http://localhost:8080/hm/auth/login',
            method: 'POST',
            data: {
              code: res.code,
              userInfo: storage.getUserInfo()
            },
            success: (result) => {
              this.setData({ isLoading: false });
              
              // 输出完整的响应数据，用于调试
              console.log('登录响应数据:', result);
              
              // 检查响应状态码
              if (result.statusCode === 200) {
                // 检查响应数据结构
                if (result.data.token) {
                  // 标准格式：直接包含token字段
                  storage.saveToken(result.data.token, result.data.expireIn || 7200);
                  console.log('登录成功，token已保存');
                  
                  // 保存用户ID
                  if (result.data.userId) {
                    storage.saveUserId(result.data.userId);
                    console.log('用户ID已保存:', result.data.userId);
                  }
                } else if (result.data.data && result.data.data.token) {
                  // 嵌套格式：token在data字段内
                  storage.saveToken(result.data.data.token, result.data.data.expireIn || 7200);
                  console.log('登录成功，token已保存(嵌套格式)');
                  
                  // 保存用户ID
                  if (result.data.data.userId) {
                    storage.saveUserId(result.data.data.userId);
                    console.log('用户ID已保存:', result.data.data.userId);
                  }
                } else if (typeof result.data === 'string') {
                  // 字符串格式：整个响应可能是token字符串
                  storage.saveToken(result.data, 7200);
                  console.log('登录成功，token已保存(字符串格式)');
                } else {
                  // 无法识别的格式，但状态码是200，尝试继续
                  console.warn('登录成功但无法识别token格式:', result.data);
                  wx.showToast({
                    title: '登录成功，但token格式异常',
                    icon: 'none'
                  });
                }
                
                // 返回上一页或首页
                const pages = getCurrentPages();
                if (pages.length > 1) {
                  wx.navigateBack();
                } else {
                  wx.switchTab({
                    url: '/pages/index/index'
                  });
                }
              } else {
                console.error('登录失败:', result);
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              this.setData({ isLoading: false });
              console.error('登录请求失败:', err);
              wx.showToast({
                title: '网络请求失败，请检查网络',
                icon: 'none'
              });
            }
          });
        } else {
          this.setData({ isLoading: false });
          console.error('登录失败:', res);
          wx.showToast({
            title: '微信登录失败，请重试',
            icon: 'none'
          });
        }
      }
    });
  }
}); 