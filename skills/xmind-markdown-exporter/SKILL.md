---
name: xmind-markdown-exporter
description: 读取 `.xmind` 脑图文件并导出为 Markdown/HTML 表格文件。适用于用户提到 XMind、脑图、`.xmind`、思维导图导出、XMind 转 Markdown、XMind 转表格、读取 xmind 文件、导出 md/html 表格等场景。执行时使用同目录下的 JavaScript 脚本解析 XMind 数据，并同时产出 `.md` 和 `.html` 文件。
---

# XMind 转 Markdown/HTML 表格 Skill

## 适用场景

当用户希望你处理 `.xmind` 文件，并且要求：

- 读取脑图结构
- 提取节点标题、层级、父子关系
- 导出为表格
- 生成 `.md` 和 `.html` 文件

就使用这个 skill。

## 输出要求

始终同时输出一个 Markdown 文件和一个 HTML 文件，内容都必须是表格。

默认输出规则：

- 输出目录：优先使用项目根目录下的 `tmp/`
- 输出文件名：默认同时生成 `<xmind文件名>-table.md` 和 `<xmind文件名>-table.html`
- Markdown 标题使用 XMind 文件名（不含 `.xmind` 后缀）
- 顶部元信息仅保留 `生成时间`
- 若识别到测试用例结构（如 `【用例标题】/TC`、`【前置条件】/CO`、`【步骤】/ST`、`【预期结果】/EX`），优先输出：`一级标题`、`二级标题`、`用例标题`、`前置条件`、`步骤`、`预期结果`
- 为实现相同内容真正合并单元格，测试用例结构会输出为嵌入在 `.md` 中的 HTML 表格，并使用 `rowspan`
- HTML 表格默认带边框、内边距和表头底色，便于直接阅读
- 若不是测试用例脑图，则回退为通用表格导出
- 【用例标题】/TC 父级为二级标题，【用例标题】/TC 父级的父级为一级标题

如果用户指定了输出路径或文件名，按用户要求执行。

## 执行步骤

### 1. 确认输入文件

要求输入为 `.xmind` 文件路径。

示例：

```text
帮我读取这个 xmind：/path/to/demo.xmind，并输出 md 表格
```

### 2. 生成输出路径

如果用户没有指定输出路径，按以下规则生成：

```javascript
const path = require('path');

function buildOutputPaths(inputPath) {
  const parsed = path.parse(inputPath);
  return {
    markdownOutputPath: path.join(process.cwd(), 'tmp', `${parsed.name}-table.md`),
    htmlOutputPath: path.join(process.cwd(), 'tmp', `${parsed.name}-table.html`),
  };
}
```

### 3. 执行脚本

运行同目录脚本：

```bash
node skills/xmind-markdown-exporter/scripts/xmind-to-table.js <input.xmind> <output.md>
```

说明：脚本会基于输出文件名同目录额外生成一个同名 `.html` 文件。

如果当前目录不是项目根目录，先切换到项目根目录再执行。

### 4. 校验结果

执行完成后，确认：

- 成功读取到 XMind 节点
- 成功生成 `.md` 文件
- 成功生成 `.html` 文件
- 输出内容为表格

### 5. 向用户反馈

反馈时至少包含：

- 输入文件路径
- 输出文件路径（Markdown/HTML）
- 导出节点数量

## 脚本能力说明

脚本位置：`skills/xmind-markdown-exporter/scripts/xmind-to-table.js`

脚本能力：

- 自动解压 `.xmind` 文件
- 优先解析 `content.json`
- 兼容解析 `content.xml`
- 展平脑图节点为表格行
- 自动识别 `【用例标题】/TC`、`【前置条件】/CO`、`【步骤】/ST`、`【预期结果】/EX` 测试用例结构并聚合字段
- 自动拆分一级标题、二级标题
- 对相同标题生成真正的合并单元格（HTML `rowspan`）
- 生成适合测试用例阅读的 Markdown/HTML 混合表格文件
- 同时输出可直接浏览器打开的 HTML 文件
- 支持 macOS / Linux / Windows

## 表格格式

输出文件内容示例：

```markdown
# demo

- 生成时间: 2026-04-16 10:30:00

<table>
  <thead>
    <tr>
      <th>一级标题</th>
      <th>二级标题</th>
      <th>用例标题</th>
      <th>前置条件</th>
      <th>步骤</th>
      <th>预期结果</th>
      <th>是否执行</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">一级功能模块A</td>
      <td rowspan="2">二级功能点A-1</td>
      <td>测试用例A-01</td>
      <td>满足基础前置条件</td>
      <td>1.执行步骤一；2.执行步骤二；3.查看结果</td>
      <td>结果符合预期</td>
      <td><input type="checkbox" /></td>
    </tr>
    <tr>
      <td>测试用例A-02</td>
      <td>满足另一组前置条件</td>
      <td>1.执行另一组步骤；2.观察页面反馈</td>
      <td>系统正确处理并提示成功</td>
      <td><input type="checkbox" /></td>
    </tr>
  </tbody>
</table>
```

## 注意事项

- `.xmind` 本质上是压缩包，脚本会先解压再读取内容。
- 若文件是较老的 XMind 格式，脚本会尝试读取 `content.xml`。
- 表格中的换行会被转成 `<br>`，避免破坏 Markdown 表格结构。
- 当节点标题为空时，脚本会自动填充为 `(untitled)`。

## 故障处理

### 找不到输入文件

提示输入文件不存在，并停止执行。

### 输出目录不存在

自动创建输出目录。

### 解析失败

优先检查：

- 文件是否真的是 `.xmind`
- 文件是否损坏
- 系统是否可用 `unzip`（macOS/Linux）或 PowerShell `Expand-Archive`（Windows）

## 推荐回复模板

```text
已完成 XMind 解析，并生成 Markdown/HTML 表格文件。
- 输入文件：<input.xmind>
- Markdown 输出：<output.md>
- HTML 输出：<output.html>
- 导出节点数：<count>
```
