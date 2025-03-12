# 健康管理小程序 API 文档

本文档列出了健康管理小程序中所有可用的 API 接口。

## 基础信息

- 基础URL: `https://api.example.com`
- 请求超时: 10秒
- 所有接口返回格式: JSON

## 通用返回格式

```json
{
  "code": 0,       // 0表示成功，非0表示失败
  "data": {},      // 返回的数据
  "message": ""    // 返回的消息
}
```

## 通用请求参数

所有接口都需要以下参数：

- `userId`: 用户ID，必填参数，用于标识当前操作的用户

## 首页相关接口

### 获取首页概览数据

获取首页显示的概览数据，包括用户信息、健康数据和活动图表数据。

- **URL**: `/hm/home/overview`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "userInfo": {
      "nickName": "David",
      "avatarUrl": "/assets/images/avatar.png"
    },
    "healthData": {
      "steps": 6890,
      "stepsChange": 12,
      "heartRate": 72,
      "calories": 1250,
      "sleep": 7.5
    },
    "activityChart": {
      "dates": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      "values": [30, 40, 35, 50, 45, 60, 70]
    }
  },
  "message": "success"
}
```

### 获取今日任务

获取用户今日需要完成的任务列表。

- **URL**: `/hm/home/tasks`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "title": "晨间跑步",
      "description": "30分钟有氧运动",
      "completed": false,
      "type": "exercise"
    },
    {
      "id": 2,
      "title": "冥想放松",
      "description": "15分钟正念冥想",
      "completed": false,
      "type": "meditation"
    }
  ],
  "message": "success"
}
```

### 更新任务状态

更新特定任务的完成状态。

- **URL**: `/hm/home/tasks/{id}`
- **方法**: `PUT`
- **参数**: 
  - `id`: 任务ID
  - 请求体: 
    ```json
    {
      "completed": true
    }
    ```
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "晨间跑步",
    "description": "30分钟有氧运动",
    "completed": true,
    "type": "exercise"
  },
  "message": "success"
}
```

### 获取活动统计数据

获取用户的活动统计数据，包括运动和冥想的累计时间、次数等。

- **URL**: `/hm/home/activity-stats`
- **方法**: `GET`
- **参数**: 
  - `period`: (可选) 时间周期，可选值：`week`(默认)、`month`、`year`
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "exercise": {
      "totalSessions": 12,
      "totalMinutes": 360,
      "totalCalories": 2450,
      "totalDistance": 24.5
    },
    "meditation": {
      "totalSessions": 8,
      "totalMinutes": 120,
      "streak": 5
    },
    "steps": {
      "total": 48250,
      "dailyAverage": 6893,
      "bestDay": "周三"
    }
  },
  "message": "success"
}
```

## 运动相关接口

### 获取运动记录列表

获取用户的运动记录列表。

- **URL**: `/hm/exercise/records`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": "1629123456789",
      "type": "running",
      "name": "跑步",
      "duration": 45,
      "distance": "3.50",
      "calories": 320,
      "pace": "5'30\"",
      "timestamp": 1629123456789
    }
  ],
  "message": "success"
}
```

### 获取运动记录详情

获取特定运动记录的详细信息。

- **URL**: `/hm/exercise/records/{id}`
- **方法**: `GET`
- **参数**: 
  - `id`: 记录ID
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "id": "1629123456789",
    "type": "running",
    "name": "跑步",
    "duration": 45,
    "distance": "3.50",
    "calories": 320,
    "pace": "5'30\"",
    "date": "2023-08-16",
    "time": "08:30",
    "heartRate": [
      {"time": 0, "value": 120},
      {"time": 45, "value": 150}
    ],
    "route": {
      "startLat": 39.908823,
      "startLng": 116.397470,
      "markers": [
        {
          "id": 1,
          "latitude": 39.908823,
          "longitude": 116.397470,
          "title": "起点"
        },
        {
          "id": 2,
          "latitude": 39.913823,
          "longitude": 116.402470,
          "title": "终点"
        }
      ],
      "polyline": [
        {
          "points": [
            {"latitude": 39.908823, "longitude": 116.397470},
            {"latitude": 39.913823, "longitude": 116.402470}
          ],
          "color": "#4F6EF6",
          "width": 4
        }
      ]
    },
    "notes": "这是一次很棒的运动体验！"
  },
  "message": "success"
}
```

### 更新运动记录

更新特定运动记录的信息。

- **URL**: `/hm/exercise/records/{id}`
- **方法**: `PUT`
- **参数**: 
  - `id`: 记录ID
  - 请求体: 运动记录对象
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "id": "1629123456789",
    "type": "running",
    "name": "跑步",
    "duration": 45,
    "distance": "3.50",
    "calories": 320,
    "pace": "5'30\"",
    "date": "2023-08-16",
    "time": "08:30"
  },
  "message": "success"
}
```

## 健康数据接口

### 获取健康数据

获取用户的健康数据。

- **URL**: `/hm/health/data`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "steps": 8547,
    "heartRate": 72,
    "sleepHours": 7.5,
    "calories": 1250
  },
  "message": "success"
}
```

## 冥想相关接口

### 获取冥想课程列表

获取冥想课程列表，可以按分类筛选。

- **URL**: `/hm/meditation/courses`
- **方法**: `GET`
- **参数**: 
  - `categoryId`: (可选) 分类ID
- **返回示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "title": "晨间冥想",
      "description": "开启美好一天",
      "duration": 15,
      "image": "/assets/images/meditation1.jpg",
      "categoryId": 1
    }
  ],
  "message": "success"
}
```

### 获取冥想课程详情

获取特定冥想课程的详细信息。

- **URL**: `/hm/meditation/courses/{id}`
- **方法**: `GET`
- **参数**: 
  - `id`: 课程ID
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "晨间冥想",
    "description": "开启美好一天的正念冥想，帮助你以平静的心态迎接新的一天。通过专注呼吸和身体扫描，唤醒身心，增强能量。",
    "duration": 15,
    "image": "/assets/images/meditation1.jpg",
    "categoryId": 1,
    "audioUrl": "/assets/audio/meditation1.mp3",
    "steps": [
      "找一个安静的地方，采取舒适的坐姿",
      "闭上眼睛，深呼吸三次",
      "将注意力集中在呼吸上，感受空气的流动",
      "观察身体各部位的感觉，从头到脚",
      "设定今天的积极意图",
      "慢慢睁开眼睛，带着平静和专注开始新的一天"
    ]
  },
  "message": "success"
}
```

### 获取冥想分类列表

获取冥想课程的分类列表。

- **URL**: `/hm/meditation/categories`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "减压放松",
      "description": "缓解压力，放松身心",s
      "image": "/assets/images/category1.jpg"
    }
  ],
  "message": "success"
}
```

### 获取冥想分类详情

获取特定冥想分类的详细信息。

- **URL**: `/hm/meditation/categories/{id}`
- **方法**: `GET`
- **参数**: 
  - `id`: 分类ID
- **返回示例**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "减压放松",
    "description": "缓解压力，放松身心",
    "image": "/assets/images/category1.jpg"
  },
  "message": "success"
}
```

## 错误码说明

| 错误码 | 说明 |
|-------|------|
| 0     | 成功 |
| 1001  | 参数错误 |
| 1002  | 资源不存在 |
| 2001  | 服务器内部错误 |
| 3001  | 未授权 |

## 注意事项

1. 所有请求需要在 header 中包含 `content-type: application/json`
2. 当前版本的 API 为模拟实现，实际数据可能与示例不同
3. 错误时会返回相应的错误码和错误信息 