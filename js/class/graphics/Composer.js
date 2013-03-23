/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

Composer = function(width, height, renderer, camera) {
	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	var renderTarget = new THREE.WebGLRenderTarget( width, height, renderTargetParameters );

	effectBloom = new THREE.BloomPass( 0.2 );
	
	var hblur = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalTiltShift" ] );
	var vblur = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalTiltShift" ] );

	var bluriness = 1;

	hblur.uniforms[ 'h' ].value = bluriness / width;
	vblur.uniforms[ 'v' ].value = bluriness / height;
	hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.2;
	
	var renderModel = new THREE.RenderPass( scene, camera );
	
	vblur.renderToScreen = true;

	this.composer = new THREE.EffectComposer( renderer, renderTarget );
	this.composer.addPass( renderModel );
	this.composer.addPass( effectBloom );
	this.composer.addPass( hblur );
	this.composer.addPass( vblur );
};

Composer.prototype.constructor = Composer;

Composer.prototype.render = function() {
	this.composer.render( 0.1 );
};