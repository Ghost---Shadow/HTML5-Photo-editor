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

	// Temporary blur entire image function
	$("#bBlur").click(function(){			
		// Get two copies of the image
		var img1 = ctx.getImageData(0,0,W,H);
		var img2 = ctx.getImageData(0,0,W,H);
		
		// Get pixel data
		var data1 = img1.data;
		var data2 = img2.data;
		
		// Kernel for Gaussian Blur
		var kernel =	[[1/16, 1/8, 1/16],
						 [1/8 , 1/4, 1/8],
						 [1/16, 1/8, 1/16]];	

		// Temporary blur the entire image
		for(var j = 0; j < H; j++){
			for(var i = 0; i < W; i++){
				var x = (i+j *W) * 4;
				data2[x+0] = applyKernel(i,j,0,data1,kernel);
				data2[x+1] = applyKernel(i,j,1,data1,kernel);
				data2[x+2] = applyKernel(i,j,2,data1,kernel);
				data2[x+3] = applyKernel(i,j,3,data1,kernel);
			}
		}		
		
		// Put the image data back into the canvas
		ctx.putImageData(img2,0,0);
	});

	// TEMPORARY: Sharpen the entire image on button click
	$("#bSharp").click(function(){			
		// Get two copies of the image
		var img1 = ctx.getImageData(0,0,W,H);
		var img2 = ctx.getImageData(0,0,W,H);
		
		// Get pixel data
		var data1 = img1.data;
		var data2 = img2.data;
		
		// Kernel for Sharpen
		var kernel = [[ 0, -1,  0],
					  [-1,  5, -1],
					  [ 0, -1,  0]];		

		// TEMPORARY: Sharpen the entire image
		for(var j = 0; j < H; j++){
			for(var i = 0; i < W; i++){
				var x = (i+j *W) * 4;
				data2[x+0] = applyKernel(i,j,0,data1,kernel);
				data2[x+1] = applyKernel(i,j,1,data1,kernel);
				data2[x+2] = applyKernel(i,j,2,data1,kernel);
				data2[x+3] = applyKernel(i,j,3,data1,kernel);
			}
		}		
		
		// Put the image data back into the canvas
		ctx.putImageData(img2,0,0);
	});	

	// TEMPORARY: Apply Sobel filter to the entire image on button click
	$("#bSobel").click(function(){			
		// Get two copies of the image
		var img1 = ctx.getImageData(0,0,W,H);
		var img2 = ctx.getImageData(0,0,W,H);
		
		// Get pixel data
		var data1 = img1.data;
		var data2 = img2.data;
		
		// Kernel for Sobel
		var kernel = [[ 1,  1,  1],
					  [ 1, -8,  1],
					  [ 1,  1,  1]];		

		// TEMPORARY: Apply sobel filter to the entire image
		for(var j = 0; j < H; j++){
			for(var i = 0; i < W; i++){
				var x = (i+j *W) * 4;
				data2[x+0] = applyKernel(i,j,0,data1,kernel);
				data2[x+1] = applyKernel(i,j,1,data1,kernel);
				data2[x+2] = applyKernel(i,j,2,data1,kernel);
				//data2[x+3] = applyKernel(i,j,3,data1,kernel);
			}
		}		
		
		// Put the image data back into the canvas
		ctx.putImageData(img2,0,0);
	});	
});