/**
 * 网络请求工具类
 */

// 导入存储工具
const storage = require('./storage');
// 导入配置模块
const config = require('./config');

// 基础URL
const BASE_URL = 'http://localhost:8080';

// 请求超时时间
const TIMEOUT = 10000;

// 获取存储的token
const getToken = () => {
  // 如果是演示环境，直接返回模拟token
  if (config.isDemoMode()) {
    return 'demo_token_123456789';
  }
  
  // 检查token是否过期
  if (storage.isTokenExpired()) {
    console.log('Token已过期，需要重新登录');
    // 清除过期token
    storage.clearToken();
    // 跳转到登录页或触发重新登录
    wx.navigateTo({
      url: '/pages/login/login'
    });
    return '';
  }
  return storage.getToken();
};

/**
 * 发送请求
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, header = {} } = options;
    
    // 显示加载中
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 检查是否处于演示环境
    if (config.isDemoMode()) {
      // 演示环境下，返回模拟数据
      wx.hideLoading();
      console.log('演示环境，使用模拟数据:', url);
      
      // 设置默认用户ID
      storage.saveUserId('1');
      
      // 返回模拟数据
      try {
        const mockData = handleMockRequest(url, method, data);
        if (mockData && mockData.code === 0) {
          setTimeout(() => {
            resolve(mockData);
          }, 300); // 添加300ms延迟，模拟网络请求
          return;
        }
      } catch (err) {
        console.error('生成模拟数据失败:', err);
      }
      
      // 根据URL返回不同的模拟数据
      if (url.includes('/hm/home/tasks')) {
        // 对于任务列表接口，返回模拟数据
        setTimeout(() => {
          resolve({
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
              }
            ],
            message: 'success (mock data from request)'
          });
        }, 300);
        return;
      }
      
      // 对于首页概览接口，返回模拟数据
      if (url.includes('/hm/home/overview')) {
        setTimeout(() => {
          resolve({
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
            message: 'success (mock data from request)'
          });
        }, 300);
        return;
      }
      
      // 对于其他请求，返回通用成功响应
      setTimeout(() => {
        resolve({
          code: 0,
          data: {},
          message: 'success (demo mode)'
        });
      }, 300);
      return;
    }
    
    // 非演示环境，正常发送请求
    // 获取认证token
    const token = getToken();
    
    // 获取用户ID
    const userId = storage.getUserId();
    
    // 准备请求数据，自动添加userId参数
    let requestData = { ...data };
    
    // 如果是GET请求，将userId添加到查询参数中
    if (method === 'GET') {
      requestData.userId = userId;
    } 
    // 如果是POST或PUT请求，将userId添加到请求体中
    else if (method === 'POST' || method === 'PUT') {
      // 如果请求体是FormData，不能直接添加属性
      if (!(requestData instanceof FormData)) {
        requestData.userId = userId;
      }
    }
    
    // 发送请求
    wx.request({
      url: /^https?:\/\//.test(url) ? url : `${BASE_URL}${url}`,
      method,
      data: requestData,
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header
      },
      timeout: TIMEOUT,
      success: (res) => {
        // 隐藏加载中
        wx.hideLoading();
        
        // 处理响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 成功响应，直接返回数据
          // 注意：后端可能返回 {code: 200, message: "操作成功", data: ...} 格式
          // 或者 {code: 0, data: ...} 格式，都应该视为成功
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 处理未授权错误
          console.log('未授权，需要重新登录');
          // 清除过期token
          storage.clearToken();
          
          // 检查是否是演示环境
          if (!config.isDemoMode()) {
            // 非演示环境才跳转登录页
            // 跳转到登录页
            wx.navigateTo({
              url: '/pages/login/login'
            });
            
            // 显示错误提示
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            });
          } else {
            // 演示环境下，设置模拟token和用户ID
            storage.saveUserId('1');
            storage.saveToken('demo_token_123456789', 86400); // 24小时过期
            console.log('演示环境下自动续签token');
            
            // 显示提示
            wx.showToast({
              title: '演示环境下自动登录',
              icon: 'success'
            });
            
            // 返回模拟成功响应
            resolve({
              code: 0,
              data: {},
              message: 'success (auto login in demo mode)'
            });
            return;
          }
          
          reject(new Error('未授权，需要重新登录'));
        } else {
          // 处理其他错误
          const error = new Error(`请求失败: ${res.statusCode}`);
          error.response = res;
          reject(error);
          
          // 显示错误提示
          wx.showToast({
            title: `请求失败: ${res.statusCode}`,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        // 隐藏加载中
        wx.hideLoading();
        
        // 处理错误
        console.error('网络请求失败:', err, url);
        
        // 对于开发环境，可以考虑返回模拟数据而不是直接拒绝Promise
        if (url.includes('/hm/home/tasks')) {
          // 对于任务列表接口，返回模拟数据
          resolve({
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
              }
            ],
            message: 'success (mock data from request)'
          });
          return;
        }
        
        // 对于首页概览接口，返回模拟数据
        if (url.includes('/hm/home/overview')) {
          resolve({
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
            message: 'success (mock data from request)'
          });
          return;
        }
        
        // 显示错误提示
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        
        reject(err);
      }
    });
  });
};

/**
 * 处理模拟请求
 * @param {string} url 请求URL
 * @param {string} method 请求方法
 * @param {Object} data 请求数据
 * @returns {Object} 模拟响应
 */
const handleMockRequest = (url, method, data) => {
  console.log('处理模拟请求:', url, method);
  
  // 首页概览
  if (url.includes('/hm/home/overview') && method === 'GET') {
    return {
      code: 0,
      data: {
        userInfo: {
          nickName: 'David',
          avatarUrl: '/assets/images/avatar.png'
        },
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
  }
  
  // 获取今日任务
  if (url.includes('/hm/home/tasks') && method === 'GET' && !url.includes('/hm/home/tasks/')) {
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
  }
  
  // 更新任务状态
  if (url.includes('/hm/home/tasks/') && method === 'PUT') {
    const taskId = parseInt(url.split('/').pop());
    return {
      code: 0,
      data: {
        id: taskId,
        title: '任务' + taskId,
        description: '任务描述',
        completed: data.completed || false,
        type: 'exercise'
      },
      message: 'success (mock data)'
    };
  }
  
  // 获取单个任务
  if (url.includes('/hm/home/tasks/') && method === 'GET') {
    const taskId = parseInt(url.split('/').pop());
    return {
      code: 0,
      data: {
        id: taskId,
        title: '任务' + taskId,
        description: '任务描述',
        completed: false,
        type: 'exercise'
      },
      message: 'success (mock data)'
    };
  }
  
  // 运动记录列表
  if (url.includes('/hm/exercise/records') && method === 'GET' && !url.includes('/records/')) {
    return {
      code: 0,
      data: generateMockExerciseRecords(),
      message: 'success (mock data)'
    };
  }
  
  // 运动记录详情
  if (url.includes('/hm/exercise/records/') && method === 'GET') {
    const recordId = url.split('/').pop();
    return {
      code: 0,
      data: generateMockExerciseDetail(recordId),
      message: 'success (mock data)'
    };
  }
  
  // 健康数据
  if (url.includes('/hm/health/data') && method === 'GET') {
    return {
      code: 0,
      data: {
        steps: 8547,
        heartRate: 72,
        sleepHours: 7.5,
        calories: 1250
      },
      message: 'success (mock data)'
    };
  }
  
  // 活动统计数据
  if (url.includes('/hm/home/activity-stats') && method === 'GET') {
    return {
      code: 0,
      data: {
        exercise: {
          totalSessions: 12,
          totalMinutes: 360,
          totalCalories: 2450,
          totalDistance: 24.5
        },
        meditation: {
          totalSessions: 8,
          totalMinutes: 120,
          streak: 5
        },
        steps: {
          total: 48250,
          dailyAverage: 6893,
          bestDay: "周三"
        }
      },
      message: 'success (mock data)'
    };
  }
  
  // 冥想课程列表
  if (url.includes('/hm/meditation/courses') && method === 'GET' && !url.includes('/courses/')) {
    return {
      code: 0,
      data: [
        {
          id: 1,
          title: '晨间冥想',
          description: '开启美好一天',
          duration: 15,
          image: '/assets/images/meditation1.jpg',
          categoryId: 1
        },
        {
          id: 2,
          title: '睡前放松',
          description: '帮助入睡',
          duration: 20,
          image: '/assets/images/meditation2.jpg',
          categoryId: 2
        }
      ],
      message: 'success (mock data)'
    };
  }
  
  // 冥想课程详情
  if (url.includes('/hm/meditation/courses/') && method === 'GET') {
    const courseId = parseInt(url.split('/').pop());
    return {
      code: 0,
      data: {
        id: courseId,
        title: '晨间冥想',
        description: '开启美好一天的正念冥想，帮助你以平静的心态迎接新的一天。通过专注呼吸和身体扫描，唤醒身心，增强能量。',
        duration: 15,
        image: '/assets/images/meditation1.jpg',
        categoryId: 1,
        audioUrl: '/assets/audio/meditation1.mp3',
        steps: [
          '找一个安静的地方，采取舒适的坐姿',
          '闭上眼睛，深呼吸三次',
          '将注意力集中在呼吸上，感受空气的流动',
          '观察身体各部位的感觉，从头到脚',
          '设定今天的积极意图',
          '慢慢睁开眼睛，带着平静和专注开始新的一天'
        ]
      },
      message: 'success (mock data)'
    };
  }
  
  // 通用默认响应
  console.log('没有匹配的模拟数据处理:', url, method);
  return {
    code: 0,
    data: {},
    message: `success (default mock data for ${url})`
  };
};

/**
 * 生成模拟运动记录列表
 * @returns {Array} 运动记录列表
 */
const generateMockExerciseRecords = () => {
  const records = [];
  const types = ['running', 'cycling', 'walking'];
  const typeNames = {
    'running': '跑步',
    'cycling': '骑行',
    'walking': '步行'
  };
  
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const duration = Math.floor(Math.random() * 60) + 15;
    const distance = (Math.random() * 5 + 1).toFixed(2);
    const calories = Math.floor(Math.random() * 300) + 100;
    const timestamp = Date.now() - i * 86400000;
    
    records.push({
      id: `${timestamp}`,
      type: type,
      name: typeNames[type],
      duration: duration,
      distance: distance,
      calories: calories,
      pace: type === 'running' ? `${Math.floor(Math.random() * 2) + 4}'${Math.floor(Math.random() * 60)}"` : '-',
      timestamp: timestamp
    });
  }
  
  return records;
};

/**
 * 生成模拟运动记录详情
 * @param {string} id 记录ID
 * @returns {Object} 运动记录详情
 */
const generateMockExerciseDetail = (id) => {
  const types = ['running', 'cycling', 'walking'];
  const typeNames = {
    'running': '跑步',
    'cycling': '骑行',
    'walking': '步行'
  };
  
  const type = types[Math.floor(Math.random() * types.length)];
  const duration = Math.floor(Math.random() * 60) + 15;
  const distance = (Math.random() * 5 + 1).toFixed(2);
  const calories = Math.floor(Math.random() * 300) + 100;
  const timestamp = parseInt(id);
  
  const date = new Date(timestamp);
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  
  // 生成心率数据
  const heartRate = [];
  for (let i = 0; i < duration; i++) {
    heartRate.push({
      time: i,
      value: Math.floor(Math.random() * 40) + 100
    });
  }
  
  // 生成运动轨迹数据
  const route = {
    startLat: 39.908823,
    startLng: 116.397470,
    markers: [
      {
        id: 1,
        latitude: 39.908823,
        longitude: 116.397470,
        title: '起点'
      },
      {
        id: 2,
        latitude: 39.913823,
        longitude: 116.402470,
        title: '终点'
      }
    ],
    polyline: [
      {
        points: [
          { latitude: 39.908823, longitude: 116.397470 },
          { latitude: 39.909823, longitude: 116.398470 },
          { latitude: 39.910823, longitude: 116.399470 },
          { latitude: 39.911823, longitude: 116.400470 },
          { latitude: 39.912823, longitude: 116.401470 },
          { latitude: 39.913823, longitude: 116.402470 }
        ],
        color: '#4F6EF6',
        width: 4
      }
    ]
  };
  
  return {
    id: id,
    type: type,
    name: typeNames[type],
    duration: duration,
    distance: distance,
    calories: calories,
    pace: type === 'running' ? `${Math.floor(Math.random() * 2) + 4}'${Math.floor(Math.random() * 60)}"` : '-',
    date: formattedDate,
    time: formattedTime,
    heartRate: heartRate,
    route: route,
    notes: '这是一次很棒的运动体验！'
  };
};

/**
 * GET请求
 * @param {string} url 请求URL
 * @param {Object} data 请求数据
 * @param {Object} header 请求头
 * @returns {Promise} 请求结果
 */
const get = (url, data = {}, header = {}) => {
  // 检查是否在演示环境下
  if (config.isDemoMode()) {
    console.log('演示环境，GET请求直接返回模拟数据:', url);
    return new Promise((resolve) => {
      // 尝试获取模拟数据
      try {
        const mockData = handleMockRequest(url, 'GET', data);
        if (mockData) {
          setTimeout(() => {
            resolve(mockData);
          }, 300);
          return;
        }
      } catch (err) {
        console.error('生成模拟数据失败:', err);
      }
      
      // 如果没有特定的模拟数据处理，返回通用的成功响应
      setTimeout(() => {
        resolve({
          code: 0,
          data: {},
          message: 'success (demo mode)'
        });
      }, 300);
    });
  }
  
  // 正常环境下发送请求
  return request({
    url,
    method: 'GET',
    data,
    header
  });
};

/**
 * POST请求
 * @param {string} url 请求URL
 * @param {Object} data 请求数据
 * @param {Object} header 请求头
 * @returns {Promise} 请求结果
 */
const post = (url, data = {}, header = {}) => {
  // 检查是否在演示环境下
  if (config.isDemoMode()) {
    console.log('演示环境，POST请求直接返回模拟数据:', url);
    return new Promise((resolve) => {
      // 尝试获取模拟数据
      try {
        const mockData = handleMockRequest(url, 'POST', data);
        if (mockData) {
          setTimeout(() => {
            resolve(mockData);
          }, 300);
          return;
        }
      } catch (err) {
        console.error('生成模拟数据失败:', err);
      }
      
      // 如果没有特定的模拟数据处理，返回通用的成功响应
      setTimeout(() => {
        resolve({
          code: 0,
          data: {},
          message: 'success (demo mode)'
        });
      }, 300);
    });
  }
  
  // 正常环境下发送请求
  return request({
    url,
    method: 'POST',
    data,
    header
  });
};

/**
 * PUT请求
 * @param {string} url 请求URL
 * @param {Object} data 请求数据
 * @param {Object} header 请求头
 * @returns {Promise} 请求结果
 */
const put = (url, data = {}, header = {}) => {
  // 检查是否在演示环境下
  if (config.isDemoMode()) {
    console.log('演示环境，PUT请求直接返回模拟数据:', url);
    return new Promise((resolve) => {
      // 尝试获取模拟数据
      try {
        const mockData = handleMockRequest(url, 'PUT', data);
        if (mockData) {
          setTimeout(() => {
            resolve(mockData);
          }, 300);
          return;
        }
      } catch (err) {
        console.error('生成模拟数据失败:', err);
      }
      
      // 如果没有特定的模拟数据处理，返回通用的成功响应
      setTimeout(() => {
        resolve({
          code: 0,
          data: {},
          message: 'success (demo mode)'
        });
      }, 300);
    });
  }
  
  // 正常环境下发送请求
  return request({
    url,
    method: 'PUT',
    data,
    header
  });
};

/**
 * DELETE请求
 * @param {string} url 请求URL
 * @param {Object} data 请求数据
 * @param {Object} header 请求头
 * @returns {Promise} 请求结果
 */
const del = (url, data = {}, header = {}) => {
  // 检查是否在演示环境下
  if (config.isDemoMode()) {
    console.log('演示环境，DELETE请求直接返回模拟数据:', url);
    return new Promise((resolve) => {
      // 尝试获取模拟数据
      try {
        const mockData = handleMockRequest(url, 'DELETE', data);
        if (mockData) {
          setTimeout(() => {
            resolve(mockData);
          }, 300);
          return;
        }
      } catch (err) {
        console.error('生成模拟数据失败:', err);
      }
      
      // 如果没有特定的模拟数据处理，返回通用的成功响应
      setTimeout(() => {
        resolve({
          code: 0,
          data: {},
          message: 'success (demo mode)'
        });
      }, 300);
    });
  }
  
  // 正常环境下发送请求
  return request({
    url,
    method: 'DELETE',
    data,
    header
  });
};

// 导出API方法
module.exports = {
  get,
  post,
  put,
  delete: del,
  // 为服务层使用导出api对象
  api: {
    get,
    post,
    put,
    delete: del
  }
}; 