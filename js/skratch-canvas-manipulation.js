if (skratch === undefined) { var skratch = {} }

/*
  View and Canvas Manipulation
    zoom(scale)
    calculateOffset()
    setBackground('name', 'value')
    clearscreen()
    drawImage(image)
*/

(function(skratch) {

  skratch.backgroundImage = new Image();
  skratch.scale = 1;

  var center = {x:0, y:0};

  skratch.zoom = function(scale){

    if (scale === undefined) { return skratch.scale }
    
    // Find the current canvas center point
    center.x = parseInt($('#draw_canvas').css("margin-right")) + ((skratch.width / 2) * skratch.scale);
    center.y = parseInt($('#draw_canvas').css("margin-bottom")) + ((skratch.height / 2) * skratch.scale);
    
    // Set the new scaling factor
    skratch.scale = scale;
    console.log(center.x - ((skratch.width / 2) * skratch.scale));
    
    // Update the view
    $('canvas').css({
      'width': skratch.width * scale,
      'height': skratch.height * scale,
      'margin-right': center.x - ((skratch.width / 2) * skratch.scale),
      'margin-bottom': center.y - ((skratch.height / 2) * skratch.scale)
    });
    
    skratch.calculateOffset();
  };
  
  skratch.pan = function(x, y) {
    $('canvas').css("margin-right", parseInt($('#draw_canvas').css("margin-right")) + x);
    $('canvas').css("margin-bottom", parseInt($('#draw_canvas').css("margin-bottom")) + y);
    skratch.calculateOffset();
  };

  // The offsets are used by the drawing code to translate mouse position to position on canvas
  skratch.calculateOffset = function() {
    skratch.offsetX = $('#draw_canvas').offset().left - $('#click-catcher').offset().left;
    skratch.offsetY = $('#draw_canvas').offset().top - $('#click-catcher').offset().top;
  };
  
  // This can draw a solid color background or an json file with a base64 encoded image in it
  skratch.setBackground = function(name, value) {
    skratch.bgcontext.globalAlpha = 1;
    skratch.bgcontext.globalCompositeOperation = 'source-over';

    if (name === 'background-color') {
      skratch.bgcontext.fillStyle = value;
      skratch.bgcontext.fillRect(0,0,skratch.width, skratch.height);
    }
    
    else if (name === 'background-image') {
      skratch.bgcontext.fillStyle = "#FFF";
      $('#bg-loading.alert').css('display', 'block');
      
      $.getJSON(value, function(data, textStatus){
        skratch.backgroundImage = new Image();
        skratch.backgroundImage.src = data['image'];
        
        skratch.backgroundImage.onload = function(){
          skratch.bgcontext.drawImage(skratch.backgroundImage, 0, 0, skratch.width, skratch.height);
          $('#bg-loading.alert').css('display', 'none');
        }
        
      });
    }
  };
  
  // Clears the drawing canvas
  skratch.clearscreen = function() {
    skratch.context.clearRect(0,0,skratch.width, skratch.height);
  };
  
  // Draws an image on the drawing canvas, for loading saved drawings
  skratch.drawImage = function(image) {
    skratch.clearscreen();
    skratch.context.save();
    skratch.context.globalAlpha = 1;
    skratch.context.globalCompositeOperation = "source-over";
    skratch.context.drawImage(image, 0,0);
    skratch.context.restore();
  };
  
  return skratch;

})(skratch);
