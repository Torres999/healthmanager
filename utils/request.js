/**
 * 网络请求工具类
 */

// 导入存储工具
const storage = require('./storage');

// 基础URL
const BASE_URL = 'http://localhost:8080';

// 请求超时时间
const TIMEOUT = 10000;

// 获取存储的token
const getToken = () => {
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
          // 清除token
          storage.clearToken();
          // 跳转到登录页
          wx.navigateTo({
            url: '/pages/login/login'
          });
          
          // 显示错误提示
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          
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
  // 运动记录列表
  if (url === '/api/exercise/records' && method === 'GET') {
    return {
      code: 0,
      data: generateMockExerciseRecords(),
      message: 'success'
    };
  }
  
  // 运动记录详情
  if (url.match(/\/api\/exercise\/records\/\d+/) && method === 'GET') {
    const id = url.split('/').pop();
    return {
      code: 0,
      data: generateMockExerciseDetail(id),
      message: 'success'
    };
  }
  
  // 健康数据
  if (url === '/api/health/data' && method === 'GET') {
    return {
      code: 0,
      data: {
        steps: Math.floor(Math.random() * 10000),
        heartRate: Math.floor(Math.random() * 40) + 60,
        sleepHours: Math.floor(Math.random() * 4) + 5,
        calories: Math.floor(Math.random() * 500) + 1000
      },
      message: 'success'
    };
  }
  
  // 冥想课程
  if (url === '/api/meditation/courses' && method === 'GET') {
    const categoryId = data?.categoryId;
    const courses = [
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
        title: '专注力训练',
        description: '提升工作效率',
        duration: 20,
        image: '/assets/images/meditation2.jpg',
        categoryId: 2
      },
      {
        id: 3,
        title: '睡前放松',
        description: '改善睡眠质量',
        duration: 30,
        image: '/assets/images/meditation3.jpg',
        categoryId: 3
      },
      {
        id: 4,
        title: '减压冥想',
        description: '缓解压力和焦虑',
        duration: 25,
        image: '/assets/images/meditation4.jpg',
        categoryId: 1
      },
      {
        id: 5,
        title: '正念呼吸',
        description: '培养专注和平静',
        duration: 10,
        image: '/assets/images/meditation5.jpg',
        categoryId: 2
      }
    ];
    
    // 如果指定了分类ID，则过滤课程
    const filteredCourses = categoryId ? courses.filter(course => course.categoryId === parseInt(categoryId)) : courses;
    
    return {
      code: 0,
      data: filteredCourses,
      message: 'success'
    };
  }
  
  // 冥想分类
  if (url === '/api/meditation/categories' && method === 'GET') {
    return {
      code: 0,
      data: [
        {
          id: 1,
          name: '减压放松',
          description: '缓解压力，放松身心',
          image: '/assets/images/category1.jpg'
        },
        {
          id: 2,
          name: '专注力提升',
          description: '提高注意力和工作效率',
          image: '/assets/images/category2.jpg'
        },
        {
          id: 3,
          name: '睡眠改善',
          description: '帮助入睡，提高睡眠质量',
          image: '/assets/images/category3.jpg'
        }
      ],
      message: 'success'
    };
  }
  
  // 冥想分类详情
  if (url.match(/\/api\/meditation\/categories\/\d+/) && method === 'GET') {
    const id = parseInt(url.split('/').pop());
    const categories = {
      1: {
        id: 1,
        name: '减压放松',
        description: '缓解压力，放松身心',
        image: '/assets/images/category1.jpg'
      },
      2: {
        id: 2,
        name: '专注力提升',
        description: '提高注意力和工作效率',
        image: '/assets/images/category2.jpg'
      },
      3: {
        id: 3,
        name: '睡眠改善',
        description: '帮助入睡，提高睡眠质量',
        image: '/assets/images/category3.jpg'
      }
    };
    
    return {
      code: 0,
      data: categories[id] || {},
      message: 'success'
    };
  }
  
  // 冥想课程详情
  if (url.match(/\/api\/meditation\/courses\/\d+/) && method === 'GET') {
    const id = parseInt(url.split('/').pop());
    const courses = {
      1: {
        id: 1,
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
      2: {
        id: 2,
        title: '专注力训练',
        description: '提升工作效率的专注力训练，帮助你在繁忙的工作中保持清晰的思维。通过引导式冥想，增强注意力和集中力。',
        duration: 20,
        image: '/assets/images/meditation2.jpg',
        categoryId: 2,
        audioUrl: '/assets/audio/meditation2.mp3',
        steps: [
          '选择一个不受打扰的环境，可以坐在椅子上',
          '保持脊柱挺直，双手放在膝盖上',
          '闭上眼睛，将注意力集中在一个点上',
          '当注意力分散时，温和地将其拉回',
          '练习单点专注5分钟',
          '逐渐延长专注时间'
        ]
      },
      3: {
        id: 3,
        title: '睡前放松',
        description: '改善睡眠质量的放松冥想，帮助你摆脱白天的压力和焦虑，为深度睡眠做好准备。包含渐进式肌肉放松和引导式想象。',
        duration: 30,
        image: '/assets/images/meditation3.jpg',
        categoryId: 3,
        audioUrl: '/assets/audio/meditation3.mp3',
        steps: [
          '躺在床上，找到舒适的姿势',
          '从脚趾开始，逐渐放松全身肌肉',
          '注意呼吸，让它变得缓慢而深沉',
          '想象自己在一个安全、平静的地方',
          '让思绪自然流动，不要刻意控制',
          '随着引导慢慢进入睡眠状态'
        ]
      },
      4: {
        id: 4,
        title: '减压冥想',
        description: '缓解压力和焦虑的冥想练习，帮助你在紧张的生活中找到内心的平静。通过呼吸技巧和身体扫描，释放紧张和不适。',
        duration: 25,
        image: '/assets/images/meditation4.jpg',
        categoryId: 1,
        audioUrl: '/assets/audio/meditation4.mp3',
        steps: [
          '找一个安静的地方坐下',
          '闭上眼睛，深呼吸几次',
          '识别身体中紧张的区域',
          '将呼吸引导到这些区域，想象紧张随呼吸释放',
          '练习4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒',
          '重复这个过程，直到感到放松'
        ]
      },
      5: {
        id: 5,
        title: '正念呼吸',
        description: '培养专注和平静的基础冥想练习，适合冥想初学者。通过简单的呼吸观察，培养当下的觉知和接纳。',
        duration: 10,
        image: '/assets/images/meditation5.jpg',
        categoryId: 2,
        audioUrl: '/assets/audio/meditation5.mp3',
        steps: [
          '采取舒适的坐姿，保持背部挺直',
          '将注意力集中在呼吸上',
          '观察呼吸的自然节奏，不要刻意控制',
          '当思绪wandering时，温和地将注意力带回呼吸',
          '保持这种觉知状态10分钟',
          '结束时，先注意身体感觉，再慢慢睁开眼睛'
        ]
      }
    };
    
    return {
      code: 0,
      data: courses[id] || {},
      message: 'success'
    };
  }
  
  // 默认返回空数据
  return {
    code: 0,
    data: null,
    message: 'no data'
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
  return request({
    url,
    method: 'DELETE',
    data,
    header
  });
};

module.exports = {
  get,
  post,
  put,
  delete: del
}; 