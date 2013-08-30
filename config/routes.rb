WordCloud::Application.routes.draw do
  root :to => 'word_cloud#index'
  post '/preprocess', :to => 'word_cloud#preprocess'
  get '/load', :to => 'word_cloud#urlget'
end
