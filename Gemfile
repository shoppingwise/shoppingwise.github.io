source 'https://rubygems.org'

gem 'github-pages', group: :jekyll_plugins
install_if -> { ENV["GITHUB_ACTIONS"] != "true" } do
    puts "Is GitHub action: #{ENV["GITHUB_ACTIONS"] == "true"}"
    gem "webrick", "~> 1.8"
end 
