# 镜像构建钩子：当 site.baseurl 非空（GitHub Pages /marginalia/ 镜像）时，
# 把渲染产物里「根绝对路径」的 URL 属性统一加上 baseurl 前缀。
#
# 背景：正文里有大量历史硬编码路径（如 ai-hot 晨报的 ![](/assets/img/...)、
# showcase/apps 的 <a href="/showcases/...">），在 jinzi.cyou 根部署下没问题，
# 但在 /marginalia/ 子路径下会 404。逐个改 100+ 篇内容不现实，
# 这里在构建期统一兜底。
#
# 规则：
#   - 只处理 href/src/poster/data-url/content 属性（双/单引号均可）
#   - 只处理以单个 "/" 开头的路径（跳过 //协议相对、http(s)://、data: 等）
#   - 已带 baseurl 前缀的跳过（relative_url 产出的不重复加）
#   - baseurl 为空（生产构建）时整个钩子不生效
Jekyll::Hooks.register :site, :post_render do |site|
  base = site.config["baseurl"]
  next if base.nil? || base.empty?

  prefix = base.chomp("/")
  attr_re = /(\b(?:href|src|poster|data-url|data-src|content)\s*=\s*(["']))(\/[^"'\/][^"']*)\2/i

  rewrite = lambda do |html|
    next html unless html.is_a?(String)

    html.gsub(attr_re) do
      attr, quote, url = Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3)
      if url.start_with?("//") || url.start_with?(prefix + "/") || url == prefix
        "#{attr}#{quote}#{url}#{quote}"
      else
        "#{attr}#{quote}#{prefix}#{url}#{quote}"
      end
    end
  end

  (site.pages + site.documents).each do |item|
    item.output = rewrite.call(item.output) if item.output
  end
rescue StandardError => e
  Jekyll.logger.warn "baseurl_rewrite:", "skipped (#{e.class}: #{e.message})"
end
