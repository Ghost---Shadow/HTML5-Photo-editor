$(document).ready(function(){

	// Get canvas and its context
	var canvas = document.getElementById("cc");
	var ctx = canvas.getContext("2d");	

	var img = new Image();
	img.crossOrigin = "";

	// Temporary source for image
	//img.src = "http://i.imgur.com/fHyEMsl.jpg";
	img.src = "http://i.imgur.com/lJLoZ0Q.jpg";
	//img.src = "./cats/original.jpg";	

	// Initialize the image on load
	img.onload = function(){
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
	}
	
	// Store image width and height
	var W = img.width;
	var H = img.height;
		
	// x,y is pixel
	// offset: 0 = red, 1 = green, 2 = blue, 3 = alpha
	function applyKernel(x,y,offset,data,kernel){
		var pix = 0;
		for(var j = -1; j < 2; j++){
			for(var i = -1; i < 2; i++){
				var p = ((x+i)+(y+j) *W) * 4;
				pix += data[p+offset] * kernel[i+1][j+1];
			}
		}
		return pix;
	}

	// Calculate mouse coords relative to canvas
	function relMouseCoords(event){
		var totalOffsetX = 0;
		var totalOffsetY = 0;
		var canvasX = 0;
		var canvasY = 0;
		var currentElement = this;

		do{
			totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
			totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
		}
		while(currentElement = currentElement.offsetParent)

		canvasX = event.pageX - totalOffsetX;
		canvasY = event.pageY - totalOffsetY;

		return {x:canvasX, y:canvasY}
	}
	HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

	var brushSize = 15;
	var kernel =	[[ 0,  0,  0],
					 [ 0,  1,  0],
					 [ 0,  0,  0]];		
	
	$("#bBlur").click(function(){		
		// Kernel for Gaussian Blur
		kernel =	[[1/16, 1/8, 1/16],
					[1/8 , 1/4, 1/8],
					[1/16, 1/8, 1/16]];
		
	});

	// TEMPORARY: Sharpen the entire image on button click
	$("#bSharp").click(function(){	
		// Kernel for Sharpen
		kernel =	[[ 0, -1,  0],
					[-1,  5, -1],
					[ 0, -1,  0]];	
	});	

	// TEMPORARY: Apply Sobel filter to the entire image on button click
	$("#bSobel").click(function(){			
		// Kernel for Sobel
		kernel =	[[ 1,  1,  1],
					[ 1, -8,  1],
					[ 1,  1,  1]];	
			
	});	
	
	function iterate(){
		if(!mouseDown) return;

			// Get the image and its copy
			var img1 = ctx.getImageData(0,0,W,H);
			var img2 = ctx.getImageData(0,0,W,H);

			// Get pixel data
			var data1 = img1.data;
			var data2 = img2.data;		

			// Get mouse coordinates
			coords = canvas.relMouseCoords(event);
			cX = coords.x;
			cY = coords.y;	

			//console.log(cX + " " + cY);	
			
			// Make sure the brush starts from red pixel
			startJ = (cY-brushSize/2) - (cY-brushSize/2)%4;	
			startI = (cX-brushSize/2) - (cX-brushSize/2)%4;		

			// Iterate over the pixels
			for(var j = startJ; j < cY+brushSize/2; j++){
				for(var i = startI; i < cX+brushSize/2; i++){
					var x = (i+j *W) * 4;
					data2[x+0] = applyKernel(i,j,0,data1,kernel);
					data2[x+1] = applyKernel(i,j,1,data1,kernel);
					data2[x+2] = applyKernel(i,j,2,data1,kernel);
					//data2[x+3] = applyKernel(i,j,3,data1,kernel);
				}
			}		

			// Put the image data back into the canvas
			ctx.putImageData(img2,0,0);
	}

	var mouseDown = false;
	$("#cc").mousedown(function(){
		mouseDown = true;	
		iterate();
		$("#cc").mousemove(function(){
			iterate();
		});
	});
	$("#cc").mouseup(function(){
		mouseDown = false;
	});

});