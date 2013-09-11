//Globals:
var renderCloud;
var sizeScaleFactor = 12;

var getWordHash = function(){
  var hash = {};
  return function(h){
    if(h) hash=h;
    else return hash;
  };
}();

function getFont(){
  return $('#font-input').val();
}

function removeColor() {
  var p = $(event.currentTarget).parent();
  p.fadeOut(600);
  window.setTimeout(function(){p.remove();}, 600);
  event.cancelBubble = true;
  if (event.stopPropagation) { event.stopPropagation() };
}
function getColors(){
  return $('#color-list p span').text().split('#').slice(1).map(function(c){return '#'.concat(c);});
}

function getWCSize(){
  return [parseInt($('#dim-w').val()), parseInt($('#dim-h').val())];
}

// Result:       {word}++{word}++...
// {word}      = {*text},{style},{transform}
// {style}     = {*color}|{*font size}
// {transform} = {*x}|{*y}|{*rotation in degrees}
//
function prepareForm() {
  $('#export-form-dim').val(getWCSize().join('x'));
  $('#export-form-bgcol').val($('#bg-color-picker').val());
  $('#export-form-font').val(getFont());
  var allWords = [];
  $('svg g text').each(function(){
    var styleVal = this.attributes[1].value;
    styleVal = styleVal.split(';');
    styleVal = styleVal[0].split(': ')[1] + '|' + styleVal[2].split(': ')[1];
    var transformVal = this.attributes[2].value;
    transformVal = transformVal.match(/-?\d+/g);
    transformVal[0] = parseInt(transformVal[0]);
    transformVal[1] = parseInt(transformVal[1]);  
    transformVal[2] = transformVal[2]||'0';
    var w = this.clientWidth;
    var h = this.clientHeight;
    if(transformVal[2]=='0' || transformVal[2]=='180'){
      transformVal[0]+=1-Math.floor(w/2);
      transformVal[1]+=1;
    }else if(transformVal[2]=='90'){
      transformVal[1]-=Math.floor(w/2);
    }else if(transformVal[2]=='-90'){
      transformVal[1]+=Math.floor(w/2);
    };
    transformVal = transformVal.join('|');
    var contentVal = this.textContent;
    allWords.push(contentVal.concat(',', styleVal, ',', transformVal));
   });
  $('#export-form-wordCloud').val(allWords.join('++'));
  $('#export').removeAttr('disabled');
};


$(window).ready(function (argument) {
  function draw(data) {
    var w = getWCSize()[0]
    var h = getWCSize()[1]
    var couldDiv = d3.select('#cloud')
                     .append('svg')
                     .style('background-color',$('#bg-color-picker').val())
                     .attr('width',w)
                     .attr('height',h)
                     .append('g')
                     .attr('transform','translate('+(w/2).toString()+','+(h/2).toString()+')')
                     .selectAll('text')
                     .data(data);
    var colors = getColors();
    var clen = colors.length
    couldDiv.enter().append('text')
            .style('fill',function(data){var i = ~~(Math.random() * clen); return colors[i];})
            .attr('text-anchor','middle')
            .text(function(data){return data.text;})
            .transition().duration(1000)
            .style('font-size',function(data){return (data.size)+'px';})
            .style('font-family',getFont())
            .attr('transform',function(data){return'translate('+[data.x,data.y]+')rotate('+data.rotate+')';});
    window.setTimeout(prepareForm,1500);
  };

  renderCloud = function () {
    var wordHash = getWordHash();
    $('#cloud').html('');
    d3.layout.cloud().size(getWCSize())
      .words(Object.keys(wordHash))
      .text(function (d) { return d; })
      .font(getFont())
      .rotate(function() { return (~~(Math.random() * 3)-1) * 90; })
      .fontSize(function(d) { return wordHash[d]*sizeScaleFactor; })
      .on('end', draw)
      .start();
  };
  $('#unprocessed').val('Welcome to my word cloud generator! Preprocess the text, then generate the cloud.')

  $('#add-color').on('click',function(){
    var col = $('#color-picker').val();
    var c = "<p class='color-"+col.substr(1)+"' style='color:"+col+"'>Color <span>"+col+"</span> <a onclick='removeColor()' title='Remove This Color'>&times;</a></p>";
    $('#color-list').append(c);
  });

  $('#cloud-go').on('click', function(){
    $('html, body').animate({scrollTop: 0}, 900);
    renderCloud()
  });
});
