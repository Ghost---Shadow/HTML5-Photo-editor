$(document).ready(function() {
    
    $("#main").height($("#sidebar").height());
    $("#cc").css("max-height",$("#sidebar").height());

    var brushSize = 15;
    var brushStrength = .5;
    var circularBrush = true;
    var bEnum = {
        NONE: 0,
        KERNEL: 1,
        CROP: 2,
        CPICK: 3,
        BRUSH: 4,
        SATURATE: 5,
        DESATURATE: 6
    };
    var currentType = bEnum.KERNEL;
    var pickedColor = [255,255,255,255];
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
    //img.src = "./sample.jpg";	
    
    var W = 0;
    var H = 0;
    var backImage = null;
    // Initialize the image on load
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Store image width and height
        W = img.width;
        H = img.height;  

        // Take a backup
        backImage = ctx.getImageData(0,0,W,H);
    }

    // To enable drag and drop
    canvas.addEventListener("dragover", function (evt) {
        evt.preventDefault();
    }, false);

    // Handle dropped image file - only Firefox and Google Chrome
    canvas.addEventListener("drop", function (evt) {
        var files = evt.dataTransfer.files;
        if (files.length > 0) {
            var file = files[0];
            if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
                var reader = new FileReader();
                // Note: addEventListener doesn't work in Google Chrome for this event
                reader.onload = function (evt) {
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
        evt.preventDefault();        
        W = ctx.canvas.width;
        H = ctx.canvas.height;
        backImage = ctx.getImageData(0,0,W,H);
    }, false);   
      
    
    $("#bBlur").mousedown(function() {
        kernel =    [[1 / 16, 1 / 8, 1 / 16], 
                    [1 / 8, 1 / 4, 1 / 8], 
                    [1 / 16, 1 / 8, 1 / 16]];
        currentType = bEnum.KERNEL;
    });
    
    $("#bSharp").click(function() {
        kernel =    [[0, -1, 0], 
                    [-1, 5, -1], 
                    [0, -1, 0]];
        currentType = bEnum.NONE; 
        kernelIterate(0,0,true);        
    });
    
    $("#bSobel").click(function() {        
        kernel =    [[1, 1, 1], 
                    [1, -8, 1], 
                    [1, 1, 1]];
        currentType = bEnum.NONE;
        kernelIterate(0,0,true);
    });

    $("#bBurn").click(function(){
        currentType = bEnum.KERNEL;
        kernel =    [[0, 0, 0], 
                    [0, .9+brushStrength*.1, 0], 
                    [0, 0, 0]];
    });

    $("#bDodge").click(function(){
        currentType = bEnum.KERNEL;
        kernel =    [[0, 0, 0], 
                    [0, 1+brushStrength*.1, 0], 
                    [0, 0, 0]];
    });

    $("#bCrop").click(function(){
        currentType = bEnum.CROP;
    });
    
    $("#bColorPicker").click(function(){
        currentType = bEnum.CPICK;
    });

    $("#bBrush").click(function(){
        currentType = bEnum.BRUSH;
    });

    $("#bSaturate").click(function(){
        currentType = bEnum.SATURATE;
    });

    $("#bDesaturate").click(function(){
        currentType = bEnum.DESATURATE;
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
    function kernelIterate(x,y,entireImage) {    
        if (!mouseDown && !entireImage)
            return;
        
        // Get the image and its copy
        var img1 = ctx.getImageData(0, 0, W, H);
        var img2 = ctx.getImageData(0, 0, W, H);
        
        // Get pixel data
        var data1 = img1.data;
        var data2 = img2.data;        

        //console.log(cX + " " + cY);	
        
        // Make sure the brush starts from red pixel
        startJ = (y - brushSize / 2) - (y - brushSize / 2) % 4;
        startI = (x - brushSize / 2) - (x - brushSize / 2) % 4;
        
        // End points
        endJ =  entireImage?H:y + brushSize / 2;
        endI =  entireImage?W:x + brushSize / 2;        

        // Iterate over the pixels
        c = -brushSize/2;
        RSq = brushSize/2 * brushSize/2;
        for (var j = startJ; j < endJ; j++) {
            if(circularBrush && !entireImage){
                cSq = c * c; 
                offset = parseInt(Math.sqrt(RSq-cSq));       
                startI = x - offset;  
                endI = x + offset;  
                c++;
            } 
            for (var i = startI; i < endI; i++) {
                var index = (i + j * W) * 4;
                data2[index + 0] = applyKernel(i, j, 0, data1, kernel); // R
                data2[index + 1] = applyKernel(i, j, 1, data1, kernel); // G
                data2[index + 2] = applyKernel(i, j, 2, data1, kernel); // B 
                //data2[index + 3] = applyKernel(i,j,3,data1,kernel);
            }
        }
        
        // Put the image data back into the canvas
        ctx.putImageData(img2, 0, 0);
    }

    function colorPick(x,y){
        if(!mouseDown)
            return;
        var img1 = ctx.getImageData(0, 0, W, H);
        var data1 = img1.data;
        var index = (x + y * W) * 4; 
        pickedColor[0] = data1[index+0];
        pickedColor[1] = data1[index+1];
        pickedColor[2] = data1[index+2];
        pickedColor[3] = data1[index+3];

        $("#bColorPicker").css("background-color",
        "rgb("+pickedColor[0]+","+pickedColor[1]+","+pickedColor[2]+")");
        $("#bColorPicker").css("color",
        "rgb("+(255-pickedColor[0])+","+(255-pickedColor[1])+","+(255-pickedColor[2])+")");
    }

    function brush(x,y){
        if(!mouseDown) return;
        
        // Get image data 
        var img = ctx.getImageData(0, 0, W, H);
        var data = img.data;

        // Make sure the brush starts from red pixel
        startJ = (y - brushSize / 2) - (y - brushSize / 2) % 4;
        startI = (x - brushSize / 2) - (x - brushSize / 2) % 4;
        
        // End points
        endJ =  y + brushSize / 2;
        endI =  x + brushSize / 2;        

        // Iterate over the pixels
        c = -brushSize/2;
        RSq = brushSize/2 * brushSize/2;
        for (var j = startJ; j < endJ; j++) {
            if(circularBrush){
                cSq = c * c; 
                offset = parseInt(Math.sqrt(RSq-cSq));       
                startI = x - offset;  
                endI = x + offset;  
                c++;
            }                          
            for (var i = startI; i < endI; i++) {
                var index = (i + j * W) * 4;
                data[index + 0] = pickedColor[0];
                data[index + 1] = pickedColor[1];
                data[index + 2] = pickedColor[2];
                data[index + 3] = pickedColor[3];
            }
        }
        // Put the image data back into the canvas
        ctx.putImageData(img, 0, 0);
    }

    function changeSaturation(x,y,factor){
        if(!mouseDown) return;
        
        // Get image data 
        var img = ctx.getImageData(0, 0, W, H);
        var data = img.data;

        // Make sure the brush starts from red pixel
        startJ = (y - brushSize / 2) - (y - brushSize / 2) % 4;
        startI = (x - brushSize / 2) - (x - brushSize / 2) % 4;
        
        // End points
        endJ =  y + brushSize / 2;
        endI =  x + brushSize / 2;        

        // Iterate over the pixels
        c = -brushSize/2;
        RSq = brushSize/2 * brushSize/2;
        for (var j = startJ; j < endJ; j++) {
            if(circularBrush){
                cSq = c * c; 
                offset = parseInt(Math.sqrt(RSq-cSq));       
                startI = x - offset;  
                endI = x + offset;  
                c++;
            } 
            for (var i = startI; i < endI; i++) {
                var index = (i + j * W) * 4;
                color = [data[index + 0],data[index + 1],data[index + 2]];
                hsv = RGBtoHSV(color);                
                hsv[1]*=factor;
                color = HSVtoRGB(hsv);
                data[index + 0] = color[0];
                data[index + 1] = color[1];
                data[index + 2] = color[2];
            }
        }
        // Put the image data back into the canvas
        ctx.putImageData(img, 0, 0);
    }

    // Crop the image
    var sX,sY;
    var started = false;
    function crop(x,y,w,h){
        var img = ctx.getImageData(x, y, w, h);
        ctx.canvas.width = w;
        ctx.canvas.height = h;
        ctx.putImageData(img,0,0);
        backImage = img;
    }

    // Get mouse coordinates
    function getCoords(event){
        var rect = canvas.getBoundingClientRect();
        cX = parseInt((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
        cY = parseInt((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
        return [cX,cY];
    }

    function takeAction(x,y){
        switch(currentType){
        case bEnum.NONE: break;
        case bEnum.KERNEL:
            kernelIterate(x,y,false);
        break;
        case bEnum.CROP:
            if(mouseDown && !started){
                sX = x;
                sY = y;
                started = true;                
            }
            if(mouseDown && started){
                ctx.putImageData(backImage,0,0);
                //ctx.clearRect(0,0,W,H);
                ctx.beginPath();
                ctx.rect(sX,sY,Math.abs(sX-x),Math.abs(sY - y));
                ctx.stroke();
                ctx.closePath();
            }
            if(!mouseDown && started){
                crop(sX,sY,Math.abs(sX-x),Math.abs(sY - y));
                started = false;
                //alert(sX+" "+sY+" "+x+" "+y);
            }
        break;
        case bEnum.CPICK:
            colorPick(x,y);
        break;
        case bEnum.BRUSH:
            brush(x,y);
        break;
        case bEnum.SATURATE:
            changeSaturation(x,y,1+brushStrength);
        break;
        case bEnum.DESATURATE:
            changeSaturation(x,y,1-brushStrength);
        break;  
        }
    }

    var mouseDown = false;
    $("#cc").mousedown(function(event) {
        mouseDown = true;
        coords = getCoords(event);
        takeAction(coords[0],coords[1]);
        $("#cc").mousemove(function(event) {
            coords = getCoords(event);
            takeAction(coords[0],coords[1]);
        });
    });
    $("#cc").mouseup(function() {
        mouseDown = false;        
        coords = getCoords(event);
        takeAction(coords[0],coords[1]);
    });

    function RGBtoHSV(color) {
        var r,g,b,h,s,v;
        r= color[0];
        g= color[1];
        b= color[2];
        min = Math.min( r, g, b );
        max = Math.max( r, g, b );


        v = max;
        delta = max - min;
        if( max != 0 )
            s = delta / max;        // s
        else {
            // r = g = b = 0        // s = 0, v is undefined
            s = 0;
            h = -1;
            return [h, s, undefined];
        }
        if( r === max )
            h = ( g - b ) / delta;      // between yellow & magenta
        else if( g === max )
            h = 2 + ( b - r ) / delta;  // between cyan & yellow
        else
            h = 4 + ( r - g ) / delta;  // between magenta & cyan
        h *= 60;                // degrees
        if( h < 0 )
            h += 360;
        if ( isNaN(h) )
            h = 0;
        return [h,s,v];
    };

    function HSVtoRGB(color) {
        var i;
        var h,s,v,r,g,b;
        h= color[0];
        s= color[1];
        v= color[2];
        if(s === 0 ) {
            // achromatic (grey)
            r = g = b = v;
            return [r,g,b];
        }
        h /= 60;            // sector 0 to 5
        i = Math.floor( h );
        f = h - i;          // factorial part of h
        p = v * ( 1 - s );
        q = v * ( 1 - s * f );
        t = v * ( 1 - s * ( 1 - f ) );
        switch( i ) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            default:        // case 5:
                r = v;
                g = p;
                b = q;
                break;
        }
        return [r,g,b];
    }

});
