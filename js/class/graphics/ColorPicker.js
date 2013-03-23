/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

ColorPicker = function(id, size) {
	this.container = document.createElement("div");
	this.container.id = id;
	this.container.style.position = "relative";
	this.color = "rgb(255, 255, 255)";
	
	var canvasTint = document.createElement("canvas");
	canvasTint.width = size*2;
    canvasTint.height = size*2;
    
    var canvasBrightness = document.createElement("canvas");
	canvasBrightness.width = (size/5)*2;
    canvasBrightness.height = size*2;
    
    var canvasCursor = document.createElement("canvas");
    canvasCursor.width = size/3;
    canvasCursor.height = size/3;
    canvasCursor.style.position = "absolute";
    
    this.drawTintCircle(canvasTint, size);
    this.drawBrightnessBar(canvasBrightness, size/5, size*2, this.color);
    this.drawCursor(canvasCursor);
    
    this.container.appendChild(canvasTint);
    this.container.appendChild(canvasBrightness);
    this.container.appendChild(canvasCursor);
    
    this.setCursorPosition(canvasCursor, canvasTint.width/2, canvasTint.height/2);
    
    var self = this;
    
    canvasTint.addEventListener( 'click', function(e){self.setBrightness(e, canvasTint, canvasBrightness, canvasCursor, self)}, false );
    canvasBrightness.addEventListener( 'click', function(e){self.changeColor(e, canvasBrightness, canvasCursor, self)}, false );
};

ColorPicker.prototype = new EventDispatcher();
ColorPicker.prototype.constructor = ColorPicker;

ColorPicker.prototype.drawTintCircle = function(canvas, size) {
	var context = canvas.getContext("2d");
	var nu = size * 15;
    var cW = size;
    var cH = size;
    var i = 0;
    var f = 1 / nu;
    var l = nu / 360;
    var m = 0;
    var n = 0;
    var o = 0;
    
    for (i = 0; i < nu; i++) {
        m = i / l * (Math.PI / 180);
        n = Math.cos(m);
        o = Math.sin(m);
        context.strokeStyle = "hsl(" + Math.floor((i * f) * 360) + ", 100%, 50%)";
        context.beginPath();
        context.moveTo(n + cW, o + cH);
        context.lineTo(n * size + cW, o * size + cH);
        context.stroke()
    }
    var fillContent = context.createRadialGradient(cW, cW, 0, cW, cW, size);
    fillContent.addColorStop(0, "rgba(255, 255, 255, 1)");
    fillContent.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = fillContent;
    context.fillRect(0, 0, canvas.width, canvas.height);
};

ColorPicker.prototype.drawBrightnessBar = function(canvas, width, height, color)
{
	var context = canvas.getContext("2d");
	context.clearRect(width, 0, width, height);
	
	var grd = context.createLinearGradient(width/2, 0, width/2, height);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.5, color); 
    grd.addColorStop(1, "#000000");
    
    context.fillStyle = grd;
    context.fillRect(width, 0, width, height);
};

ColorPicker.prototype.drawCursor = function(canvas)
{
	var context = canvas.getContext("2d");
	
	context.beginPath();
    context.arc(canvas.width/2, canvas.height/2, canvas.width/2-2, 0, 2 * Math.PI, false);
    context.lineWidth = 4;
    context.strokeStyle = "#ffffff";
    context.stroke();
    
    context.arc(canvas.width/2, canvas.height/2, canvas.width/2-2, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = "#000000";
    context.stroke();
};

ColorPicker.prototype.setBrightness = function(e, canvas, canvasTarget, cursor, scope)
{
	this.changeColor(e, canvas, cursor, scope);
	
    scope.drawBrightnessBar(canvasTarget, (canvas.width)/10, canvas.width, this.color);
    
    this.dispatchEvent(Event.UPDATE);
};

ColorPicker.prototype.changeColor = function(e, canvas, cursor, scope)
{
	var mousePositionCanvas = getMousePosition(e, canvas);
	var mousePositionAbsolute = getMousePosition(e, this.container);
	
	this.setColor(mousePositionCanvas, canvas, scope);
	this.setCursorPosition(cursor, mousePositionAbsolute.x, mousePositionAbsolute.y);
}

ColorPicker.prototype.setColor = function(mousePosition, canvas, scope)
{
	var context = canvas.getContext("2d");
	
    var pixel = scope.getPixel(context, mousePosition.x, mousePosition.y);
    this.color = "rgb("+pixel.r+","+pixel.g+","+pixel.b+")";
    
    this.dispatchEvent(Event.UPDATE);
}

ColorPicker.prototype.setCursorPosition = function(target, x, y) {
	target.style.left = (x - target.width/2) + "px";
	target.style.top = (y - target.height/2) + "px";
};

ColorPicker.prototype.getPixel = function(context, x, y) {
	var imgd = context.getImageData(x, y, 1, 1);
	var pix = imgd.data;
	
	return {
		r : pix[0],
		g : pix[1],
		b : pix[2]
	}
};