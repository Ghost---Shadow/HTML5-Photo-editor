$(document).ready(function() {
    
    $("#main").height($("#sidebar").height());

    var brushSize = 15;
    var kernel =    [[0, 0, 0], 
                    [0, 1, 0], 
                    [0, 0, 0]];
    
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
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    }
    
    // Store image width and height
    var W = img.width;
    var H = img.height;    
    
    $("#bBlur").mousedown(function() {
        // Kernel for Gaussian Blur
        kernel =    [[1 / 16, 1 / 8, 1 / 16], 
                    [1 / 8, 1 / 4, 1 / 8], 
                    [1 / 16, 1 / 8, 1 / 16]];
    
    });
    
    $("#bSharp").click(function() {
        // Kernel for Sharpen
        kernel =    [[0, -1, 0], 
                    [-1, 5, -1], 
                    [0, -1, 0]];
    });
    
    $("#bSobel").click(function() {
        // Kernel for Sobel
        kernel = [[1, 1, 1], 
        [1, -8, 1], 
        [1, 1, 1]];
    
    });

    // x,y is pixel
    // offset: 0 = red, 1 = green, 2 = blue, 3 = alpha
    function applyKernel(x, y, offset, data, kernel) {
        var pix = 0;
        for (var j = -1; j < 2; j++) {
            for (var i = -1; i < 2; i++) {
                var p = ((x + i) + (y + j) * W) * 4;
                pix += data[p + offset] * kernel[i + 1][j + 1];
            }
        }
        return pix;
    }  
    
    // Modify the pixels surrounding the mouse position
    function iterate() {    
        if (!mouseDown)
            return;
        
        // Get the image and its copy
        var img1 = ctx.getImageData(0, 0, W, H);
        var img2 = ctx.getImageData(0, 0, W, H);
        
        // Get pixel data
        var data1 = img1.data;
        var data2 = img2.data;
        
        // Get mouse coordinates        
        var rect = canvas.getBoundingClientRect();
        cX = parseInt((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
        cY = parseInt((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);

        //console.log(cX + " " + cY);	
        
        // Make sure the brush starts from red pixel
        startJ = (cY - brushSize / 2) - (cY - brushSize / 2) % 4;
        startI = (cX - brushSize / 2) - (cX - brushSize / 2) % 4;
        
        // Iterate over the pixels
        for (var j = startJ; j < cY + brushSize / 2; j++) {
            for (var i = startI; i < cX + brushSize / 2; i++) {
                var x = (i + j * W) * 4;
                data2[x + 0] = applyKernel(i, j, 0, data1, kernel); // R
                data2[x + 1] = applyKernel(i, j, 1, data1, kernel); // G
                data2[x + 2] = applyKernel(i, j, 2, data1, kernel); // B 
                //data2[x+3] = applyKernel(i,j,3,data1,kernel);
            }
        }
        
        // Put the image data back into the canvas
        ctx.putImageData(img2, 0, 0);
    }
    var mouseDown = false;
    $("#cc").mousedown(function() {
        mouseDown = true;
        iterate();
        $("#cc").mousemove(function() {
            iterate();
        });
    });
    $("#cc").mouseup(function() {
        mouseDown = false;
    });
});
