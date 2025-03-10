const { addMeditationRecord } = require('../../../utils/storage');

// 冥想提示
const MEDITATION_TIPS = [
  "深呼吸，感受空气流入你的身体",
  "放松你的肩膀和颈部",
  "专注于你的呼吸，不要刻意控制它",
  "如果思绪游走，轻轻地将注意力带回呼吸",
  "感受你的胸部和腹部随呼吸起伏",
  "接受当下的感受，不做评判",
  "想象每一次呼气都带走紧张和压力",
  "保持背部挺直但不僵硬",
  "让你的思绪像云一样飘过，不要抓住它们",
  "感受全身的放松和平静"
];

Page({
  data: {
    course: {
      id: 0,
      title: '',
      description: '',
      duration: 0,
      image: ''
    },
    status: 'ready', // ready, active, paused, finished
    statusText: '准备开始',
    startTime: 0,
    pauseTime: 0,
    totalTime: 0,
    elapsedTime: 0,
    formatTime: {
      minutes: '00',
      seconds: '00'
    },
    currentTip: '',
    tipIndex: 0
  },

  // 计时器ID
  timer: null,
  tipTimer: null,

  onLoad(options) {
    const { id } = options;
    
    // 模拟获取课程数据
    const courseData = {
      id: parseInt(id) || 1,
      title: '晨间冥想',
      description: '通过专注呼吸，开启充满活力的一天',
      duration: 15,
      image: '/assets/images/meditation1.jpg'
    };
    
    this.setData({
      course: courseData,
      currentTip: MEDITATION_TIPS[0]
    });
  },

  onUnload() {
    // 清除计时器
    this.clearTimers();
  },

  // 开始/暂停冥想
  toggleMeditation() {
    if (this.data.status === 'ready') {
      this.startMeditation();
    } else if (this.data.status === 'active') {
      this.pauseMeditation();
    }
  },

  // 开始冥想
  startMeditation() {
    const startTime = Date.now();
    
    this.setData({
      status: 'active',
      statusText: '冥想中',
      startTime
    });
    
    this.startTimer();
    this.startTipRotation();
  },

  // 暂停冥想
  pauseMeditation() {
    const pauseTime = Date.now();
    const elapsedTime = this.data.elapsedTime + (pauseTime - this.data.startTime);
    
    this.setData({
      status: 'paused',
      statusText: '已暂停',
      pauseTime,
      elapsedTime
    });
    
    this.clearTimers();
  },

  // 继续冥想
  resumeMeditation() {
    const startTime = Date.now();
    
    this.setData({
      status: 'active',
      statusText: '冥想中',
      startTime
    });
    
    this.startTimer();
    this.startTipRotation();
  },

  // 结束冥想
  stopMeditation() {
    let totalTime = this.data.elapsedTime;
    
    if (this.data.status === 'active') {
      const stopTime = Date.now();
      totalTime += (stopTime - this.data.startTime);
    }
    
    this.clearTimers();
    
    this.setData({
      status: 'finished',
      statusText: '已完成',
      totalTime
    });
  },

  // 保存冥想记录
  saveMeditation() {
    const { course, totalTime } = this.data;
    
    const record = {
      courseId: course.id,
      title: course.title,
      duration: Math.round(totalTime / 60000), // 转换为分钟
      icon: '/assets/icons/meditation.png'
    };
    
    addMeditationRecord(record);
    
    wx.showToast({
      title: '记录已保存',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 放弃冥想记录
  discardMeditation() {
    wx.showModal({
      title: '确认放弃',
      content: '确定要放弃本次冥想记录吗？',
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
      
      this.setData({
        formatTime: {
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        }
      });
      
      // 检查是否达到课程时长
      if (minutes >= this.data.course.duration) {
        this.stopMeditation();
        wx.vibrateLong(); // 震动提醒
      }
    }, 1000);
  },

  // 开始提示轮换
  startTipRotation() {
    this.clearTipTimer();
    
    this.tipTimer = setInterval(() => {
      let nextIndex = this.data.tipIndex + 1;
      if (nextIndex >= MEDITATION_TIPS.length) {
        nextIndex = 0;
      }
      
      this.setData({
        tipIndex: nextIndex,
        currentTip: MEDITATION_TIPS[nextIndex]
      });
    }, 20000); // 每20秒更换一次提示
  },

  // 清除计时器
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  // 清除提示计时器
  clearTipTimer() {
    if (this.tipTimer) {
      clearInterval(this.tipTimer);
      this.tipTimer = null;
    }
  },

  // 清除所有计时器
  clearTimers() {
    this.clearTimer();
    this.clearTipTimer();
  }
}); 