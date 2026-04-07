---
name: full-stack-development-pipeline
description: 全栈前端开发流水线，一站式完成从需求分析到项目开发的全流程。自动执行三步流程：① 使用 requirement-splitter 分析需求文档并拆分前后端任务；② 使用 frontend-tech-doc-generator 生成完整技术文档；③ 在具体项目中执行开发实施。当用户提到"全流程开发"、"需求到上线"、"完整开发流程"、"需求文档开发"、"端到端开发"、"需求分析+技术设计+开发"、"一键开发全流程"时使用此 skill。
---

# 全栈前端开发流水线 Skill

## 概述

本 Skill 提供从需求文档到项目开发的完整流水线服务，自动化串联三个核心阶段：

1. **需求分析阶段**：使用 `requirement-splitter` skill 读取并分析需求文档，拆分前后端任务
2. **技术设计阶段**：使用 `frontend-tech-doc-generator` skill 生成完整的技术方案文档
3. **项目开发阶段**：在具体项目中执行开发，创建项目、编写代码、实现功能

**核心价值**：
- 🔄 **流程自动化**：三个阶段无缝衔接，自动流转
- 📋 **输出标准化**：每个阶段产生标准化的输出产物
- 🎯 **前后端协同**：清晰的任务分工，明确的责任边界
- 📖 **文档完备**：技术文档齐全，便于团队协作和后续维护
- ⚡ **快速启动**：从需求到开发，一键式完成准备

**适用场景**：
- 有需求文档的新项目开发
- 企业级应用前端开发
- 团队协作的前端项目
- 需要规范化输出的开发任务

## 一、流水线架构

### 1.1 整体流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         全栈前端开发流水线                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  阶段一：需求分析（requirement-splitter）                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  输入：Word/PDF 需求文档                                                │  │
│  │  处理：读取文档 → 识别功能模块 → 拆分前后端任务 → 识别疑问点              │  │
│  │  输出：前后端分工表、接口清单、疑问点汇总                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ 阶段一完成确认
┌─────────────────────────────────────────────────────────────────────────────┐
│  阶段二：技术设计（frontend-tech-doc-generator）                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  输入：需求分析结果 + 疑问点确认                                         │  │
│  │  处理：技术选型 → 页面设计 → 组件设计 → 接口设计 → 状态管理设计          │  │
│  │  输出：完整技术文档（Markdown/Word）                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ 阶段二完成确认
┌─────────────────────────────────────────────────────────────────────────────┐
│  阶段三：项目开发                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  输入：技术文档 + 前后端分工表                                           │  │
│  │  处理：环境搭建 → 项目初始化 → 功能开发 → 接口对接                       │  │
│  │  输出：可运行的前端项目                                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 阶段依赖关系

```javascript
const stageDependencies = {
  // 阶段一：需求分析（无依赖，起始阶段）
  requirementAnalysis: {
    dependencies: [],
    outputs: ['前后端分工表', '接口清单', '疑问点汇总'],
    required: true,
    description: '分析需求文档，拆分前后端任务'
  },
  
  // 阶段二：技术设计（依赖阶段一的输出）
  techDesign: {
    dependencies: ['requirementAnalysis'],
    inputs: ['需求分析结果', '疑问点确认结果'],
    outputs: ['技术选型文档', '页面设计方案', '接口设计文档'],
    required: true,
    description: '生成完整技术方案文档'
  },
  
  // 阶段三：项目开发（依赖阶段二的输出）
  development: {
    dependencies: ['techDesign'],
    inputs: ['技术文档', '分工表'],
    outputs: ['项目代码', '可运行系统'],
    required: true,
    description: '在具体项目中执行开发'
  }
};
```

## 二、阶段一：需求分析

### 2.1 执行说明

**触发条件**：用户提供需求文档（Word/PDF 格式）

**执行内容**：
1. 读取需求文档内容
2. 识别功能模块和业务场景
3. 拆分前端任务和后端任务
4. 识别接口定义和数据交互
5. 识别疑问点和待确认事项
6. 生成前后端分工表（Markdown + Excel）

**关键输出**：

```javascript
const stageOneOutputs = {
  // 1. 前后端分工表
  divisionTable: {
    format: ['Markdown', 'Excel'],
    content: {
      frontendTasks: ['页面开发', '组件开发', '状态管理', '路由配置'],
      backendTasks: ['接口开发', '数据库设计', '业务逻辑实现'],
      sharedTasks: ['接口联调', '数据格式定义']
    }
  },
  
  // 2. 接口清单
  apiList: {
    format: ['Markdown', 'Excel'],
    content: {
      apis: [
        { name: '登录', method: 'POST', path: '/api/auth/login', frontend: '调用', backend: '实现' },
        { name: '用户列表', method: 'GET', path: '/api/users', frontend: '调用', backend: '实现' }
      ]
    }
  },
  
  // 3. 疑问点汇总
  doubts: {
    format: ['Markdown', 'Excel'],
    priority: ['高', '中', '低'],
    content: [
      { priority: '高', module: '用户管理', doubt: '登录失败错误提示文案', impact: '前端UI' },
      { priority: '高', module: '文件上传', doubt: '文件大小限制', impact: '前后端' }
    ]
  }
};
```

### 2.2 阶段一完成标准

```javascript
const stageOneCompletionCheck = {
  checks: [
    { item: '需求文档已读取', required: true },
    { item: '功能模块已识别', required: true },
    { item: '前后端任务已拆分', required: true },
    { item: '接口清单已生成', required: true },
    { item: '疑问点已汇总', required: true },
    { item: '分工表已输出', required: true }
  ],
  
  // 完成后确认
  confirmation: {
    message: '✅ 阶段一：需求分析已完成！',
    outputs: [
      '📄 前后端分工表（Markdown + Excel）',
      '📋 接口清单',
      '⚠️ 疑问点汇总'
    ],
    nextStep: '是否继续进行阶段二：技术设计？'
  }
};
```

## 三、阶段二：技术设计

### 3.1 前置条件

**依赖阶段一输出**：
- 需求分析结果
- 前后端分工表
- 疑问点列表（建议先确认高优先级疑问）

### 3.2 执行说明

**触发条件**：阶段一完成并确认

**执行内容**：
1. 根据需求分析结果进行技术选型
2. 设计项目架构和目录结构
3. 设计页面结构和路由方案
4. 设计组件树和组件规范
5. 设计状态管理方案
6. 设计接口封装方案
7. 设计性能优化方案
8. 设计安全方案
9. 识别技术风险和待确认事项

**关键输出**：

```javascript
const stageTwoOutputs = {
  // 1. 技术选型文档
  techStack: {
    sections: [
      '框架选型（React/Vue）',
      '状态管理（Redux/Zustand/Pinia）',
      'UI 组件库（Ant Design/Element Plus）',
      '构建工具（Vite/Webpack）',
      '其他工具库'
    ]
  },
  
  // 2. 页面设计
  pageDesign: {
    sections: [
      '页面清单',
      '页面结构图',
      '组件树设计',
      '页面状态设计'
    ]
  },
  
  // 3. 组件设计
  componentDesign: {
    sections: [
      '公共组件清单',
      '业务组件清单',
      '组件设计规范',
      '组件 Props 设计'
    ]
  },
  
  // 4. 接口设计
  apiDesign: {
    sections: [
      '接口封装方案',
      '接口模块化',
      '接口类型定义',
      '错误处理方案'
    ]
  },
  
  // 5. 状态管理设计
  stateManagement: {
    sections: [
      '状态划分原则',
      '全局状态设计',
      '模块状态设计',
      '状态使用规范'
    ]
  },
  
  // 6. 其他设计
  others: {
    sections: [
      '路由设计',
      '性能优化方案',
      '安全方案',
      '测试方案',
      '部署方案'
    ]
  }
};
```

### 3.3 技术文档结构

```markdown
# [项目名称] 前端技术方案

## 文档信息
- 文档版本：v1.0
- 编写日期：YYYY-MM-DD
- 需求来源：[需求文档名称]

## 一、项目概述
### 1.1 项目背景
### 1.2 业务目标
### 1.3 用户角色

## 二、技术选型
### 2.1 技术栈总览
### 2.2 技术架构图
### 2.3 项目目录结构

## 三、页面设计
### 3.1 页面清单
### 3.2 页面详细设计

## 四、组件设计
### 4.1 公共组件清单
### 4.2 业务组件清单
### 4.3 组件设计规范

## 五、路由设计
### 5.1 路由配置
### 5.2 路由守卫
### 5.3 路由元信息

## 六、状态管理设计
### 6.1 状态划分原则
### 6.2 状态设计示例
### 6.3 状态使用规范

## 七、接口设计
### 7.1 接口封装
### 7.2 接口模块化
### 7.3 接口类型定义

## 八、性能优化方案
## 九、安全方案
## 十、测试方案
## 十一、部署方案
## 十二、风险与疑问点
## 十三、附录
```

### 3.4 阶段二完成标准

```javascript
const stageTwoCompletionCheck = {
  checks: [
    { item: '技术选型已完成', required: true },
    { item: '页面设计已完成', required: true },
    { item: '组件设计已完成', required: true },
    { item: '接口设计已完成', required: true },
    { item: '状态管理设计已完成', required: true },
    { item: '技术文档已输出', required: true }
  ],
  
  // 完成后确认
  confirmation: {
    message: '✅ 阶段二：技术设计已完成！',
    outputs: [
      '📖 前端技术方案文档（Markdown/Word）',
      '🎨 页面设计文档',
      '🧩 组件设计文档',
      '🔌 接口设计文档'
    ],
    nextStep: '是否继续进行阶段三：项目开发？'
  }
};
```

## 四、阶段三：项目开发

### 4.1 前置条件

**依赖阶段二输出**：
- 技术选型文档
- 页面设计方案
- 组件设计方案
- 接口设计文档

**环境准备**：
- Node.js 环境
- 包管理器（npm/yarn/pnpm）
- 代码编辑器

### 4.2 执行说明

**触发条件**：阶段二完成并确认

**执行内容**：

#### 4.2.1 环境搭建

```bash
# 1. 检测环境
node --version
npm --version

# 2. 配置镜像源（国内环境）
npm config set registry https://registry.npmmirror.com

# 3. 安装全局工具
npm install -g pnpm typescript
```

#### 4.2.2 项目初始化

```bash
# React 项目
npm create vite@latest project-name -- --template react-ts

# Vue 项目
npm create vite@latest project-name -- --template vue-ts

# 进入项目目录
cd project-name

# 安装依赖
npm install
# 或
pnpm install
```

#### 4.2.3 基础配置

```javascript
// 根据技术文档进行基础配置
const setupConfig = {
  // 1. 安装依赖
  dependencies: {
    // UI 组件库
    'antd': '^5.x',  // 或 'element-plus'
    
    // 状态管理
    'zustand': '^4.x',  // 或 '@reduxjs/toolkit'
    
    // 路由
    'react-router-dom': '^6.x',  // 或 'vue-router'
    
    // HTTP 请求
    'axios': '^1.x',
    
    // 工具库
    'dayjs': '^1.x',
    'lodash-es': '^4.x'
  },
  
  // 2. 开发依赖
  devDependencies: {
    'typescript': '^5.x',
    'eslint': '^8.x',
    'prettier': '^3.x',
    '@types/node': '^20.x'
  },
  
  // 3. 目录结构创建
  directories: [
    'src/api',
    'src/assets/images',
    'src/assets/styles',
    'src/components/common',
    'src/components/business',
    'src/hooks',
    'src/pages',
    'src/router',
    'src/store',
    'src/types',
    'src/utils'
  ]
};
```

#### 4.2.4 功能开发

```javascript
// 开发顺序（按优先级）
const developmentOrder = [
  // 1. 基础架构
  {
    phase: '基础架构',
    tasks: [
      '创建项目目录结构',
      '配置路由系统',
      '配置状态管理',
      '封装 Axios 请求',
      '配置全局样式'
    ]
  },
  
  // 2. 公共组件
  {
    phase: '公共组件',
    tasks: [
      '开发 Button 组件',
      '开发 Input 组件',
      '开发 Modal 组件',
      '开发 Table 组件',
      '开发 Form 组件'
    ]
  },
  
  // 3. 布局组件
  {
    phase: '布局组件',
    tasks: [
      '开发 MainLayout',
      '开发 Header 组件',
      '开发 Sidebar 组件',
      '开发 Footer 组件'
    ]
  },
  
  // 4. 业务页面
  {
    phase: '业务页面',
    tasks: [
      '开发登录页',
      '开发首页',
      '开发列表页',
      '开发详情页',
      '开发表单页'
    ]
  },
  
  // 5. 接口对接
  {
    phase: '接口对接',
    tasks: [
      '登录接口对接',
      '用户信息接口',
      '业务数据接口',
      '文件上传接口'
    ]
  }
];
```

### 4.3 代码生成规范

#### 4.3.1 目录结构

```
project-root/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                   # API 接口
│   │   ├── index.ts          # API 统一导出
│   │   ├── request.ts        # Axios 封装
│   │   └── modules/          # 按模块组织
│   │       ├── user.ts
│   │       └── product.ts
│   ├── assets/               # 静态资源
│   │   ├── images/
│   │   └── styles/
│   ├── components/           # 组件
│   │   ├── common/          # 通用组件
│   │   └── business/        # 业务组件
│   ├── hooks/                # 自定义 Hooks
│   ├── pages/                # 页面组件
│   ├── router/               # 路由配置
│   ├── store/                # 状态管理
│   ├── types/                # TypeScript 类型
│   ├── utils/                # 工具函数
│   ├── App.tsx               # 根组件
│   └── main.tsx              # 入口文件
├── .env                      # 环境变量
├── .eslintrc.js             # ESLint 配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── package.json
```

#### 4.3.2 命名规范

```javascript
const namingConventions = {
  // 文件夹命名
  folder: 'kebab-case',      // user-list
  
  // 组件命名
  component: 'PascalCase',   // UserList
  
  // 函数命名
  function: 'camelCase',     // getUserInfo
  
  // 常量命名
  constant: 'UPPER_SNAKE_CASE', // API_BASE_URL
  
  // CSS 类命名
  css: 'kebab-case',         // user-list__item
  
  // 接口类型命名
  interface: 'PascalCase + I前缀', // IUserInfo
};
```

### 4.4 阶段三完成标准

```javascript
const stageThreeCompletionCheck = {
  checks: [
    { item: '开发环境已搭建', required: true },
    { item: '项目已初始化', required: true },
    { item: '基础架构已完成', required: true },
    { item: '核心组件已开发', required: true },
    { item: '核心页面已实现', required: true },
    { item: '接口已对接', required: true },
    { item: '项目可运行', required: true }
  ],
  
  // 完成确认
  confirmation: {
    message: '🎉 阶段三：项目开发已完成！',
    outputs: [
      '💻 可运行的前端项目',
      '📦 完整的项目代码',
      '🔌 已对接的接口',
      '🚀 可部署的应用'
    ]
  }
};
```

## 五、完整执行流程

### 5.1 执行步骤

```javascript
async function executeFullPipeline(requirementDocPath) {
  // ========== 阶段一：需求分析 ==========
  console.log('📍 阶段一：需求分析');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Step 1.1: 读取需求文档
  const requirementContent = await readDocument(requirementDocPath);
  
  // Step 1.2: 分析需求
  const analysisResult = await analyzeRequirement(requirementContent);
  
  // Step 1.3: 拆分前后端任务
  const divisionTable = await splitFrontendBackend(analysisResult);
  
  // Step 1.4: 生成接口清单
  const apiList = await generateApiList(analysisResult);
  
  // Step 1.5: 识别疑问点
  const doubts = await identifyDoubts(analysisResult);
  
  // Step 1.6: 输出产物
  await outputStageOneResults({
    divisionTable,
    apiList,
    doubts
  });
  
  // Step 1.7: 确认完成
  const stageOneConfirmed = await confirmStageCompletion('stageOne');
  if (!stageOneConfirmed) {
    return { status: 'paused', stage: 'stageOne' };
  }
  
  // ========== 阶段二：技术设计 ==========
  console.log('\n📍 阶段二：技术设计');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Step 2.1: 确认疑问点（可选）
  const confirmedDoubts = await confirmDoubts(doubts);
  
  // Step 2.2: 技术选型
  const techStack = await selectTechStack(analysisResult);
  
  // Step 2.3: 设计架构
  const architecture = await designArchitecture(techStack);
  
  // Step 2.4: 设计页面
  const pages = await designPages(analysisResult);
  
  // Step 2.5: 设计组件
  const components = await designComponents(pages);
  
  // Step 2.6: 设计接口
  const apiDesign = await designApi(apiList);
  
  // Step 2.7: 设计状态管理
  const stateManagement = await designStateManagement(analysisResult);
  
  // Step 2.8: 生成技术文档
  await generateTechDocument({
    techStack,
    architecture,
    pages,
    components,
    apiDesign,
    stateManagement
  });
  
  // Step 2.9: 确认完成
  const stageTwoConfirmed = await confirmStageCompletion('stageTwo');
  if (!stageTwoConfirmed) {
    return { status: 'paused', stage: 'stageTwo' };
  }
  
  // ========== 阶段三：项目开发 ==========
  console.log('\n📍 阶段三：项目开发');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Step 3.1: 检测环境
  await checkEnvironment();
  
  // Step 3.2: 创建项目
  await createProject(techStack);
  
  // Step 3.3: 安装依赖
  await installDependencies(techStack);
  
  // Step 3.4: 创建目录结构
  await createDirectoryStructure(architecture);
  
  // Step 3.5: 开发基础架构
  await developInfrastructure(architecture);
  
  // Step 3.6: 开发公共组件
  await developCommonComponents(components);
  
  // Step 3.7: 开发业务页面
  await developPages(pages);
  
  // Step 3.8: 对接接口
  await integrateApi(apiDesign);
  
  // Step 3.9: 测试运行
  await testRun();
  
  console.log('\n🎉 全流程开发完成！');
  return { status: 'completed' };
}
```

### 5.2 阶段交互确认

```javascript
// 每个阶段完成后的确认机制
async function confirmStageCompletion(stage) {
  const stageNames = {
    stageOne: '需求分析',
    stageTwo: '技术设计',
    stageThree: '项目开发'
  };
  
  const outputs = {
    stageOne: [
      '📄 前后端分工表（Markdown + Excel）',
      '📋 接口清单',
      '⚠️ 疑问点汇总'
    ],
    stageTwo: [
      '📖 前端技术方案文档',
      '🎨 页面设计文档',
      '🧩 组件设计文档',
      '🔌 接口设计文档'
    ],
    stageThree: [
      '💻 可运行的前端项目',
      '📦 完整的项目代码'
    ]
  };
  
  console.log(`\n✅ ${stageNames[stage]} 已完成！`);
  console.log('输出产物：');
  outputs[stage].forEach(item => console.log(`  ${item}`));
  
  // 询问用户是否继续
  const continueNext = await askUser('是否继续下一阶段？');
  return continueNext;
}
```

## 六、产物清单

### 6.1 阶段一产物

| 产物名称 | 格式 | 说明 |
|---------|------|------|
| 前后端分工表 | Markdown + Excel | 详细的前端和后端任务列表 |
| 接口清单 | Markdown + Excel | 需要开发的接口列表 |
| 疑问点汇总 | Markdown + Excel | 需要确认的问题列表 |

### 6.2 阶段二产物

| 产物名称 | 格式 | 说明 |
|---------|------|------|
| 技术选型文档 | Markdown/Word | 技术栈选择和理由 |
| 页面设计文档 | Markdown/Word | 页面结构和组件树 |
| 组件设计文档 | Markdown/Word | 组件规范和 Props 设计 |
| 接口设计文档 | Markdown/Word | 接口封装和使用规范 |
| 状态管理文档 | Markdown/Word | 状态划分和使用规范 |

### 6.3 阶段三产物

| 产物名称 | 格式 | 说明 |
|---------|------|------|
| 项目代码 | JavaScript/TypeScript | 完整的前端项目代码 |
| 配置文件 | JSON/YAML | 项目配置文件 |
| 可运行应用 | - | 可本地运行的前端应用 |

## 七、异常处理

### 7.1 阶段暂停与恢复

```javascript
const pauseAndResume = {
  // 暂停点
  pausePoints: ['stageOne', 'stageTwo', 'stageThree'],
  
  // 暂停原因
  pauseReasons: [
    '用户主动暂停',
    '疑问点未确认',
    '技术方案未确认',
    '环境问题'
  ],
  
  // 恢复机制
  resume: {
    stageOne: '从需求分析继续',
    stageTwo: '从技术设计继续',
    stageThree: '从项目开发继续'
  },
  
  // 状态保存
  stateSave: {
    location: '.catpaw/cache/pipeline-state.json',
    content: ['currentStage', 'completedStages', 'outputs', 'timestamp']
  }
};
```

### 7.2 错误处理

```javascript
const errorHandling = {
  // 阶段一错误
  stageOneErrors: {
    '文档读取失败': '检查文件路径和格式',
    '内容解析失败': '检查文档内容是否完整',
    '无法识别功能模块': '提供更详细的需求说明'
  },
  
  // 阶段二错误
  stageTwoErrors: {
    '技术选型冲突': '根据项目实际情况调整',
    '设计方案不合理': '重新评估需求和技术栈'
  },
  
  // 阶段三错误
  stageThreeErrors: {
    '环境配置失败': '检查 Node.js 和包管理器',
    '依赖安装失败': '检查网络和镜像源配置',
    '项目运行失败': '检查配置和代码错误'
  }
};
```

## 八、使用示例

### 示例一：完整流程

```
用户输入：
我有一个需求文档 requirement.docx，请帮我完成从需求分析到项目开发的全流程。

执行过程：
📍 阶段一：需求分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 读取需求文档
✅ 分析功能模块
✅ 拆分前后端任务
✅ 生成接口清单
✅ 识别疑问点
✅ 输出分工表

是否继续进行阶段二？[Y/n] Y

📍 阶段二：技术设计
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 技术选型：React 18 + TypeScript + Zustand
✅ 页面设计：5 个页面
✅ 组件设计：12 个组件
✅ 接口设计：8 个接口
✅ 状态管理：3 个模块
✅ 生成技术文档

是否继续进行阶段三？[Y/n] Y

📍 阶段三：项目开发
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 检测环境
✅ 创建项目
✅ 安装依赖
✅ 开发基础架构
✅ 开发公共组件
✅ 开发业务页面
✅ 对接接口
✅ 项目可运行

🎉 全流程开发完成！
```

### 示例二：分步执行

```
用户输入：
先帮我分析需求文档，拆分前后端任务。

执行过程：
📍 阶段一：需求分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...（完成阶段一）

用户后续输入：
继续进行技术设计。

📍 阶段二：技术设计
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...（完成阶段二）

用户后续输入：
开始项目开发。

📍 阶段三：项目开发
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...（完成阶段三）
```

## 九、配置选项

### 9.1 可配置项

```javascript
const configOptions = {
  // 输出格式配置
  output: {
    format: ['markdown', 'word', 'excel'],
    encoding: 'utf-8',
    path: './output'
  },
  
  // 技术选型配置
  techStack: {
    framework: 'auto',  // auto | react | vue
    language: 'typescript',
    stateManagement: 'auto',  // auto | redux | zustand | pinia
    uiLibrary: 'auto'  // auto | antd | element-plus
  },
  
  // 开发配置
  development: {
    packageManager: 'auto',  // auto | npm | yarn | pnpm
    mirror: 'auto',  // auto | taobao | npm
    test: false,
    lint: true
  },
  
  // 流程控制
  pipeline: {
    autoConfirm: false,  // 是否自动确认进入下一阶段
    pauseOnDoubts: true,  // 遇到疑问点是否暂停
    skipStages: []  // 跳过的阶段
  }
};
```

## 十、注意事项

1. **阶段依赖**：必须按顺序执行，阶段二依赖阶段一的输出
2. **疑问确认**：高优先级疑问建议在阶段二前确认
3. **技术栈确认**：阶段二开始前确认技术栈选择
4. **环境准备**：阶段三需要准备开发环境
5. **暂停恢复**：支持在任意阶段暂停，下次继续
6. **产物保存**：每个阶段的产物都会保存，便于查阅
7. **团队协作**：生成的文档和分工表便于团队协作

## 十一、依赖 Skills

- `requirement-splitter`：需求分析，拆分前后端任务
- `frontend-tech-doc-generator`：生成技术文档
- `frontend-env-installer`：环境搭建和配置

## 十二、技能版本

- 版本：v1.0
- 更新日期：2026-04-07
- 维护者：前端开发团队
