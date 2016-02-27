$(document).ready(function(){
	setupCanvas();
    $("#bBlur").click(function(){
        blur();
    });
});

function setupCanvas(){
	var c = document.getElementById("myCanvas");
	var img = document.getElementById("target");	
    var ctx = c.getContext("2d");    
    ctx.drawImage(img, 0, 0);
};
function blur(){
    var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");    
    var imgData = ctx.getImageData(0, 0, c.width, c.height);
	var d = document.getElementById("dump");
	
	for(i = 0; i < ctx.width; i++){
		for(j = 0;
	}
	
	/*
    var i;
    for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i+1] = 255 - imgData.data[i+1];
        imgData.data[i+2] = 255 - imgData.data[i+2];
        imgData.data[i+3] = 255;
    }
	*/
	
    ctx.putImageData(imgData, 0, 0);
	d.innerHTML = "Done"
};
