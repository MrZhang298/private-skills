#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function fail(message) {
  console.error(`[xmind-to-table] ${message}`);
  process.exit(1);
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node xmind-to-table.js <input.xmind> [output.md]');
    process.exit(0);
  }

  const inputPath = path.resolve(args[0]);
  const requestedOutputPath = args[1]
    ? path.resolve(args[1])
    : path.join(process.cwd(), 'tmp', `${path.parse(inputPath).name}-table.md`);

  return {
    inputPath,
    ...resolveOutputPaths(requestedOutputPath),
  };
}

function runCommand(command, args, errorMessage) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    fail(`${errorMessage}${details ? `\n${details}` : ''}`);
  }
}

function extractXmindArchive(inputPath, tempDir) {
  if (process.platform === 'win32') {
    const script = `Expand-Archive -LiteralPath '${inputPath.replace(/'/g, "''")}' -DestinationPath '${tempDir.replace(/'/g, "''")}' -Force`;
    runCommand('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], '无法解压 .xmind 文件');
    return;
  }

  runCommand('unzip', ['-oq', inputPath, '-d', tempDir], '无法解压 .xmind 文件，请确认系统已安装 unzip');
}

function readArchiveContent(inputPath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xmind-export-'));

  try {
    extractXmindArchive(inputPath, tempDir);

    const jsonPath = path.join(tempDir, 'content.json');
    const xmlPath = path.join(tempDir, 'content.xml');

    if (fs.existsSync(jsonPath)) {
      return { type: 'json', content: fs.readFileSync(jsonPath, 'utf8') };
    }

    if (fs.existsSync(xmlPath)) {
      return { type: 'xml', content: fs.readFileSync(xmlPath, 'utf8') };
    }

    fail('未在 .xmind 文件中找到 content.json 或 content.xml');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toPlainNotes(notes) {
  if (!notes) return '';
  if (typeof notes === 'string') return notes;
  if (typeof notes.plain === 'string') return notes.plain;
  if (notes.plain && typeof notes.plain.content === 'string') return notes.plain.content;
  if (Array.isArray(notes.plain && notes.plain.content)) return notes.plain.content.join('\n');
  if (Array.isArray(notes.realHTMLContent)) return notes.realHTMLContent.join('\n');
  return '';
}

function normalizeJsonSheets(rawContent) {
  const parsed = JSON.parse(rawContent);
  const sheets = Array.isArray(parsed) ? parsed : [parsed];

  return sheets.map((sheet, index) => ({
    sheetTitle: sheet.title || `Sheet ${index + 1}`,
    rootTopic: sheet.rootTopic || null,
  })).filter((sheet) => sheet.rootTopic);
}

function flattenJsonTopic(topic, context) {
  const title = (topic && topic.title ? String(topic.title).trim() : '') || '(untitled)';
  const parentTitle = context.parentTitle || '';
  const ancestorTitles = context.ancestorTitles || [];

  context.rows.push({
    sheet: context.sheetTitle,
    level: context.level,
    parent: parentTitle,
    title,
    path: [...ancestorTitles, title].join(' > '),
    ancestorTitles,
    labels: ensureArray(topic.labels).join(', '),
    markers: ensureArray(topic.markers).map((item) => item.markerId || item).join(', '),
    notes: toPlainNotes(topic.notes),
    link: topic.href || topic.link || '',
  });

  const childGroups = topic.children || {};
  const childTopics = [
    ...ensureArray(childGroups.attached),
    ...ensureArray(childGroups.detached),
    ...ensureArray(childGroups['floating-topics']),
    ...ensureArray(childGroups['summary-topics']),
  ];

  for (const child of childTopics) {
    flattenJsonTopic(child, {
      sheetTitle: context.sheetTitle,
      rows: context.rows,
      level: context.level + 1,
      parentTitle: title,
      ancestorTitles: [...ancestorTitles, title],
    });
  }
}

function parseXml(xml) {
  const root = { name: '#document', attrs: {}, children: [], text: '' };
  const stack = [root];
  const tokenRegex = /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<[^>]+>|[^<]+/g;
  let match;

  while ((match = tokenRegex.exec(xml))) {
    const token = match[0];

    if (token.startsWith('<!--') || token.startsWith('<?')) {
      continue;
    }

    if (token.startsWith('<![CDATA[')) {
      stack[stack.length - 1].text += token.slice(9, -3);
      continue;
    }

    if (token.startsWith('</')) {
      if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    if (token.startsWith('<')) {
      const selfClosing = token.endsWith('/>');
      const inner = token.slice(1, selfClosing ? -2 : -1).trim();
      const spaceIndex = inner.search(/\s/);
      const rawName = spaceIndex === -1 ? inner : inner.slice(0, spaceIndex);
      const name = rawName.split(':').pop();
      const attrText = spaceIndex === -1 ? '' : inner.slice(spaceIndex + 1);
      const attrs = {};
      const attrRegex = /([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(attrText))) {
        const attrName = attrMatch[1].split(':').pop();
        const attrValue = attrMatch[3] !== undefined ? attrMatch[3] : attrMatch[4] || '';
        attrs[attrName] = decodeXml(attrValue);
      }

      const node = { name, attrs, children: [], text: '' };
      stack[stack.length - 1].children.push(node);
      if (!selfClosing) {
        stack.push(node);
      }
      continue;
    }

    const text = decodeXml(token);
    if (text.trim()) {
      stack[stack.length - 1].text += text;
    }
  }

  return root;
}

function childElements(node, name) {
  return (node.children || []).filter((child) => child.name === name);
}

function firstChild(node, name) {
  return childElements(node, name)[0] || null;
}

function deepFind(node, predicate, results = []) {
  if (!node) return results;
  if (predicate(node)) {
    results.push(node);
  }
  for (const child of node.children || []) {
    deepFind(child, predicate, results);
  }
  return results;
}

function nodeText(node) {
  return decodeXml((node && node.text) || '').replace(/\s+/g, ' ').trim();
}

function notesFromXmlTopic(topicNode) {
  const notesNode = firstChild(topicNode, 'notes');
  if (!notesNode) return '';
  const plainNode = deepFind(notesNode, (node) => node.name === 'plain')[0];
  const htmlNode = deepFind(notesNode, (node) => node.name === 'html')[0];
  return nodeText(plainNode || htmlNode || notesNode);
}

function labelsFromXmlTopic(topicNode) {
  const labelsNode = firstChild(topicNode, 'labels');
  if (!labelsNode) return '';
  const labelNodes = childElements(labelsNode, 'label');
  return labelNodes.map((node) => nodeText(node)).filter(Boolean).join(', ');
}

function markersFromXmlTopic(topicNode) {
  const markerRefsNode = firstChild(topicNode, 'marker-refs');
  if (!markerRefsNode) return '';
  return childElements(markerRefsNode, 'marker-ref')
    .map((node) => node.attrs['marker-id'] || '')
    .filter(Boolean)
    .join(', ');
}

function childTopicsFromXmlTopic(topicNode) {
  const childrenNode = firstChild(topicNode, 'children');
  if (!childrenNode) return [];

  const topicContainers = childElements(childrenNode, 'topics');
  const results = [];

  for (const container of topicContainers) {
    for (const topic of childElements(container, 'topic')) {
      results.push(topic);
    }
  }

  return results;
}

function normalizeXmlSheets(rawContent) {
  const documentNode = parseXml(rawContent);
  const sheetNodes = deepFind(documentNode, (node) => node.name === 'sheet');

  return sheetNodes.map((sheetNode, index) => ({
    sheetTitle: nodeText(firstChild(sheetNode, 'title')) || `Sheet ${index + 1}`,
    rootTopic: firstChild(sheetNode, 'topic'),
  })).filter((sheet) => sheet.rootTopic);
}

function flattenXmlTopic(topicNode, context) {
  const title = nodeText(firstChild(topicNode, 'title')) || '(untitled)';
  const parentTitle = context.parentTitle || '';
  const ancestorTitles = context.ancestorTitles || [];

  context.rows.push({
    sheet: context.sheetTitle,
    level: context.level,
    parent: parentTitle,
    title,
    path: [...ancestorTitles, title].join(' > '),
    ancestorTitles,
    labels: labelsFromXmlTopic(topicNode),
    markers: markersFromXmlTopic(topicNode),
    notes: notesFromXmlTopic(topicNode),
    link: topicNode.attrs['xlink:href'] || topicNode.attrs.href || '',
  });

  for (const child of childTopicsFromXmlTopic(topicNode)) {
    flattenXmlTopic(child, {
      sheetTitle: context.sheetTitle,
      rows: context.rows,
      level: context.level + 1,
      parentTitle: title,
      ancestorTitles: [...ancestorTitles, title],
    });
  }
}

function normalizeRows(source) {
  const sheets = source.type === 'json'
    ? normalizeJsonSheets(source.content)
    : normalizeXmlSheets(source.content);

  if (sheets.length === 0) {
    fail('未解析到任何 Sheet 或主题节点');
  }

  const rows = [];

  for (const sheet of sheets) {
    if (source.type === 'json') {
      flattenJsonTopic(sheet.rootTopic, {
        sheetTitle: sheet.sheetTitle,
        rows,
        level: 1,
        parentTitle: '',
        ancestorTitles: [],
      });
    } else {
      flattenXmlTopic(sheet.rootTopic, {
        sheetTitle: sheet.sheetTitle,
        rows,
        level: 1,
        parentTitle: '',
        ancestorTitles: [],
      });
    }
  }

  return { rows, sheetCount: sheets.length };
}

function escapeCell(value) {
  return String(value == null ? '' : value)
    .replace(/\r?\n+/g, '<br>')
    .replace(/\|/g, '\\|')
    .trim();
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatHtmlCell(value) {
  return escapeHtml(value)
    .replace(/&lt;br&gt;/g, '<br>')
    .replace(/&lt;br\s*\/&gt;/g, '<br>');
}

function getDocumentTitle(inputPath) {
  return path.parse(inputPath).name || 'XMind Export';
}

function formatGeneratedTime(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function buildMarkdownMeta(inputPath) {
  return {
    title: getDocumentTitle(inputPath),
    generatedTime: formatGeneratedTime(),
  };
}

function resolveOutputPaths(requestedOutputPath) {
  const parsed = path.parse(requestedOutputPath);
  if (parsed.ext.toLowerCase() === '.html') {
    return {
      markdownOutputPath: path.join(parsed.dir, `${parsed.name}.md`),
      htmlOutputPath: requestedOutputPath,
    };
  }

  const baseName = parsed.ext ? parsed.name : parsed.base;
  return {
    markdownOutputPath: parsed.ext
      ? requestedOutputPath
      : path.join(parsed.dir, `${baseName}.md`),
    htmlOutputPath: path.join(parsed.dir, `${baseName}.html`),
  };
}

function renderHtmlDocument(title, bodyContent) {
  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${escapeHtml(title)}</title>`,
    '  <style>',
    '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 24px; color: #24292f; }',
    '    h1 { margin-bottom: 12px; }',
    '    ul { padding-left: 20px; margin-top: 0; }',
    '    table { border-collapse: collapse; width: 100%; }',
    '    th, td { border: 1px solid #d0d7de; padding: 8px; vertical-align: top; }',
    '    th { text-align: left; background: #f6f8fa; }',
    '    .align-center { text-align: center; }',
    '  </style>',
    '</head>',
    '<body>',
    bodyContent,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function detectCaseType(title) {
  const normalizedTitle = String(title || '').trim();
  const shortCodeMatch = normalizedTitle.match(/^(TC|CO|ST|EX)\s*[：:]/i);
  if (shortCodeMatch) {
    return shortCodeMatch[1].toUpperCase();
  }

  const localizedPrefixMap = [
    { pattern: /^【?用例标题】?\s*[：:]/, type: 'TC' },
    { pattern: /^【?前置条件】?\s*[：:]/, type: 'CO' },
    { pattern: /^【?(测试步骤|步骤)】?\s*[：:]/, type: 'ST' },
    { pattern: /^【?(预期结果|预期效果)】?\s*[：:]/, type: 'EX' },
  ];

  const matchedPrefix = localizedPrefixMap.find((item) => item.pattern.test(normalizedTitle));
  return matchedPrefix ? matchedPrefix.type : '';
}

function stripCasePrefix(title) {
  return String(title || '')
    .replace(/^(TC|CO|ST|EX)\s*[：:]\s*/i, '')
    .replace(/^【?用例标题】?\s*[：:]\s*/i, '')
    .replace(/^【?前置条件】?\s*[：:]\s*/i, '')
    .replace(/^【?(测试步骤|步骤)】?\s*[：:]\s*/i, '')
    .replace(/^【?(预期结果|预期效果)】?\s*[：:]\s*/i, '')
    .trim();
}

function joinCaseField(currentValue, nextValue) {
  if (!nextValue) return currentValue;
  if (!currentValue) return nextValue;
  return `${currentValue}<br><br>${nextValue}`;
}

function buildCompactRows(rows) {
  const compactRows = rows.map((row) => ({
    parent: row.parent,
    title: row.title,
    path: row.ancestorTitles.join(' > '),
    executed: '<input type="checkbox" />',
  }));

  for (let index = 1; index < compactRows.length; index += 1) {
    const previousRow = compactRows[index - 1];
    const currentRow = compactRows[index];

    if (currentRow.path === previousRow.path) {
      currentRow.path = '';
    }
    if (currentRow.parent === previousRow.parent) {
      currentRow.parent = '';
    }
    if (currentRow.title === previousRow.title) {
      currentRow.title = '';
    }
  }

  return compactRows;
}

function ensureTestCaseRecord(testCases, orderedIds, caseId, row, title) {
  if (!testCases.has(caseId)) {
    const moduleInfo = buildModuleInfo(row.ancestorTitles);
    testCases.set(caseId, {
      levelOneTitle: moduleInfo.levelOneTitle,
      levelTwoTitle: moduleInfo.levelTwoTitle,
      testCaseTitle: stripCasePrefix(title),
      precondition: '',
      steps: '',
      expectedResult: '',
    });
    orderedIds.push(caseId);
  }

  return testCases.get(caseId);
}

function buildModuleInfo(ancestorTitles) {
  const titles = ensureArray(ancestorTitles).filter(Boolean);
  if (titles.length === 0) {
    return { levelOneTitle: '', levelTwoTitle: '' };
  }

  const moduleTitles = titles.slice(1).filter((title) => !detectCaseType(title));
  if (moduleTitles.length === 0) {
    return { levelOneTitle: titles[0], levelTwoTitle: '' };
  }

  return {
    levelOneTitle: moduleTitles[0] || '',
    levelTwoTitle: moduleTitles.slice(1).join(' > '),
  };
}

function buildTestCases(rows) {
  const testCases = new Map();
  const orderedIds = [];

  for (const row of rows) {
    const caseType = detectCaseType(row.title);

    if (caseType === 'TC') {
      ensureTestCaseRecord(testCases, orderedIds, row.path, row, row.title);
      continue;
    }

    if (!caseType) {
      continue;
    }

    const tcIndex = [...row.ancestorTitles]
      .map((title) => detectCaseType(title))
      .lastIndexOf('TC');

    if (tcIndex === -1) {
      continue;
    }

    const tcTitle = row.ancestorTitles[tcIndex];
    const caseId = row.ancestorTitles.slice(0, tcIndex + 1).join(' > ');
    const record = ensureTestCaseRecord(testCases, orderedIds, caseId, row, tcTitle);
    const content = stripCasePrefix(row.title);

    if (caseType === 'CO') {
      record.precondition = joinCaseField(record.precondition, content);
    } else if (caseType === 'ST') {
      record.steps = joinCaseField(record.steps, content);
    } else if (caseType === 'EX') {
      record.expectedResult = joinCaseField(record.expectedResult, content);
    }
  }

  return orderedIds.map((id) => testCases.get(id));
}

function buildCaseDisplayRows(testCases) {
  return testCases.map((item) => ({
    levelOneTitle: item.levelOneTitle,
    levelTwoTitle: item.levelTwoTitle,
    testCaseTitle: item.testCaseTitle,
    precondition: item.precondition,
    steps: item.steps,
    expectedResult: item.expectedResult,
    executed: '<input type="checkbox" />',
  }));
}

function calculateRowSpans(displayRows) {
  const levelOneRowSpans = new Array(displayRows.length).fill(0);
  const levelTwoRowSpans = new Array(displayRows.length).fill(0);

  let groupStart = 0;
  while (groupStart < displayRows.length) {
    let groupEnd = groupStart + 1;
    while (
      groupEnd < displayRows.length &&
      displayRows[groupEnd].levelOneTitle === displayRows[groupStart].levelOneTitle
    ) {
      groupEnd += 1;
    }
    levelOneRowSpans[groupStart] = groupEnd - groupStart;

    let subGroupStart = groupStart;
    while (subGroupStart < groupEnd) {
      let subGroupEnd = subGroupStart + 1;
      while (
        subGroupEnd < groupEnd &&
        displayRows[subGroupEnd].levelTwoTitle === displayRows[subGroupStart].levelTwoTitle
      ) {
        subGroupEnd += 1;
      }
      levelTwoRowSpans[subGroupStart] = subGroupEnd - subGroupStart;
      subGroupStart = subGroupEnd;
    }

    groupStart = groupEnd;
  }

  return { levelOneRowSpans, levelTwoRowSpans };
}

function buildGenericMarkdownTable(rows, meta) {
  const displayRows = buildCompactRows(rows);
  const header = ['Parent', 'Title', 'Path', '是否执行'];
  const lines = [
    `# ${meta.title}`,
    '',
    `- 生成时间: ${meta.generatedTime}`,
    `- Rows: ${rows.length}`,
    '',
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
  ];

  for (const row of displayRows) {
    lines.push(`| ${[
      escapeCell(row.parent),
      escapeCell(row.title),
      escapeCell(row.path),
      row.executed,
    ].join(' | ')} |`);
  }

  return lines.join('\n') + '\n';
}

function buildTestCaseMarkdownTable(testCases, meta) {
  const displayRows = buildCaseDisplayRows(testCases);
  const { levelOneRowSpans, levelTwoRowSpans } = calculateRowSpans(displayRows);
  const lines = [
    `# ${meta.title}`,
    '',
    `- 生成时间: ${meta.generatedTime}`,
    `- 测试用例数量: ${testCases.length}`,
    '',
    '<table style="border-collapse: collapse; width: 100%;">',
    '  <thead>',
    '    <tr>',
      '      <th style="border: 1px solid #d0d7de; padding: 8px; text-align: left; background: #f6f8fa;">一级标题</th>',
      '      <th style="border: 1px solid #d0d7de; padding: 8px; text-align: left; background: #f6f8fa;">二级标题</th>',
      '      <th style="border: 1px solid #d0d7de; padding: 8px; text-align: left; background: #f6f8fa;">用例标题</th>',
      '      <th style="border: 1px solid #d0d7de; padding: 8px; text-align: left; background: #f6f8fa;">前置条件</th>',
      '      <th style="border: 1px solid #d0d7de; padding: 8px; text-align: left; background: #f6f8fa;">步骤</th>',
      '      <th style="border: 1px solid #d0d7de; padding: 8px; text-align: left; background: #f6f8fa;">预期结果</th>',
      '      <th style="border: 1px solid #d0d7de; padding: 8px; text-align: center; background: #f6f8fa;">是否执行</th>',

    '    </tr>',
    '  </thead>',
    '  <tbody>',
  ];

  for (let index = 0; index < displayRows.length; index += 1) {
    const row = displayRows[index];
    lines.push('    <tr>');

    if (levelOneRowSpans[index] > 0) {
      lines.push(`      <td rowspan="${levelOneRowSpans[index]}" style="border: 1px solid #d0d7de; padding: 8px; vertical-align: top;">${formatHtmlCell(row.levelOneTitle)}</td>`);
    }
    if (levelTwoRowSpans[index] > 0) {
      lines.push(`      <td rowspan="${levelTwoRowSpans[index]}" style="border: 1px solid #d0d7de; padding: 8px; vertical-align: top;">${formatHtmlCell(row.levelTwoTitle)}</td>`);
    }

    lines.push(`      <td style="border: 1px solid #d0d7de; padding: 8px; vertical-align: top;">${formatHtmlCell(row.testCaseTitle)}</td>`);
    lines.push(`      <td style="border: 1px solid #d0d7de; padding: 8px; vertical-align: top;">${formatHtmlCell(row.precondition)}</td>`);
    lines.push(`      <td style="border: 1px solid #d0d7de; padding: 8px; vertical-align: top;">${formatHtmlCell(row.steps)}</td>`);
    lines.push(`      <td style="border: 1px solid #d0d7de; padding: 8px; vertical-align: top;">${formatHtmlCell(row.expectedResult)}</td>`);
    lines.push(`      <td style="border: 1px solid #d0d7de; padding: 8px; vertical-align: top; text-align: center;">${row.executed}</td>`);
    lines.push('    </tr>');
  }

  lines.push('  </tbody>');
  lines.push('</table>');

  return lines.join('\n') + '\n';
}

function buildMarkdownTable(rows, meta) {
  const testCases = buildTestCases(rows);
  if (testCases.length > 0) {
    return buildTestCaseMarkdownTable(testCases, meta);
  }
  return buildGenericMarkdownTable(rows, meta);
}

function buildGenericHtmlTable(rows, meta) {
  const displayRows = buildCompactRows(rows);
  const bodyRows = displayRows.map((row) => [
    '    <tr>',
    `      <td>${formatHtmlCell(row.parent)}</td>`,
    `      <td>${formatHtmlCell(row.title)}</td>`,
    `      <td>${formatHtmlCell(row.path)}</td>`,
    '      <td class="align-center"><input type="checkbox" /></td>',
    '    </tr>',
  ].join('\n')).join('\n');

  return renderHtmlDocument(meta.title, [
    `  <h1>${escapeHtml(meta.title)}</h1>`,
    '  <ul>',
    `    <li>生成时间: ${escapeHtml(meta.generatedTime)}</li>`,
    `    <li>Rows: ${rows.length}</li>`,
    '  </ul>',
    '  <table>',
    '    <thead>',
    '      <tr>',
    '        <th>Parent</th>',
    '        <th>Title</th>',
    '        <th>Path</th>',
    '        <th class="align-center">是否执行</th>',
    '      </tr>',
    '    </thead>',
    '    <tbody>',
    bodyRows,
    '    </tbody>',
    '  </table>',
  ].join('\n'));
}

function buildTestCaseHtmlTable(testCases, meta) {
  const displayRows = buildCaseDisplayRows(testCases);
  const { levelOneRowSpans, levelTwoRowSpans } = calculateRowSpans(displayRows);
  const bodyRows = [];

  for (let index = 0; index < displayRows.length; index += 1) {
    const row = displayRows[index];
    bodyRows.push('    <tr>');

    if (levelOneRowSpans[index] > 0) {
      bodyRows.push(`      <td rowspan="${levelOneRowSpans[index]}">${formatHtmlCell(row.levelOneTitle)}</td>`);
    }
    if (levelTwoRowSpans[index] > 0) {
      bodyRows.push(`      <td rowspan="${levelTwoRowSpans[index]}">${formatHtmlCell(row.levelTwoTitle)}</td>`);
    }

    bodyRows.push(`      <td>${formatHtmlCell(row.testCaseTitle)}</td>`);
    bodyRows.push(`      <td>${formatHtmlCell(row.precondition)}</td>`);
    bodyRows.push(`      <td>${formatHtmlCell(row.steps)}</td>`);
    bodyRows.push(`      <td>${formatHtmlCell(row.expectedResult)}</td>`);
    bodyRows.push('      <td class="align-center"><input type="checkbox" /></td>');
    bodyRows.push('    </tr>');
  }

  return renderHtmlDocument(meta.title, [
    `  <h1>${escapeHtml(meta.title)}</h1>`,
    '  <ul>',
    `    <li>生成时间: ${escapeHtml(meta.generatedTime)}</li>`,
    `    <li>测试用例数量: ${testCases.length}</li>`,
    '  </ul>',
    '  <table>',
    '    <thead>',
    '      <tr>',
    '        <th>一级标题</th>',
    '        <th>二级标题</th>',
    '        <th>用例标题</th>',
    '        <th>前置条件</th>',
    '        <th>步骤</th>',
    '        <th>预期结果</th>',
    '        <th class="align-center">是否执行</th>',
    '      </tr>',
    '    </thead>',
    '    <tbody>',
    bodyRows.join('\n'),
    '    </tbody>',
    '  </table>',
  ].join('\n'));
}

function buildHtmlTable(rows, meta) {
  const testCases = buildTestCases(rows);
  if (testCases.length > 0) {
    return buildTestCaseHtmlTable(testCases, meta);
  }
  return buildGenericHtmlTable(rows, meta);
}

function main() {
  const { inputPath, markdownOutputPath, htmlOutputPath } = parseArgs(process.argv);

  if (!fs.existsSync(inputPath)) {
    fail(`输入文件不存在: ${inputPath}`);
  }

  if (path.extname(inputPath).toLowerCase() !== '.xmind') {
    fail(`输入文件不是 .xmind: ${inputPath}`);
  }

  const source = readArchiveContent(inputPath);
  const { rows, sheetCount } = normalizeRows(source);
  const meta = {
    inputPath,
    sheetCount,
    ...buildMarkdownMeta(inputPath),
  };
  const markdownContent = buildMarkdownTable(rows, meta);
  const htmlContent = buildHtmlTable(rows, meta);

  fs.mkdirSync(path.dirname(markdownOutputPath), { recursive: true });
  fs.writeFileSync(markdownOutputPath, markdownContent, 'utf8');
  fs.writeFileSync(htmlOutputPath, htmlContent, 'utf8');

  console.log(JSON.stringify({
    inputPath,
    markdownOutputPath,
    htmlOutputPath,
    sheetCount,
    rowCount: rows.length,
    sourceType: source.type,
  }, null, 2));
}

main();
