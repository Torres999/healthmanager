/**
 * API服务模块
 * 封装所有与后端API交互的方法
 */

// 导入请求工具
const { get, post, put } = require('../utils/request');

/**
 * 获取首页概览数据
 * 包括用户信息、健康数据和活动图表数据
 * @returns {Promise} 请求结果
 */
const getHomeOverview = () => {
  return get('/hm/home/overview');
};

/**
 * 获取今日任务列表
 * @returns {Promise} 请求结果
 */
const getTodayTasks = () => {
  return get('/hm/home/tasks');
};

/**
 * 更新任务状态
 * @param {number} id 任务ID
 * @param {boolean} completed 是否完成
 * @returns {Promise} 请求结果
 */
const updateTaskStatus = (id, completed) => {
  return put(`/hm/home/tasks/${id}`, { completed });
};

// 导出API方法
module.exports = {
  getHomeOverview,
  getTodayTasks,
  updateTaskStatus
}; 