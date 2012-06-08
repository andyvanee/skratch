/*
  Color Picker
  skratch.brushSize('#size');
  skratch.brushLightness('#lightness');
  skratch.brushColorA('#colorA');
  skratch.brushColorB('#colorB');
  skratch.brushOpacity('#opacity');
*/

(function (skratch) {
  // Each color component sets up it's own view when supplied a jQuery selector.
  // They also catch their own mouse events
  skratch.brushSize = function(selector){
    if (selector.layerX || selector.layerX === 0) {
      if (skratch.updateColor){
        var value = selector.layerX / selector.currentTarget.clientWidth;
        skratch.tools['size'] = value;
        skratch.setColor();
      }
      return;
    }
  
    else if ((typeof selector) === 'string'){
      $(selector).append("<div id='handleS' class='handle'></div>");
      $(selector).append("<div id='bS' class='touchslider'></div>");
      $('#bS').bind('mousemove', skratch.brushSize, false);
      $('#bS').bind('mousedown', function(event){skratch.updateColor = true; skratch.brushSize(event)}, false);
      $('#bS').css({'position':'absolute', 'width':'100%', 'height':'100%'});
      $('#size').css({'background-color': 'rgba(255,255,255,0.3)', 'background-image': 'url(css/images/slider.png)'});
    }
  };
  
  skratch.brushLightness = function(selector){
    if (selector.layerX || selector.layerX === 0) {
      if (skratch.updateColor){
        var value = selector.layerX / selector.currentTarget.clientWidth;
        skratch.tools['lightness'] = value;
        skratch.setColor();
      }
      return;
    }
    
    else if ((typeof selector) === 'string'){
      $(selector).append("<div id='handleL' class='handle'></div>");
      $(selector).append("<div id='bL' class='touchslider'></div>");
      $('#bL').bind('mousemove', skratch.brushLightness, false);
      $('#bL').bind('mousedown', function(event){skratch.updateColor = true; skratch.brushLightness(event)}, false);
      $('#bL').css({'position':'absolute', 'width':'100%', 'height':'100%'});
      $('#lightness').css('background-image', lGradient('w', [[0, 0, 0, 0.8],[255, 255, 255, 0.8]]));
    }
  };

  skratch.brushColorA = function(selector){
    if (selector.layerX || selector.layerX === 0) {
      if (skratch.updateColor){
        var value = selector.layerX / selector.currentTarget.clientWidth;
        skratch.tools['colorA'] = value;
        skratch.setColor();
      }
      return;
    }

    else if ((typeof selector) === 'string'){
      $(selector).append("<div id='handleCA' class='handle'></div>");
      $(selector).append("<div id='bCA' class='touchslider'></div>");
      $('#bCA').bind('mousemove', skratch.brushColorA, false);
      $('#bCA').bind('mousedown', function(event){skratch.updateColor = true; skratch.brushColorA(event)}, false);
      $('#bCA').css({'position':'absolute', 'width':'100%', 'height':'100%'});
      $('#colorA').css('background-image', lGradient('w', [[18, 192, 105, 1.0],[201, 9, 105, 1.0]]));
    }
  };

  skratch.brushColorB = function(selector){
    if (selector.layerX || selector.layerX === 0) {
      if (skratch.updateColor){
        var value = selector.layerX / selector.currentTarget.clientWidth;
        skratch.tools['colorB'] = value;
        skratch.setColor();
      }
      return;
    }
    
    else if ((typeof selector) === 'string'){
      $(selector).append("<div id='handleCB' class='handle'></div>");
      $(selector).append("<div id='bCB' class='touchslider'></div>");
      $('#bCB').bind('mousemove', skratch.brushColorB, false);
      $('#bCB').bind('mousedown', function(event){skratch.updateColor = true; skratch.brushColorB(event)}, false);
      $('#bCB').css({'position':'absolute', 'width':'100%', 'height':'100%'});
      $('#colorB').css('background-image', lGradient('w', [[198, 198, 6, 1.0],[9, 9, 201, 1.0]]));
    }

  };

  skratch.brushOpacity = function(selector){
    if (selector.layerX || selector.layerX === 0) {
      if (skratch.updateColor){
        var value = selector.layerX / selector.currentTarget.clientWidth;
        skratch.tools['opacity'] = value;
        skratch.setColor();
      }
      return;
    }
        
    else if ((typeof selector) === 'string'){
      $(selector).append("<div id='bObg' class='touchslider'></div>");
      $('#bObg').css({'position':'absolute', 'width':'100%', 'height':'100%'});
      $(selector).append("<div id='handleO' class='handle'></div>");
      $(selector).append("<div id='bO' class='touchslider'></div>");
      $(selector).css({'background-image': 'url(css/images/alpha.png)', 'background-repeat': 'repeat'});
      $('#bO').bind('mousemove', skratch.brushOpacity, false);
      $('#bO').bind('touchmove', skratch.brushOpacity, false);
      $('#bO').bind('mousedown', function(event){skratch.updateColor = true; skratch.brushOpacity(event)}, false);

      $('#bO').css({'position':'absolute', 'width':'100%', 'height':'100%'});
      skratch.setColor();
    }
  };
  
  skratch.setColor = function(capture){
    if (capture === true) {skratch.updateColor = true}
    else if (capture === false) {skratch.updateColor = false}
    
    var cR = Math.round(skratch.tools['colorA'] * 20) / 20
    ,   cG = Math.round((1 - skratch.tools['colorA']) * 20) / 20
    ,   cB = Math.round(skratch.tools['colorB'] * 20) / 20
    ,   cY = Math.round((1 - skratch.tools['colorB']) * 20) / 20
    ;

    var red = Math.round(((cR + cY - 0.5) * skratch.tools['lightness'] * 2) * 256)
    ,   green = Math.round(((cG + cY - 0.5) * skratch.tools['lightness'] * 2) * 256)
    ,   blue = Math.round((cB * skratch.tools['lightness']) * 256 * 2)
    ;
    
    skratch.tools['colorRed'] = red;
    skratch.tools['colorGreen'] = green;
    skratch.tools['colorBlue'] = blue;
    skratch.tools['rgbaColorString'] =
          "rgba(" + red.toString() +
          "," + green.toString() +
          "," + blue.toString() +
          "," + skratch.tools['opacity'].toString() +
          ")";

    $('#brush-preview').css('background-color', skratch.tools['rgbaColorString']);

    $('#bObg').css('background-image', lGradient('w', [[red, green, blue, 0.0],[red, green, blue, 1.0]]));

    $('#brush-preview-wrap').css('height', (Math.pow(skratch.tools['size'], 2) * 20) + 0.2);

    // Set the handle positions
    $('#handleCA').css('left', cR * 268);
    $('#handleCB').css('left', cB * 268);
    $('#handleO').css('left', skratch.tools['opacity'] * 268);
    $('#handleS').css('left', skratch.tools['size'] * 268);
    $('#handleL').css('left', skratch.tools['lightness'] * 268);

    skratch.setTool();
  };
  
  // Helper to build background gradient strings
  var lGradient = function(type, gradient){
    var g;
    switch(type){
    case ('w'):
      g = "-webkit-gradient(linear, left top, right top, color-stop(0, rgba(" +
            gradient[0][0] +
            "," + gradient[0][1] +
            "," + gradient[0][2] +
            "," + gradient[0][3] +
            "))," +
            "color-stop(1, rgba(" + gradient[1][0] +
            "," + gradient[1][1] +
            "," + gradient[1][2] +
            "," + gradient[1][3] +
            ")))"
            ;
      break;
    case ('m'):
      g = "-moz-linear-gradient(center top, rgba(" +
            gradient[0][0] +
            "," + gradient[0][1] +
            "," + gradient[0][2] +
            "," + gradient[0][3] +
            ") 0%," +
            "rgba(" + gradient[1][0] +
            "," + gradient[1][1] +
            "," + gradient[1][2] +
            "," + gradient[1][3] +
            ") 100%)"
            ;
      break;
    default: 
      alert("Wrong gradient type.");
    }
    return g;
  };

  return skratch;

})(skratch);