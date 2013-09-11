class WordCloudController < ApplicationController
  require "lemmatizer"
  require "open-uri"
  require "nokogiri"
  require "pdfkit"

  def index
    render action: 'index.html.erb', :handlers => [:erb]
  end

  def urlget
    doc = Nokogiri::HTML(open(params[:url]))
    render text: doc.to_s.html_safe
  end

  skip_before_filter :verify_authenticity_token
  def export
    PDFKit.configure do |config|
      config.default_options = {
        :encoding => "UTF-8",
        :page_width => params[:width],
        :page_height => params[:height],
        :margin_top => "0in",
        :margin_right => "0in",
        :margin_bottom => "0in",
        :margin_left => "0in",
        :disable_smart_shrinking => false
        }
    end
    html = params[:wordCloud]
    p html
    pdf = PDFKit.new(html)
    send_data pdf.to_pdf, :filename => "Word Cloud.pdf", :type => "application/pdf", :disposition => "inline"
  end

  skip_before_filter :verify_authenticity_token  
  def preprocess
    text = params[:text]
    bad_tags = /<(link|script|style)[^>]*>(.|\n)*?(<\/\1\s*>)/i
    xml_tag = /<[^>]*>/
    xml_comment = /<!--(.*?)-->[\n]?/
    html_nbsp = /(?i)&nbsp;/
    html_entity = /&[^; ]*;/
    # preprocess the text
    text = text.gsub(bad_tags, ' ')
    text = text.gsub(xml_comment, '')
    text = text.gsub(xml_tag, ' ')
    text = text.gsub(html_nbsp, ' ')
    text = text.gsub(/\s+/, ' ')
    text = text.sub(html_entity, '')
    text = text.gsub(/[^a-zA-Z ]/, '')
    words = text.downcase.split
    words = words.select do |w|
      not (stops.include? w)
    end
    lem = Lemmatizer.new
    words = words.map do |w|
      lem.lemma w
    end
    hash = {}
    words.each do |w|
      hash[w] = (hash[w]||0)+1
    end
    if params[:normalize]
      len = words.length
      normal = 20
      hash = hash.inject({}) do |h, (k,v)|
        p k
        h[k] = normal*v/len
        h
      end
    end
    render json: {text: words.join(' '), hash: hash}
  end

  private
  def stops
    ['a', 'about', 'above', 'accordingly', 'across', 'after',
     'afterwards', 'again', 'against', 'all', 'allows', 'almost',
     'alone', 'along', 'already', 'also', 'although', 'always',
     'am', 'among', 'amongst', 'an', 'and', 'another', 'any',
     'anybody', 'anyhow', 'anyone', 'anything', 'anywhere',
     'apart', 'appear', 'appropriate', 'are', 'around', 'as',
     'aside', 'associated', 'at', 'available', 'away', 'awfully',
     'b', 'back', 'be', 'became', 'because', 'become', 'becomes',
     'becoming', 'been', 'before', 'beforehand', 'behind',
     'being', 'below', 'beside', 'besides', 'best', 'better',
     'between', 'beyond', 'both', 'brief', 'but', 'by', 'c',
     'came', 'can', 'cannot', 'cant', 'cause', 'causes',
     'certain', 'changes', 'co', 'come', 'consequently',
     'contain', 'containing', 'contains', 'corresponding',
     'could', 'currently', 'd', 'day', 'described', 'did',
     'different', 'do', 'does', 'doing', 'done', 'down',
     'downwards', 'during', 'e', 'each', 'eg', 'eight', 'either',
     'else', 'elsewhere', 'enough', 'et', 'etc', 'even', 'ever',
     'every', 'everybody', 'everyone', 'everything', 'everywhere',
     'ex', 'example', 'except', 'f', 'far', 'few', 'fifth',
     'first', 'five', 'followed', 'following', 'for', 'former',
     'formerly', 'forth', 'four', 'from', 'further',
     'furthermore', 'g', 'get', 'gets', 'given', 'gives', 'go',
     'gone', 'good', 'got', 'great', 'h', 'had', 'hardly', 'has',
     'have', 'having', 'he', 'hence', 'her', 'here', 'hereafter',
     'hereby', 'herein', 'hereupon', 'hers', 'herself', 'him',
     'himself', 'his', 'hither', 'how', 'howbeit', 'however', 'i',
     'ie', 'if', 'ignored', 'immediate', 'in', 'inasmuch', 'inc',
     'indeed', 'indicate', 'indicated', 'indicates', 'inner',
     'insofar', 'instead', 'into', 'inward', 'is', 'it', 'its',
     'itself', 'j', 'just', 'k', 'keep', 'kept', 'know', 'l',
     'last', 'latter', 'latterly', 'least', 'less', 'lest',
     'life', 'like', 'little', 'long', 'ltd', 'm', 'made', 'make',
     'man', 'many', 'may', 'me', 'meanwhile', 'men', 'might',
     'more', 'moreover', 'most', 'mostly', 'mr', 'much', 'must',
     'my', 'myself', 'n', 'name', 'namely', 'near', 'necessary',
     'neither', 'never', 'nevertheless', 'new', 'next', 'nine',
     'no', 'nobody', 'none', 'noone', 'nor', 'normally', 'not',
     'nothing', 'novel', 'now', 'nowhere', 'o', 'of', 'off',
     'often', 'oh', 'old', 'on', 'once', 'one', 'ones', 'only',
     'onto', 'or', 'other', 'others', 'otherwise', 'ought', 'our',
     'ours', 'ourselves', 'out', 'outside', 'over', 'overall',
     'own', 'p', 'particular', 'particularly', 'people', 'per',
     'perhaps', 'placed', 'please', 'plus', 'possible',
     'probably', 'provides', 'q', 'que', 'quite', 'r', 'rather',
     'really', 'relatively', 'respectively', 'right', 's', 'said',
     'same', 'second', 'secondly', 'see', 'seem', 'seemed',
     'seeming', 'seems', 'self', 'selves', 'sensible', 'sent',
     'serious', 'seven', 'several', 'shall', 'she', 'should',
     'since', 'six', 'so', 'some', 'somebody', 'somehow',
     'someone', 'something', 'sometime', 'sometimes', 'somewhat',
     'somewhere', 'specified', 'specify', 'specifying', 'state',
     'still', 'sub', 'such', 'sup', 't', 'take', 'taken', 'than',
     'that', 'the', 'their', 'theirs', 'them', 'themselves',
     'then', 'thence', 'there', 'thereafter', 'thereby',
     'therefore', 'therein', 'thereupon', 'these', 'they',
     'third', 'this', 'thorough', 'thoroughly', 'those', 'though',
     'three', 'through', 'throughout', 'thru', 'thus', 'time',
     'to', 'together', 'too', 'toward', 'towards', 'twice', 'two',
     'u', 'under', 'unless', 'until', 'unto', 'up', 'upon', 'us',
     'use', 'used', 'useful', 'uses', 'using', 'usually', 'v',
     'value', 'various', 'very', 'via', 'viz', 'vs', 'w', 'was',
     'way', 'we', 'well', 'went', 'were', 'what', 'whatever',
     'when', 'whence', 'whenever', 'where', 'whereafter',
     'whereas', 'whereby', 'wherein', 'whereupon', 'wherever',
     'whether', 'which', 'while', 'whither', 'who', 'whoever',
     'whole', 'whom', 'whose', 'why', 'will', 'with', 'within',
     'without', 'work', 'world', 'would', 'x', 'y', 'year',
     'years', 'yet', 'you', 'your', 'yours', 'yourself',
     'yourselves', 'z', 'zero']
  end
end
