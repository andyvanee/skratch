if (skratch === undefined) {var skratch = {};}

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
	skratch.zoom = function(scale){
		if (scale === undefined) {
			return skratch.scale;
		}
		//alert(scale);
		skratch.scale = scale;
		$('canvas').css('width', skratch.width * scale);
		$('canvas').css('height', skratch.height * scale);
		skratch.calculateOffset();
	};
	skratch.calculateOffset = function() {
		skratch.offsetX = $('#draw_canvas').offset().left - $('#click-catcher').offset().left;
		skratch.offsetY = $('#draw_canvas').offset().top - $('#click-catcher').offset().top;
	};
	
	skratch.setBackground = function(name, value) {
		//skratch.startSetBackground = new Date();
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
				//skratch.startJSONcallback = new Date();
				//alert(textStatus);
				skratch.backgroundImage = new Image();
				skratch.backgroundImage.src = data['image'];
				skratch.backgroundImage.onload = function(){
					skratch.bgcontext.drawImage(skratch.backgroundImage, 0, 0, skratch.width, skratch.height);
					$('#bg-loading.alert').css('display', 'none');
					//skratch.backgroundLoaded = new Date();
					//log("start set background: " + (skratch.startJSONcallback - skratch.startSetBackground.getTime()) + " Background Loaded: " + (skratch.backgroundLoaded.getTime() - skratch.startSetBackground.getTime()) + "<br>");

				}
			});
		}
	};
	
	skratch.clearscreen = function() {
		skratch.context.clearRect(0,0,skratch.width, skratch.height);
	};
	
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
