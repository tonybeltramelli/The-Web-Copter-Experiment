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

var width, height;
var scene, sceneRenderTarget;
var renderer;
var aircraft, materials, map;
var controls;
var composer;
var camera, cameraOrtho;
var initMaterials;
var cameraPositions, currentCameraPosition;
var popInManager;
//
var LOCAL_ID = "labs.tonybeltramelli.com/theWebCopterExperiment:aircraft";
var LOCAL_IMG_ID = "labs.tonybeltramelli.com/theWebCopterExperiment:custom";

function main()
{
	width = window.innerWidth - 100;
	height = window.innerHeight - 140;
	
	sceneRenderTarget = new THREE.Scene();
	
	cameraOrtho = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, -10000, 10000 );
	cameraOrtho.position.z = 100;
	
	cameraPositions = [
	                   {x: 0, y: 580, z: 600},
	                   {x: 0, y: 580, z: 450},
	                   {x: 0, y: 500, z: 900},
	                   {x: 0, y: 580, z: -400},
	                   {x: 0, y: 610, z: 400},
	                   {x: 0, y: 690, z: 300},
	                   {x: 400, y: 580, z: 400},
	                   {x: 400, y: 580, z: 600},
	                   {x: -400, y: 580, z: 400},
	                   {x: -400, y: 580, z: 600}
	];
	
	currentCameraPosition = 0;

	sceneRenderTarget.add( cameraOrtho );
	
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffd7af, 1200, 4000 );
	
	camera = new THREE.PerspectiveCamera( 40, width / height, 2, 4000 );
	camera.position.set( 0, 580, 1200 );
	
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
	directionalLight.position.set( 500, 2000, 0 );
	
	scene.add( camera );
	scene.add( new THREE.AmbientLight( 0x111111 ) );
	scene.add( directionalLight );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( width, height );
	renderer.setClearColor( scene.fog.color, 1 );	
	renderer.autoClear = false;
	renderer.initWebGLObjects( scene );
	$("#game").append( renderer.domElement );
	
	composer = new Composer(width, height, renderer, camera);
	controls = new Controls();
	
	map = new Map(width, height, renderer, cameraOrtho);
	map.addEventListener(Event.IS_LOADED, mapIsLoaded);
	map.init();
	
	materials = new Materials();
	materials.init(materials.SKY_ENV_MAP);
	
	initMaterials = JSON.parse(localStorage.getItem(LOCAL_ID));
	if(!initMaterials && isStorageAvailable)
	{
		document.location.href='create';
	}
	
	if(!initMaterials && !isStorageAvailable)
	{
		initMaterials = {
				body : materials.bodyMaterials[0].name,
				blades : materials.bladesMaterials[0].name,
				windshield : materials.windshieldMaterials[0].name
		};
	}
	
	aircraft = new Aircraft();
	aircraft.addEventListener(Event.IS_LOADED, aircraftIsLoaded);
	aircraft.init(40, materials.getBodyMaterialByName("multicamochrome"), materials.getBladesMaterialByName(initMaterials.blades), materials.getWindshieldMaterialByName(initMaterials.windshield));
	
	rockets = new Array();
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	
	window.addEventListener( 'resize', resize, false );
}

function handleKeyDown(event){
	event.preventDefault();
	
	switch(event.keyCode)
	{
		case 37 :
		case 65 :
			controls.moveLeft = true;
			break;
		case 39 :
		case 68 :
			controls.moveRight = true;
			break;
		case 40 :
		case 83 :
			controls.moveForward = true;
			break;
		case 38 :
		case 87 :
			controls.moveBackward = true;
			break;
	}
}

function handleKeyUp(event){
	event.preventDefault();
	
	switch(event.keyCode)
	{
		case 37 :
		case 65 :
			controls.moveLeft = false;
			break;
		case 39 :
		case 68 :
			controls.moveRight = false;
			break;
		case 40 :
		case 83 :
			controls.moveForward = false;
			break;
		case 38 :
		case 87 :
			controls.moveBackward = false;
			break;
	}
}

function mapIsLoaded() {
	sceneRenderTarget.add( map.quadTarget );
	scene.add( map.terrain );
}

function aircraftIsLoaded() {
	aircraft.mesh.position.set(-10, 480, 700);
	aircraft.mesh.rotation.y = aircraft.OR_Y;
	aircraft.setGravityCenter(0);
	
	if(initMaterials.body == "custom")
	{
		var customDatas = JSON.parse(localStorage.getItem(LOCAL_IMG_ID));
		if(customDatas)
		{
			var loadedTexture;
			materials.addEventListener(Event.READY, function(){
				aircraft.setBodyMaterial(loadedTexture);
			});
			loadedTexture = self.materials.fromBase64(customDatas);
		}else{
			aircraft.setBodyMaterial(materials.getBodyMaterialByName("multicamochrome"));
		}
	}else{
		aircraft.setBodyMaterial(materials.getBodyMaterialByName(initMaterials.body));
	}
	
	scene.add( aircraft.mesh );
	
	$("#wtf").click(function(e){
		e.preventDefault();
		popInManager.showAbout();
	});
	
	$("#camera").click(function(){
		if(currentCameraPosition == cameraPositions.length-1)
		{
			currentCameraPosition = 0;
		}else{
			currentCameraPosition ++;
		}
	});
	
	$("#game canvas").css("background-color", "#000000");
	
	$("header").fadeIn(2000);
	$("#game").fadeIn(2000);
	$("footer").fadeIn(2000);
	
	$("#loader").detach();
	
	if(!popInManager) popInManager = new PopInManager();
	popInManager.showCommands();
	
	animate();
}

function animate() {
	requestAnimationFrame( animate );

	render();
}

function render()
{
	aircraft.animate(controls);
		
	var distZ = camera.position.z - aircraft.mesh.position.z;
	if(distZ != cameraPositions[currentCameraPosition].z) aircraft.mesh.position.z += (distZ-cameraPositions[currentCameraPosition].z)*0.1;
	var distX = camera.position.x - aircraft.mesh.position.x;
	if(distX != cameraPositions[currentCameraPosition].x) aircraft.mesh.position.x += (distX-cameraPositions[currentCameraPosition].x)*0.1;
	camera.position.y = cameraPositions[currentCameraPosition].y;
	
	if ( map.terrain.visible ) {
		map.render(aircraft.forwardDelta, aircraft.sideDelta, sceneRenderTarget);
		composer.render();
	}
	
	$("#speed p:nth-child(1)").text(aircraft.realSpeed+" km/h");
	$("#speed p:nth-child(2)").text(kmhToMph(aircraft.realSpeed)+" mph");
}

function resize(event) {
	width = window.innerWidth - 100;
	height = window.innerHeight - 140;

	renderer.setSize( width, height );

	camera.aspect = width/height;
	camera.updateProjectionMatrix();
	
	cameraOrtho.aspect = width/height;
	cameraOrtho.updateProjectionMatrix();
}

function isStorageAvailable() {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch(e) {
      return false;
    }
}

function webGLIsSupported() {
	try { 
		return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
	} catch( e ) { return false;
	}
}

function kmhToMph(kmh)
{
	var mph = kmh * 0.621371192;
	return Math.round(mph*100) / 100;
}

function clean() {
	window.removeEventListener( 'resize', resize, false);
}