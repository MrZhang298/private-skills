---
name: requirement-splitter
description: 根据Word或PDF类型的需求文档，自动分析并分离前后端需要工作的内容，生成清晰的分工表格。当用户提到"需求分析"、"前后端分工"、"分离前后端"、"需求拆解"、"分析需求文档"、"需求文档拆分"、"前后端任务分离"、"解析需求文档"、"拆分需求"时使用此 skill。
---

# 需求文档前后端分工分析 Skill

## 概述

本 Skill 用于解析 Word（.docx）或 PDF（.pdf）格式的需求文档，自动识别并分离前端和后端需要完成的工作内容，生成结构化的分工表格，帮助团队快速明确开发任务。

**支持操作系统**：macOS、Linux、Windows

## 功能特性

- ✅ 支持 Word（.docx）和 PDF（.pdf）格式需求文档
- ✅ 智能识别功能模块和业务场景
- ✅ 自动分离前端和后端开发任务
- ✅ 识别接口定义和数据交互
- ✅ 识别页面/组件开发需求
- ✅ 生成 Markdown/Excel 格式分工表格
- ✅ 支持自定义输出格式
- ✅ 跨平台支持（macOS/Linux/Windows）

## 环境准备

### 检测操作系统

在执行任何操作之前，首先检测用户的操作系统：

```bash
# macOS/Linux
uname -s
# 输出: Darwin (macOS) 或 Linux

# Windows (PowerShell)
$env:OS
# 输出: Windows_NT

# Windows (CMD)
echo %OS%
# 输出: Windows_NT

# 跨平台 Python 方式
python -c "import platform; print(platform.system())"
# 输出: Darwin / Linux / Windows
```

### 安装必要工具

#### macOS / Linux

```bash
# 安装 pandoc（如果未安装）
# macOS
brew install pandoc

# Linux (Ubuntu/Debian)
sudo apt-get install pandoc

# Linux (CentOS/RHEL)
sudo yum install pandoc

# 安装 Python 依赖
pip3 install python-docx pdfplumber openpyxl pandas pypdf
```

#### Windows

**方式一：使用 winget（推荐，Windows 10/11 内置）**

```powershell
# 安装 pandoc
winget install --id JohnMacFarlane.Pandoc -e

# 安装 Python（如果未安装）
winget install Python.Python.3.12
```

**方式二：使用 Chocolatey**

```powershell
# 如果未安装 Chocolatey，先安装
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 pandoc
choco install pandoc -y

# 安装 Python
choco install python -y
```

**方式三：手动安装**

1. **pandoc**: 访问 https://pandoc.org/installing.html 下载 Windows 安装包
2. **Python**: 访问 https://www.python.org/downloads/ 下载安装

**安装 Python 依赖（Windows）**

```powershell
# 使用 pip 安装依赖
pip install python-docx pdfplumber openpyxl pandas pypdf

# 如果 pip 不在 PATH 中，使用以下命令
python -m pip install python-docx pdfplumber openpyxl pandas pypdf
```

### 验证环境

```bash
# 验证 pandoc 安装
pandoc --version

# 验证 Python 安装
python --version
# 或
python3 --version

# 验证 Python 包
python -c "import docx; import pdfplumber; import openpyxl; import pandas; print('All packages installed!')"
```

## 使用流程

### 1. 接收需求文档

当用户提供需求文档时，首先确认文档格式：

```
用户输入示例：
- "帮我分析这个需求文档，分离前后端任务：requirement.docx"
- "分析这份PDF需求，拆分前后端工作内容"
```

### 2. 读取文档内容

#### 读取 Word 文档

**方式一：使用 pandoc（跨平台）**

```bash
# macOS / Linux
pandoc requirement.docx -o requirement.md

# Windows (PowerShell)
pandoc requirement.docx -o requirement.md

# Windows (CMD)
pandoc requirement.docx -o requirement.md

# 保留更多格式信息
pandoc --track-changes=all requirement.docx -o requirement.md
```

**方式二：使用 Python（跨平台，推荐）**

```python
import os
import platform
from docx import Document

def read_docx(file_path):
    """跨平台读取 Word 文档"""
    # 处理路径（Windows 路径兼容）
    file_path = os.path.normpath(file_path)
    
    doc = Document(file_path)
    content = []
    
    # 读取段落
    for para in doc.paragraphs:
        if para.text.strip():
            content.append(para.text)
    
    # 读取表格
    for table in doc.tables:
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells]
            content.append(" | " + " | ".join(row_data) + " |")
    
    return "\n".join(content)

# 使用示例
content = read_docx("requirement.docx")
print(content)
```

#### 读取 PDF 文档

**使用 pdfplumber（跨平台）**

```python
import os
import pdfplumber

def read_pdf(file_path):
    """跨平台读取 PDF 文档"""
    # 处理路径（Windows 路径兼容）
    file_path = os.path.normpath(file_path)
    
    content = []
    
    with pdfplumber.open(file_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            # 提取文本
            text = page.extract_text()
            if text:
                content.append(f"--- 第 {page_num} 页 ---")
                content.append(text)
            
            # 提取表格
            tables = page.extract_tables()
            for table in tables:
                content.append("\n表格内容:")
                for row in table:
                    row_text = " | ".join([str(cell) if cell else "" for cell in row])
                    content.append("| " + row_text + " |")
    
    return "\n".join(content)

# 使用示例
content = read_pdf("requirement.pdf")
print(content)
```

**备选方案：使用 pypdf（跨平台）**

```python
from pypdf import PdfReader

def read_pdf_pypdf(file_path):
    """使用 pypdf 读取 PDF"""
    reader = PdfReader(file_path)
    content = []
    
    for page_num, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        if text:
            content.append(f"--- 第 {page_num} 页 ---")
            content.append(text)
    
    return "\n".join(content)
```

### 3. 分析需求内容

使用 AI 模型分析需求文档，识别以下关键信息：

#### 3.1 识别功能模块

从文档中提取主要功能模块：

```javascript
// 功能模块识别关键词
const frontendKeywords = [
  "页面", "界面", "UI", "组件", "表单", "按钮", "列表", "弹窗", 
  "前端", "展示", "交互", "动画", "样式", "布局", "响应式",
  "路由", "状态管理", "视图", "渲染", "输入", "点击", "滚动",
  "筛选", "搜索", "排序", "分页", "上传", "下载", "预览"
];

const backendKeywords = [
  "接口", "API", "数据库", "存储", "查询", "增删改查", "CRUD",
  "后端", "服务", "逻辑", "计算", "处理", "验证", "权限",
  "缓存", "队列", "定时任务", "事务", "并发", "性能优化",
  "数据同步", "数据迁移", "导入导出", "报表", "统计"
];

const sharedKeywords = [
  "登录", "认证", "授权", "配置", "日志", "监控", "测试"
];

// 疑问点/争议识别关键词
const doubtKeywords = {
  ambiguous: [
    "待定", "TBD", "待确认", "暂定", "可能", "或者", "备选",
    "需要讨论", "待商榷", "不确定", "视情况"
  ],
  conflict: [
    "冲突", "矛盾", "不一致", "重复", "遗漏",
    "需确认", "存在争议", "有待澄清"
  ],
  missing: [
    "未说明", "未定义", "缺失", "缺少", "不详",
    "无具体说明", "未明确"
  ],
  technical: [
    "性能要求", "兼容性", "安全性", "扩展性", "并发量",
    "响应时间", "数据量", "缓存策略"
  ],
  frontend_specific: [
    "交互方式", "跳转逻辑", "异常处理", "边界情况",
    "空状态", "加载状态", "错误提示", "刷新机制",
    "表单校验规则", "数据格式", "UI 细节", "动效要求"
  ]
};
```

#### 3.2 识别疑问点和争议内容

在分析需求文档时，需要特别关注可能存在争议或需要澄清的内容：

```python
def analyze_doubts(document_content):
    """分析需求文档中的疑问点和争议内容"""
    
    doubts = {
        'ambiguous': [],      # 含糊不清的内容
        'conflict': [],       # 可能冲突的内容
        'missing': [],        # 缺失的关键信息
        'technical': [],      # 技术细节待确认
        'frontend_specific': []  # 前端相关疑问
    }
    
    # 分析规则示例
    analysis_rules = {
        'ambiguous': {
            'keywords': ['待定', 'TBD', '待确认', '暂定', '可能', '或者', '备选'],
            'description': '需求描述含糊或未最终确定'
        },
        'conflict': {
            'keywords': ['同时', '也需要', '还要'],
            'patterns': [
                r'(.+?)与(.+?)存在.*冲突',
                r'(.+?)与(.+?)不一致'
            ],
            'description': '需求之间可能存在矛盾或冲突'
        },
        'missing': {
            'checklist': [
                '错误处理方式',
                '空状态展示',
                '加载状态',
                '边界条件',
                '数据校验规则',
                '权限控制',
                '异常流程',
                '数据格式定义'
            ],
            'description': '需求文档中缺失的关键信息'
        },
        'technical': {
            'checklist': [
                '性能要求',
                '兼容性要求',
                '安全要求',
                '并发量预估',
                '响应时间要求',
                '数据量预估'
            ],
            'description': '需要技术确认的细节'
        },
        'frontend_specific': {
            'checklist': [
                '交互细节',
                '跳转逻辑',
                '表单校验规则',
                'UI 状态变化',
                '动效要求',
                '响应式适配',
                '错误提示文案'
            ],
            'description': '前端开发需要明确的细节'
        }
    }
    
    return doubts
```

#### 3.3 分析模板（含疑问点标注）

使用以下分析框架：

```
请分析以下需求文档，识别所有功能点，并将每个功能点拆分为前端任务和后端任务。
同时，请识别需求文档中可能存在争议或需要澄清的内容，并标注出来。

需求文档内容：
{document_content}

请按照以下格式输出：

## 功能模块分析

### 功能点 1: [功能名称]
**业务描述**: [简述该功能的业务目的]

| 类型 | 任务描述 | 技术要点 | 优先级 | 预估工时 | 疑问/争议 |
|------|---------|---------|--------|---------|---------|
| 前端 | ... | ... | P0/P1/P2 | ...h | ⚠️ 如有疑问标注 |
| 后端 | ... | ... | P0/P1/P2 | ...h | - |

### 功能点 2: [功能名称]
...

## ⚠️ 疑问点与争议内容汇总

### 🔴 高优先级疑问（必须在开发前确认）

| 序号 | 类型 | 所属模块 | 疑问描述 | 建议确认方式 | 负责确认人 |
|-----|------|---------|---------|------------|----------|
| 1 | 缺失信息 | 用户管理 | 未说明用户登录失败后的错误提示文案 | 与产品确认 | 产品经理 |
| 2 | 技术细节 | 文件上传 | 未明确文件上传大小限制和格式要求 | 与后端确认 | 后端开发 |

### 🟡 中优先级疑问（建议在开发前确认）

| 序号 | 类型 | 所属模块 | 疑问描述 | 建议确认方式 |
|-----|------|---------|---------|------------|
| ... | ... | ... | ... | ... |

### 🟢 低优先级疑问（可在开发过程中确认）

| 序号 | 类型 | 所属模块 | 疑问描述 |
|-----|------|---------|---------|
| ... | ... | ... | ... |

## 前端特别关注事项

### 需明确的交互细节
- [ ] 加载状态如何展示？
- [ ] 空状态如何展示？
- [ ] 错误提示如何展示？
- [ ] 表单校验规则是什么？

### 需明确的边界情况
- [ ] 数据为空时的处理？
- [ ] 网络异常时的处理？
- [ ] 超时如何处理？

## 接口定义

| 接口名称 | 请求方式 | 路径 | 前端参数 | 后端返回 | 备注 | 待确认项 |
|---------|---------|------|---------|---------|------|--------|
| ... | ... | ... | ... | ... | ... | ⚠️ 如有 |

## 数据结构

### 数据表设计
| 字段名 | 类型 | 说明 | 是否必填 | 待确认 |
|-------|------|------|---------|--------|
| ... | ... | ... | ... | ⚠️ 如有 |

## 前端页面/组件
| 页面/组件名 | 路由/位置 | 功能说明 | 关联接口 | 待确认细节 |
|------------|----------|---------|---------|----------|
| ... | ... | ... | ... | ⚠️ 如有 |

## 依赖关系
- [功能A] 依赖 [功能B]
- ...

## 注意事项
- ...
```

### 4. 生成分工表格

#### 4.1 Markdown 格式表格（含疑问点标注）

```markdown
# 需求文档分析报告 - 前后端分工

## 文档信息
- 文档名称：xxx
- 分析时间：2026-04-07
- 分析人：AI Assistant
- **疑问点数量**：8 个（其中高优先级 3 个）

## 一、功能模块分工总览

| 序号 | 功能模块 | 前端任务数 | 后端任务数 | 总工时预估 | 疑问点数 |
|-----|---------|-----------|-----------|-----------|---------|
| 1 | 用户管理 | 5 | 4 | 16h | ⚠️ 2 |
| 2 | 商品管理 | 8 | 6 | 24h | ⚠️ 3 |
| ... | ... | ... | ... | ... | ... |

## 二、⚠️ 疑问点与争议内容汇总

> 💡 **说明**：以下疑问点需要在开发前与相关人员进行确认，避免返工

### 🔴 高优先级疑问（必须在开发前确认）

| 序号 | 类型 | 所属模块 | 疑问描述 | 影响范围 | 建议确认方式 | 建议确认人 |
|-----|------|---------|---------|---------|------------|----------|
| 1 | 缺失信息 | 用户管理 | 登录失败时的错误提示文案未定义 | 前端UI实现 | 与产品确认错误提示规范 | 产品经理 |
| 2 | 技术细节 | 文件上传 | 未明确单个文件大小限制（建议20MB） | 前后端实现 | 与后端确认服务器配置 | 后端开发 |
| 3 | 交互细节 | 商品列表 | 批量删除时是否需要二次确认弹窗？ | 前端交互 | 与产品确认交互规范 | 产品经理 |

### 🟡 中优先级疑问（建议在开发前确认）

| 序号 | 类型 | 所属模块 | 疑问描述 | 影响范围 | 建议确认方式 |
|-----|------|---------|---------|---------|------------|
| 1 | 边界情况 | 用户列表 | 数据为空时是否展示空状态图？ | 前端UI | 与UI设计师确认 |
| 2 | 性能要求 | 商品搜索 | 搜索接口响应时间要求是多少？ | 后端实现 | 与产品确认性能指标 |
| 3 | 兼容性 | 整体项目 | 是否需要兼容IE浏览器？ | 前端实现 | 与产品确认兼容性要求 |

### 🟢 低优先级疑问（可在开发过程中确认）

| 序号 | 类型 | 所属模块 | 疑问描述 |
|-----|------|---------|---------|
| 1 | UI细节 | 登录页面 | 记住密码的勾选框样式 |
| 2 | 动效 | 列表页 | 列表项删除动画时长 |

## 三、前端特别关注事项

### 需明确的交互细节

| 功能模块 | 待确认项 | 当前状态 | 建议默认值 | 备注 |
|---------|---------|---------|----------|------|
| 用户登录 | 加载中状态展示 | ⚠️ 未定义 | 显示loading动画 | 建议确认 |
| 用户登录 | 登录失败提示方式 | ⚠️ 未定义 | Toast提示 | 建议确认 |
| 商品列表 | 空状态展示 | ⚠️ 未定义 | 显示空状态图 | 建议确认 |
| 商品列表 | 删除确认弹窗文案 | ⚠️ 未定义 | "确定删除吗？" | 建议确认 |

### 需明确的边界情况

| 场景 | 当前定义 | 疑问点 | 建议处理方式 |
|-----|---------|--------|-------------|
| 网络异常 | ⚠️ 未定义 | 如何提示用户？ | 显示网络异常提示页 |
| 接口超时 | ⚠️ 未定义 | 超时时间多久？ | 10秒后提示超时 |
| 数据格式错误 | ⚠️ 未定义 | 前端如何处理？ | 显示数据格式错误提示 |
| 并发操作 | ⚠️ 未定义 | 如何防止重复提交？ | 按钮置灰+防抖 |

### 需明确的技术细节

| 类型 | 待确认项 | 影响方 | 优先级 |
|-----|---------|--------|--------|
| 性能 | 列表数据量上限 | 前后端 | P1 |
| 性能 | 图片加载策略 | 前端 | P2 |
| 安全 | Token 过期时间 | 后端 | P1 |
| 安全 | XSS 防护策略 | 前端 | P2 |

## 四、详细分工

### 4.1 用户管理模块

#### 功能点：用户登录 ⚠️ 含疑问点

| 类型 | 任务项 | 详细描述 | 技术实现要点 | 优先级 | 预估工时 | 疑问/待确认 |
|------|-------|---------|-------------|--------|---------|-------------|
| 前端 | 登录页面开发 | 实现登录表单、记住密码、验证码展示 | 使用 React/Vue 组件，表单校验，状态管理 | P0 | 4h | ⚠️ 错误提示文案待确认 |
| 前端 | 登录状态管理 | Token 存储、登录态维护、自动刷新 | localStorage/cookie 管理，axios 拦截器 | P0 | 2h | - |
| 后端 | 登录接口开发 | 验证用户名密码，生成 Token | JWT 生成，密码加密比对，登录日志记录 | P0 | 3h | - |
| 后端 | 验证码接口 | 生成图形验证码 | 随机字符串生成，图片绘制，Redis 缓存 | P1 | 2h | - |

## 五、接口清单

| 序号 | 接口名称 | 方法 | 路径 | 前端负责 | 后端负责 | 状态 | 待确认项 |
|-----|---------|------|------|---------|---------|------|--------|
| 1 | 用户登录 | POST | /api/auth/login | 调用、处理响应 | 实现、验证 | 待开发 | ⚠️ 错误码定义 |
| 2 | 获取用户信息 | GET | /api/user/info | 调用、状态存储 | 查询、权限校验 | 待开发 | - |

## 六、前端页面/组件清单

| 序号 | 类型 | 名称 | 说明 | 关联接口 | 状态 | 待确认细节 |
|-----|------|------|------|---------|------|----------|
| 1 | 页面 | LoginPage | 登录页面 | /api/auth/login | 待开发 | ⚠️ 加载状态、错误提示 |
| 2 | 组件 | LoginForm | 登录表单组件 | - | 待开发 | ⚠️ 表单校验规则 |

## 七、开发依赖顺序

```
1. 【确认疑问】优先处理高优先级疑问点 → 输出确认结果
2. 后端：数据库设计 → 基础接口开发
3. 前端：搭建项目框架 → 公共组件开发
4. 并行：核心功能前后端开发
5. 联调：接口联调 → 功能测试
```

## 八、疑问确认追踪表

| 疑问ID | 描述 | 状态 | 确认人 | 确认时间 | 确认结果 |
|-------|------|------|--------|---------|---------|
| Q001 | 登录失败错误提示文案 | 🔴 待确认 | - | - | - |
| Q002 | 文件上传大小限制 | 🔴 待确认 | - | - | - |
| Q003 | 批量删除确认弹窗 | 🔴 待确认 | - | - | - |
| Q004 | 空状态展示方式 | 🟡 待确认 | - | - | - |
```

#### 4.2 Excel 格式表格（含疑问点Sheet）

使用 Python 生成 Excel 文件（跨平台）:

```python
import os
import platform
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side


def generate_excel_report(frontend_tasks, backend_tasks, api_list, doubts_list, output_path):
    """生成 Excel 格式的前后端分工表格（跨平台版本，含疑问点）"""
    
    # 规范化输出路径
    output_path = os.path.normpath(output_path)
    output_dir = os.path.dirname(output_path)
    
    # 确保输出目录存在
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    wb = Workbook()
    
    # 定义样式
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True, name="微软雅黑" if platform.system() == "Windows" else "Arial")
    normal_font = Font(name="微软雅黑" if platform.system() == "Windows" else "Arial", size=11)
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Sheet 1: 前端任务
    ws_frontend = wb.active
    ws_frontend.title = "前端任务"
    
    headers = ["序号", "功能模块", "任务项", "详细描述", "技术要点", "优先级", "预估工时", "状态", "负责人"]
    ws_frontend.append(headers)
    
    # 设置表头样式
    for col in range(1, len(headers) + 1):
        cell = ws_frontend.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
    
    # 添加前端任务数据
    for idx, task in enumerate(frontend_tasks, 1):
        row_data = [
            idx,
            task.get('module', ''),
            task.get('name', ''),
            task.get('description', ''),
            task.get('tech_points', ''),
            task.get('priority', ''),
            task.get('hours', ''),
            '待开发',
            task.get('owner', '')
        ]
        ws_frontend.append(row_data)
        
        # 设置单元格样式
        for col in range(1, len(row_data) + 1):
            cell = ws_frontend.cell(row=idx + 1, column=col)
            cell.font = normal_font
            cell.border = thin_border
            cell.alignment = Alignment(vertical='center', wrap_text=True)
    
    # Sheet 2: 后端任务
    ws_backend = wb.create_sheet("后端任务")
    ws_backend.append(headers)
    
    for col in range(1, len(headers) + 1):
        cell = ws_backend.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
    
    for idx, task in enumerate(backend_tasks, 1):
        row_data = [
            idx,
            task.get('module', ''),
            task.get('name', ''),
            task.get('description', ''),
            task.get('tech_points', ''),
            task.get('priority', ''),
            task.get('hours', ''),
            '待开发',
            task.get('owner', '')
        ]
        ws_backend.append(row_data)
        
        for col in range(1, len(row_data) + 1):
            cell = ws_backend.cell(row=idx + 1, column=col)
            cell.font = normal_font
            cell.border = thin_border
            cell.alignment = Alignment(vertical='center', wrap_text=True)
    
    # Sheet 3: 接口清单
    ws_api = wb.create_sheet("接口清单")
    api_headers = ["序号", "接口名称", "请求方法", "路径", "前端参数", "后端返回", "状态", "备注", "待确认项"]
    ws_api.append(api_headers)
    
    for col in range(1, len(api_headers) + 1):
        cell = ws_api.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
    
    for idx, api in enumerate(api_list, 1):
        row_data = [
            idx,
            api.get('name', ''),
            api.get('method', ''),
            api.get('path', ''),
            api.get('params', ''),
            api.get('response', ''),
            '待开发',
            api.get('remark', ''),
            api.get('doubt', '')  # 疑问点
        ]
        ws_api.append(row_data)
        
        for col in range(1, len(row_data) + 1):
            cell = ws_api.cell(row=idx + 1, column=col)
            cell.font = normal_font
            cell.border = thin_border
            cell.alignment = Alignment(vertical='center', wrap_text=True)
    
    # Sheet 4: 疑问点汇总（新增）
    ws_doubts = wb.create_sheet("⚠️ 疑问点汇总")
    
    # 定义疑问点样式
    high_fill = PatternFill(start_color="FFCDD2", end_color="FFCDD2", fill_type="solid")  # 红色背景
    medium_fill = PatternFill(start_color="FFF9C4", end_color="FFF9C4", fill_type="solid")  # 黄色背景
    low_fill = PatternFill(start_color="C8E6C9", end_color="C8E6C9", fill_type="solid")  # 绿色背景
    
    doubts_headers = ["序号", "优先级", "类型", "所属模块", "疑问描述", "影响范围", "建议确认方式", "建议确认人", "状态", "确认结果", "确认时间"]
    ws_doubts.append(doubts_headers)
    
    for col in range(1, len(doubts_headers) + 1):
        cell = ws_doubts.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
    
    for idx, doubt in enumerate(doubts_list, 1):
        row_data = [
            idx,
            doubt.get('priority', ''),  # 高/中/低
            doubt.get('type', ''),  # 缺失信息/技术细节/交互细节等
            doubt.get('module', ''),
            doubt.get('description', ''),
            doubt.get('impact', ''),
            doubt.get('confirm_method', ''),
            doubt.get('confirm_person', ''),
            '🔴 待确认',
            '',
            ''
        ]
        ws_doubts.append(row_data)
        
        # 根据优先级设置背景色
        priority = doubt.get('priority', '')
        fill = low_fill
        if '高' in priority:
            fill = high_fill
        elif '中' in priority:
            fill = medium_fill
        
        for col in range(1, len(row_data) + 1):
            cell = ws_doubts.cell(row=idx + 1, column=col)
            cell.font = normal_font
            cell.border = thin_border
            cell.alignment = Alignment(vertical='center', wrap_text=True)
            if col == 2:  # 优先级列
                cell.fill = fill
    
    # Sheet 5: 前端特别关注事项（新增）
    ws_frontend_focus = wb.create_sheet("前端特别关注")
    
    # 前端关注事项表头
    focus_headers = ["序号", "类型", "功能模块", "待确认项", "当前状态", "建议默认值", "备注"]
    ws_frontend_focus.append(focus_headers)
    
    for col in range(1, len(focus_headers) + 1):
        cell = ws_frontend_focus.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border
    
    # 前端关注事项数据
    frontend_focus_items = [
        {'type': '交互细节', 'module': '用户登录', 'item': '加载中状态展示', 'status': '⚠️ 未定义', 'default': '显示loading动画'},
        {'type': '交互细节', 'module': '用户登录', 'item': '登录失败提示方式', 'status': '⚠️ 未定义', 'default': 'Toast提示'},
        {'type': '交互细节', 'module': '商品列表', 'item': '空状态展示', 'status': '⚠️ 未定义', 'default': '显示空状态图'},
        {'type': '交互细节', 'module': '商品列表', 'item': '删除确认弹窗文案', 'status': '⚠️ 未定义', 'default': '"确定删除吗？"'},
        {'type': '边界情况', 'module': '通用', 'item': '网络异常处理', 'status': '⚠️ 未定义', 'default': '显示网络异常提示页'},
        {'type': '边界情况', 'module': '通用', 'item': '接口超时处理', 'status': '⚠️ 未定义', 'default': '10秒后提示超时'},
    ]
    
    for idx, item in enumerate(frontend_focus_items, 1):
        row_data = [
            idx,
            item.get('type', ''),
            item.get('module', ''),
            item.get('item', ''),
            item.get('status', ''),
            item.get('default', ''),
            item.get('remark', '')
        ]
        ws_frontend_focus.append(row_data)
        
        for col in range(1, len(row_data) + 1):
            cell = ws_frontend_focus.cell(row=idx + 1, column=col)
            cell.font = normal_font
            cell.border = thin_border
            cell.alignment = Alignment(vertical='center', wrap_text=True)
    
    # 调整列宽（所有 Sheet）
    for ws in [ws_frontend, ws_backend, ws_api, ws_doubts, ws_frontend_focus]:
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    cell_value = str(cell.value) if cell.value else ""
                    # 中文字符宽度计算
                    length = sum(2 if ord(c) > 127 else 1 for c in cell_value)
                    if length > max_length:
                        max_length = length
                except:
                    pass
            adjusted_width = min(max_length + 4, 60)
            ws.column_dimensions[column_letter].width = adjusted_width
        
        # 冻结首行
        ws.freeze_panes = 'A2'
    
    # 保存文件
    wb.save(output_path)
    print(f"Excel 文件已生成: {output_path}")
    return output_path


def get_default_output_dir():
    """获取默认输出目录（跨平台）"""
    system = platform.system()
    
    if system == "Windows":
        # Windows: 优先使用桌面，其次用户目录
        desktop = os.path.join(os.environ.get("USERPROFILE", "."), "Desktop")
        if os.path.exists(desktop):
            return desktop
        return os.environ.get("USERPROFILE", ".")
    elif system == "Darwin":  # macOS
        desktop = os.path.join(os.environ.get("HOME", "."), "Desktop")
        if os.path.exists(desktop):
            return desktop
        return os.environ.get("HOME", ".")
    else:  # Linux
        desktop = os.path.join(os.environ.get("HOME", "."), "Desktop")
        if os.path.exists(desktop):
            return desktop
        return os.environ.get("HOME", ".")


# 使用示例
if __name__ == "__main__":
    # 示例数据
    frontend_tasks = [
        {'module': '用户管理', 'name': '登录页面', 'description': '实现登录表单', 'tech_points': 'React + Form', 'priority': 'P0', 'hours': '4h', 'doubt': '⚠️ 错误提示文案待确认'},
        {'module': '用户管理', 'name': '用户列表', 'description': '展示用户列表', 'tech_points': 'Table + Pagination', 'priority': 'P0', 'hours': '6h'},
    ]
    
    backend_tasks = [
        {'module': '用户管理', 'name': '登录接口', 'description': '验证用户登录', 'tech_points': 'JWT + MySQL', 'priority': 'P0', 'hours': '3h'},
        {'module': '用户管理', 'name': '用户列表接口', 'description': '查询用户列表', 'tech_points': 'RESTful API', 'priority': 'P0', 'hours': '4h'},
    ]
    
    api_list = [
        {'name': '登录', 'method': 'POST', 'path': '/api/auth/login', 'params': 'username, password', 'response': 'token, userInfo', 'doubt': '⚠️ 错误码定义待确认'},
        {'name': '用户列表', 'method': 'GET', 'path': '/api/users', 'params': 'page, size', 'response': 'list, total'},
    ]
    
    # 疑问点数据
    doubts_list = [
        {'priority': '高', 'type': '缺失信息', 'module': '用户管理', 'description': '登录失败时的错误提示文案未定义', 'impact': '前端UI实现', 'confirm_method': '与产品确认错误提示规范', 'confirm_person': '产品经理'},
        {'priority': '高', 'type': '技术细节', 'module': '文件上传', 'description': '未明确单个文件大小限制', 'impact': '前后端实现', 'confirm_method': '与后端确认服务器配置', 'confirm_person': '后端开发'},
        {'priority': '中', 'type': '交互细节', 'module': '商品列表', 'description': '数据为空时是否展示空状态图', 'impact': '前端UI', 'confirm_method': '与UI设计师确认', 'confirm_person': 'UI设计师'},
        {'priority': '低', 'type': 'UI细节', 'module': '登录页面', 'description': '记住密码的勾选框样式', 'impact': '前端UI', 'confirm_method': '与UI设计师确认', 'confirm_person': 'UI设计师'},
    ]
    
    # 生成输出路径
    output_dir = get_default_output_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(output_dir, f"前后端分工表_{timestamp}.xlsx")
    
    # 生成 Excel
    generate_excel_report(frontend_tasks, backend_tasks, api_list, doubts_list, output_path)
```

### 5. 分析规则

#### 5.1 前端任务识别规则

以下内容通常属于前端任务：

| 类别 | 具体内容 |
|-----|---------|
| 页面开发 | 新建页面、页面布局、页面样式 |
| 组件开发 | UI 组件、业务组件、公共组件 |
| 交互实现 | 点击事件、表单提交、弹窗交互 |
| 数据展示 | 列表渲染、数据可视化、图表展示 |
| 状态管理 | 全局状态、页面状态、缓存管理 |
| 路由配置 | 路由定义、路由守卫、动态路由 |
| 表单处理 | 表单验证、数据收集、格式化 |
| 文件处理 | 文件上传预览、图片裁剪、导出 |
| 动画效果 | 过渡动画、加载动画、交互反馈 |

#### 5.2 后端任务识别规则

以下内容通常属于后端任务：

| 类别 | 具体内容 |
|-----|---------|
| 接口开发 | RESTful API、GraphQL 接口 |
| 数据库设计 | 表结构设计、索引优化、数据迁移 |
| 业务逻辑 | 数据处理、计算逻辑、业务规则 |
| 权限控制 | 身份认证、权限校验、角色管理 |
| 数据校验 | 参数验证、数据完整性校验 |
| 缓存设计 | Redis 缓存、缓存策略 |
| 定时任务 | 定时同步、定时清理、定时推送 |
| 第三方集成 | 支付接口、短信服务、消息推送 |
| 性能优化 | SQL 优化、接口性能、并发处理 |

#### 5.3 共同关注点

| 类别 | 前端关注 | 后端关注 |
|-----|---------|---------|
| 登录认证 | Token 存储、登录态管理 | Token 生成、身份验证 |
| 数据格式 | 数据展示格式、输入校验 | 数据结构设计、存储格式 |
| 错误处理 | 错误提示、异常捕获 | 异常处理、错误码定义 |
| 安全性 | XSS 防护、敏感信息脱敏 | SQL 注入防护、数据加密 |

#### 5.4 疑问点识别规则

**高优先级疑问（必须确认）**

| 类型 | 识别标准 | 示例 |
|-----|---------|------|
| 缺失关键信息 | 核心功能描述不完整 | 登录失败后的处理方式未说明 |
| 技术约束不明 | 性能/安全要求未定义 | 接口响应时间要求未说明 |
| 数据格式未定义 | 关键数据结构缺失 | 返回数据字段类型未定义 |
| 权限逻辑模糊 | 权限控制描述不清 | 谁可以删除数据？ |
| 接口定义缺失 | 前后端交互未明确 | 数据格式、字段名未定义 |

**中优先级疑问（建议确认）**

| 类型 | 识别标准 | 示例 |
|-----|---------|------|
| 边界情况 | 特殊场景未处理 | 数据为空时如何展示？ |
| 交互细节 | 用户操作细节缺失 | 按钮点击后是否需要确认？ |
| 异常流程 | 异常情况未说明 | 网络超时如何处理？ |
| 兼容性要求 | 浏览器/设备要求未定义 | 是否需要兼容 IE？ |

**低优先级疑问（可后续确认）**

| 类型 | 识别标准 | 示例 |
|-----|---------|------|
| UI细节 | 样式细节未定义 | 图标大小、颜色 |
| 动效要求 | 动画效果未定义 | 过渡动画时长 |
| 文案细节 | 文字内容未确定 | 按钮文案、提示文案 |

#### 5.5 前端特别关注疑问点清单

在分析需求文档时，前端需要特别关注以下问题：

**交互相关问题**

```markdown
- [ ] 按钮点击后是否有反馈（loading/disabled）？
- [ ] 表单提交后是否需要跳转？
- [ ] 列表是否支持下拉刷新？
- [ ] 是否有上拉加载更多？
- [ ] 返回按钮行为是什么？
- [ ] 弹窗关闭后数据是否需要刷新？
- [ ] 操作成功/失败后的提示方式？
```

**状态相关问题**

```markdown
- [ ] 页面初始加载状态如何展示？
- [ ] 数据加载中如何展示？
- [ ] 数据为空如何展示？
- [ ] 加载失败如何展示？
- [ ] 无权限时如何展示？
- [ ] 网络断开如何提示？
```

**表单相关问题**

```markdown
- [ ] 每个字段的校验规则是什么？
- [ ] 校验失败提示文案是什么？
- [ ] 是否支持实时校验？
- [ ] 提交时的 loading 状态？
- [ ] 提交成功后的行为？
- [ ] 提交失败后的行为？
- [ ] 是否有重置/清空功能？
```

**列表相关问题**

```markdown
- [ ] 默认排序规则是什么？
- [ ] 支持哪些筛选条件？
- [ ] 分页大小是多少？
- [ ] 是否支持多选/全选？
- [ ] 批量操作的确认方式？
- [ ] 删除是否有二次确认？
```

**文件相关的问题**

```markdown
- [ ] 文件大小限制是多少？
- [ ] 支持哪些文件格式？
- [ ] 文件数量限制是多少？
- [ ] 上传进度如何展示？
- [ ] 上传失败如何处理？
- [ ] 预览方式是什么？
```

### 6. 完整示例

#### 输入：需求文档片段

```
用户管理模块

1. 用户列表
   - 支持按用户名、手机号、状态筛选
   - 支持分页展示，每页显示 20 条
   - 列表字段：头像、用户名、手机号、注册时间、状态、操作
   - 操作按钮：查看详情、编辑、禁用/启用、删除

2. 新增用户
   - 表单字段：用户名（必填，4-20字符）、手机号（必填，11位）、
     邮箱（选填）、角色（必选，下拉选择）、状态（默认启用）
   - 用户名不能重复，实时校验
   - 提交前进行表单校验

3. 编辑用户
   - 复用新增用户表单
   - 预填现有数据
   - 可修改字段：手机号、邮箱、角色、状态
```

#### 输出：分工表格

```markdown
## 用户管理模块 - 前后端分工

### 功能点 1：用户列表

| 类型 | 任务项 | 详细描述 | 技术要点 | 优先级 | 预估工时 |
|------|-------|---------|---------|--------|---------|
| 前端 | 列表页面开发 | 实现用户列表展示 | 表格组件、分页组件 | P0 | 4h |
| 前端 | 筛选功能实现 | 搜索表单、筛选条件 | 表单联动、防抖搜索 | P1 | 2h |
| 前端 | 操作按钮实现 | 查看、编辑、禁用、删除 | 确认弹窗、状态切换 | P1 | 2h |
| 后端 | 用户列表接口 | 分页查询、筛选查询 | SQL 分页、条件拼接 | P0 | 3h |
| 后端 | 用户状态变更接口 | 禁用/启用用户 | 状态更新、操作日志 | P1 | 2h |
| 后端 | 用户删除接口 | 删除用户（软删除） | 逻辑删除、数据校验 | P1 | 2h |

### 功能点 2：新增用户

| 类型 | 任务项 | 详细描述 | 技术要点 | 优先级 | 预估工时 |
|------|-------|---------|---------|--------|---------|
| 前端 | 新增表单开发 | 表单布局、字段校验 | 表单组件、实时校验 | P0 | 3h |
| 前端 | 用户名重复校验 | 异步校验用户名 | 防抖请求、loading 状态 | P1 | 1h |
| 后端 | 新增用户接口 | 创建用户记录 | 数据校验、密码加密 | P0 | 3h |
| 后端 | 用户名校验接口 | 校验用户名是否重复 | 查询、返回校验结果 | P1 | 1h |

### 功能点 3：编辑用户

| 类型 | 任务项 | 详细描述 | 技术要点 | 优先级 | 预估工时 |
|------|-------|---------|---------|--------|---------|
| 前端 | 编辑表单开发 | 复用新增表单、数据回填 | 表单复用、数据初始化 | P0 | 2h |
| 后端 | 用户详情接口 | 获取用户信息 | 查询用户、返回详情 | P0 | 1h |
| 后端 | 更新用户接口 | 修改用户信息 | 数据更新、变更日志 | P0 | 2h |
```

## 执行说明

当用户请求分析需求文档时，按照以下步骤执行：

### Step 0: 环境检测与准备（跨平台）

首先检测操作系统和环境：

```javascript
// 环境检测逻辑
const os = require('os');
const platform = os.platform(); // 'darwin' | 'linux' | 'win32'

// 根据不同平台执行不同的检测命令
```

**macOS/Linux 检测命令：**

```bash
# 检测操作系统
echo "OS: $(uname -s)"

# 检测 pandoc
which pandoc && pandoc --version | head -1 || echo "pandoc 未安装"

# 检测 Python
which python3 && python3 --version || which python && python --version || echo "Python 未安装"

# 检测 Python 包
python3 -c "import docx, pdfplumber, openpyxl, pandas" 2>/dev/null && echo "Python 包已安装" || echo "需要安装 Python 包"
```

**Windows 检测命令：**

```powershell
# 检测操作系统
Write-Host "OS: $env:OS"

# 检测 pandoc
if (Get-Command pandoc -ErrorAction SilentlyContinue) {
    pandoc --version | Select-Object -First 1
} else {
    Write-Host "pandoc 未安装"
}

# 检测 Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    python --version
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    python3 --version
} else {
    Write-Host "Python 未安装"
}

# 检测 Python 包
try {
    python -c "import docx, pdfplumber, openpyxl, pandas" 2>$null
    Write-Host "Python 包已安装"
} catch {
    Write-Host "需要安装 Python 包"
}
```

如果环境未准备好，引导用户安装必要的工具（参见「环境准备」章节）。

### Step 1: 确认文档信息

1. 确认文档路径和格式
2. **处理路径格式**（Windows 使用反斜杠或正斜杠均可，Python 可自动处理）
3. 询问用户是否有特定的输出格式需求
4. 确认是否需要生成 Excel 文件

**路径处理示例：**

```python
import os
import platform

def normalize_path(file_path):
    """规范化文件路径，兼容所有操作系统"""
    # 展开用户目录（如 ~/Documents）
    file_path = os.path.expanduser(file_path)
    # 规范化路径分隔符
    file_path = os.path.normpath(file_path)
    # 转换为绝对路径
    file_path = os.path.abspath(file_path)
    return file_path

# Windows 示例
# 输入: "C:\Users\xxx\Documents\requirement.docx"
# 或输入: "C:/Users/xxx/Documents/requirement.docx"
# 都会被正确处理
```

### Step 2: 读取文档

根据文档格式选择合适的读取方式：
- Word 文档：使用 python-docx（跨平台推荐）或 pandoc
- PDF 文档：使用 pdfplumber 或 pypdf

### Step 3: 分析需求

使用 AI 分析框架，识别：
- 功能模块
- 前端任务
- 后端任务
- 接口定义
- 数据结构
- 页面组件

### Step 4: 生成输出

根据用户需求生成：
- Markdown 格式报告
- Excel 格式表格（可选）

**输出路径处理：**

```python
import os
from datetime import datetime

def get_output_path(filename, output_dir=None):
    """生成输出文件路径"""
    if output_dir is None:
        # 默认输出到用户桌面或当前目录
        if platform.system() == "Windows":
            output_dir = os.path.join(os.environ.get("USERPROFILE", "."), "Desktop")
        else:
            output_dir = os.path.join(os.environ.get("HOME", "."), "Desktop")
        
        # 如果桌面目录不存在，使用当前目录
        if not os.path.exists(output_dir):
            output_dir = "."
    
    # 添加时间戳避免覆盖
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name, ext = os.path.splitext(filename)
    output_filename = f"{name}_{timestamp}{ext}"
    
    return os.path.join(output_dir, output_filename)

# 使用示例
output_path = get_output_path("前后端分工表.xlsx")
print(f"输出文件: {output_path}")
```

### Step 5: 补充确认

询问用户是否需要：
- 调整任务优先级
- 补充遗漏的功能点
- 细化某个模块的分工

## 注意事项

1. **文档质量**：确保需求文档清晰完整，如果文档过于模糊，需要向用户确认
2. **业务背景**：如果对业务场景不熟悉，需要用户提供补充说明
3. **技术栈**：确认前后端技术栈，以便提供更准确的技术实现建议
4. **工时估算**：工时估算为参考值，实际工时需要根据团队情况调整
5. **依赖关系**：明确标注功能之间的依赖关系，便于安排开发顺序
6. **跨平台兼容**：注意路径分隔符、编码格式等跨平台差异
7. **编码问题**：Windows 默认使用 GBK 编码，处理中文时需注意

## 跨平台注意事项

### 路径处理

| 操作系统 | 路径分隔符 | 示例路径 |
|---------|-----------|---------|
| macOS/Linux | `/` | `/Users/xxx/Documents/file.docx` |
| Windows | `\` 或 `/` | `C:\Users\xxx\Documents\file.docx` |

**最佳实践**：使用 Python 的 `os.path` 或 `pathlib` 模块处理路径

```python
from pathlib import Path

# 跨平台路径处理
file_path = Path("Documents") / "requirement.docx"
# macOS/Linux: Documents/requirement.docx
# Windows: Documents\requirement.docx

# 使用 Path 对象
file_path = Path.home() / "Documents" / "requirement.docx"
```

### 编码处理

```python
# 跨平台文件读写（自动处理编码）
import locale
import sys

def get_default_encoding():
    """获取系统默认编码"""
    if sys.platform == "win32":
        return "utf-8"  # Windows 建议显式使用 utf-8
    return locale.getpreferredencoding() or "utf-8"

# 写入文件时指定编码
with open("output.md", "w", encoding="utf-8") as f:
    f.write(content)

# 读取文件时指定编码
with open("input.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

### 命令执行差异

| 操作 | macOS/Linux | Windows PowerShell | Windows CMD |
|-----|-------------|-------------------|-------------|
| 查看当前目录 | `pwd` | `pwd` 或 `Get-Location` | `cd` |
| 列出文件 | `ls` 或 `ls -la` | `ls` 或 `dir` | `dir` |
| 环境变量 | `echo $HOME` | `$env:HOME` 或 `$env:USERPROFILE` | `echo %USERPROFILE%` |
| 查找命令 | `which python` | `Get-Command python` | `where python` |

## 故障排除

### macOS/Linux 常见问题

1. **权限问题**
   ```bash
   # 修复文件权限
   chmod 755 script.py
   
   # 修复目录权限
   sudo chown -R $(whoami) /usr/local/lib/python3.x
   ```

2. **pandoc 未找到**
   ```bash
   # 确认安装路径
   which pandoc
   # 如果使用 Homebrew 安装但找不到
   brew link pandoc
   ```

### Windows 常见问题

1. **Python 不在 PATH 中**
   ```powershell
   # 方法一：使用完整路径
   & "C:\Python312\python.exe" script.py
   
   # 方法二：添加到 PATH（需要管理员权限）
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Python312", "Machine")
   ```

2. **pandoc 未找到**
   ```powershell
   # 检查安装路径
   Get-Command pandoc -ErrorAction SilentlyContinue
   
   # 如果已安装但不在 PATH 中，添加到 PATH
   $env:Path += ";C:\Program Files\Pandoc"
   ```

3. **编码错误**
   ```python
   # 在 Python 脚本开头添加
   import sys
   sys.stdout.reconfigure(encoding='utf-8')
   ```

4. **PowerShell 执行策略限制**
   ```powershell
   # 临时允许运行脚本
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

5. **长路径限制（Windows 10 之前）**
   ```powershell
   # 启用长路径支持（需要管理员权限）
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
       -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

## 依赖工具

- **pandoc**: Word 文档转换（可选，有 Python 库可替代）
- **python-docx**: Word 文档读取
- **pdfplumber**: PDF 文档读取
- **openpyxl**: Excel 文件生成
- **pandas**: 数据处理
- **pypdf**: PDF 读取备选方案

### 安装依赖

**macOS / Linux:**
```bash
pip3 install python-docx pdfplumber openpyxl pandas pypdf
```

**Windows:**
```powershell
pip install python-docx pdfplumber openpyxl pandas pypdf

# 或使用 python -m pip
python -m pip install python-docx pdfplumber openpyxl pandas pypdf
```

**验证安装：**
```bash
# macOS/Linux/Windows 通用
python -c "import docx, pdfplumber, openpyxl, pandas; print('所有依赖已安装！')"
```
