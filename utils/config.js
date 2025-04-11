/**
 * 应用配置管理模块
 * 统一管理应用配置和开关设置
 */

// 导入存储工具
const storage = require('./storage');

// 配置项存储键名
const CONFIG_KEYS = {
  DEMO_MODE: 'demo_mode'      // 演示环境开关
};

// 默认配置值
const DEFAULT_CONFIG = {
  DEMO_MODE: true             // 演示环境默认开启
};

/**
 * 获取演示环境状态
 * @returns {boolean} 是否开启演示环境
 */
const isDemoMode = () => {
  try {
    // 尝试从storage读取配置项
    const demoMode = wx.getStorageSync(CONFIG_KEYS.DEMO_MODE);
    // 如果存储中没有值，返回默认值
    return demoMode !== undefined ? demoMode : DEFAULT_CONFIG.DEMO_MODE;
  } catch (error) {
    console.error('获取演示环境状态失败:', error);
    // 出错时返回默认值
    return DEFAULT_CONFIG.DEMO_MODE;
  }
};

/**
 * 设置演示环境状态
 * @param {boolean} isEnabled 是否启用演示环境
 * @returns {boolean} 设置是否成功
 */
const setDemoMode = (isEnabled) => {
  try {
    wx.setStorageSync(CONFIG_KEYS.DEMO_MODE, isEnabled);
    // 如果开启演示环境，设置默认用户ID为1
    if (isEnabled) {
      storage.saveUserId('1');
    }
    return true;
  } catch (error) {
    console.error('设置演示环境状态失败:', error);
    return false;
  }
};

/**
 * 初始化所有配置项
 * 如果配置项不存在，则设置为默认值
 */
const initConfig = () => {
  try {
    // 初始化演示环境设置
    const currentDemoMode = wx.getStorageSync(CONFIG_KEYS.DEMO_MODE);
    if (currentDemoMode === undefined || currentDemoMode === null) {
      wx.setStorageSync(CONFIG_KEYS.DEMO_MODE, DEFAULT_CONFIG.DEMO_MODE);
      console.log('初始化演示环境状态: ', DEFAULT_CONFIG.DEMO_MODE ? '开启' : '关闭');
    } else {
      console.log('已存在演示环境设置:', currentDemoMode ? '开启' : '关闭');
    }
    
    // 读取最新的演示环境设置
    const demoMode = wx.getStorageSync(CONFIG_KEYS.DEMO_MODE);
    
    // 如果演示环境开启，设置默认用户ID和token
    if (demoMode !== false) {
      // 设置用户ID
      wx.setStorageSync('user_id', '1');
      console.log('演示环境已设置默认用户ID: 1');
      
      // 设置模拟token
      const fakeToken = 'demo_token_123456789';
      const expireTime = Date.now() + 86400 * 1000; // 24小时过期
      wx.setStorageSync('token', fakeToken);
      wx.setStorageSync('token_expire_time', expireTime);
      console.log('演示环境已设置模拟token');
    }
    
    console.log('配置初始化完成');
    return true;
  } catch (error) {
    console.error('初始化配置失败:', error);
    return false;
  }
};

/**
 * 重置所有配置到默认值
 */
const resetConfig = () => {
  try {
    // 重置演示环境设置
    wx.setStorageSync(CONFIG_KEYS.DEMO_MODE, DEFAULT_CONFIG.DEMO_MODE);
    
    console.log('配置已重置为默认值');
    return true;
  } catch (error) {
    console.error('重置配置失败:', error);
    return false;
  }
};

// 导出配置管理方法
module.exports = {
  isDemoMode,
  setDemoMode,
  initConfig,
  resetConfig,
  CONFIG_KEYS,
  DEFAULT_CONFIG
}; 