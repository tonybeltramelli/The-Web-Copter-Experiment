/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

$(document).ready(function() {
	if(webGLIsSupported())
	{		
		main();
	}else{
		if(!popInManager) popInManager = new PopInManager();
		popInManager.showCompatibilityMessage();
	}
});

var scene;
var renderer;
var aircraft, materials;
var current, all;
var popInManager;
var rotateSpeed;
//
var FAST = 0.9;
var NORMAL = 0.005;

function main() {
	width = window.innerWidth - 370;
	height = window.innerHeight - 140;
	
	rotateSpeed = NORMAL;
	current = 0;
	
	all = new Array();
	
	$.getJSON("script/getAll.php",
		function(data) {
			$.each(data.all, function(i,item){
				all.push(item);
			});
			
			init();
		}
	);
}

function init()
{
	scene = new THREE.Scene();
	
	$("#wtf").click(function(e){
		e.preventDefault();
		popInManager.showAbout();
	});
	
	if(!popInManager) popInManager = new PopInManager();
	
	camera = new THREE.PerspectiveCamera(70, width / height, 1, 100000);
	camera.position.z = 450;
	camera.position.y = 70;
	camera.target = new THREE.Vector3(0, 0, 0);
	scene.add(camera);
	
	var ambient = new THREE.AmbientLight( 0x212121 );
	scene.add( ambient );
	
	directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 1, 1, 0.5 ).normalize();
	scene.add( directionalLight );
	
	pointLight = new THREE.PointLight( 0xffffff );
	pointLight.position.set( 0, 0, 0 );
	scene.add( pointLight );
	
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( width, height );
	renderer.setFaceCulling( 0 );
	
	$("#gallery .clear").before('<a id="prev" href="#"><span class="button">prev</span></a>');
	$("#gallery .clear").before( renderer.domElement );
	$("#gallery .clear").before('<a id="next" href="#"><span class="button">next</span></a>');
	
	materials = new Materials();
	materials.init(materials.HOME_ENV_MAP);
	
	$("header").fadeIn(2000);
	$("#gallery").fadeIn(2000);
	$("footer").fadeIn(2000);
	
	$("#loader").detach();
	
	$("#next, #prev").css("height", $("#gallery canvas").height()+"px");
	$("#next span, #prev span").css("margin-top", $("#gallery canvas").height()/2 - 14+"px");
	
	$("#next").click(function(e){
		e.preventDefault();
		changeAircraft(1);
	});
	
	$("#prev").click(function(e){
		e.preventDefault();
		changeAircraft(-1);
	});
	
	$("#random").click(function(e){
		e.preventDefault();
		random();
	});
	
	displayLoader();
	
	aircraft = new Aircraft();
	aircraft.addEventListener(Event.IS_LOADED, aircraftIsLoaded);
	aircraft.init(40, materials.getBodyMaterialByName("multicamochrome"), materials.getBladesMaterialByName("blackchrome"), materials.getWindshieldMaterialByName("gold"));
	
	$("#share .fb").click(function(e){
		e.preventDefault();
		window.open("https://www.facebook.com/sharer.php?u="+document.URL);
	});
	
	$("#share .tw").click(function(e){
		e.preventDefault();
		window.open("http://twitter.com/intent/tweet?url="+document.URL);
	});
	
	$("#share .gp").click(function(e){
		e.preventDefault();
		window.open("https://plus.google.com/share?url="+document.URL);
	});
	
	document.onkeydown = handleKeyDown;
	window.addEventListener( 'resize', resize, false );
}

function handleKeyDown(event){
	event.preventDefault();
	
	switch(event.keyCode)
	{
		case 37 :
		case 65 :
			changeAircraft(-1);
			break;
		case 39 :
		case 68 :
			changeAircraft(1);
			break;
	}
}

function aircraftIsLoaded()
{	
	scene.add( aircraft.mesh );
	animate();
	
	var aircraftId = getAircraftId();
	
	if(aircraftId != undefined && aircraftId <= all.length && aircraftId > 0)
	{
		current = aircraftId-1;
		applyTexture();
	}else{
		random();
	}
}

function random()
{
	var target = Math.round(Math.random()*(all.length-1));
	var direction;
	
	if(target < current)
	{
		direction = -1;
	}else{
		direction = 1;
	}
	current = target;
	changeAircraft(direction);
}

function changeAircraft(dir) {
	rotateSpeed = FAST * dir;
	
	setTimeout(function(){
		move(dir);
	}, 160);
}

function move(direction)
{
	displayLoader();
	
	switch(direction)
	{
		case 1 :
			if(current < all.length-1)
			{
				current ++;
			}else{
				current = 0;
			}
			break;
		case -1 :
			if(current > 0)
			{
				current --;
			}else{
				current = all.length-1;
			}
			break;
	}
	
	applyTexture();
}

function getAircraftId()
{
	var url = document.URL;
	var urlSection = url.split("?");
	return urlSection[1];
}

function setAircraftUrl(id)
{
	var url = document.URL;
	var urlSection = url.split("?");
	
	var updatedUrl = urlSection[0] + "?" + id;
	history.pushState({}, "", updatedUrl);
}

function applyTexture()
{
	var bodyMaterial = all[current].body;
	var bladesMaterial = all[current].blades;
	var windshieldMaterial = all[current].windshield;
	
	if(bodyMaterial == "custom")
	{
		var customDatas = all[current].custom;
		if(customDatas)
		{
			var loadedTexture;
			materials.addEventListener(Event.READY, function(){
				applyToBody(loadedTexture);
			});
			loadedTexture = materials.fromBase64(customDatas);
		}else{
			move(1);
		}
	}else{
		applyToBody(materials.getBodyMaterialByName(bodyMaterial));
	}
	
	aircraft.setBladesMaterial(materials.getBladesMaterialByName(bladesMaterial));
	aircraft.setWindshieldMaterial(materials.getWindshieldMaterialByName(windshieldMaterial));
	
	$("#gallery h2").text((current+1)+" / "+all.length);
	setAircraftUrl(current+1);
}

function applyToBody(texture) {
	aircraft.setBodyMaterial(texture);
	$("#gallery .loader").detach();
	aircraft.mesh.rotation.y = 4.2;
	rotateSpeed = NORMAL;
}

function displayLoader() {
	$("#gallery #share").before('<img class="loader" src="images/loader.gif" alt="loading..."/>');
}

function animate() {
	requestAnimationFrame( animate );
    
	render();
}

function render(){
	aircraft.mesh.rotation.y += rotateSpeed;
	
	renderer.render( scene, camera );
}

function resize(event) {
	width = window.innerWidth - 370;
	height = window.innerHeight - 140;

	renderer.setSize( width, height );

	camera.aspect = width/height;
	camera.updateProjectionMatrix();
	
	$("#next, #prev").css("height", $("#gallery canvas").height()+"px");
	$("#next span, #prev span").css("margin-top", $("#gallery canvas").height()/2 - 14+"px");
}

function webGLIsSupported() {
	try { 
		return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
	} catch( e ) { return false;
	}
}