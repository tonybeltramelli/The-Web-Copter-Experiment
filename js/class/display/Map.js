/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

Map = function(SCREEN_WIDTH, SCREEN_HEIGHT, renderer, cameraOrtho) {
	this.width = SCREEN_WIDTH;
	this.height = SCREEN_HEIGHT;
	this.renderer = renderer;
	this.heightMap;
	this.normalMap;
	this.cameraOrtho = cameraOrtho;
	this.quadTarget;
	this.terrain;
	this.texturesLoaded = 0;
	this.mlib = {};
	this.uniformsTerrain;
};

Map.prototype = new EventDispatcher();
Map.prototype.constructor = Map;

Map.prototype.init = function()
{
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShaderNoise = document.getElementById( 'fragmentShaderNoise' ).textContent;
	
	var normalShader = THREE.ShaderExtras[ 'normalmap' ];
	var terrainShader = THREE.ShaderTerrain[ "terrain" ];

	var rx = 256;
	var ry = 256;
	var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
	this.normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );

	uniformsNoise = {
		time:   { type: "f", value: 1.0 },
		scale:  { type: "v2", value: new THREE.Vector2( 1.5, 1.5 ) },
		offset: { type: "v2", value: new THREE.Vector2( 0, 0 ) }
	};
	
	uniformsNormal = THREE.UniformsUtils.clone( normalShader.uniforms );

	uniformsNormal.height.value = 0.05;
	uniformsNormal.resolution.value.set( rx, ry );
	uniformsNormal.heightMap.texture = this.heightMap;
	
	var specularMap = new THREE.WebGLRenderTarget( 2048, 2048, pars );
	
	var self = this;
	
	var diffuseTexture1 = THREE.ImageUtils.loadTexture( "texture/terrain/soil-big.jpg", null, function () {
		self.textureIsLoaded();
		self.applyShader( THREE.ShaderExtras[ 'luminosity' ], diffuseTexture1, specularMap );
	});
	var diffuseTexture2 = THREE.ImageUtils.loadTexture( "texture/terrain/soil-details.jpg", null, function () {
		self.textureIsLoaded();
	});
	var detailTexture = THREE.ImageUtils.loadTexture( "texture/terrain/grasslight-big-nm.jpg", null, function () {
		self.textureIsLoaded();
	});
	
	diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
	diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
	detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
	specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;

	uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );
	
	uniformsTerrain[ "tNormal" ].texture = this.normalMap;
	uniformsTerrain[ "tDisplacement" ].texture = this.heightMap;
	uniformsTerrain[ "tDiffuse1" ].texture = diffuseTexture1;
	uniformsTerrain[ "tDiffuse2" ].texture = diffuseTexture2;
	uniformsTerrain[ "tSpecular" ].texture = specularMap;
	uniformsTerrain[ "tDetail" ].texture = detailTexture;
	
	uniformsTerrain[ "enableDiffuse1" ].value = true;
	uniformsTerrain[ "enableDiffuse2" ].value = true;
	uniformsTerrain[ "enableSpecular" ].value = true;

	uniformsTerrain[ "uDiffuseColor" ].value.setHex( 0xededed );
	uniformsTerrain[ "uSpecularColor" ].value.setHex( 0xffffff );
	uniformsTerrain[ "uAmbientColor" ].value.setHex( 0x111111 );
	
	uniformsTerrain[ "uNormalScale" ].value = 3.5;
	uniformsTerrain[ "uShininess" ].value = 30;
	uniformsTerrain[ "uDisplacementScale" ].value = 520;
	uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );

	var params = [
	              [ 'heightmap', fragmentShaderNoise, vertexShader, uniformsNoise, false ],
	              [ 'normal', normalShader.fragmentShader,  normalShader.vertexShader, uniformsNormal, false ],
	              [ 'terrain', terrainShader.fragmentShader, terrainShader.vertexShader, uniformsTerrain, true ]
	];
	
	var i = 0;
	var l = params.length;
	
	for( i = 0; i < l; i ++ ) {
		material = new THREE.ShaderMaterial( {
			uniforms: 		params[ i ][ 3 ],
			vertexShader: 	params[ i ][ 2 ],
			fragmentShader: params[ i ][ 1 ],
			lights: 		params[ i ][ 4 ],
			fog: 			true
		} );
		this.mlib[ params[ i ][ 0 ] ] = material;
	}
	
	var plane = new THREE.PlaneGeometry( this.width, this.height );

	this.quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
	this.quadTarget.position.z = -500;
	this.quadTarget.rotation.x = Math.PI / 2;

	var geometryTerrain = new THREE.PlaneGeometry( 6000, 6000, 256, 256 );
	geometryTerrain.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
	geometryTerrain.computeFaceNormals();
	geometryTerrain.computeVertexNormals();
	geometryTerrain.computeTangents();

	this.terrain = new THREE.Mesh( geometryTerrain, this.mlib[ "terrain" ] );
	this.terrain.position.set( 0, -125, 0 );
	this.terrain.rotation.x = -Math.PI / 2;
	this.terrain.visible = false;
	
	this.dispatchEvent(Event.IS_LOADED);
};

Map.prototype.applyShader = function( shader, texture, target )
{
	var shaderMaterial = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms )
	});
	
	shaderMaterial.uniforms[ "tDiffuse" ].texture = texture;
	
	var tempMesh = new THREE.Mesh( new THREE.PlaneGeometry( this.width, this.height ), shaderMaterial );
	tempMesh.position.z = -500;
	tempMesh.rotation.x = Math.PI / 2;
	
	var tempScene = new THREE.Scene(); 
	tempScene.add( tempMesh );

	this.renderer.render( tempScene, this.cameraOrtho, target, true );
};

Map.prototype.textureIsLoaded = function() {
	this.texturesLoaded += 1;
	
	if ( this.texturesLoaded == 3 )	{
		this.terrain.visible = true;
	}
};

Map.prototype.render = function(forwardDelta, sideDelta, sceneRenderTarget) {
	var speedForward = -0.0004 * forwardDelta;
	var speedSide = 0.00015 * sideDelta;
	
	uniformsNoise[ "offset" ].value.x +=  speedSide;
	uniformsTerrain[ "uOffset" ].value.x = 4 * uniformsNoise[ "offset" ].value.x;
	
	uniformsNoise[ "offset" ].value.y += speedForward;
	uniformsTerrain[ "uOffset" ].value.y = -4 * uniformsNoise[ "offset" ].value.y;

	this.quadTarget.material = this.mlib[ "heightmap" ];
	this.renderer.render( sceneRenderTarget, this.cameraOrtho, this.heightMap, true );

	//this.quadTarget.material = this.mlib[ "normal" ];
	this.renderer.render( sceneRenderTarget, this.cameraOrtho, this.normalMap, true );
};