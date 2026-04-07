---
name: one-stop-development
description: 一站式前端开发助手，根据具体项目自动分析并规划开发步骤。支持环境搭建、技术文档生成、需求分析、前后端分工等一站式服务。根据项目实际情况智能推荐开发流程，避免过度规划，快速启动开发。当用户提到"一站式开发"、"快速启动项目"、"帮我开始开发"、"项目开发流程"、"开发步骤"、"项目初始化"、"从零开始开发"时使用此 skill。
---

# 一站式前端开发 Skill

## 概述

本 Skill 提供前端项目的一站式开发引导，根据具体项目需求自动分析并规划精简的开发步骤。通过智能识别项目类型、规模和复杂度，避免过度规划，帮助开发者快速进入开发状态。

**核心特点**：
- 🎯 **具体项目具体分析**：根据项目实际情况智能推荐步骤
- ⚡ **快速启动**：避免过度规划，只做必要准备
- 🔧 **环境一键配置**：自动检测并配置开发环境
- 📋 **技术方案精简**：按需生成技术文档，不搞形式主义
- 🔄 **渐进式开发**：边开发边完善，逐步迭代

## 一、项目智能分析

### 1.1 项目类型识别

首先识别项目类型，确定开发重点：

```javascript
// 项目类型识别矩阵
const projectTypes = {
  // 新项目
  newProject: {
    indicators: ['新项目', '从零开始', '新建项目', '空白项目'],
    steps: ['环境搭建', '项目初始化', '基础配置', '开发启动']
  },
  
  // 现有项目
  existingProject: {
    indicators: ['现有项目', '已有代码', '接手项目', '维护项目'],
    steps: ['环境检查', '依赖安装', '启动项目', '功能开发']
  },
  
  // 需求驱动
  requirementDriven: {
    indicators: ['需求文档', 'PRD', '功能需求', '产品文档'],
    steps: ['需求分析', '技术选型', '环境搭建', '开发实施']
  },
  
  // 快速原型
  prototype: {
    indicators: ['原型', 'Demo', '演示', '快速验证'],
    steps: ['环境搭建', '脚手架生成', '快速实现']
  }
};
```

### 1.2 项目规模评估

根据项目规模调整步骤深度：

```javascript
// 项目规模评估
const projectScale = {
  small: {
    indicators: ['个人项目', '小工具', '简单页面', '单一功能'],
    techDoc: '简化版',  // 不生成详细技术文档
    steps: ['快速搭建', '直接开发']
  },
  
  medium: {
    indicators: ['团队项目', '中型应用', '多个模块'],
    techDoc: '标准版',  // 生成标准技术文档
    steps: ['环境配置', '基础架构', '模块开发']
  },
  
  large: {
    indicators: ['企业级', '大型系统', '多人协作', '长期维护'],
    techDoc: '完整版',  // 生成完整技术文档
    steps: ['完整规划', '架构设计', '团队协作', '迭代开发']
  }
};
```

### 1.3 决策树

```
用户发起请求
    │
    ├─ 是否有需求文档？
    │   ├─ 是 → 读取文档 → 分析需求 → 推荐步骤
    │   └─ 否 → 询问项目类型 → 进入下一步
    │
    ├─ 是否是新项目？
    │   ├─ 是 → 环境检测 → 环境搭建 → 项目初始化
    │   └─ 否 → 环境检测 → 依赖安装 → 启动项目
    │
    └─ 项目规模？
        ├─ 小型 → 快速流程（3步内）
        ├─ 中型 → 标准流程（5-8步）
        └─ 大型 → 完整流程（详细规划）
```

## 二、开发步骤规划

### 2.1 最小可行步骤（MVP）

针对不同场景的最小步骤集合：

#### 场景一：新项目快速启动

```bash
# 步骤 1: 环境检测（自动化）
检测 Node.js → 检测包管理器 → 检测构建工具

# 步骤 2: 项目创建
npm create vite@latest my-project -- --template react-ts

# 步骤 3: 基础配置
cd my-project && npm install

# 步骤 4: 启动开发
npm run dev
```

#### 场景二：需求驱动开发

```bash
# 步骤 1: 需求分析
读取需求文档 → 提取功能点 → 识别页面

# 步骤 2: 技术选型
根据需求特征 → 推荐技术栈 → 确认选型

# 步骤 3: 环境搭建
检测环境 → 安装缺失 → 配置镜像

# 步骤 4: 项目初始化
创建项目 → 安装依赖 → 基础配置

# 步骤 5: 开始开发
实现首页 → 联调接口 → 迭代完善
```

#### 场景三：现有项目接手

```bash
# 步骤 1: 环境检查
检测本地环境 → 对比项目要求

# 步骤 2: 依赖安装
npm install / yarn / pnpm install

# 步骤 3: 项目启动
npm run dev / yarn dev

# 步骤 4: 了解项目
查看目录结构 → 阅读文档 → 理解架构
```

### 2.2 可选步骤库

根据项目需要选择性添加：

```javascript
// 可选步骤库
const optionalSteps = {
  // 技术文档类
  techDoc: {
    when: '中型以上项目 或 团队协作',
    action: '生成技术文档',
    detail: '技术选型、架构设计、接口规范'
  },
  
  // 需求分析类
  requirementAnalysis: {
    when: '有需求文档',
    action: '分析需求文档',
    detail: '提取功能点、识别页面、规划模块'
  },
  
  // 前后端分工
  frontendBackendSplit: {
    when: '前后端分离项目',
    action: '生成分工表',
    detail: '明确前端职责、后端接口、联调计划'
  },
  
  // 代码规范
  codeStandard: {
    when: '团队项目',
    action: '配置代码规范',
    detail: 'ESLint、Prettier、Git Hooks'
  },
  
  // Mock 数据
  mockData: {
    when: '后端接口未就绪',
    action: '生成 Mock 数据',
    detail: '接口 Mock、数据结构定义'
  }
};
```

## 三、环境智能配置

### 3.1 自动检测脚本

```bash
#!/bin/bash
# 环境自动检测脚本

echo "🔍 检测开发环境..."

# 检测 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js 未安装"
    echo "💡 建议: brew install node (macOS)"
fi

# 检测包管理器
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
fi
if command -v yarn &> /dev/null; then
    echo "✅ yarn: $(yarn --version)"
fi
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm: $(pnpm --version)"
fi

# 检测构建工具
if command -v vite &> /dev/null; then
    echo "✅ Vite 已安装"
fi
if command -v webpack &> /dev/null; then
    echo "✅ Webpack 已安装"
fi

# 检测 Git
if command -v git &> /dev/null; then
    echo "✅ Git: $(git --version)"
fi

echo ""
echo "📊 环境检测结果完成"
```

### 3.2 智能安装策略

```javascript
// 根据项目类型智能安装
const installStrategy = {
  // React 项目
  react: {
    global: ['create-vite', 'typescript'],
    dev: ['@types/react', '@types/react-dom', 'eslint', 'prettier']
  },
  
  // Vue 项目
  vue: {
    global: ['create-vue', 'typescript'],
    dev: ['vue-tsc', 'eslint', 'prettier']
  },
  
  // Node.js 项目
  node: {
    global: ['nodemon', 'ts-node', 'typescript'],
    dev: ['@types/node', 'eslint', 'prettier']
  }
};
```

### 3.3 镜像源配置

```bash
# 国内环境自动配置镜像
if [[ $(curl -s --connect-timeout 5 https://registry.npmjs.org) != *"registry"* ]]; then
    echo "检测到网络问题，自动配置淘宝镜像..."
    npm config set registry https://registry.npmmirror.com
fi
```

## 四、技术文档精简生成

### 4.1 按需生成策略

```javascript
// 技术文档生成策略
const docGenerationStrategy = {
  // 小型项目：不生成
  small: {
    generate: false,
    reason: '小型项目直接开发即可，无需过度规划'
  },
  
  // 中型项目：精简版
  medium: {
    generate: true,
    sections: ['技术选型', '页面清单', '接口设计', '开发计划'],
    skip: ['架构图', '组件详细设计', '性能优化方案', '测试方案']
  },
  
  // 大型项目：完整版
  large: {
    generate: true,
    sections: 'all',  // 所有章节
    detail: 'high'    // 高详细度
  }
};
```

### 4.2 精简版技术文档模板

```markdown
# [项目名称] 技术方案（精简版）

## 一、技术选型

| 技术 | 版本 | 用途 |
|-----|------|------|
| React/Vue | 18/3 | 前端框架 |
| TypeScript | 5.x | 类型支持 |
| Vite | 5.x | 构建工具 |
| Axios | 1.x | HTTP 请求 |

## 二、页面清单

| 页面 | 路由 | 主要功能 |
|-----|------|---------|
| 首页 | / | 数据概览 |
| 列表页 | /list | 数据展示 |

## 三、接口规划

| 功能 | 方法 | 路径 | 说明 |
|-----|------|------|------|
| 获取列表 | GET | /api/list | 分页查询 |

## 四、开发计划

- Week 1: 基础框架搭建
- Week 2: 核心功能开发
- Week 3: 测试与优化
```

## 五、需求快速分析

### 5.1 需求提取流程

```python
# 需求快速分析
def quick_analysis(requirement_content):
    """快速提取需求关键信息"""
    
    result = {
        'project_name': extract_project_name(requirement_content),
        'features': extract_features(requirement_content),
        'pages': extract_pages(requirement_content),
        'api_list': extract_api_requirements(requirement_content),
        'tech_requirements': extract_tech_requirements(requirement_content)
    }
    
    return result

# 功能点提取
def extract_features(content):
    """提取核心功能点"""
    features = []
    # 关键词匹配
    keywords = ['功能', '需求', '支持', '实现', '提供']
    # ... 提取逻辑
    return features

# 页面识别
def extract_pages(content):
    """识别需要的页面"""
    pages = []
    # 识别页面关键词
    page_keywords = ['页面', '界面', '列表', '详情', '表单']
    # ... 识别逻辑
    return pages
```

### 5.2 前后端分工（可选）

仅当前后端分离项目需要时生成：

```markdown
## 前后端分工表

### 前端负责
- [ ] 页面开发与布局
- [ ] 组件开发
- [ ] 前端路由
- [ ] 状态管理
- [ ] 接口联调

### 后端负责
- [ ] 接口开发
- [ ] 数据库设计
- [ ] 业务逻辑实现
- [ ] 接口文档提供

### 联调计划
| 功能 | 前端完成 | 后端完成 | 联调时间 |
|-----|---------|---------|---------|
| 登录 | Day 1 | Day 1 | Day 2 |
| 列表 | Day 2 | Day 2 | Day 3 |
```

## 六、开发流程模板

### 6.1 敏捷开发流程

```javascript
// 敏捷开发流程
const agileProcess = {
  // Sprint 1: 基础搭建
  sprint1: {
    duration: '1-2天',
    tasks: [
      '项目初始化',
      '基础配置',
      '路由搭建',
      '布局组件'
    ]
  },
  
  // Sprint 2: 核心功能
  sprint2: {
    duration: '3-5天',
    tasks: [
      '核心页面开发',
      '核心组件封装',
      '接口对接',
      '数据联调'
    ]
  },
  
  // Sprint 3: 完善优化
  sprint3: {
    duration: '2-3天',
    tasks: [
      '边缘场景处理',
      '性能优化',
      'Bug 修复',
      '代码审查'
    ]
  }
};
```

### 6.2 快速原型流程

```javascript
// 快速原型流程
const prototypeProcess = [
  {
    step: 1,
    action: '选择脚手架',
    command: 'npm create vite@latest',
    duration: '1分钟'
  },
  {
    step: 2,
    action: '安装依赖',
    command: 'npm install',
    duration: '2分钟'
  },
  {
    step: 3,
    action: '启动项目',
    command: 'npm run dev',
    duration: '即刻'
  },
  {
    step: 4,
    action: '快速实现',
    tips: '先实现核心功能，不追求完美',
    duration: '按需'
  }
];
```

## 七、执行流程

### Step 1: 项目诊断

与用户交互，了解项目情况：

```
询问模板：
1. 这是一个什么类型的项目？（新项目/现有项目/需求驱动/原型验证）
2. 项目规模大概多大？（个人/小团队/企业级）
3. 有需求文档吗？（有/没有/简要需求）
4. 有技术栈偏好吗？（React/Vue/其他）
5. 预期什么时候开始编码？（立刻/先规划一下）
```

### Step 2: 生成开发步骤

根据诊断结果生成最小可行步骤：

```javascript
function generateSteps(diagnosis) {
  let steps = [];
  
  // 1. 基础步骤（必选）
  steps.push({
    phase: '环境准备',
    tasks: ['检测环境', '安装缺失'],
    auto: true
  });
  
  // 2. 项目步骤（根据类型）
  if (diagnosis.type === 'new') {
    steps.push({
      phase: '项目初始化',
      tasks: ['创建项目', '基础配置'],
      auto: true
    });
  } else if (diagnosis.type === 'existing') {
    steps.push({
      phase: '项目启动',
      tasks: ['安装依赖', '启动项目'],
      auto: true
    });
  }
  
  // 3. 可选步骤（按需）
  if (diagnosis.hasRequirement) {
    steps.push({
      phase: '需求分析',
      tasks: ['提取功能点', '识别页面'],
      optional: true
    });
  }
  
  if (diagnosis.scale === 'large') {
    steps.push({
      phase: '技术规划',
      tasks: ['技术选型', '架构设计'],
      optional: true
    });
  }
  
  // 4. 开发步骤
  steps.push({
    phase: '开始开发',
    tasks: ['编码实现'],
    action: '可以开始写代码了！'
  });
  
  return steps;
}
```

### Step 3: 执行与反馈

```javascript
// 执行步骤
async function executeSteps(steps) {
  for (const step of steps) {
    console.log(`\n📌 ${step.phase}`);
    
    if (step.auto) {
      // 自动执行
      await executeAutoTasks(step.tasks);
    } else if (step.optional) {
      // 询问用户是否需要
      const confirm = await askUser(`是否执行: ${step.tasks.join(', ')}?`);
      if (confirm) {
        await executeTasks(step.tasks);
      }
    } else {
      // 提示用户执行
      console.log(`💡 建议: ${step.action}`);
    }
  }
}
```

## 八、最佳实践

### 8.1 避免过度规划

```javascript
// ❌ 错误：小项目也搞全套规划
const badExample = {
  projectSize: 'small',
  steps: [
    '详细需求分析',
    '完整技术文档',
    '架构设计图',
    '组件详细设计',
    '性能优化方案',
    '安全方案设计',
    '测试方案设计'
  ]
};

// ✅ 正确：按需规划
const goodExample = {
  projectSize: 'small',
  steps: [
    '环境搭建',
    '项目创建',
    '开始开发'
  ]
};
```

### 8.2 渐进式完善

```
开发阶段划分：

阶段1 - 快速启动
└── 环境搭建 → 项目创建 → 核心功能

阶段2 - 迭代优化  
└── 完善细节 → 优化体验 → 修复Bug

阶段3 - 工程化
└── 代码规范 → 测试覆盖 → 文档完善
```

### 8.3 智能推荐原则

```javascript
// 推荐原则
const principles = [
  '最小必要步骤优先',
  '能自动化就不手动',
  '先跑起来再优化',
  '文档按需生成',
  '不过度设计',
  '快速反馈迭代'
];
```

## 九、示例场景

### 场景一：个人小工具开发

**用户输入**：我想做一个简单的待办事项应用

**智能分析**：
- 项目类型：新项目
- 项目规模：小型
- 需求文档：无
- 开发目标：快速实现

**推荐步骤**：

```bash
# 步骤 1: 环境检测（自动）
✅ Node.js 已安装
✅ npm 已安装

# 步骤 2: 项目创建
npm create vite@latest todo-app -- --template react-ts
cd todo-app
npm install

# 步骤 3: 启动开发
npm run dev

# 建议
💡 小型项目无需技术文档，直接开始开发即可
💡 建议从核心功能开始：添加任务、显示列表、标记完成
```

### 场景二：企业级后台管理系统

**用户输入**：需要开发一个企业级后台管理系统，有需求文档

**智能分析**：
- 项目类型：需求驱动
- 项目规模：大型
- 需求文档：有
- 开发目标：规范开发

**推荐步骤**：

```bash
# 步骤 1: 需求分析
读取需求文档 → 提取功能模块 → 识别页面

# 步骤 2: 技术选型
框架: React 18 + TypeScript
UI库: Ant Design 5.x
状态管理: Zustand
构建工具: Vite 5.x

# 步骤 3: 环境搭建
检测并安装 Node.js
配置 npm 镜像源

# 步骤 4: 项目初始化
创建项目结构
配置代码规范
搭建基础架构

# 步骤 5: 生成技术文档
技术选型说明
架构设计方案
接口对接规范
开发计划排期

# 步骤 6: 开始开发
实现登录模块
搭建布局框架
开发业务模块
```

### 场景三：接手现有项目

**用户输入**：我刚接手一个现有项目，需要开始开发

**智能分析**：
- 项目类型：现有项目
- 项目规模：中型
- 需求文档：未知
- 开发目标：快速上手

**推荐步骤**：

```bash
# 步骤 1: 环境检查
检测 Node.js 版本是否符合项目要求
检测包管理器类型（npm/yarn/pnpm）

# 步骤 2: 安装依赖
根据项目 lock 文件选择包管理器
执行依赖安装

# 步骤 3: 启动项目
运行开发服务器
查看项目是否正常运行

# 步骤 4: 了解项目
查看 package.json 了解项目结构
查看 README 了解项目文档
查看 src 目录了解代码组织

# 建议
💡 先让项目跑起来，再开始开发新功能
💡 了解现有代码风格，保持一致性
💡 有疑问及时与团队成员沟通
```

## 十、交互式引导

### 10.1 首次对话模板

```
你好！我是你的前端开发助手 🚀

为了更好地帮助你开始开发，我需要了解一下项目情况：

1️⃣ 项目类型：
   - 全新项目
   - 现有项目
   - 有需求文档

2️⃣ 项目规模：
   - 个人/小工具
   - 团队项目
   - 企业级项目

3️⃣ 技术偏好：
   - React
   - Vue
   - 无偏好

请告诉我你的选择，我会为你规划最合适的开发步骤！
```

### 10.2 快速启动模式

```
如果你想快速开始，直接告诉我：

示例1：我要创建一个 React 项目
示例2：我有需求文档，帮我规划开发
示例3：现有项目，帮我启动

我会自动分析并给出最佳步骤！
```

## 注意事项

1. **避免过度规划**：小项目直接开始，不要花时间做详细规划
2. **自动化优先**：能自动完成的不要让用户手动操作
3. **按需生成文档**：文档是为了帮助开发，不是为了文档而文档
4. **快速迭代**：先让项目跑起来，再逐步完善
5. **灵活调整**：根据实际情况调整步骤，不僵化执行
6. **用户导向**：最终目标是帮用户快速开始开发，而不是走完流程
