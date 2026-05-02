---
layout: page
title: AI Hot · 每日 AI 晨报
description: "Marginalia 的每日 AI 新闻汇编。每天 06:00 自动汇集前 24 小时的全网 AI 动态——模型发布、公司动态、研究论文、应用产品、行业观点、开源工具，分板块成稿。"
permalink: /ai-hot/
---

每天清晨 06:00 自动汇集前 24 小时的全网 AI 动态——来自官方博客、arXiv、Reddit、Hacker News、X，由大模型聚类去重、分板块成稿。

涵盖：🚀 模型发布 · 🏢 公司动态 · 🔬 研究论文 · 📱 应用产品 · 💭 行业观点 · ⚙️ 开源工具

---

{% assign ai_hot_posts = site.posts | where_exp: "p", "p.tags contains 'ai-hot'" %}
{% if ai_hot_posts.size == 0 %}
还没有发布过 AI 晨报。第一篇会在明天清晨自动出现。
{% else %}
<ol class="posts" role="list">
  {% for post in ai_hot_posts %}
  <li class="post-item">
    <aside class="margin-note">
      <time datetime="{{ post.date | date_to_xmlschema }}">
        <span class="m-y">{{ post.date | date: '%Y' }}</span>
        <span class="m-md">{{ post.date | date: '%m · %d' }}</span>
      </time>
    </aside>
    <article class="post-summary">
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      {% if post.excerpt %}<p class="excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 200 }}</p>{% endif %}
    </article>
  </li>
  {% endfor %}
</ol>
{% endif %}
