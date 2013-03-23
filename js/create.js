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
var scene;
var renderer;
var aircraft, materials;
var initMaterials;
var customTool, popInManager;
var share;
//
var LOCAL_ID = "labs.tonybeltramelli.com/theWebCopterExperiment:aircraft";
var LOCAL_IMG_ID = "labs.tonybeltramelli.com/theWebCopterExperiment:custom";

function main() {
	width = window.innerWidth - $("#control").width() - 140;
	height = window.innerHeight - 140;
	
	scene = new THREE.Scene();
	
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
	$("#scene").append( renderer.domElement );
	
	materials = new Materials();
	materials.init(materials.HOME_ENV_MAP);
	
	var i = 0;
	var length = materials.materialType.length;
	
	for(i = 0; i < length; i++)
	{
		createElem(materials.materialType[i].name, materials.materialType[i].material);
	}
	
	$("#body ul .clear").before("<a class='button medium' id='custom' href='#'>Custom</a>");
	
	$("#custom").click(function(e){
		e.preventDefault();		
		customTool.show("create");
	});
	
	$("#random").click(function(e){
		e.preventDefault();
		var randomMaterial = materials.getRandomMaterials();
		
		aircraft.setBodyMaterial(randomMaterial.body);
		aircraft.setBladesMaterial(randomMaterial.blades);
		aircraft.setWindshieldMaterial(randomMaterial.windshield);
	});
	
	$("#fly").click(function(e){
		e.preventDefault();
		clean();
		if(customTool.isOpen) customTool.saveCustomCanvas();
		saveAircraft(false);
		$("#create").fadeOut(1000);
		$("#command").fadeOut(950, function() {
			document.location.href='fly';
		});
	});
	
	$("#wtf").click(function(e){
		e.preventDefault();
		popInManager.showAbout();
	});
	
	initMaterials = JSON.parse(localStorage.getItem(LOCAL_ID));
	if(!initMaterials) initMaterials = {body : "multicamochrome", blades : "blackchrome", windshield : "gold"};
	
	aircraft = new Aircraft();
	aircraft.addEventListener(Event.IS_LOADED, aircraftIsLoaded);
	aircraft.init(40, materials.getBodyMaterialByName("multicamochrome"), materials.getBladesMaterialByName(initMaterials.blades), materials.getWindshieldMaterialByName(initMaterials.windshield));
	
	window.addEventListener( 'resize', resize, false );
}

function createElem(id, material) {
	var i = 0;
	var length = material.length;
	
	$("#control .accordion").append("<h2><a href='#'>"+id+"</a></h2><div id='"+id+"'><ul></ul></div>");
	for(i = 0; i < length; i++)
	{
		buildIt(id, material[i]);
	}
	$("#"+id+" ul").append("<li class='clear'></li>");
}

function buildIt(id, materialObject) {
	var materialName = materialObject.name;
	var material = materialObject.material;
	
	$("#"+id+" ul").append("<li><a id='"+id+"_"+materialName+"' href='#'><img src='./images/textureLittle/"+materialName+".jpg' alt='"+materialName+"'/></a></li>");
	
	$("#"+id+"_"+materialName).click(function(e) {
		e.preventDefault();
		applyMaterial(id, material, materialName);
	});
}

function aircraftIsLoaded() {
	scene.add( aircraft.mesh );
	animate();
	
	if(initMaterials.body == "custom")
	{
		var customDatas = JSON.parse(localStorage.getItem(LOCAL_IMG_ID));
		if(customDatas)
		{
			var loadedTexture;
			materials.addEventListener(Event.READY, function(){
				aircraft.setBodyMaterial(loadedTexture);
			});
			loadedTexture = materials.fromBase64(customDatas);
		}else{
			aircraft.setBodyMaterial(materials.getBodyMaterialByName("multicamochrome"));
		}
	}else{
		aircraft.setBodyMaterial(materials.getBodyMaterialByName(initMaterials.body));
		if(materials.isSpecial(initMaterials.body)) aircraft.special = true;
	}
	
	customTool = new CustomTool(aircraft, materials);
	
	if(!popInManager) popInManager = new PopInManager();
	popInManager.showHomePopUp();
	
	$("#save").click(function(e){
		e.preventDefault();
		saveAircraft(true);
	});
	
	$("#push").click(function(e){
		e.preventDefault();
		share = "";
		pushAircraft(false);
	});
	
	$("#share .fb").click(function(e){
		e.preventDefault();
		share = "https://www.facebook.com/sharer.php?u={URL}";
		pushAircraft(true);
	});
	
	$("#share .tw").click(function(e){
		e.preventDefault();
		share = "http://twitter.com/intent/tweet?url={URL}";
		pushAircraft(true);
	});
	
	$("#share .gp").click(function(e){
		e.preventDefault();
		share = "https://plus.google.com/share?url={URL}";
		pushAircraft(true);
	});
	
	$("header").fadeIn(2000);
	$("#create").fadeIn(2000);
	$("footer").fadeIn(2000);
	
	$("#loader").detach();
	
	$("#control .accordion").accordion();
}

function applyMaterial(id, material, materialName) {
	switch(id)
	{
		case "body":
			if(aircraft.special == true)
			{
				aircraft.setBladesMaterial({name: materials.bladesMaterials[0].name, material: materials.bladesMaterials[0].material});
				aircraft.setWindshieldMaterial({name: materials.windshieldMaterials[0].name, material: materials.windshieldMaterials[0].material});
			}
			aircraft.setBodyMaterial({name: materialName, material : material});
			break;
		case "blades":
			if(aircraft.special == true)
			{
				aircraft.setBodyMaterial({name: materials.bodyMaterials[0].name, material: materials.bodyMaterials[0].material});
				aircraft.setWindshieldMaterial({name: materials.windshieldMaterials[0].name, material: materials.windshieldMaterials[0].material});
			}
			aircraft.setBladesMaterial({name: materialName, material : material});
			break;
		case "windshield":
			if(aircraft.special == true)
			{
				aircraft.setBodyMaterial({name: materials.bodyMaterials[0].name, material: materials.bodyMaterials[0].material});
				aircraft.setBladesMaterial({name: materials.bladesMaterials[0].name, material: materials.bladesMaterials[0].material});
			}
			aircraft.setWindshieldMaterial({name: materialName, material : material});
			break;
		case "special":
			aircraft.setSpecialMaterial({name: materialName, material : material});
			break;	
	}
}

function saveAircraft(popin) {
	displayLoader();
	
	if(!isStorageAvailable)
	{
		$("#command .loader").detach();
		if(popin) popInManager.show("ERROR", "Sorry, but your aircraft cannot be saved.");
		return;
	}
	
	var materialNames = { body : aircraft.currentBodyMaterialName, blades : aircraft.currentBladesMaterialName, windshield : aircraft.currentWindshieldMaterialName };
	localStorage.setItem( LOCAL_ID, JSON.stringify(materialNames) );
	
	if(!JSON.parse(localStorage.getItem(LOCAL_ID)))
	{
		$("#command .loader").detach();
		if(popin) popInManager.show("ERROR", "Sorry, but your aircraft cannot be saved.");
	}else{
		$("#command .loader").detach();
		if(popin) popInManager.show("SUCCESS", "Your aircraft have been successfully saved.");
	}
}

function pushAircraft(boo) {
	displayLoader();
	
	var materialNames = {
			body : aircraft.currentBodyMaterialName,
			blades : aircraft.currentBladesMaterialName,
			windshield : aircraft.currentWindshieldMaterialName
	};
	
	if(aircraft.currentBodyMaterialName == "custom")
	{
		var customDatas = JSON.parse(localStorage.getItem(LOCAL_IMG_ID));
		if(customDatas)
		{
			var customMaterial = { width : customDatas.width, height : customDatas.height, datas : customDatas.datas, glossy : customDatas.glossy };
			materialNames = { 
					body : aircraft.currentBodyMaterialName,
					blades : aircraft.currentBladesMaterialName,
					windshield : aircraft.currentWindshieldMaterialName,
					custom: customMaterial
			};
		}
	}
	
	var datas = JSON.stringify(materialNames);
	$.ajax({
	  type: 'POST',
	  url: "script/addNew.php",
	  data: {data : datas, boo : boo == true ? 1 : 0},
	  success: boo ? successShareAircraftHandler : successPushAircraftHandler
	});
}

function successPushAircraftHandler(data) {
	$("#command .loader").detach();
	if(data == "success")
	{
		popInManager.show("SUCCESS", "Your aircraft have been saved to the gallery.");
	}else{
		popInManager.show("ERROR", data);
	}
}

function successShareAircraftHandler(data) {
	$("#command .loader").detach();
	var reg = new RegExp("({URL})", "g");
	
	var url = document.URL;
	var urlSection = url.split("create");
	var updatedUrl = urlSection[0] + "gallery?" + data;
	
	window.open(share.replace(reg, updatedUrl));
}

function displayLoader() {
	$("#command").append('<img class="loader" src="images/loader.gif" alt="loading..."/>');
}

function animate() {
	requestAnimationFrame( animate );
    
	render();
}

function render(){
	aircraft.mesh.rotation.y += 0.005;
	
	renderer.render( scene, camera );
}

function resize(event) {
	width = window.innerWidth - $("#control").width() - 140;
	height = window.innerHeight - 140;

	renderer.setSize( width, height );

	camera.aspect = width/height;
	camera.updateProjectionMatrix();
	
	popInManager.position();
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

function clean() {
	window.removeEventListener( 'resize', resize, false);
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

function getMousePosition(e, element) {
	var rect = element.getBoundingClientRect();
	
	var docTop = document.documentElement.scrollTop;
	docTop = docTop == 0 ? document.body.scrollTop : docTop;
	
	var docLeft = document.documentElement.scrollLeft;
	docLeft = docLeft == 0 ? document.body.scrollLeft : docLeft;
			
	var mouseX = e.pageX - rect.left - docLeft;
	var mouseY = e.pageY - rect.top - docTop;

	return {
		x : mouseX,
		y : mouseY
	}
}

function webGLIsSupported() {
	try { 
		return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
	} catch( e ) { return false;
	}
}