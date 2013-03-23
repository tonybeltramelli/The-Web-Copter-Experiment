/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

CustomTool = function(aircraft, materials) {
	this.bigCanvas;
	this.bigContext;
	this.aircraft = aircraft;
	this.materials = materials;
	this.isOpen = false;
	this.paintSize = 5;
	this.systemImg = null;
	//
	this.WIDTH = 250;
	this.HEIGHT = 250;
	this.RATIO = 2;
};

CustomTool.prototype = new EventDispatcher();
CustomTool.prototype.constructor = CustomTool;

CustomTool.prototype.show = function(parentId)
{
	this.isOpen = true;
	
	this.paintSize = 5;
	
	this.bigCanvas = document.createElement("canvas");
	this.bigCanvas.width = this.WIDTH * this.RATIO;
	this.bigCanvas.height = this.HEIGHT * this.RATIO;
	
	this.bigContext = this.bigCanvas.getContext('2d');
	this.bigContext.fillStyle = "#FFFFFF";  
	this.bigContext.fillRect (0, 0, this.bigCanvas.width, this.bigCanvas.height);
	
	var customCanvas = document.createElement("canvas");
	customCanvas.id = "customCanvas";
	customCanvas.width = this.WIDTH;
	customCanvas.height = this.HEIGHT;
	
	var customContext = customCanvas.getContext('2d');
	customContext.fillStyle = "#FFFFFF";  
	customContext.fillRect (0, 0, customCanvas.width, customCanvas.height);
	
	var colorPicker = new ColorPicker("colorPicker", 50);
	colorPicker.addEventListener(Event.UPDATE, function()
	{
		if($("#fillCustom").hasClass("active")) $("#fillCustom + span").css("background-color", colorPicker.color);
	    if($("#paintCustom").hasClass("active")) $("#paintCustom + span").css("background-color", colorPicker.color);
	});
	
	$("#"+parentId).append("<div id='customContainer'><div id='toolContainer'></div></div>");
	
	$("#customContainer").append(customCanvas);
	$("#customContainer").append("<div><a class='button medium' id='cancelCustom' href='#'>Cancel</a><a class='button medium' id='okCustom' href='#'>Ok</a></div>");	
	
	$("#toolContainer").append(colorPicker.container);
	$("#toolContainer").append("<a class='button little active' id='fillCustom' href='#'>Fill</a>");
	$("#toolContainer").append("<span></span>");
	$("#toolContainer").append("<a class='button little' id='paintCustom' href='#'>Draw</a>");
	$("#toolContainer").append("<span></span>");
	$("#toolContainer").append("<div class='button little' id='paintSize'><span></span></div>");
	$("#toolContainer").append("<a class='button little no' id='metalicCustom' href='#'>Metalic</a>");
	$("#toolContainer").append("<span></span>");
	$("#toolContainer").append("<a class='button little no' id='systemCustom' href='#'>System</a>");
	$("#toolContainer").append("<span></span>");
	
	var aircraftCurrentMaterials = { body : this.aircraft.currentBodyMaterialName, blades : this.aircraft.currentBladesMaterialName, windshield : this.aircraft.currentWindshieldMaterialName };
	var self = this;
	
	if(aircraft.special == true)
	{
		aircraft.setBladesMaterial({name: materials.bladesMaterials[0].name, material: materials.bladesMaterials[0].material});
		aircraft.setWindshieldMaterial({name: materials.windshieldMaterials[0].name, material: materials.windshieldMaterials[0].material});
	}
	
	$("#okCustom").click(function(e){
		e.preventDefault();
		self.applyToBody();
		self.saveCustomCanvas();
		self.hide();
	});
	
	$("#cancelCustom").click(function(e){
		e.preventDefault();
		if(aircraftCurrentMaterials.body == "custom")
		{
			var customDatas = JSON.parse(localStorage.getItem(LOCAL_IMG_ID));
			if(customDatas)
			{
				var loadedTexture;
				self.materials.addEventListener(Event.READY, function(){
					this.aircraft.setBodyMaterial(loadedTexture);
				});
				loadedTexture = self.materials.fromBase64(customDatas);
			}else{
				self.aircraft.setBodyMaterial(materials.getBodyMaterialByName("multicamochrome"));
			}
		}else{
			self.aircraft.setBodyMaterial(self.materials.getBodyMaterialByName(aircraftCurrentMaterials.body));
		}
		self.aircraft.setBladesMaterial(self.materials.getBladesMaterialByName(aircraftCurrentMaterials.blades));
		self.aircraft.setWindshieldMaterial(self.materials.getWindshieldMaterialByName(aircraftCurrentMaterials.windshield));
		self.hide();
	});
	
	$("#metalicCustom").click(function(e){
		e.preventDefault();
		if($(this).hasClass("yes"))
		{
			$(this).removeClass("yes");
			$(this).addClass("no");
		}else if($(this).hasClass("no"))
		{
			$(this).removeClass("no");
			$(this).addClass("yes");
		}
		
		self.applyToBody();
	});
	
	$("#systemCustom").click(function(e){
		e.preventDefault();
		if($(this).hasClass("yes"))
		{
			$(this).removeClass("yes");
			$(this).addClass("no");
		}else if($(this).hasClass("no"))
		{
			$(this).removeClass("no");
			$(this).addClass("yes");
			
			if(!self.systemImg)
			{
				self.systemImg = new Image();
				self.systemImg.onload = function(){
					self.applyToBody();
				}
				self.systemImg.src = "texture/mapping/system.png";
			}
		}
		
		self.applyToBody();
	});
    
	$("#customContainer").css({
			"top": $("#body").position().top+"px",
			"left": "-"+$("#customContainer").width()+"px",
			"height": $("#body").height()-12+"px"});
	$("#customContainer").animate({left: "0"}, 300);
	
	$("#paintCustom").click(function(e){
		e.preventDefault();
		$("#fillCustom").removeClass("active");
		$(this).addClass("active");
	});
	
	$("#fillCustom").click(function(e){
		e.preventDefault();
		$("#paintCustom").removeClass("active");
		$(this).addClass("active");
	});
	
	$("#paintSize").mousedown(function(e){
		self.updatePaintSize(e, $(this));
		$(this).mousemove( function(e)
		{
			self.updatePaintSize(e, $(this));		
		});
		$(this).mouseup( function()
		{
			$(this).unbind("mousemove");
		});
	});
	
	$('#customCanvas').mousedown(function(e) { self.draw(e, customCanvas); });
	$('#customCanvas').mouseup(function(e) { self.stopDrawing(customContext); });
	$('#customCanvas').mouseout(function(e) { self.stopDrawing(customContext); });
	
	this.applyToBody();
};

CustomTool.prototype.updatePaintSize = function(e, target) {
	var mousePosition = getMousePosition(e, target.get(0));
	var percent = Math.round((mousePosition.x * 100) / target.width());
	target.find("span").css("width", percent+"%");
	this.paintSize = percent/10;
};

CustomTool.prototype.saveCustomCanvas = function() {
	var canvas = this.getEndCanvas();
	var customEncode = canvas.toDataURL("image/jpeg");
	var result = { width : canvas.width, height : canvas.height, datas : customEncode, glossy : this.isMetalic() };
	localStorage.setItem( LOCAL_IMG_ID, JSON.stringify(result) );
};

CustomTool.prototype.draw = function(e, canvas) {
	var context = canvas.getContext("2d");
	var color;
	if($("#fillCustom").hasClass("active"))
	{
		color = $("#fillCustom + span").css("background-color");
		
		this.bigContext.clearRect(0, 0, this.bigCanvas.width, this.bigCanvas.height);
		this.bigContext.fillStyle = color;
		this.bigContext.fillRect (0, 0, this.bigCanvas.width, this.bigCanvas.height);
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = color;
	    context.fillRect (0, 0, canvas.width, canvas.height);
	    
	    this.applyToBody();
	}else if($("#paintCustom").hasClass("active"))
	{
		color = $("#paintCustom + span").css("background-color");
		
		context.strokeStyle = color;
		context.lineCap = "round";
		context.lineJoin = "round";
		context.lineWidth = this.paintSize;
		context.shadowBlur = this.paintSize/2;
		context.shadowColor = color;
		
		context.beginPath();
		
		this.bigContext.strokeStyle = color;
		this.bigContext.lineCap = "round";
		this.bigContext.lineJoin = "round";
		this.bigContext.lineWidth = this.paintSize * this.RATIO;
		this.bigContext.shadowBlur = this.paintSize * (this.RATIO / 2);
		this.bigContext.shadowColor = color;
		
		this.bigContext.beginPath();
		
		var startMousePosition = getMousePosition(e, canvas);
		var startX = startMousePosition.x;
		var startY = startMousePosition.y;
		
		this.drawOnContext(canvas, startX, startY, false);
	}
};

CustomTool.prototype.drawOnContext = function(canvas, startX, startY) {
	var context = canvas.getContext("2d");
	var self = this;
	
	$('#customCanvas').mousemove( function(e)
	{
		var endMousePosition = getMousePosition(e, canvas);
		var endX = endMousePosition.x;
		var endY = endMousePosition.y;
		
		context.moveTo(startX, startY);  
		context.lineTo(endX, endY);
		
		self.drawOnBig(startX, startY, endX, endY);
		
		startX = endX;
		startY = endY;
		
		context.stroke();
		
		self.applyToBody();
	});
};

CustomTool.prototype.drawOnBig = function(startX, startY, endX, endY) {
	this.bigContext.moveTo(startX * this.RATIO, startY * this.RATIO);  
	this.bigContext.lineTo(endX * this.RATIO, endY * this.RATIO);
	this.bigContext.stroke();
}

CustomTool.prototype.stopDrawing = function(context) {
	if($("#paintCustom").hasClass("active"))
	{
		context.closePath();
		$('#customCanvas').unbind("mousemove");
	}
};

CustomTool.prototype.applyToBody = function() {
	this.aircraft.setBodyMaterial(this.materials.createCustomTexture(this.getEndCanvas(), this.isMetalic()));
};

CustomTool.prototype.isMetalic = function() {
	if($("#metalicCustom").hasClass("yes"))
	{
		return true;
	}else if($("#metalicCustom").hasClass("no"))
	{
		return false;
	}
};

CustomTool.prototype.getEndCanvas = function() {
	var endCanvas = document.createElement("canvas");
	endCanvas.width = this.bigCanvas.width;
	endCanvas.height = this.bigCanvas.height;
	
	endContext = endCanvas.getContext('2d');
	endContext.drawImage(this.bigCanvas, 0, 0);
	
	if($("#systemCustom").hasClass("yes"))
	{
		if(this.systemImg) endContext.drawImage(this.systemImg, 0, 0);
	}
	
	return endCanvas;
};

CustomTool.prototype.hide = function() {
	var self = this;
	this.isOpen = false;
	$("#customContainer").animate({
		left: "-"+$("#customContainer").width()+"px"
	}, 300, function(){
		$(this).detach();
	});
};