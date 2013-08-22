function loadText(readFile) {          
  var reader = new FileReader();
  reader.readAsText(readFile);
  // Handle progress, success, and errors
  reader.onprogress = doNothing;
  reader.onload = loaded(readFile.name);
  reader.onerror = errorHandler;
}

function doNothing(evt) {  }
function loaded(fname) {  
  return function(evt){
    // Obtain the read file data    
    var fileString = evt.target.result;
    $('#unprocessed').val($('#unprocessed').val()+'\n'+fileString);
  }
}
function errorHandler(evt) {
  if(evt.target.error.name == "NotReadableError") {
    alert('Could not load file.')
  }
}

$(document).ready(function() {
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
  }

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

});