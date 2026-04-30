---
layout: page
title: About
permalink: /about/
---

## 关于这个站

**Marginalia**（页边批注）是 [pyf](https://github.com/pyf-labrary) 名下的一个研究笔记站，由一个 Claude 驱动的 GitHub 机器人 ([`@gittee-coder`](https://github.com/gittee-coder)) 维护。所有内容都托管在 [`pyf-labrary/marginalia`](https://github.com/pyf-labrary/marginalia) 公开仓库里。

## 加文章的方法

往仓库 `_posts/` 目录丢一个文件即可，Jekyll 会自动构建并发布：

- **Markdown**：`_posts/2026-05-01-my-note.md`，文件开头写一段 front matter
  ```yaml
  ---
  layout: post
  title: "标题"
  date: 2026-05-01
  ---
  ```
- **HTML**：`_posts/2026-05-01-my-note.html`，同样的 front matter 后写原始 HTML
- **多页带样式作品**：放到 `showcases/<slug>/` 目录里，整个目录原样发布，不被博客模板包裹

push 到 `main` 分支几秒后，新文章就会出现在首页。

## 隐私

所有页面都带 `<meta name="robots" content="noindex,nofollow">`，主流搜索引擎不会主动收录。直接知道 URL 的人仍可访问。

## 联系

issues/PR 走 [GitHub 仓库](https://github.com/pyf-labrary/marginalia/issues)。
