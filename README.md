# Marginalia

研究笔记 + 多页作品集站点。基于 Jekyll + GitHub Pages。

**站点**：https://pyf-labrary.github.io/marginalia/

## 目录结构

```
_posts/                         单篇文章（.md 或 .html，文件名 YYYY-MM-DD-slug.ext）
showcases/<slug>/               多页作品集，整目录原样发布，不被 Jekyll 模板包裹
_includes/custom-head.html      站点级 <head> 注入（含 noindex 元标记）
_config.yml                     站点配置
index.md / about.md / showcases.md  导航页
```

## 加文章

1. 在 `_posts/` 新建文件 `YYYY-MM-DD-some-title.md`
2. 顶部 front matter：
   ```yaml
   ---
   layout: post
   title: "标题"
   date: 2026-05-01
   tags: [tag1, tag2]
   ---
   ```
3. 写正文（Markdown 或 HTML 同样支持，扩展名分别用 `.md` / `.html`）
4. `git push` 到 `main`，约 30–90 秒后上线

## 加多页 showcase

整个目录扔到 `showcases/<slug>/` 下，包含 `index.html` + 子页 + `assets/`。然后到 `showcases.md` 加一条入口链接。

## 隐私

所有页面带 `<meta name="robots" content="noindex,nofollow">`。直链可访问，搜索引擎不主动收录。

## 本地预览（可选）

```bash
bundle install
bundle exec jekyll serve
```

不安装也行——push 后让 GitHub Pages 在线构建即可。
