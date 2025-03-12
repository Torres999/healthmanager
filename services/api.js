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
  console.log('正在请求首页概览数据...');
  return get('/hm/home/overview')
    .then(res => {
      // 记录返回的数据，便于调试
      console.log('获取首页概览数据返回:', res);
      
      // 处理后端返回的数据格式
      // 如果是 {code: 200, message: "操作成功", data: Object} 格式，转换为标准格式
      if (res && res.code === 200 && res.data) {
        return {
          code: 0,
          data: res.data,
          message: 'success'
        };
      }
      
      // 返回原始响应
      return res;
    })
    .catch(err => {
      console.error('获取首页概览数据失败，使用模拟数据:', err);
      // 返回模拟数据
      return {
        code: 0,
        data: {
          healthData: {
            steps: 6890,
            stepsChange: 12,
            heartRate: 72,
            calories: 1250,
            sleep: 7.5
          },
          activityChart: {
            dates: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            values: [30, 40, 35, 50, 45, 60, 70]
          }
        },
        message: 'success (mock data)'
      };
    });
};

/**
 * 获取今日任务列表
 * @returns {Promise} 请求结果
 */
const getTodayTasks = () => {
  // 尝试从后端获取数据，如果失败则返回模拟数据
  return get('/hm/home/tasks')
    .then(res => {
      // 处理后端返回的数据格式
      // 如果是 {code: 200, message: "操作成功", data: Array} 格式，直接返回
      if (res && res.code === 200 && Array.isArray(res.data)) {
        return res;
      }
      
      // 如果是其他格式，尝试标准化为 {code: 0, data: Array} 格式
      if (res && Array.isArray(res)) {
        return {
          code: 0,
          data: res,
          message: 'success'
        };
      }
      
      // 返回原始响应
      return res;
    })
    .catch(err => {
      console.log('获取任务数据失败，使用模拟数据:', err);
      // 返回模拟数据
      return {
        code: 0,
        data: [
          {
            id: 1,
            title: '晨间跑步',
            description: '30分钟有氧运动',
            completed: false,
            type: 'exercise'
          },
          {
            id: 2,
            title: '冥想放松',
            description: '15分钟正念冥想',
            completed: false,
            type: 'meditation'
          },
          {
            id: 3,
            title: '健康饮食',
            description: '记录今日饮食',
            completed: false,
            type: 'diet'
          }
        ],
        message: 'success (mock data)'
      };
    });
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