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

## SEO

启用了 `jekyll-seo-tag` + `jekyll-sitemap`：

- `<head>` 自动生成 OpenGraph / Twitter Card / canonical / `<meta description>` / JSON-LD（`BlogPosting` / `WebSite` schema）
- `/sitemap.xml` 由 jekyll-sitemap 自动生成，包含所有 posts 和 pages
- `/feed.xml` 由 jekyll-feed 提供
- `/robots.txt` 显式 `Allow: /` 并指向 sitemap

写新文章时，front matter 里加 `description:`（首选）或 `excerpt:` 给 SEO tag 用。`tags:` 和 `keywords:` 可选。

`showcases/<slug>/` 下的原始 HTML 文件 Jekyll 不处理，需在 `<head>` 里手动加 canonical / OG / description。模板见 `/tmp/inject-seo.py`（一次性脚本，按需重跑）。

## 本地预览（可选）

```bash
bundle install
bundle exec jekyll serve
```

不安装也行——push 后让 GitHub Pages 在线构建即可。
