const { getUserInfo, saveUserInfo } = require('../../../utils/storage');

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      signature: '',
      gender: '保密',
      birthday: '',
      height: '',
      weight: ''
    },
    genders: ['保密', '男', '女'],
    genderIndex: 0
  },

  onLoad() {
    // 获取用户信息
    const userInfo = getUserInfo();
    
    // 设置性别索引
    const genderIndex = this.data.genders.findIndex(g => g === userInfo.gender);
    
    this.setData({
      userInfo,
      genderIndex: genderIndex !== -1 ? genderIndex : 0
    });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
  },

  // 昵称变更
  onNicknameChange(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    });
  },

  // 个性签名输入
  onSignatureInput(e) {
    this.setData({
      'userInfo.signature': e.detail.value
    });
  },

  // 性别选择
  onGenderChange(e) {
    const genderIndex = e.detail.value;
    
    this.setData({
      genderIndex,
      'userInfo.gender': this.data.genders[genderIndex]
    });
  },

  // 生日选择
  onBirthdayChange(e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    });
  },

  // 身高输入
  onHeightInput(e) {
    this.setData({
      'userInfo.height': e.detail.value
    });
  },

  // 体重输入
  onWeightInput(e) {
    this.setData({
      'userInfo.weight': e.detail.value
    });
  },

  // 保存用户信息
  saveUserInfo() {
    const { userInfo } = this.data;
    
    // 验证必填字段
    if (!userInfo.nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    // 保存用户信息
    saveUserInfo(userInfo);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 取消编辑
  cancelEdit() {
    wx.navigateBack();
  }
}); 