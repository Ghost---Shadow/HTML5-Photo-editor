$(document).ready(function(){
	var canvas = document.getElementById("cc");
	var ctx = canvas.getContext("2d");

	var img = new Image();
	img.crossOrigin = "Anonymous";

	img.onload = function(){
		var W = img.width;
		var H = img.height;
		canvas.width = W;
		canvas.height = H;
		ctx.drawImage(img, 0, 0);
	}
	img.src = "./cats/original.jpg"

	$("#bBlur").click(function(){		
		var W = img.width;
		var H = img.height;
		
		var img1 = ctx.getImageData(0,0,W,H);
		var img2 = ctx.getImageData(0,0,W,H);

		var data1 = img1.data;
		var data2 = img2.data;

		var kernel =	[[1/16, 1/8, 1/16],
						 [1/8 , 1/4, 1/8],
						 [1/16, 1/8, 1/16]];
		
		function blurPixel(x,y,offset){			
			var pix = 0;
			for(var j = -1; j < 2; j++){
				for(var i = -1; i < 2; i++){
					var p = ((x+i)+(y+j) *W) * 4;
					pix += data1[p+offset] * kernel[i+1][j+1];
				}
			}
			return pix;
		}

		for(var j = 0; j < H; j++){
			for(var i = 0; i < W; i++){
				var x = (i+j *W) * 4;
				data2[x+0] = blurPixel(i,j,0);
				data2[x+1] = blurPixel(i,j,1);
				data2[x+2] = blurPixel(i,j,2);
				data2[x+3] = blurPixel(i,j,3);
			}
		}		
		ctx.putImageData(img2,0,0);
	});
});