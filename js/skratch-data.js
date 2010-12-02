if (skratch === undefined) {var skratch = {};}

/*	skratch.data
	Data Handling 

	Exposed functions
		skratch.data.save()
		skratch.data.restore()
		skratch.data.newDrawing()
		skratch.data.renderCanvas()
		skratch.data.currentIndex
		skratch.data.cleanLocalStorage()
		skratch.data.renderIconPane()
		skratch.data.files{...}
		
*/

(function (skratch) {
	// Data variables & constants
	var iconSize = 80,
	iconCanvas = (function() {
		ic = document.createElement('canvas');
		ic.width = iconSize;
		ic.height = iconSize;
		return ic
	})(),
	images = [],
	iconImage = new Image(),
	renderedImage = new Image();
	backgrounds = [
		'0', '1', '2', '3', '4', '5', '6', '7', '8'
	];

	skratch.data = {
		save : function() {
			// Render the canvas to localStorage
			var thisicon, thisimage = this.renderCanvas();
			localStorage.setItem("skratch.image." + skratch.data.currentIndex, thisimage);

			// render the icon
			iconCanvas.getContext('2d').clearRect(0,0,iconSize,iconSize);
			iconImage.src = thisimage;
			iconImage.onload = function() {
				// Scale and draw the source image to the canvas
				iconCanvas.getContext('2d').drawImage(iconImage, 0, 0, 80, 80);
				thisicon = iconCanvas.toDataURL('image/jpeg');
				localStorage.setItem('skratch.icon.' + skratch.data.currentIndex, thisicon);
				skratch.data.renderIconPane();
			};
			
			// save the file info to skratch.files localstorage
			skratch.data.files[skratch.data.currentIndex] = {
					'image': 'skratch.image.' + skratch.data.currentIndex,
					'icon' : 'skratch.icon.' + skratch.data.currentIndex,
					'background' : skratch.tools['background-image'],
					'current': true
					};
			
			//localStorage.setItem('skratch.files', skratch.data.files.toJSONString());
			localStorage.setItem('skratch.files', JSON.stringify(skratch.data.files));
			// alert(skratch.data.files.toString());
			//log(JSON.stringify(skratch.data.files));
			// this.cleanLocalStorage();
		},
		restore : function(index) {
			skratch.bgcontext.fillStyle = "#FFF";
			skratch.bgcontext.fillRect(0,0,skratch.width, skratch.height);
			var thisimage = localStorage.getItem('skratch.image.' + index);
			skratch.data.currentIndex = index;
			if (thisimage.length > 0) {
				restored = new Image();
				restored.src = thisimage;
				restored.onload = function() {
					skratch.drawImage(restored);
				};
			}
			else {
				skratch.controls.drawImage(undefined);
			}
			$('#left-pane').hide_panel();
		},
		newDrawing : function() {
			// set index to number of drawings + 1
			skratch.data.currentIndex = skratch.data.files.length;
			if (skratch.data.currentIndex > 8) {
				skratch.data.currentIndex = 8;
				return false;
			}
			skratch.setupTools();
			skratch.setBackground('background-image', skratch.tools['background-image']);
			skratch.clearscreen();
			return true;
		},
		renderCanvas : function() {
			// Flatten Canvas and Background
			skratch.bgcontext.globalAlpha = 1;
			skratch.bgcontext.globalCompositeOperation = 'source-over';
			skratch.bgcontext.fillStyle = "#FFF";
			skratch.bgcontext.drawImage(skratch.canvas, 0, 0);
			return document.getElementById('bg_canvas').toDataURL("image/jpeg");
		},
		currentIndex : 0,
		cleanLocalStorage : function() {
			for (var i=0; i < skratch.data.files.length; i++) {
				localStorage.removeItem(skratch.data.files[i].image);
				localStorage.removeItem(skratch.data.files[i].icon);
				localStorage.removeItem('skratch.files');
				this.files = [];
				this.renderIconPane();
			}
		
		},

		renderIconPane : function () {
			var thisicon;
			
			$('#icon_pane').html('');
			for (var i=0; i < skratch.data.files.length; i++) {
				$('#icon_pane').append("<img data-index='" + i + "' src='" + localStorage.getItem(skratch.data.files[i].icon) + "'>");
			}
			$('#icon_pane img').click(function() {
				var i = $(this).attr('data-index');
				$('#canvas-container').css('display', 'block');
				skratch.calculateOffset();
				skratch.data.restore(i);
			});
		},
		
		renderBackgroundsPane : function () {
			skratch.backgroundsLoaded = 0;
			// Create the HTML structure
			$("#backgrounds-pane").html("");
			for (var i in backgrounds) {
				$("#backgrounds-pane").append("<img data-index='" + i + "'>");
			}
			// Thumb loading gets pushed off the main loading queue with their onload function
			skratch.data.getBackground(skratch.backgroundsLoaded);
		},
		getBackground : function(index) {
			$.getJSON("backgrounds/" + index + "tn.json", function(data, textStatus){
				//alert(textStatus);
				$("#backgrounds-pane img[data-index='" + data['index'] + "']").attr("src", data["image"]);
				$("#backgrounds-pane img[data-index='" + data['index'] + "']").click(function(){
					var i = $(this).attr('data-index');
					skratch.setBackground('background-image', "backgrounds/" + i + ".json");
					$('#right-pane').hide_panel();
				});
				skratch.backgroundsLoaded += 1;
				if (skratch.backgroundsLoaded < 9) {
					skratch.data.getBackground(skratch.backgroundsLoaded);
				}
			});
		},
		files : (function() {
			var filelist = localStorage.getItem('skratch.files');
			if( filelist !== null) {
				return jQuery.parseJSON(filelist);
			}
			else {
				return [];
			}
		}()),
		toDataURL : function(){
			renderedImage = new Image();
			renderedImage.src = localStorage.getItem('skratch.image.' + skratch.data.currentIndex);
			renderedImage.onload = function(){
				$('.shade').append(renderedImage);
			}
		}
	} // end skratch.data

	return skratch;
})(skratch);