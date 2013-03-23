/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

PopInManager = function() {
};

PopInManager.prototype.constructor = PopInManager;

PopInManager.prototype.show = function(title, description)
{	
	this.build(title, "<p>"+description+"</p>");
	
	$("#popInManager").delay(1200).fadeOut(500, this.remove);
};

PopInManager.prototype.showHomePopUp = function()
{
	var content = '<p>This website is an experiment build with love and the latest web technologies HTML5, WebGL and CSS3.</p><br/>';
	
	var step1 = '<div class="step"><li class="button">1 - Create</li><p>First, create your own design for your aircraft from body to blades.</p></div>';
	var step2 = '<div class="step"><li class="button">2 - Fly</li><p>Then, take the commands and fly with it in an infinitely big world.</p></div>';
	var step3 = '<div class="step"><li class="button">3 - Share</li><p>Finally, share it with your friends and explore the WebCopter gallery.</p></div>';

	var button = '<a class="button nav" href="#">Start</a>';
	
	this.build("Hi there !", "<div class='description'>"+content+step1+step2+step3+button+"</div>", true);

	var self = this;
	
	$("#popInManager a.button").click(function(e)
	{
		e.preventDefault();
		$("#popInManager").fadeOut(500, self.remove);
	});
};

PopInManager.prototype.showAbout = function()
{
	var p1 = '<p>This website is an experiment created with the latest web technologies HTML5, WebGL, OpenGL Shaders and CSS3.</p><br/>';
	var p2 = '<p>The free Javascript librairies <a target="_blank" href="http://mrdoob.github.com/three.js/">three.js</a> and <a target="_blank" href="http://jquery.com//">jQuery</a> have been used.</p><br/>';
	var p3 = '<p>Build with love by <a href="http://www.tonybeltramelli.com" target="_blank">Tony Beltramelli</a>.</p>';
	
	this.build("WTF", "<div class='description'>"+p1+p2+p3+"</div>", true);
};

PopInManager.prototype.showCommands = function()
{
	var content = '<p class="ready">Get ready to fly in an infinite world.</p>';
	var keysContent = '<img src="images/keys.png" alt="keys to fly"/><p>You can fly either with W A S D keys or the arrow keys.</p><div class="clear"></div>';
	
	this.build("How to fly", "<div class='description'>"+keysContent+content+"</div>", true);
};

PopInManager.prototype.showCompatibilityMessage = function()
{
	var content = '<div class="browsers"><p>Sorry, your graphics card or your web browser do not properly support the latest web technologies HTML5 / WebGL. <br /> Please download one of the web browser below for free or get <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL implementation informations</a>.</p><a class="browser" href="http://www.google.fr/chrome" target="_blank"><img src="images/chrome.jpg" alt="chrome logo"/></a><a class="browser" href="http://www.mozilla.org/firefox/" target="_blank"><img src="images/firefox.jpg" alt="firefox logo"/></a><div class="clear"></div></div>';
	this.build("Not supported", "<div class='description'>"+content+"</div>", true);
};

PopInManager.prototype.build = function(title, description, big)
{
	$("body").append("<div id='popInManager'><div></div></div>");
	if(big) $("#popInManager").addClass("big");
	
	$("#popInManager > div").append("<h3>"+title+"</h3><a href='#' class='closeBtn'></a>");
	$("#popInManager > div").append(description);
	
	$("#popInManager").fadeOut(0);
	$("#popInManager").fadeIn(500);
	
	var self = this;
	
	$("#popInManager .closeBtn").click(function(e){
		$("#popInManager").fadeOut(500, self.remove);
	});
	
	this.position();
};

PopInManager.prototype.position = function()
{
	var topPosition = $("#popInManager").height()/2 - $("#popInManager > div").height()/2;
	$("#popInManager > div").css("top", topPosition+"px");
};

PopInManager.prototype.remove = function(){
	$("#popInManager").detach();
};