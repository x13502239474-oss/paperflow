# Paperflow｜纸间

一款本地优先的个人收件箱与归档流水线。它只负责接收碎片、分拣和记录去向，不试图成为另一个笔记系统。

## 功能

- 快速捕获文本和链接，粘贴纯 URL 时自动识别链接类型。
- 捕获时不发起网络请求、不显示确认弹窗。
- 分拣页支持拖拽到「稍后」「归档」「丢弃」区域。
- 键盘快捷键：`A` 归档、`S` 稍后、`D` 丢弃；`J/K` 保留为列表浏览快捷键扩展位。
- 自定义归档目的地。
- 归档记录可导出为 JSON。
- 本周捕获、归档和积压统计。
- 日间 / 夜间桌面主题。
- 所有数据保存在当前浏览器的 localStorage。

## 环境要求

- Node.js 18.18+（建议 Node.js 20 LTS）
- npm

## 运行

```bash
npm install
npm run dev
```

按终端提示打开本地地址，通常是 `http://localhost:5173`。

生产构建：

```bash
npm run build
npm run preview
```

## 数据存储在哪里？

数据只保存在当前浏览器、当前网站源（origin）的 `localStorage` 中：

| Key | 内容 |
| --- | --- |
| `paperflow.items.v1` | 收件箱条目及状态 |
| `paperflow.archive.v1` | 归档日志 |
| `paperflow.destinations.v1` | 自定义归档目的地 |
| `paperflow.theme.v1` | 主题偏好 |

清除浏览器站点数据会删除这些内容。不同浏览器、设备或 localhost / 部署域名之间不会自动同步。建议定期导出归档日志；当前版本没有全量备份 / 恢复入口。

## 导出归档记录

进入「归档记录」，点击「导出归档记录」。浏览器会下载类似 `paperflow-archive-2026-11-08.json` 的文件。

日志字段：

```json
{
  "itemId": "条目 ID",
  "destination": "归档目的地",
  "time": "ISO 8601 时间",
  "title": "条目标题"
}
```

## 目录结构

```text
paperflow/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── storage.ts
    └── styles.css
```

## 设计取舍：物理隐喻不干扰效率

1. **物理质感只做反馈，不做门槛。** 纸张、托盘和文件柜用 CSS 纹理、阴影与层级表达；不使用重型 3D 或长动画，避免捕获和分拣变慢。
2. **操作入口始终明确且可替代。** 拖拽是直觉入口，键盘 A/S/D 是高频入口；所有分拣桶也可点击对应快捷键完成动作，触屏窄屏下仍保留清晰按钮式区域。
3. **捕获路径优先于视觉表演。** 输入后一次提交即写入 localStorage 并清空输入，不抓取网页标题、不等待网络、不弹确认；托盘堆叠只是状态可视化，不阻塞数据写入。

## 下一阶段最值得增加的一个功能

**完整数据备份与恢复。** 允许将条目、目的地、主题和归档日志一次性导出为单个 JSON，并可从 JSON 恢复。因为 localStorage 是单设备数据，备份恢复比多端同步更符合当前产品边界。
