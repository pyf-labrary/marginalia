---
layout: default
title: Games
description: "Marginalia 的游戏画廊——每一个都是 AI 协作写出来的独立可玩 HTML 小品。点开即玩，不需要安装。"
permalink: /games/
---

<style>
  /* —— dark-mode site chrome (only on this page) —— */
  body { background: #0c0c10; }
  body::before {
    background: linear-gradient(90deg, #8b2e2a 0, #8b2e2a 28%, #1a1a22 28%) !important;
  }
  .site-header {
    background: rgba(12, 12, 16, 0.78) !important;
    border-bottom-color: rgba(245, 239, 225, 0.08) !important;
  }
  .site-header .brand { color: #f5efe1 !important; }
  .site-header .brand-mark { color: #d97570 !important; }
  .site-header .brand-tag { color: rgba(245, 239, 225, 0.55) !important; }
  .site-header .site-nav a { color: rgba(245, 239, 225, 0.78) !important; }
  .site-header .site-nav a:hover { color: #d97570 !important; }
  .site-footer {
    background: #0c0c10;
    color: rgba(245, 239, 225, 0.55);
    border-top: 1px solid rgba(245, 239, 225, 0.08);
  }
  .site-footer a { color: rgba(245, 239, 225, 0.85); border-bottom-color: rgba(245, 239, 225, 0.25); }
  .site-footer .muted { color: rgba(245, 239, 225, 0.4); }

  /* —— full-bleed dark gallery shell —— */
  .games-shell {
    position: relative;
    width: 100vw;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    margin-top: -3.5rem;          /* cancel .site-main top padding */
    margin-bottom: -4rem;          /* cancel .site-main bottom padding */
    padding: 5rem 0 6rem;
    background: #0c0c10;
    color: #ece6d8;
    font-family: var(--serif);
    overflow: hidden;
  }
  .games-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(1200px 600px at 15% -10%, rgba(139, 46, 42, 0.35), transparent 60%),
      radial-gradient(800px 400px at 95% 110%, rgba(232, 199, 137, 0.18), transparent 60%);
    pointer-events: none;
  }
  .games-inner {
    position: relative;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  .games-eyebrow {
    font-family: var(--sans);
    font-size: 0.78rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #b8615c;
    margin: 0 0 1rem;
  }
  .games-title {
    font-size: clamp(3rem, 8vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin: 0 0 1.2rem;
    color: #f5efe1;
    font-weight: 700;
  }
  .games-lede {
    max-width: 640px;
    font-size: 1.05rem;
    line-height: 1.7;
    color: #b8b1a3;
    margin: 0 0 4rem;
    font-style: italic;
  }
  .games-rule {
    width: 60px;
    height: 3px;
    background: #8b2e2a;
    margin: 0 0 4rem;
    border: 0;
  }

  /* —— gallery grid —— */
  .games-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    align-items: start;        /* honor each frame's aspect ratio, don't stretch */
    gap: 2.2rem 2rem;
  }
  .game-card {
    position: relative;
    grid-column: span 6;       /* uniform 2-up → every cover keeps its native 16:9 */
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    isolation: isolate;
  }
  /* —— featured hero: the newest game runs full width —— */
  .game-card.is-hero { grid-column: span 12; }
  .game-card.is-hero .game-name { font-size: clamp(2rem, 3.4vw, 2.8rem); }
  .game-card.is-hero .game-meta { left: 2rem; right: 2rem; bottom: 1.8rem; }
  .game-card.is-hero .game-desc {   /* hero shows its blurb without needing hover */
    display: -webkit-box;
    -webkit-line-clamp: 3;          /* bound the height — ellipsis, never a hard mid-line cut */
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: none;
    opacity: 1;
    margin-top: 0.5rem;
    max-width: 54ch;
  }
  .game-card.is-hero .game-frame::after { opacity: 0.82; }

  .game-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;      /* matches the source covers → object-fit:cover never crops */
    overflow: hidden;
    border-radius: 2px;
    background: #1a1410;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.04) inset,
      0 30px 60px -30px rgba(0,0,0,0.7),
      0 8px 24px -8px rgba(0,0,0,0.5);
    transition: transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s;
  }

  .game-frame img,
  .game-frame .svg-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.8s cubic-bezier(.2,.8,.2,1), filter 0.5s;
  }
  .game-frame::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(12,12,16,0.85) 0%, rgba(12,12,16,0) 45%);
    opacity: 0.6;
    transition: opacity 0.5s;
    pointer-events: none;
  }
  .game-card:hover .game-frame { transform: translateY(-4px); }
  .game-card:hover .game-frame img,
  .game-card:hover .game-frame .svg-cover { transform: scale(1.04); filter: brightness(1.05); }
  .game-card:hover .game-frame::after { opacity: 0.9; }

  .game-meta {
    position: absolute;
    left: 1.4rem;
    right: 1.4rem;
    bottom: 1.2rem;
    z-index: 2;
  }
  .game-name {
    font-family: var(--serif);
    font-size: 1.6rem;
    line-height: 1.2;
    color: #f5efe1;
    margin: 0;
    letter-spacing: -0.005em;
    font-weight: 600;
  }
  .game-desc {
    margin: 0.4rem 0 0;
    font-family: var(--sans);
    font-size: 0.88rem;
    line-height: 1.5;
    color: rgba(245, 239, 225, 0.72);
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, opacity 0.4s ease, margin 0.4s ease;
  }
  .game-card:hover .game-desc {
    max-height: 5em;
    opacity: 1;
    margin-top: 0.5rem;
  }
  .game-play {
    position: absolute;
    top: 1.2rem;
    right: 1.2rem;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    background: rgba(12,12,16,0.6);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(245,239,225,0.18);
    border-radius: 999px;
    font-family: var(--sans);
    font-size: 0.74rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #f5efe1;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.4s, transform 0.4s;
  }
  .game-card:hover .game-play {
    opacity: 1;
    transform: translateY(0);
  }

  .games-empty {
    padding: 4rem 0;
    color: #8a7f73;
    font-style: italic;
  }

  @media (max-width: 800px) {
    .games-shell { padding: 3rem 0 4rem; }
    .games-inner { padding: 0 1.2rem; }
    .games-grid { gap: 1.5rem; }
    .game-card { grid-column: span 12; }
    /* short 16:9 frames have no room for a hero blurb on phones — title only */
    .game-card.is-hero .game-desc { display: none; }
    .game-card.is-hero .game-name { font-size: 1.6rem; }
  }
</style>

<div class="games-shell">
  <div class="games-inner">
    <p class="games-eyebrow">¶ The Arcade Wing</p>
    <h1 class="games-title">Games</h1>
    <hr class="games-rule">
    <p class="games-lede">
      用 AI 协作写出来的可玩 HTML 小品。每一个都是单文件即开即玩——没有安装、没有账号、没有广告。把封面看成一张展厅里的海报，点进去就是开始。
    </p>

    {% assign games = site.games | sort: "date" | reverse %}
    {% if games.size == 0 %}
      <p class="games-empty">展厅暂时空着——下一局正在装裱。</p>
    {% else %}
    <div class="games-grid">
      {% for g in games %}
        {% assign is_external = false %}
        {% if g.play_url contains '://' %}{% assign is_external = true %}{% endif %}
        <a class="game-card{% if forloop.first %} is-hero{% endif %}" href="{% if is_external %}{{ g.play_url }}{% else %}{{ g.play_url | relative_url }}{% endif %}"{% if is_external %} target="_blank" rel="noopener"{% endif %}>
          <div class="game-frame">
            {% if g.cover contains '.svg' %}
              <img class="svg-cover" src="{{ g.cover | relative_url }}" alt="{{ g.title | escape }}" loading="lazy">
            {% else %}
              <img src="{{ g.cover | relative_url }}" alt="{{ g.title | escape }}" loading="lazy">
            {% endif %}
          </div>
          <span class="game-play">▶ Play</span>
          <div class="game-meta">
            <h2 class="game-name">{{ g.title }}</h2>
            {% if g.description and g.description != "" %}
              <p class="game-desc">{{ g.description }}</p>
            {% endif %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}
  </div>
</div>
