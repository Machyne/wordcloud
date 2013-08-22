class WordCloudController < ApplicationController
  def index
    render action: 'index.html.erb', :handlers => [:erb]
  end
end
