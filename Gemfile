source "https://rubygems.org"

ruby "~> 3.2.0"  # Ruby 버전 명시

gem "jekyll", "~> 3.9.3"
gem "github-pages", "~> 228", group: :jekyll_plugins
gem "webrick", "~> 1.8"  # Ruby 3.0 이상에서 필요

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-paginate"
end

# Windows and JRuby does not include zoneinfo files
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
gem "wdm", "~> 0.1.1", platforms: [:mingw, :mswin, :x64_mingw]
