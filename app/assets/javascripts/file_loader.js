function loadText(readFile) {          
  var reader = new FileReader();
  reader.readAsText(readFile);
  // Handle progress, success, and errors
  reader.onprogress = doNothing;
  reader.onload = loaded(readFile.name);
  reader.onerror = errorHandler;
};

function doNothing(evt) {};
function loaded(fname) {  
  return function(evt){
    // Obtain the read file data    
    var fileString = evt.target.result;
    $('#unprocessed').val($('#unprocessed').val()+'\n'+fileString);
  };
};
function errorHandler(evt) {
  if(evt.target.error.name == "NotReadableError") {
    alert('Could not load file.');
  };
};

$(document).ready(function() {
  $('#loading').toggle(false);

  // Load file on drop.
  var unproc = $('#unproc-container');
  unproc.on('dragenter', preventThings);
  unproc.on('dragover', preventThings);
  unproc.on('drop', function(e){
    e.originalEvent.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
    loadText(file);
  });
  function preventThings(e){
    e.preventDefault();
    e.stopPropagation();
  };

  // Load file when picked with the uploader
  $('#file-uploader').change(function(evt){
    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      loadText(files[i]);
    };
    $('#file-uploader').val(null);
    $('#file-uploader').style.width = '100%';
  });

  // Clear the textarea when the clear button is pressed
  $('#clear-button').on('click', function(){
    $('#unprocessed').val('');
  });

  // Append the desired page to textarea value when the load page button is pressed
  $('#load-page-button').on('click', function(){
    var current = $('#unprocessed').val();
    $('#loading').toggle(true);
    $.ajax({url:'/load', data:{url:$('#page-url').val()}, type: 'GET',
      success: function(data, textStatus, jqXHR){
        $('#unprocessed').val($('#unprocessed').val()+data);
        $('#loading').toggle(false);
      },
      error: function() {
        alert('fail');
        $('#loading').toggle(false);
      }
    });
  });

  $('#normalize').on('click', function(){
    var attr = $('#normal').attr('disabled');
    if(typeof attr !== 'undefined' && attr !== false){
      $('#normal').removeAttr('disabled');
    }else{
      $('#normal').attr('disabled', 'disabled');
    };
  });

  // Process the textarea value when the preprocess button is pressed
  $('#preprocess-button').on('click', function(){
    $('#cloud-go').attr('disabled', 'disabled');
    $('#loading').toggle(true);
    var data = {text: $('#unprocessed').val(), normal: $('#normal').val()};
    var norm = $('#normalize:checked');
    if(norm[0])data.normalize=true;
    $.ajax({url: '/preprocess', data: data, type: 'POST', dataType: 'json',
      success: function(data, textStatus, jqXHR){
        $('#unprocessed').val(data.text);
        $('#loading').toggle(false);
        getWordHash(data.hash);
        $('#cloud-go').removeAttr('disabled');
      },
      error: function() {
        alert('fail');
        $('#loading').toggle(false);
      }
    });
  });

});