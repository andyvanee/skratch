if (skratch === undefined) {var skratch = {};}

/*
  Tool Functions
  skratch.setupTools()
  skratch.pendown(event{type position.x position.y})
  skratch.penup(event{type position.x position.y})
  skratch.penmove(event{type position.x position.y})
  skratch.setTool(name, value)
  skratch.draw(cp)  //Dynamically mapped to penDraw via setTool('tool', 'pen-tool') by default
  skratch.clearscreen()
  skratch.drawImage(image)
*/

(function(skratch) {
  var toolDefaults = {
      'tool': 'pen-tool',
      'size':0.4,
      'lightness' : 0.4,
      'colorA': 0.5,
      'colorB': 0.6,
      'opacity': 0.7,
      'background-image':'backgrounds/0.json', 
      'rgbaColorString':'',
      'colorRed':0,
      'colorGreen':0,
      'colorBlue':0 }
  ,   isDrawing = false
  ,   mice = { x:[], y:[] }
  ,   cp = { x:[], y:[] }
  ,   size, opacity, angle
  ,   thisx, thisy, thisrate, sample, qx = [], qy = []
  ,   brushSize, particlesz, thisrate
  ,   pencilDraw = function (cp) {
        qx = []; qy = [];
        brushSize = (Math.pow(skratch.tools['size'], 2) * 20) + 0.2;
        particlesz = (size / 80) + 0.6,
        thisrate = 1 / ((Math.sqrt(Math.pow(cp.x[0] - cp.x[2], 2) +
                Math.pow(cp.y[0] - cp.y[2], 2)) + 0.1) *
                (brushSize + 0.1)); // 0.1 is particle density, hardcoded here...
        // To simulate a contact-motion medium like pencil, we calculate the
        // repeat rate based on the distance the tool will travel.
        // So a stationary tool will not accumulate like a spray-can would.
        // sq(a) + sq(b) = sq(c) : distance we need to cover.
        // * skratch.tools['size'] + particle_density
        
        for (var t = 0; t <= 1; t = t + thisrate) {
          qx.push((((1 - t) * (1 - t)) * cp.x[0]) + ((2 * (1 - t)) * t * cp.x[1]) + ((t * t) * cp.x[2]));
          qy.push((((1 - t) * (1 - t)) * cp.y[0]) + ((2 * (1 - t)) * t * cp.y[1]) + ((t * t) * cp.y[2]));
        }
        
        for (sample in qx) {
          if (qx[sample]) {
            angle = (Math.random() * 360);
            //particlesz = (Math.random() + 1) * ((this.skratch.tools['size'] / 100) + .4);
            opacity = (Math.random() * 0.5) + 0.5;
            //random to the power: x > 0.5 contraction towards center, x < 0.5 dilation away from center 
            size = Math.pow(Math.random(), 0.5) * (brushSize * 0.6);
            thisx = qx[sample] + (Math.sin(angle) * size);
            thisy = qy[sample] + (Math.cos(angle) * size);
            // drawing.context.drawImage(drawing.brush, thisx, thisy, particlesz, particlesz);
            skratch.context.fillRect(thisx, thisy, particlesz, particlesz);
          }
        }
      }

  ,   penDraw = function(cp){
        skratch.context.beginPath();
        skratch.context.moveTo(cp.x[0], cp.y[0]);
        skratch.context.quadraticCurveTo(cp.x[1], cp.y[1], cp.x[2], cp.y[2]);
        skratch.context.stroke();
      }
  ,   eraserDraw = function(cp) {
        skratch.context.beginPath();
        skratch.context.moveTo(cp.x[0], cp.y[0]);
        skratch.context.quadraticCurveTo(cp.x[1], cp.y[1], cp.x[2], cp.y[2]);
        skratch.context.stroke();
      }
  ;

  // Public Functions
  
  skratch.setupTools = function() {
    skratch.tools = localStorage.getItem('skratch.tools');
    if (skratch.tools === null) {skratch.tools = toolDefaults};
    skratch.setTool('tool', skratch.tools['tool']);
  };
  
  skratch.setTool = function(name, value){
    // All tools get saved as floats in the range 0.0 - 1.0
    skratch.tools[name] = value;
    
    switch (skratch.tools['tool'])    
    {
    case ('pen-tool'):
      skratch.draw = penDraw;
      skratch.context.globalAlpha = skratch.tools['opacity'];
      skratch.context.strokeStyle = skratch.tools['rgbaColorString']; // Set Color Here
      skratch.context.shadowColor = skratch.tools['rgbaColorString'];
      skratch.context.globalCompositeOperation = 'source-over';
      skratch.context.lineWidth = (Math.pow(skratch.tools['size'], 2) * 20) + 0.2;
      break;

    case ('pencil-tool'):
      skratch.draw = pencilDraw;
      skratch.context.globalAlpha = skratch.tools['opacity'];
      skratch.context.fillStyle = skratch.tools['rgbaColorString']; // Set Color Here
      skratch.context.shadowColor = skratch.tools['rgbaColorString'];
      skratch.context.globalCompositeOperation = 'source-over';
      skratch.context.lineWidth = (Math.pow(skratch.tools['size'], 2) * 20) + 0.2;
      break;
      
    case ('eraser-tool'):
      skratch.draw = eraserDraw;
      // lineWidth and globalAlpha boosted for erasing operations.
      skratch.context.globalAlpha = 1;
      skratch.context.strokeStyle = "rgba(0,0,0," + skratch.tools['opacity'] + ")"; // fixed color for erasing
      skratch.context.lineWidth = ((Math.pow(skratch.tools['size'], 2) * 20) + 0.2) * 1.8;
      skratch.context.globalCompositeOperation = 'destination-out';
      break;

    default:
      break;
    }
    
  };
  
  skratch.pendown = function(e){
    isDrawing = true;
    mice.x = [e.x, e.x, e.x];
    mice.y = [e.y, e.y, e.y];
    cp.x = [(mice.x[0] + mice.x[1])/2 , mice.x[1], (mice.x[1] + mice.x[2])/2];
    cp.y = [(mice.y[0] + mice.y[1])/2 , mice.y[1], (mice.y[1] + mice.y[2])/2];    
  };
  
  skratch.penup = function(e){
    isDrawing = false;
  };
  
  skratch.penmove = function(e){
    if (isDrawing) {
      if ((Math.abs(e.x - mice.x[2]) < 3) && (Math.abs(e.y - mice.y[2]) < 3)){
        return false;
      }
      mice.x.shift(); mice.x.push(e.x);
      mice.y.shift(); mice.y.push(e.y);
      cp.x = [(mice.x[0] + mice.x[1])/2 , mice.x[1], (mice.x[1] + mice.x[2])/2];
      cp.y = [(mice.y[0] + mice.y[1])/2 , mice.y[1], (mice.y[1] + mice.y[2])/2];
      skratch.draw(cp);
    }
  };
  
  return skratch;

}(skratch));