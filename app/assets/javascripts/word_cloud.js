//Globals:
var renderCloud;
var sizeScaleFactor = 12;

function getWordHash(){
    var text = $("#unprocessed").val();
    text = text.split(' ');
    var obj = {};
    for (var i = 0; i < text.length; i++) {
        if(obj[text[i]]){
            obj[text[i]]++;
        } else{
            obj[text[i]]=1;
        };
    };
    return obj;
}

function getFont(){
    return 'Open Sans';
}

function getColors(){
    return ['#fff','#f00','#0f0','#00f'];
}

function getWCSize(){
    return [400, 400];
}



$(window).ready(function (argument) {
    function draw(data) {
        var w = getWCSize()[0]
        var h = getWCSize()[1]
        var couldDiv = d3.select("#cloud")
                         .append("svg")
                         .attr("width",w)
                         .attr("height",h)
                         .append("g")
                         .attr("transform","translate("+(w/2).toString()+","+(h/2).toString()+")")
                         .selectAll("text")
                         .data(data);
        var colors = getColors();
        var clen = colors.length
        couldDiv.enter().append("text")
                .style("fill",function(data){var i = ~~(Math.random() * clen); return colors[i];})
                .attr("text-anchor","middle")
                .text(function(data){return data.text;})
                .transition().duration(1000)
                .style("font-size",function(data){return (data.size)+"px";})
                .style("font-family",getFont())
                .attr("transform",function(data){return"translate("+[data.x,data.y]+")rotate("+data.rotate+")";});
     };

    renderCloud = function () {
        var wordHash = getWordHash();
        $("#cloud").html('');
        d3.layout.cloud().size(getWCSize())
          .words(Object.keys(wordHash))
          .text(function (d) { return d; })
          .font(getFont())
          .rotate(function() { return (~~(Math.random() * 3)-1) * 90; })
          .fontSize(function(d) { return wordHash[d]*sizeScaleFactor; })
          .on("end", draw)
          .start();
    };
    $("#unprocessed").val('welcome to my word cloud generator! words words words in a cloud')
    window.setTimeout(renderCloud, 200);

    $("#cloud-go").on('click', renderCloud);
});