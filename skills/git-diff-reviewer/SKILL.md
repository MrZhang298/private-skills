---
name: git-diff-reviewer
description: 查看当前项目 git diff 并自动进行代码评审。支持查看暂存区变更、工作区变更、分支间差异，并基于代码规范、最佳实践、潜在问题等维度进行智能评审。当用户提到"代码评审"、"code review"、"查看变更"、"git diff"、"检查代码"、"评审代码"、"review代码"、"代码审查"时使用此 skill。
---

# Git Diff 代码评审 Skill

## 概述

本 Skill 提供当前项目的 git diff 查看和自动化代码评审功能。通过分析代码变更，从代码规范、最佳实践、潜在问题、性能优化等多个维度进行智能评审，帮助开发者提升代码质量。

**核心特点**：
- 🔍 **多模式 Diff 查看**：支持工作区、暂存区、分支间、提交间的差异查看
- 🤖 **智能代码评审**：自动识别代码问题并提供改进建议
- 📊 **多维度分析**：代码规范、安全性、性能、可维护性等
- 🎯 **项目级执行**：仅在当前项目目录下运行，避免误操作
- 💡 **可操作建议**：提供具体的代码修改建议和最佳实践

## 一、Diff 查看模式

### 1.1 支持的 Diff 模式

```javascript
const diffModes = {
  // 工作区变更（未暂存的修改）
  workingChanges: {
    command: 'git diff',
    description: '查看工作区未暂存的变更',
    useCase: '查看当前修改但未 add 的内容'
  },
  
  // 暂存区变更（已暂存未提交）
  stagedChanges: {
    command: 'git diff --cached',
    description: '查看暂存区已 add 但未 commit 的变更',
    useCase: '查看即将提交的内容'
  },
  
  // 所有变更（工作区 + 暂存区）
  allChanges: {
    command: 'git diff HEAD',
    description: '查看所有未提交的变更',
    useCase: '查看相对于最近一次提交的所有改动'
  },
  
  // 分支间差异
  branchDiff: {
    command: 'git diff <source-branch> <target-branch>',
    description: '查看两个分支之间的差异',
    useCase: '比较分支差异，常用于 PR 前检查'
  },
  
  // 提交间差异
  commitDiff: {
    command: 'git diff <commit1> <commit2>',
    description: '查看两个提交之间的差异',
    useCase: '比较特定提交之间的变化'
  },
  
  // 最近 N 次提交的变更
  recentCommits: {
    command: 'git diff HEAD~N HEAD',
    description: '查看最近 N 次提交的变更',
    useCase: '查看最近几次提交的累积改动'
  }
};
```

### 1.2 Diff 查看执行流程

**步骤 1：确认当前工作目录**

首先确认执行目录是否为 git 仓库：

```bash
# 检查是否在 git 仓库中
git rev-parse --is-inside-work-tree

# 获取仓库根目录
git rev-parse --show-toplevel

# 显示当前分支
git branch --show-current
```

**步骤 2：询问用户选择 Diff 模式**

根据用户需求选择合适的 diff 模式，默认使用 `git diff HEAD` 查看所有未提交的变更。

**步骤 3：执行 Diff 命令**

```bash
# 根据选择的模式执行相应命令
# 示例：查看所有未提交的变更
git diff HEAD

# 如果需要查看统计信息
git diff HEAD --stat

# 如果需要查看具体文件的变更
git diff HEAD -- <file-path>
```

## 二、代码评审流程

### 2.1 评审执行步骤

**步骤 1：获取 Diff 内容**

```bash
# 获取完整的 diff 内容，包含上下文
git diff HEAD --unified=5
```

**步骤 2：读取书写规范文件**

在分析代码之前，必须先读取项目根目录下的 `书写规范.md` 文件，作为代码评审的标准规范：

```javascript
// 书写规范文件路径
const codingStandardPath = './书写规范.md';

// 该文件包含以下规范内容，需要在评审时对照参考：
const codingStandards = {
  naming: {
    variable: 'camelCase（小驼峰）',
    constant: 'UPPER_SNAKE_CASE（全大写下划线分隔）',
    function: 'camelCase + 动词开头',
    booleanFunction: 'is/has/can/should 开头',
    class: 'PascalCase（大驼峰）',
    interface: 'PascalCase + I 开头',
    typeAlias: 'PascalCase',
    enum: 'PascalCase',
    componentFile: 'PascalCase.tsx',
    utilFile: 'camelCase.ts'
  },
  variableDeclaration: {
    priority: 'const > let > var',
    initialization: '声明时初始化',
    chaining: '避免链式声明'
  },
  types: {
    primitive: 'string, number, boolean, null, undefined, symbol, bigint',
    array: 'number[] 或 Array<string>',
    union: 'string | number',
    literal: "'up' | 'down' | 'left' | 'right'"
  },
  functions: {
    declaration: '推荐箭头函数',
    parameters: '支持默认值、可选参数、剩余参数',
    async: '使用 async/await'
  },
  classes: {
    access: 'public/private/protected/readonly',
    static: 'static readonly',
    inheritance: 'extends',
    abstract: 'abstract class'
  },
  errorHandling: {
    tryCatch: '必须处理异常',
    customError: '使用自定义错误类型',
    optionalChaining: '使用可选链（?.）和空值合并（??）'
  },
  comments: {
    jsdoc: '函数必须有 JSDoc 注释',
    todo: 'TODO/FIXME/HACK/NOTE 标记'
  },
  codeOrganization: {
    importOrder: '标准库 → 第三方库 → 内部模块 → 类型导入',
    codeOrder: '常量 → 接口/类型 → 类 → 函数 → 导出'
  }
};
```

**步骤 3：分析变更文件类型**

识别变更的文件类型，针对性地进行评审：

```javascript
const fileTypeAnalysis = {
  javascript: {
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    focus: ['ES6+ 语法', '异步处理', '模块化', '错误处理']
  },
  
  typescript: {
    extensions: ['.ts', '.tsx'],
    focus: ['类型定义', '接口设计', '泛型使用', '类型安全']
  },
  
  vue: {
    extensions: ['.vue'],
    focus: ['组件结构', '生命周期', 'Props/Events', '响应式数据']
  },
  
  css: {
    extensions: ['.css', '.scss', '.sass', '.less'],
    focus: ['选择器命名', '样式隔离', '响应式设计', '性能优化']
  },
  
  config: {
    extensions: ['.json', '.yaml', '.yml', '.config.js'],
    focus: ['配置格式', '环境变量', '敏感信息', '依赖版本']
  }
};
```

**步骤 3：读取代码书写规范**

在执行代码评审前，需要读取项目中的代码书写规范文件，作为评审的参考标准：

```bash
# 检查项目中是否存在书写规范文件
# 书写规范文件路径：书写规范.md（位于项目根目录）
```

使用 read_file 工具读取 `./书写规范.md` 文件内容，该文件包含完整的 JavaScript & TypeScript 编码规范，涵盖：
- 命名规范（变量、常量、函数、类、接口、类型别名、枚举、文件）
- 变量声明规范
- 数据类型规范
- 函数规范
- 类与对象规范
- 接口与类型别名
- 泛型规范
- 模块化规范
- 异步编程规范
- 错误处理规范
- 注释规范
- 代码组织规范
- 性能优化规范
- 最佳实践

**步骤 4：执行代码评审**

结合书写规范文件内容，从以下维度进行评审：

### 2.2 评审维度

根据 `书写规范.md` 文件中定义的规范，从以下维度进行评审：

```javascript
const reviewDimensions = {
  // 1. 代码规范 - 参照书写规范.md 中的命名规范、变量声明等章节
  codeStyle: {
    source: '书写规范.md - 一、命名规范、二、变量声明',
    severity: 'warning'
  },
  
  // 2. 最佳实践 - 参照书写规范.md 中的最佳实践章节
  bestPractices: {
    source: '书写规范.md - 十四、最佳实践',
    severity: 'warning'
  },
  
  // 3. 潜在问题
  potentialIssues: {
    source: '书写规范.md - 十、错误处理',
    severity: 'error'
  },
  
  // 4. 性能优化
  performance: {
    source: '书写规范.md - 十三、性能优化',
    severity: 'suggestion'
  },
  
  // 5. 安全问题
  security: {
    checks: [
      'XSS 风险：是否存在未转义的用户输入',
      '敏感信息：是否暴露密码、token 等敏感信息',
      '权限控制：是否有正确的权限校验',
      '数据验证：是否验证用户输入',
      '第三方依赖：是否引入有漏洞的依赖'
    ],
    severity: 'error'
  },
  
  // 6. 可维护性
  maintainability: {
    source: '书写规范.md - 十二、代码组织',
    severity: 'info'
  }
};
```

> **注意**：具体的评审检查项请参考 `书写规范.md` 文件内容，在执行评审时必须先读取该文件获取完整规范。

## 三、评审报告生成

### 3.1 报告格式

生成结构化的评审报告：

```markdown
# 代码评审报告

## 📊 变更概览

- **分支**: [当前分支名]
- **变更文件数**: [数量]
- **新增行数**: [+lines]
- **删除行数**: [-lines]
- **评审时间**: [时间戳]

## 📁 变更文件列表

| 文件路径 | 状态 | 变更行数 |
|---------|------|---------|
| path/to/file.js | Modified | +10/-5 |
| ... | ... | ... |

## 🔍 评审结果

### ❌ 严重问题 (Errors)

#### 文件: `src/utils/helper.js`

**问题 1: 潜在的空指针访问**
- **位置**: Line 45
- **代码**: `const value = data.items[0].name`
- **问题描述**: `data.items` 可能为空数组，访问 `[0]` 会导致错误
- **建议修改**:
```javascript
const value = data.items?.[0]?.name || 'default'
```

---

### ⚠️ 警告 (Warnings)

#### 文件: `src/components/Button.vue`

**问题 1: 组件命名不规范**
- **位置**: Line 12
- **代码**: `const btn_click = () => {}`
- **问题描述**: 函数名应使用 camelCase 命名规范
- **建议修改**:
```javascript
const btnClick = () => {}
```

---

### 💡 优化建议 (Suggestions)

#### 文件: `src/api/user.js`

**建议 1: 添加请求缓存**
- **位置**: Line 23-30
- **问题描述**: 频繁调用 getUserInfo 接口可能导致重复请求
- **建议**: 考虑添加缓存机制或请求合并

---

## 📈 评审统计

| 类型 | 数量 |
|-----|------|
| 严重问题 | 2 |
| 警告 | 5 |
| 优化建议 | 3 |
| 信息提示 | 1 |

## ✅ 总体评价

代码整体质量 [良好/一般/需改进]，建议在提交前修复标记的严重问题。

## 📝 后续建议

1. [具体建议 1]
2. [具体建议 2]
3. [具体建议 3]
```

## 四、评审结果存储

### 4.1 自动创建存储目录

代码评审完成后，自动在项目根目录下创建 `.CodeReview` 文件夹，用于存放评审结果：

```bash
# 创建评审结果存储目录
mkdir -p .CodeReview
```

### 4.2 评审报告文件命名规则

评审报告以 Markdown 格式存储，文件命名格式如下：

```
.CodeReview/
├── review-YYYY-MM-DD_HH-mm-ss.md    # 按时间戳命名
├── review-2024-01-15_14-30-25.md     # 示例
└── ...
```

### 4.3 自动更新 .gitignore

评审完成后，自动检查并更新项目的 `.gitignore` 文件，添加 `.CodeReview` 目录的屏蔽配置：

**执行逻辑**：

```javascript
/**
 * 更新 .gitignore 文件
 */
async function updateGitignore(projectPath) {
  const gitignorePath = `${projectPath}/.gitignore`;
  const ignoreEntry = '.CodeReview/';
  
  // 1. 检查 .gitignore 是否存在
  // 2. 读取 .gitignore 内容
  // 3. 检查是否已包含 .CodeReview 配置
  // 4. 如果不存在，追加配置
  
  const fs = require('fs');
  
  if (!fs.existsSync(gitignorePath)) {
    // 创建新的 .gitignore 文件
    fs.writeFileSync(gitignorePath, `# 代码审查结果\n${ignoreEntry}\n`);
    console.log('✅ 已创建 .gitignore 文件并添加 .CodeReview 配置');
    return;
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf-8');
  
  if (content.includes('.CodeReview')) {
    console.log('ℹ️  .gitignore 已包含 .CodeReview 配置');
    return;
  }
  
  // 追加配置到 .gitignore
  const newContent = content.trimEnd() + `\n\n# 代码审查结果\n${ignoreEntry}\n`;
  fs.writeFileSync(gitignorePath, newContent);
  console.log('✅ 已在 .gitignore 中添加 .CodeReview 配置');
}
```

### 4.4 存储操作命令

评审完成后执行以下操作：

```bash
# 步骤 1: 创建存储目录
mkdir -p .CodeReview

# 步骤 2: 保存评审报告（使用当前时间戳）
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
echo "$REVIEW_CONTENT" > ".CodeReview/review-${TIMESTAMP}.md"

# 步骤 3: 检查并更新 .gitignore
if [ ! -f .gitignore ]; then
  echo -e "# 代码审查结果\n.CodeReview/" > .gitignore
elif ! grep -q ".CodeReview" .gitignore; then
  echo -e "\n# 代码审查结果\n.CodeReview/" >> .gitignore
fi

echo "✅ 评审报告已保存至: .CodeReview/review-${TIMESTAMP}.md"
```

## 五、执行流程

### 4.1 完整执行步骤

```
用户请求代码评审
    │
    ├─ 1. 环境检查
    │   ├─ 检查是否在 git 仓库中
    │   ├─ 获取当前分支信息
    │   └─ 确认工作目录
    │
    ├─ 2. 询问 Diff 模式
    │   ├─ 工作区变更 (git diff)
    │   ├─ 暂存区变更 (git diff --cached)
    │   ├─ 所有变更 (git diff HEAD)
    │   ├─ 分支间差异 (需要指定分支)
    │   └─ 最近提交变更 (需要指定数量)
    │
    ├─ 3. 获取 Diff 内容
    │   ├─ 执行 git diff 命令
    │   ├─ 获取变更文件列表
    │   └─ 统计变更行数
    │
    ├─ 4. 读取书写规范 ⭐ 新增步骤
    │   ├─ 读取 书写规范.md 文件
    │   ├─ 解析编码规范内容
    │   └─ 作为评审标准参考
    │
    ├─ 5. 代码分析
    │   ├─ 按文件类型分类
    │   ├─ 解析变更内容
    │   └─ 提取代码上下文
    │
    ├─ 6. 执行评审
    │   ├─ 代码规范检查（对照书写规范）
    │   ├─ 最佳实践检查
    │   ├─ 潜在问题检查
    │   ├─ 性能优化检查
    │   ├─ 安全问题检查
    │   └─ 可维护性检查
    │
    ├─ 7. 生成报告
    │   ├─ 汇总评审结果
    │   ├─ 按严重程度分类
    │   ├─ 生成改进建议
    │   └─ 输出评审报告
    │
    ├─ 8. 保存评审结果 ⭐ 自动存储
    │   ├─ 创建 .CodeReview 目录
    │   ├─ 生成评审报告文件
    │   └─ 更新 .gitignore 配置
    │
    └─ 9. 提供后续操作建议
        ├─ 是否需要修复问题
        ├─ 是否需要查看详细说明
        └─ 是否需要生成 commit message
```

### 5.2 交互式选项

在评审完成后，提供以下交互选项：

```javascript
const postReviewActions = [
  {
    key: 'fix',
    label: '帮我修复问题',
    action: '根据评审结果自动修复可修复的问题'
  },
  {
    key: 'explain',
    label: '详细解释问题',
    action: '对某个问题进行详细解释和示例说明'
  },
  {
    key: 'commit-msg',
    label: '生成 commit message',
    action: '根据变更内容生成规范的 commit message'
  },
  {
    key: 'export',
    label: '导出评审报告',
    action: '将评审报告导出为 Markdown 文件'
  }
];
```

## 六、使用示例

### 示例 1：查看当前工作区变更并评审

**用户输入**：
```
帮我评审当前项目的代码变更
```

**执行流程**：
1. 检查当前在 git 仓库中
2. 默认执行 `git diff HEAD` 查看所有未提交变更
3. 分析变更内容
4. 执行多维度评审
5. 输出评审报告
6. **自动保存评审结果到 `.CodeReview` 目录**
7. **自动更新 `.gitignore` 配置**

### 示例 2：查看分支间差异并评审

**用户输入**：
```
对比 feature/user-module 和 develop 分支的差异并评审
```

**执行流程**：
1. 执行 `git diff feature/user-module develop`
2. 分析分支间差异
3. 执行代码评审
4. 输出评审报告
5. **自动保存评审结果到 `.CodeReview` 目录**
6. **自动更新 `.gitignore` 配置**

### 示例 3：查看最近提交并评审

**用户输入**：
```
评审最近 3 次提交的代码
```

**执行流程**：
1. 执行 `git diff HEAD~3 HEAD`
2. 分析最近 3 次提交的变更
3. 执行代码评审
4. 输出评审报告
5. **自动保存评审结果到 `.CodeReview` 目录**
6. **自动更新 `.gitignore` 配置**

## 七、注意事项

### 7.1 执行限制

- **仅在当前项目目录执行**：不会跨目录或跨仓库执行
- **只读操作**：默认只查看 diff，不自动修改代码
- **敏感信息保护**：评审时会检测并提醒敏感信息泄露

### 7.2 最佳实践建议

1. **提交前评审**：建议在每次 commit 前执行代码评审
2. **分支对比**：PR 前使用分支间差异评审
3. **持续改进**：根据评审结果持续优化代码质量
4. **团队规范**：可根据团队规范自定义评审规则

## 八、详细规范参考

> **重要说明**：所有代码规范内容均参考项目根目录下的 `书写规范.md` 文件。
> 
> 在执行代码评审时，**必须**先使用 `read_file` 工具读取 `./书写规范.md` 文件，获取完整的编码规范作为评审标准。
> 
> `书写规范.md` 文件包含以下规范章节：
> 
> | 章节 | 内容概述 |
> |------|----------|
> | 一、命名规范 | 变量、常量、函数、类、接口、类型别名、枚举、文件命名规范 |
> | 二、变量声明 | const/let/var 使用优先级、初始化、链式声明 |
> | 三、数据类型 | 原始类型、数组、对象、元组、联合类型、交叉类型、字面量类型 |
> | 四、函数 | 函数声明方式、参数默认值、可选参数、剩余参数、函数重载、异步函数 |
> | 五、类与对象 | 类结构、继承、抽象类、接口实现、访问器 |
> | 六、接口与类型别名 | 接口定义、只读属性、索引签名、接口继承、type vs interface |
> | 七、泛型 | 泛型函数、泛型接口、泛型类、泛型约束、条件类型、映射类型 |
> | 八、模块化 | 导出/导入规范、命名导出、默认导出、类型导入 |
> | 九、异步编程 | Promise、async/await、并行执行、竞争执行、批量处理 |
> | 十、错误处理 | try-catch、抛出错误、自定义错误、可选链和空值合并 |
> | 十一、注释规范 | JSDoc 注释、单行注释、多行注释、特殊标记 |
> | 十二、代码组织 | 文件头部、导入顺序、代码结构顺序 |
> | 十三、性能优化 | 防抖、节流、惰性初始化、缓存/记忆化 |
> | 十四、最佳实践 | const 断言、可选链、空值合并、类型守卫、枚举、解构赋值等 |

## 九、评审规则扩展

### 9.1 自定义规则

支持根据项目特点自定义评审规则：

```javascript
const customRules = {
  // 项目特定规则
  projectRules: [
    {
      id: 'no-console',
      pattern: /console\.(log|warn|error)/,
      message: '生产代码中不应包含 console 语句',
      severity: 'warning'
    },
    {
      id: 'no-debugger',
      pattern: /debugger/,
      message: '生产代码中不应包含 debugger 语句',
      severity: 'error'
    }
  ],
  
  // 团队规范
  teamStandards: {
    maxLineLength: 120,
    maxFunctionLength: 50,
    maxFileLength: 300,
    namingConvention: {
      variable: 'camelCase',
      constant: 'UPPER_SNAKE_CASE',
      component: 'PascalCase',
      file: 'kebab-case'
    }
  }
};
```

### 9.2 规则优先级

```
严重问题 (Error) > 警告 (Warning) > 建议 (Suggestion) > 信息 (Info)
```

## 八、总结

本 Skill 提供完整的 git diff 查看和代码评审功能：

1. **灵活的 Diff 模式**：支持多种场景的差异查看
2. **全面的评审维度**：从 6 个维度进行代码审查
3. **可操作的报告**：提供具体的问题位置和修改建议
4. **项目级安全**：仅在当前项目目录执行，避免误操作
5. **持续优化**：支持自定义规则，适应团队规范

使用本 Skill 可以有效提升代码质量，减少潜在问题，是代码提交前的得力助手。
