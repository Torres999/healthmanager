const { addExerciseRecord } = require('../../../utils/storage');

// 运动类型图标映射
const EXERCISE_ICONS = {
  1: '/assets/icons/running.png',
  2: '/assets/icons/cycling.png',
  3: '/assets/icons/yoga.png',
  4: '/assets/icons/walking.png'
};

// 运动类型名称映射
const EXERCISE_NAMES = {
  1: '跑步',
  2: '骑行',
  3: '瑜伽',
  4: '步行'
};

// 每分钟消耗卡路里（根据运动类型）
const CALORIES_PER_MINUTE = {
  1: 10, // 跑步
  2: 8,  // 骑行
  3: 5,  // 瑜伽
  4: 4   // 步行
};

Page({
  data: {
    exerciseType: 1,
    exerciseIcon: '',
    exerciseName: '',
    status: 'ready', // ready, active, paused, finished
    startTime: 0,
    pauseTime: 0,
    totalTime: 0,
    elapsedTime: 0,
    formatTime: {
      minutes: '00',
      seconds: '00'
    },
    calories: 0,
    distance: 0,
    pace: '0\'00"'
  },

  // 计时器ID
  timer: null,

  onLoad(options) {
    const { type, name } = options;
    const exerciseType = parseInt(type) || 1;
    
    this.setData({
      exerciseType,
      exerciseIcon: EXERCISE_ICONS[exerciseType],
      exerciseName: name || EXERCISE_NAMES[exerciseType]
    });
  },

  onUnload() {
    // 清除计时器
    this.clearTimer();
  },

  // 开始/暂停运动
  toggleExercise() {
    if (this.data.status === 'ready') {
      this.startExercise();
    } else if (this.data.status === 'active') {
      this.pauseExercise();
    }
  },

  // 开始运动
  startExercise() {
    const startTime = Date.now();
    
    this.setData({
      status: 'active',
      startTime
    });
    
    this.startTimer();
  },

  // 暂停运动
  pauseExercise() {
    const pauseTime = Date.now();
    const elapsedTime = this.data.elapsedTime + (pauseTime - this.data.startTime);
    
    this.setData({
      status: 'paused',
      pauseTime,
      elapsedTime
    });
    
    this.clearTimer();
  },

  // 继续运动
  resumeExercise() {
    const startTime = Date.now();
    
    this.setData({
      status: 'active',
      startTime
    });
    
    this.startTimer();
  },

  // 结束运动
  stopExercise() {
    let totalTime = this.data.elapsedTime;
    
    if (this.data.status === 'active') {
      const stopTime = Date.now();
      totalTime += (stopTime - this.data.startTime);
    }
    
    this.clearTimer();
    
    // 计算最终数据
    const minutes = totalTime / 60000;
    const calories = Math.round(minutes * CALORIES_PER_MINUTE[this.data.exerciseType]);
    const distance = this.calculateDistance(minutes, this.data.exerciseType);
    const pace = this.calculatePace(distance, minutes);
    
    this.setData({
      status: 'finished',
      totalTime,
      calories,
      distance: distance.toFixed(2),
      pace
    });
  },

  // 保存记录
  saveRecord() {
    const { exerciseType, exerciseName, totalTime, calories, distance } = this.data;
    
    const record = {
      type: exerciseName,
      typeId: exerciseType,
      duration: Math.round(totalTime / 60000), // 转换为分钟
      calories,
      distance: parseFloat(distance),
      icon: EXERCISE_ICONS[exerciseType]
    };
    
    addExerciseRecord(record);
    
    wx.showToast({
      title: '记录已保存',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 放弃记录
  discardRecord() {
    wx.showModal({
      title: '确认放弃',
      content: '确定要放弃本次运动记录吗？',
      confirmText: '放弃',
      confirmColor: '#E93B3B',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  // 开始计时器
  startTimer() {
    this.clearTimer();
    
    this.timer = setInterval(() => {
      const now = Date.now();
      const currentElapsed = this.data.elapsedTime + (now - this.data.startTime);
      const minutes = Math.floor(currentElapsed / 60000);
      const seconds = Math.floor((currentElapsed % 60000) / 1000);
      
      // 计算实时数据
      const minutesDecimal = currentElapsed / 60000;
      const calories = Math.round(minutesDecimal * CALORIES_PER_MINUTE[this.data.exerciseType]);
      const distance = this.calculateDistance(minutesDecimal, this.data.exerciseType);
      const pace = this.calculatePace(distance, minutesDecimal);
      
      this.setData({
        formatTime: {
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        },
        calories,
        distance: distance.toFixed(2),
        pace
      });
    }, 1000);
  },

  // 清除计时器
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  // 计算距离（根据运动类型和时间）
  calculateDistance(minutes, type) {
    // 简单估算，实际应用中可能需要更复杂的计算或GPS数据
    const speedMap = {
      1: 0.15, // 跑步，约9km/h
      2: 0.25, // 骑行，约15km/h
      3: 0,    // 瑜伽，无距离
      4: 0.08  // 步行，约5km/h
    };
    
    return minutes * speedMap[type];
  },

  // 计算配速
  calculatePace(distance, minutes) {
    if (distance <= 0 || minutes <= 0) {
      return '0\'00"';
    }
    
    // 计算每公里所需分钟数
    const paceMinutes = minutes / distance;
    const paceMinutesInt = Math.floor(paceMinutes);
    const paceSeconds = Math.floor((paceMinutes - paceMinutesInt) * 60);
    
    return `${paceMinutesInt}'${paceSeconds.toString().padStart(2, '0')}"`;
  }
}); 