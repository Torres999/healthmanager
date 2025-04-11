/**
 * 健康数据存储工具类
 */

// 健康数据键名
const STORAGE_KEYS = {
  HEALTH_DATA: 'health_data',
  EXERCISE_HISTORY: 'exercise_history',
  MEDITATION_HISTORY: 'meditation_history',
  USER_GOALS: 'user_goals',
  USER_INFO: 'user_info',
  TOKEN: 'token',
  TOKEN_EXPIRE_TIME: 'token_expire_time',
  USER_ID: 'user_id'
};

/**
 * 保存健康数据
 * @param {Object} data 健康数据对象
 */
const saveHealthData = (data) => {
  try {
    const currentData = getHealthData() || {};
    const newData = { ...currentData, ...data, updatedAt: new Date().getTime() };
    wx.setStorageSync(STORAGE_KEYS.HEALTH_DATA, newData);
    return true;
  } catch (error) {
    console.error('保存健康数据失败:', error);
    return false;
  }
};

/**
 * 获取健康数据
 * @returns {Object} 健康数据对象
 */
const getHealthData = () => {
  try {
    return wx.getStorageSync(STORAGE_KEYS.HEALTH_DATA) || {};
  } catch (error) {
    console.error('获取健康数据失败:', error);
    return {};
  }
};

/**
 * 添加运动记录
 * @param {Object} record 运动记录对象
 */
const addExerciseRecord = (record) => {
  try {
    const history = getExerciseHistory();
    const newRecord = {
      id: new Date().getTime(),
      date: new Date().toISOString(),
      ...record
    };
    history.unshift(newRecord);
    wx.setStorageSync(STORAGE_KEYS.EXERCISE_HISTORY, history);
    
    // 更新健康数据
    const healthData = getHealthData();
    const today = new Date().toISOString().split('T')[0];
    const todayData = healthData[today] || {};
    
    const updatedTodayData = {
      ...todayData,
      exerciseMinutes: (todayData.exerciseMinutes || 0) + (record.duration || 0),
      exerciseCalories: (todayData.exerciseCalories || 0) + (record.calories || 0),
      exerciseCount: (todayData.exerciseCount || 0) + 1
    };
    
    saveHealthData({ [today]: updatedTodayData });
    return newRecord;
  } catch (error) {
    console.error('添加运动记录失败:', error);
    return null;
  }
};

/**
 * 获取运动历史记录
 * @returns {Array} 运动记录数组
 */
const getExerciseHistory = () => {
  try {
    return wx.getStorageSync(STORAGE_KEYS.EXERCISE_HISTORY) || [];
  } catch (error) {
    console.error('获取运动历史记录失败:', error);
    return [];
  }
};

/**
 * 添加冥想记录
 * @param {Object} record 冥想记录对象
 */
const addMeditationRecord = (record) => {
  try {
    const history = getMeditationHistory();
    const newRecord = {
      id: new Date().getTime(),
      date: new Date().toISOString(),
      ...record
    };
    history.unshift(newRecord);
    wx.setStorageSync(STORAGE_KEYS.MEDITATION_HISTORY, history);
    
    // 更新健康数据
    const healthData = getHealthData();
    const today = new Date().toISOString().split('T')[0];
    const todayData = healthData[today] || {};
    
    const updatedTodayData = {
      ...todayData,
      meditationMinutes: (todayData.meditationMinutes || 0) + (record.duration || 0),
      meditationCount: (todayData.meditationCount || 0) + 1
    };
    
    saveHealthData({ [today]: updatedTodayData });
    return newRecord;
  } catch (error) {
    console.error('添加冥想记录失败:', error);
    return null;
  }
};

/**
 * 获取冥想历史记录
 * @returns {Array} 冥想记录数组
 */
const getMeditationHistory = () => {
  try {
    return wx.getStorageSync(STORAGE_KEYS.MEDITATION_HISTORY) || [];
  } catch (error) {
    console.error('获取冥想历史记录失败:', error);
    return [];
  }
};

/**
 * 保存用户目标
 * @param {Object} goals 用户目标对象
 */
const saveUserGoals = (goals) => {
  try {
    const currentGoals = getUserGoals();
    const newGoals = { ...currentGoals, ...goals };
    wx.setStorageSync(STORAGE_KEYS.USER_GOALS, newGoals);
    return true;
  } catch (error) {
    console.error('保存用户目标失败:', error);
    return false;
  }
};

/**
 * 获取用户目标
 * @returns {Object} 用户目标对象
 */
const getUserGoals = () => {
  try {
    return wx.getStorageSync(STORAGE_KEYS.USER_GOALS) || {
      steps: 10000,
      exerciseMinutes: 30,
      meditationMinutes: 15,
      sleep: 8
    };
  } catch (error) {
    console.error('获取用户目标失败:', error);
    return {
      steps: 10000,
      exerciseMinutes: 30,
      meditationMinutes: 15,
      sleep: 8
    };
  }
};

/**
 * 保存用户信息
 * @param {Object} userInfo 用户信息对象
 */
const saveUserInfo = (userInfo) => {
  try {
    const currentInfo = getUserInfo();
    const newInfo = { ...currentInfo, ...userInfo };
    wx.setStorageSync(STORAGE_KEYS.USER_INFO, newInfo);
    return true;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return false;
  }
};

/**
 * 获取用户信息
 * @returns {Object} 用户信息对象
 */
const getUserInfo = () => {
  try {
    return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || {};
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {};
  }
};

/**
 * 保存认证token
 * @param {string} token 认证token
 * @param {number} expireIn token过期时间(秒)
 */
const saveToken = (token, expireIn = 7200) => {
  try {
    wx.setStorageSync(STORAGE_KEYS.TOKEN, token);
    // 计算过期时间戳 (当前时间 + 过期秒数)
    const expireTime = Date.now() + expireIn * 1000;
    wx.setStorageSync(STORAGE_KEYS.TOKEN_EXPIRE_TIME, expireTime);
    return true;
  } catch (error) {
    console.error('保存token失败:', error);
    return false;
  }
};

/**
 * 获取认证token
 * @returns {string} 认证token
 */
const getToken = () => {
  try {
    // 注意：这里不能直接导入config模块，会造成循环依赖
    // 所以通过直接读取storage来判断是否处于演示环境
    const demoMode = wx.getStorageSync('demo_mode');
    // 演示环境下，返回一个模拟token
    if (demoMode !== false) {
      return 'demo_token_123456789';
    }
    
    return wx.getStorageSync(STORAGE_KEYS.TOKEN) || '';
  } catch (error) {
    console.error('获取token失败:', error);
    return '';
  }
};

/**
 * 检查token是否过期
 * @returns {boolean} 是否过期
 */
const isTokenExpired = () => {
  try {
    // 注意：这里不能直接导入config模块，会造成循环依赖
    // 所以通过直接读取storage来判断是否处于演示环境
    const demoMode = wx.getStorageSync('demo_mode');
    // 演示环境下，永远返回false（未过期）
    if (demoMode !== false) {
      return false;
    }
    
    const expireTime = wx.getStorageSync(STORAGE_KEYS.TOKEN_EXPIRE_TIME) || 0;
    return Date.now() >= expireTime;
  } catch (error) {
    console.error('检查token过期失败:', error);
    return true;
  }
};

/**
 * 清除token
 */
const clearToken = () => {
  try {
    wx.removeStorageSync(STORAGE_KEYS.TOKEN);
    wx.removeStorageSync(STORAGE_KEYS.TOKEN_EXPIRE_TIME);
    return true;
  } catch (error) {
    console.error('清除token失败:', error);
    return false;
  }
};

/**
 * 保存用户ID
 * @param {string|number} userId 用户ID
 */
const saveUserId = (userId) => {
  try {
    wx.setStorageSync(STORAGE_KEYS.USER_ID, userId);
    return true;
  } catch (error) {
    console.error('保存用户ID失败:', error);
    return false;
  }
};

/**
 * 获取用户ID
 * @returns {string|number} 用户ID
 */
const getUserId = () => {
  try {
    return wx.getStorageSync(STORAGE_KEYS.USER_ID) || '';
  } catch (error) {
    console.error('获取用户ID失败:', error);
    return '';
  }
};

module.exports = {
  saveHealthData,
  getHealthData,
  addExerciseRecord,
  getExerciseHistory,
  addMeditationRecord,
  getMeditationHistory,
  saveUserGoals,
  getUserGoals,
  saveUserInfo,
  getUserInfo,
  saveToken,
  getToken,
  isTokenExpired,
  clearToken,
  saveUserId,
  getUserId
}; 