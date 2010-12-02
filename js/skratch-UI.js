var log = function(message) {
		$('#debug').html('<p>' + message + '</p>' + $('#debug').html());
};

$(document).ready(function(){
	/*  Document Setup  */
	$('#canvas-container').append("<div id='canvases'>");
	$('#canvases').append("<canvas id='bg_canvas'>");
	$('#canvases').append("<canvas id='draw_canvas'>");
	skratch.width = ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight);

	if (skratch.width > 768){skratch.width = 768;}

	skratch.height = skratch.width * 1.2;
	document.getElementById('draw_canvas').width = skratch.width;
	document.getElementById('draw_canvas').height = skratch.height;
	document.getElementById('bg_canvas').width = skratch.width;
	document.getElementById('bg_canvas').height = skratch.height;
	$('canvas').css({
		'position': 'absolute',
		'right': '50%',
		'bottom' : '50%',
		'margin-right': 0 - (skratch.width / 2),
		'margin-bottom': 0 - (skratch.height / 2),
		'z-index' : 0
	});	
	skratch.canvas = document.getElementById('draw_canvas');
	skratch.context = document.getElementById('draw_canvas').getContext('2d');
	skratch.bgcontext = document.getElementById('bg_canvas').getContext('2d');
	skratch.currentCanvasIndex = 0;
	skratch.context.shadowBlur = 1;

	skratch.setupTools();
	skratch.data.renderIconPane();

	skratch.offsetX = $('#draw_canvas').offset().left - $('#click-catcher').offset().left;
	skratch.offsetY = $('#draw_canvas').offset().top - $('#click-catcher').offset().top;

	// end Document Setup
	
	var colors = {
		'bg': '#202838',
		'headers': '#444',
		'buttons': '-webkit-gradient(linear, left top, left bottom, color-stop(0, #666), color-stop(0.5, #333), color-stop(1, #333))',
		'buttonActive': ' -webkit-gradient(linear, left top, left bottom, color-stop(0, #7A90AA), color-stop(0.5, #3a507a), color-stop(1, #3a507a))'
	}; 
	
	skratch.brushSize('#size');
	skratch.brushLightness('#lightness');
	skratch.brushColorA('#colorA');
	skratch.brushColorB('#colorB');
	skratch.brushOpacity('#opacity');
	$('#pen-tool').css('background-image', colors['buttonActive']);

	
	// UI Scaling Logic
	$('#left-pane').data('open', true);
	$('#right-pane').data('open', false); 
	$('#left-pane').data('position', 'left');
	$('#right-pane').data('position', 'right');

	var panel_exclusive = false, single_panel = false, panel_width = 320,
	size_panels = function() {
		if (window.innerWidth < 481) {
			panel_exclusive = true;
			panel_width = window.innerWidth;
			$('.pane').css('width',panel_width);
			$('.pane').css('height',window.innerHeight);
		}
		else {
			panel_exclusive = false;
			panel_width = 320;
			$('.pane').css('width',panel_width);
			$('.pane').css('height',416);
		}
		
		if (window.innerHeight < 388) {$('.pane').css('height', 388)}
			
		
		if (window.innerWidth < 640) {single_panel = true;}
		else {single_panel = false;}
		
		// Close the right pane if left is open going into single panel mode
		if (single_panel && $('#left-pane').data('open') && $('#right-pane').data('open')) { $('#right-pane').data('open', false)}
		
		if (!$('#left-pane').data('open')) {
			$('#left-pane').css('left', 0 - panel_width);
			$('#left-pane').css('display', 'none');
		}
		else {
			$('#left-pane').css('left', 0);
			$('#left-pane').css('display', 'block');
		}
		if (!$('#right-pane').data('open')) {
			$('#right-pane').css('right', 0 - panel_width);
			$('#right-pane').css('display', 'none');
		}
		else {
			$('#right-pane').css('right', 0);
			$('#right-pane').css('display', 'block');
		}
		$('.page').css('height', window.innerHeight - 40);
		$('.main-window').css('height', window.innerHeight);
		skratch.calculateOffset();
	};

	// jQuery extension to show and hide the panels
	// Probably more work than it was worth, since .animate() doesn't seem to work from within the blocks.
	jQuery.fn.extend({
		show_panel: function() {
			if (single_panel) {
				$('.pane').css('display', 'none');
				$('.pane').each(function(){$(this).data('open', false)});
			};
			$(this).css('display', 'block');
			$(this).css($(this).data('position'), 0);
			$(this).data('open', true);
		},
		hide_panel: function() {
			$(this).css($(this).data('position'), 0 - panel_width);
			$(this).data('open', false) 
			$(this).css('display', 'none');
			//$(this).css($(this.selector).data('position'), 0 - panel_width);
			//$(this).css('display', 'none');
		}
	});
	
	size_panels();
	
	$(window).resize(function() {
		size_panels();
	});
	
	// Setup Event Handlers
	$('#app-back').click(function() {
		skratch.data.save();
		$('#left-pane').show_panel();
		$('#canvas-container').css('display', 'none');
		
	});
	$('.nav-hide').click(function() {
		$('#left-pane').hide_panel();
	});
	$('#new-drawing').click(function() {
		if (skratch.data.newDrawing()) {
			$('#canvas-container').css('display', 'block');
			skratch.zoom(1);
			skratch.calculateOffset();
		}
		else {
			$('.shade').css('display', 'block');
			$('#too-many-files-alert').css('display', 'block');
			$('#left-pane').show_panel();
		}
		
	});
	
	$('#app-option').click(function() {
		$('#tools').css('display', 'block');
		$('#backgrounds').css('display', 'none');
		$('.opt-backgrounds').css('background-image', colors['buttons']);
		$('.opt-tools').css('background-image', colors['buttonActive']);
		$('#right-pane').show_panel();
	});
	$('#opt-hide').click(function() {
		$('#right-pane').hide_panel();
	});
	
	$('.opt-tools').click(function(){
		$('.opt-backgrounds').css('background-image', colors['buttons']);
		$('.opt-tools').css('background-image', colors['buttonActive']);
		$('#tools').css('display', 'block');
		$('#backgrounds').css('display', 'none');		
	});
	
	$('.opt-backgrounds').click(function(){
		$('.opt-backgrounds').css('background-image', colors['buttonActive']);
		$('.opt-tools').css('background-image', colors['buttons']);
		$('#backgrounds').css('display', 'block');
		$('#tools').css('display', 'none');
	});
	
	$('#opt-clear').click(function() {
		$('.shade').css('display', 'block');
		$('#confirm-clear-current').css('display', 'block');
	});
	
	$('#clear-current').click(function() {
		skratch.clearscreen();
	});
	
	$('#try-clear-storage').click(function() {
		///// Debug convenience function
		$('.shade').css('display', 'block');
		$('#confirm-clear-storage').css('display', 'block');
	});

	$('#clear-storage').click(function() {
		///// Debug convenience function
		skratch.data.cleanLocalStorage();
		//$('.alert').css('display', 'none');
	});
	$('.alert button').click(function() {
		$('.alert').css('display', 'none');
		$('.shade').css('display', 'none');
	});
	
	$('#to-dataURL').click(function() {
//		//$('#confirm-email').css('display', 'block');
//		var mailtolink = skratch.data.toDataURL();
//		$('#confirm-email').css('display', 'block');
//		$('#email-drawings').append(mailtolink);
		skratch.data.toDataURL();
		$('.shade').css('display', 'block');
		$('#export-dialog').css('display', 'block');
		
	});
	
	$('#export-dialog-close').click(function() {
		$('.shade').css('display', 'none');
		$('#export-dialog').css('display', 'none');
		$('.shade img').detach();
	});

	$('#pencil-tool').click(function() {
		skratch.setTool("tool", "pencil-tool");
		$('#toolnames button').css('background-image', colors['buttons']);
		$('#pencil-tool').css('background-image', colors['buttonActive']);

	});
	$('#pen-tool').click(function() {
		skratch.setTool("tool", "pen-tool");
		$('#toolnames button').css('background-image', colors['buttons']);
		$('#pen-tool').css('background-image', colors['buttonActive']);
	});
	$('#eraser-tool').click(function() {
		skratch.setTool("tool", "eraser-tool");
		$('#toolnames button').css('background-image', colors['buttons']);
		$('#eraser-tool').css('background-image', colors['buttonActive']);
	
	});
	$('#tooltips-toggle').click(function(){
		skratch.tooltipsON = !skratch.tooltipsON;
		if (skratch.tooltipsON === false) {
			$('#tooltips').css('display', 'none');
			$('#tooltips-toggle p').html('i');
		}
		else {
			skratch.tooltip();
			$('#tooltips-toggle p').html('x');
		}
	});
	$('#tool-options').mousedown(function(){
		skratch.setColor(true);
	});
	$('#tool-options').mouseup(function(){
		skratch.setColor(false);
	});
	$('#tool-options').mouseleave(function(){
		skratch.setColor(false);
	});
	
	
	var isPanning = false, isZooming = false, pan = {"x": false, "y":false, "scale": false};
	
	// Map touch and mouse events from the canvas div
	var touch_event = function(e) {
		e.preventDefault();
		var position = {};
		if (e.originalEvent.touches[0] || e.originalEvent.touches[0] === 0){
				position.x = e.originalEvent.touches[0].clientX;
                position.y = e.originalEvent.touches[0].clientY - 44;
		} else {return false;}

		if (e.originalEvent.type === "touchstart") {
			pan = {"x":position.x, "y":position.y, "scale":false};
			pan.scale = skratch.zoom();
		}
		
		// Zoom And Pan
		if (e.originalEvent.touches[1] || e.originalEvent.touches[1] === 0){
			if (pan.scale) {
				skratch.zoom(e.originalEvent.scale * pan.scale);
				//log(skratch.zoom());
			}
			
			if (pan.x !== false) {
				skratch.pan((pan.x - position.x), (pan.y - position.y));
			}
			pan["x"] = position.x; 
			pan["y"] = position.y;
			return true;
		}

		position.x = (position.x - skratch.offsetX) * (1/skratch.scale);
		position.y = (position.y - skratch.offsetY) * (1/skratch.scale);
		
		switch (e.type)
		{
		case ('touchstart'):
			skratch.pendown(position);
			break;
		case ('touchmove'):
			skratch.penmove(position);
			//alert(position.x);
			break;
		case ('touchend'):
			skratch.penup();
			break;
			
		default:
			alert(e.type + " : " + ev);
		}
	},
	mouse_event = function (e) {
		e.preventDefault();
		var position = {};
		if (e.layerX || e.layerX === 0) { // Firefox
			position.x = e.layerX;
			position.y = e.layerY;
		}
		else if (e.offsetX || e.offsetX === 0) { // Opera
                position.x = e.offsetX;
                position.y = e.offsetY;
		}
		else { alert("Mouse event not supported on this browser");}
		
		if ((isPanning === false) && (isZooming === false)) {
			position.x = (position.x - skratch.offsetX) * (1/skratch.scale);
			position.y = (position.y - skratch.offsetY) * (1/skratch.scale);

			//log(position.x + " " + position.y);
			switch (e.type)
			{
			case ('mousedown'):
				skratch.pendown(position);
				//$('#click-catcher').css('cursor', 'crosshair');
				break;
			case ('mousemove'):
				// log(e.type + " : " + position.x + ":" + position.y);
				skratch.penmove(position);
				break;
			case ('mouseup'):
				skratch.penup(position);
				break;
			case ('mouseleave'):
				skratch.penup(position);
				break;
			}
		}
		else if (isPanning) {
			//log(e.type + " " + pan.x + " " + position.x);
			//log(e.target.id);
			
			if (Math.abs(pan.x - position.x) > 100) { pan.x = position.x };
			if (Math.abs(pan.y - position.y) > 100) { pan.y = position.y };
				
			if ((e.type === "mousemove") && (pan.x !== false)) {
				skratch.pan((pan.x - position.x), (pan.y - position.y));
			}
			pan = {"x":position.x, "y":position.y, "scale": false};
		}
		else if (isZooming) {
			if (pan.x) {
				skratch.zoom(pan.y / position.y);
			}
			else {
				pan = {"x":position.x * skratch.zoom() , "y":position.y * skratch.zoom()};
			}
		}
	};
	
	// Wire up the event handlers 
	$("#click-catcher").bind('touchmove', touch_event, false);
	$("#click-catcher").bind('touchstart', touch_event, false);
	$("#click-catcher").bind('touchend', touch_event, false);
	$("window").bind('gesturechange', touch_event, false);
	
	$("#click-catcher").bind('mousemove', mouse_event, false);
	$("#click-catcher").bind('mousedown', mouse_event, false);
	$("#click-catcher").bind('mouseup', mouse_event, false);
	$("#click-catcher").bind('mouseleave', mouse_event, false);
	
	$('body').keydown(function(event) {
		if (event.which === 8) {
			skratch.clearscreen();
			event.preventDefault();
		}
		else if (event.which === 32) {
			isPanning = true;
			event.preventDefault();
		}
		else if (event.which === 16) {
			event.preventDefault();
			isZooming = true;
			pan = {"x": false, "y":false, "scale": false};
		}
		//log(event.which);
	});
	$('body').keyup(function(event) {
		if (event.which === 32) {
			event.preventDefault();
			isPanning = false;
			pan = {"x": false, "y":false, "scale": false};
		}
		else if (event.which === 16) {
			event.preventDefault();
			isZooming = false;
		}
	});
	
	
	
	//---------------------------
	(function(){ thistip = 0; skratch.tooltipsON = true;
		tooltips=["Desktop: Shift to Zoom, Spacebar to Pan", "iOS: Pinch and Swipe to Zoom and Pan", "andyvanee.com", "gurudigitalarts.com"];
		skratch.tooltip = function() {
			thistip += 1;
			if (thistip == tooltips.length) { thistip = 0 }
			if (skratch.tooltipsON) { $('#tooltips').html(tooltips[thistip]).delay(1200).fadeIn(800).delay(4200).fadeOut(800, skratch.tooltip);}
		};
	}());
	
	skratch.tooltip();
	skratch.data.renderBackgroundsPane();
	skratch.setBackground('background-image', skratch.tools['background-image']);

});