/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

Materials = function() {
	this.HOME_ENV_MAP = "texture/reflexion/gridEnvMap/";
	this.SKY_ENV_MAP = "texture/reflexion/skyEnvMap/";
	this.envMap;
}

Materials.prototype = new EventDispatcher();
Materials.prototype.constructor = Materials;

Materials.prototype.init = function(envMapUrl) {
	this.setEnvMap(envMapUrl, false);

	this.allMaterials = {
		chrome: new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: this.envMap } ),
		blackchrome: new THREE.MeshLambertMaterial( { color: 0x1b1b1b, envMap: this.envMap } ),
		bluechrome : new THREE.MeshLambertMaterial( { color: 0x2484e7, envMap: this.envMap } ),
		greenchrome: new THREE.MeshLambertMaterial( { color: 0x007711, envMap: this.envMap } ),
		redchrome : new THREE.MeshPhongMaterial( { color: 0x770000, envMap: this.envMap, combine: THREE.MixOperation, reflectivity: 0.25 } ),
		orangechrome : new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: this.envMap } ),
		purplechrome: new THREE.MeshLambertMaterial( { color: 0xb128ba, envMap: this.envMap } ),
		brownchrome: new THREE.MeshLambertMaterial( { color: 0x635353, envMap: this.envMap } ),
		gold : new THREE.MeshPhongMaterial( { color: 0xaa9944,  specular:0xffcd04, shininess:50, envMap: this.envMap } ),
		bronze : new THREE.MeshPhongMaterial( { color: 0x150505, specular:0xee6600, shininess:10, envMap: this.envMap } ),
		black : new THREE.MeshPhongMaterial( { color: 0x101010 } ),
		white : new THREE.MeshLambertMaterial( { color: 0xdedede } ),
		brown: new THREE.MeshLambertMaterial( { color: 0x635353 } ),
		navyblue: new THREE.MeshLambertMaterial( { color: 0x1d106e } ),
		blue : new THREE.MeshLambertMaterial( { color: 0x226699 } ),
		green: 	new THREE.MeshLambertMaterial( { color: 0x007711 } ),
		yellow: new THREE.MeshLambertMaterial( { color: 0xfded3d } ),
		orange : new THREE.MeshLambertMaterial( { color: 0xff6600 } ),
		red : new THREE.MeshLambertMaterial( { color: 0xff0000 } ),
		purple: new THREE.MeshLambertMaterial( { color: 0x8032b2 } ),
		glass: new THREE.MeshBasicMaterial( { color: 0x223344, envMap: this.envMap, opacity: 0.5, transparent: true, combine: THREE.MixOperation, reflectivity: 0.25 } ),
		redgreen : new THREE.MeshPhongMaterial( { color: 0xe61414, specular:0x24e53f, envMap: this.envMap } ),
		brownsand : new THREE.MeshPhongMaterial( { color: 0x53412e, specular:0x53842d } ),
		pink: new THREE.MeshLambertMaterial( { color: 0xe133cb } ),
		silver: new THREE.MeshLambertMaterial( { color: 0x1b1b1b, envMap: this.envMap, combine: THREE.MixOperation} ),
		greycamo : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/greycamo.jpg' ), overdraw: true } ),
		desertcamo : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/desertcamo.jpg' ), overdraw: true } ),
		multicamo : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/multicamo.jpg' ), overdraw: true } ),
		cowpattern : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/cowpattern.jpg' ), overdraw: true } ),
		heartpattern : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/heartpattern.jpg' ), overdraw: true } ),
		greycamochrome : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/greycamo.jpg' ), envMap: this.envMap, combine: THREE.MixOperation, reflectivity: 0.5, overdraw: true } ),
		desertcamochrome : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/desertcamo.jpg' ), envMap: this.envMap, combine: THREE.MixOperation, reflectivity: 0.5, overdraw: true } ),
		multicamochrome : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/multicamo.jpg' ), envMap: this.envMap, combine: THREE.MixOperation, reflectivity: 0.5, overdraw: true } ),
		cowpatternchrome : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/cowpattern.jpg' ), envMap: this.envMap, combine: THREE.MixOperation, reflectivity: 0.5, overdraw: true } ),
		heartpatternchrome : new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'texture/mapping/heartpattern.jpg' ), envMap: this.envMap, combine: THREE.MixOperation, reflectivity: 0.5, overdraw: true } )
	};
	
	this.bodyMaterials = new Array(
			{name : "chrome", material : this.allMaterials.chrome},
			{name : "blackchrome", material : this.allMaterials.blackchrome},
			{name : "bluechrome", material : this.allMaterials.bluechrome},
			{name : "greenchrome", material : this.allMaterials.greenchrome},
			{name : "redchrome", material : this.allMaterials.redchrome},
			{name : "orangechrome", material : this.allMaterials.orangechrome},
			{name : "purplechrome", material : this.allMaterials.purplechrome},
			{name : "brownchrome", material : this.allMaterials.brownchrome},
			{name : "gold", material : this.allMaterials.gold},
			{name : "bronze", material : this.allMaterials.bronze},
			{name : "black", material : this.allMaterials.black},
			{name : "white", material : this.allMaterials.white},
			{name : "brown", material : this.allMaterials.brown},
			{name : "navyblue", material : this.allMaterials.navyblue},
			{name : "blue", material : this.allMaterials.blue},
			{name : "green", material : this.allMaterials.green},
			{name : "yellow", material : this.allMaterials.yellow},
			{name : "orange", material : this.allMaterials.orange},
			{name : "red", material : this.allMaterials.red},
			{name : "purple", material : this.allMaterials.purple},
			{name : "greycamo", material : this.allMaterials.greycamo},
			{name : "desertcamo", material : this.allMaterials.desertcamo},
			{name : "multicamo", material : this.allMaterials.multicamo},
			{name : "cowpattern", material : this.allMaterials.cowpattern},
			{name : "heartpattern", material : this.allMaterials.heartpattern},
			{name : "greycamochrome", material : this.allMaterials.greycamochrome},
			{name : "desertcamochrome", material : this.allMaterials.desertcamochrome},
			{name : "multicamochrome", material : this.allMaterials.multicamochrome},
			{name : "cowpatternchrome", material : this.allMaterials.cowpatternchrome},
			{name : "heartpatternchrome", material : this.allMaterials.heartpatternchrome}
	);
	
	this.bladesMaterials = new Array(
			{name : "chrome", material : this.allMaterials.chrome},
			{name : "blackchrome", material : this.allMaterials.blackchrome},
			{name : "bluechrome", material : this.allMaterials.bluechrome},
			{name : "greenchrome", material : this.allMaterials.greenchrome},
			{name : "redchrome", material : this.allMaterials.redchrome},
			{name : "orangechrome", material : this.allMaterials.orangechrome},
			{name : "purplechrome", material : this.allMaterials.purplechrome},
			{name : "brownchrome", material : this.allMaterials.brownchrome},
			{name : "gold", material : this.allMaterials.gold},
			{name : "bronze", material : this.allMaterials.bronze},
			{name : "black", material : this.allMaterials.black},
			{name : "white", material : this.allMaterials.white},
			{name : "brown", material : this.allMaterials.brown},
			{name : "navyblue", material : this.allMaterials.navyblue},
			{name : "blue", material : this.allMaterials.blue},
			{name : "green", material : this.allMaterials.green},
			{name : "yellow", material : this.allMaterials.yellow},
			{name : "orange", material : this.allMaterials.orange},
			{name : "red", material : this.allMaterials.red},
			{name : "purple", material : this.allMaterials.purple}
	);
	
	this.windshieldMaterials = new Array(
			{name : "chrome", material : this.allMaterials.chrome},
			{name : "blackchrome", material : this.allMaterials.blackchrome},
			{name : "bluechrome", material : this.allMaterials.bluechrome},
			{name : "greenchrome", material : this.allMaterials.greenchrome},
			{name : "redchrome", material : this.allMaterials.redchrome},
			{name : "orangechrome", material : this.allMaterials.orangechrome},
			{name : "purplechrome", material : this.allMaterials.purplechrome},
			{name : "brownchrome", material : this.allMaterials.brownchrome},
			{name : "gold", material : this.allMaterials.gold},
			{name : "bronze", material : this.allMaterials.bronze}
	);
	
	this.specialMaterials = new Array(
			{name : "glass", material : this.allMaterials.glass},
			{name : "redgreen", material : this.allMaterials.redgreen},
			{name : "brownsand", material : this.allMaterials.brownsand},
			{name : "pink", material : this.allMaterials.pink},
			{name : "silver", material : this.allMaterials.silver}
	);
	
	this.materialType = new Array(
			{name : "body", material : this.bodyMaterials},
			{name : "blades", material : this.bladesMaterials},
			{name : "windshield", material : this.windshieldMaterials},
			{name : "special", material : this.specialMaterials}
	);
};

Materials.prototype.getRandomMaterials = function()
{
	var bodyMaterialNumber = Math.floor(Math.random() * this.bodyMaterials.length);
	var bladesMaterialNumber = Math.floor(Math.random() * this.bladesMaterials.length);	
	var windshieldMaterialNumber = Math.floor(Math.random() * this.windshieldMaterials.length);
	
	var result = {
		body : {
			name : this.bodyMaterials[bodyMaterialNumber].name,
			material : this.bodyMaterials[bodyMaterialNumber].material
		},
		blades : {
			name : this.bladesMaterials[bladesMaterialNumber].name,
			material : this.bladesMaterials[bladesMaterialNumber].material
		},
		windshield : {
			name : this.bladesMaterials[windshieldMaterialNumber].name,
			material : this.windshieldMaterials[windshieldMaterialNumber].material
		}
	}
	return result;
};

Materials.prototype.setEnvMap = function(url, listenTo)
{
	var r = url;
	var urls = [ r + "px.jpg", r + "nx.jpg",
				 r + "py.jpg", r + "ny.jpg",
				 r + "pz.jpg", r + "nz.jpg" ];

	this.envMap = THREE.ImageUtils.loadTextureCube( urls );
	if(listenTo) this.dispatchEvent(Event.UPDATE);
};

Materials.prototype.getBodyMaterialByName = function(name)
{
	return(this.getMaterialName(this.bodyMaterials, name));
};

Materials.prototype.getBladesMaterialByName = function(name)
{
	return(this.getMaterialName(this.bladesMaterials, name));
};

Materials.prototype.getWindshieldMaterialByName = function(name)
{
	return(this.getMaterialName(this.windshieldMaterials, name));
};

Materials.prototype.getMaterialName = function(aMaterials, name)
{
	var result = this.parse(aMaterials, name);
	
	if(!result)
	{
		result = this.parse(this.specialMaterials, name);
	}
	
	return(result); 
};

Materials.prototype.fromBase64 = function(datas)
{
	var canvas = document.createElement("canvas");
	canvas.width = datas.width;
	canvas.height = datas.height;
	var context = canvas.getContext("2d");

	var self = this;
	
	var image = new Image();
	image.onload = function() {
		context.drawImage(image, 0, 0);
		
		self.dispatchEvent(Event.READY);
	}
	image.src = datas.datas;
	
	return this.createCustomTexture(canvas, datas.glossy);
};

Materials.prototype.createCustomTexture = function(canvas, isGlossy)
{
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
	var customTexture;
	
	if(!isGlossy)
	{
		customTexture = new THREE.MeshBasicMaterial( { map: texture, envMap: this.envMap, combine: THREE.MixOperation, reflectivity: 0.5 } );
	}else{
		customTexture = new THREE.MeshBasicMaterial( { map: texture, envMap: this.envMap, reflectivity: 0.2, overdraw: true } );
	}
	
	return( { material: customTexture, name: "custom" } );
};

Materials.prototype.isSpecial = function(materialName)
{
	var result = this.parse(this.specialMaterials, materialName);
	
	if(result)
	{
		return true;
	}else{
		return false;
	}
};

Materials.prototype.parse = function(aToParse, name)
{
	var i = 0;
	var l = aToParse.length;
	
	for(i = 0; i < l; i++)
	{
		if(aToParse[i].name == name)
		{
			return aToParse[i];
		}
	}
	
	return null;
};
