---
layout: default
title: Videos
description: "Marginalia 视频专栏——AI 周报与解释类视频。脚本生成、TTS 配音、Remotion 动效、AI B-roll，电视新闻播报感。"
permalink: /videos/
---

<style>
  /* —— dark cinema chrome (only on this page) —— */
  body { background: #0a0a0e; }
  body::before {
    background: linear-gradient(90deg, #8b2e2a 0, #8b2e2a 28%, #1a1a22 28%) !important;
  }
  .site-header {
    background: rgba(10, 10, 14, 0.78) !important;
    border-bottom-color: rgba(245, 239, 225, 0.08) !important;
  }
  .site-header .brand { color: #f5efe1 !important; }
  .site-header .brand-mark { color: #d97570 !important; }
  .site-header .brand-tag { color: rgba(245, 239, 225, 0.55) !important; }
  .site-header .site-nav a { color: rgba(245, 239, 225, 0.78) !important; }
  .site-header .site-nav a:hover { color: #d97570 !important; }
  .site-footer {
    background: #0a0a0e;
    color: rgba(245, 239, 225, 0.55);
    border-top: 1px solid rgba(245, 239, 225, 0.08);
  }
  .site-footer a { color: rgba(245, 239, 225, 0.85); border-bottom-color: rgba(245, 239, 225, 0.25); }
  .site-footer .muted { color: rgba(245, 239, 225, 0.4); }

  /* —— full-bleed dark shell —— */
  .videos-shell {
    position: relative;
    width: 100vw;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    margin-top: -3.5rem;
    margin-bottom: -4rem;
    padding: 5rem 0 6rem;
    background: #0a0a0e;
    color: #ece6d8;
    font-family: var(--serif);
    overflow: hidden;
  }
  .videos-shell::before {
    content: "";
    position: absolute; inset: 0;
    pointer-events: none;
    background:
      radial-gradient(900px 700px at 12% 8%, rgba(217, 117, 112, 0.10), transparent 60%),
      radial-gradient(700px 600px at 88% 92%, rgba(240, 194, 138, 0.07), transparent 60%);
  }

  .videos-wrap {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  .videos-hero {
    border-bottom: 1px solid rgba(245, 239, 225, 0.10);
    padding-bottom: 2.5rem;
    margin-bottom: 3rem;
  }
  .videos-hero .kicker {
    font-size: 0.78rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #d97570;
    margin-bottom: 1rem;
  }
  .videos-hero h1 {
    font-size: clamp(2rem, 5vw, 3.4rem);
    line-height: 1.05;
    letter-spacing: -0.005em;
    margin: 0 0 1rem;
    font-weight: 700;
    color: #f5efe1;
  }
  .videos-hero h1 em {
    font-style: italic;
    color: #f0c28a;
  }
  .videos-hero p {
    font-size: 1.05rem;
    line-height: 1.65;
    color: rgba(245, 239, 225, 0.72);
    max-width: 56ch;
    margin: 0;
  }

  /* —— video card grid —— */
  .videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 2rem;
  }
  .video-card {
    display: block;
    text-decoration: none;
    color: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0));
    border: 1px solid rgba(245, 239, 225, 0.08);
    border-radius: 6px;
    overflow: hidden;
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }
  .video-card:hover {
    transform: translateY(-4px);
    border-color: rgba(217, 117, 112, 0.4);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
  }
  .video-card .poster {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #1a1a22;
  }
  .video-card .poster img {
    width: 100%; height: 100%; object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .video-card:hover .poster img { transform: scale(1.04); }
  .video-card .play-badge {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 64px; height: 64px;
    border-radius: 50%;
    background: rgba(10,10,14,0.65);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 239, 225, 0.2);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.25s ease;
  }
  .video-card:hover .play-badge {
    background: rgba(217, 117, 112, 0.85);
    border-color: rgba(245, 239, 225, 0.4);
  }
  .video-card .play-badge::after {
    content: "";
    width: 0; height: 0;
    border-left: 18px solid #f5efe1;
    border-top: 11px solid transparent;
    border-bottom: 11px solid transparent;
    margin-left: 4px;
  }
  .video-card .duration {
    position: absolute; right: 12px; bottom: 12px;
    font-size: 0.78rem;
    padding: 4px 10px;
    background: rgba(10,10,14,0.78);
    color: #f5efe1;
    border-radius: 3px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
  }

  .video-card .meta {
    padding: 1.25rem 1.4rem 1.6rem;
  }
  .video-card .vol {
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(245, 239, 225, 0.45);
    margin-bottom: 0.6rem;
  }
  .video-card .title {
    font-size: 1.25rem;
    line-height: 1.3;
    color: #f5efe1;
    font-weight: 600;
    margin: 0 0 0.7rem;
    letter-spacing: -0.005em;
  }
  .video-card .desc {
    font-size: 0.92rem;
    line-height: 1.55;
    color: rgba(245, 239, 225, 0.62);
    margin: 0 0 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .video-card .pills {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .video-card .pills span {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(245, 239, 225, 0.55);
    border: 1px solid rgba(245, 239, 225, 0.12);
    padding: 3px 8px;
    border-radius: 3px;
  }
  .video-card .pills span.brand-claude { color: #d97570; border-color: rgba(217, 117, 112, 0.4); }
  .video-card .pills span.brand-openai { color: #f0c28a; border-color: rgba(240, 194, 138, 0.4); }

  /* empty state */
  .videos-empty {
    text-align: center;
    padding: 4rem 2rem;
    color: rgba(245, 239, 225, 0.5);
    font-style: italic;
  }
</style>

<div class="videos-shell">
  <div class="videos-wrap">

    <header class="videos-hero">
      <div class="kicker">Videos · 视频专栏</div>
      <h1>把一周的 AI 大事，<em>讲给工程师听</em></h1>
      <p>每一条都是脚本生成的：MiniMax TTS 主播口播 + Hailuo AI B-roll + Remotion 动效 + 字幕条 + 背景音乐。
      不复述新闻，只挑会改变你写代码方式的更新。</p>
    </header>

    {% assign videos = site.videos | sort: 'date' | reverse %}
    {% if videos.size == 0 %}
      <div class="videos-empty">暂无视频。</div>
    {% else %}
      <div class="videos-grid">
        {% for v in videos %}
        <a class="video-card" href="{{ v.url | relative_url }}">
          <div class="poster">
            {% if v.poster %}
              <img src="{{ v.poster | relative_url }}" alt="{{ v.title }}" loading="lazy">
            {% endif %}
            <div class="play-badge"></div>
            {% if v.duration %}<div class="duration">{{ v.duration }}</div>{% endif %}
          </div>
          <div class="meta">
            {% if v.vol %}<div class="vol">{{ v.vol }}</div>{% endif %}
            <h3 class="title">{{ v.title }}</h3>
            <p class="desc">{{ v.description }}</p>
            <div class="pills">
              {% for tag in v.pills %}
                <span class="brand-{{ tag.brand }}">{{ tag.label }}</span>
              {% endfor %}
            </div>
          </div>
        </a>
        {% endfor %}
      </div>
    {% endif %}

  </div>
</div>
