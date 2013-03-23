/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 *
 */

Aircraft = function() {
	this.mesh = new THREE.Object3D();
	this.body;
	this.firstBlade;
	this.secondBlade;
	this.rotor;
	this.tailFirstBlade;
	this.tailSecondBlade;
	this.tailRotor;
	this.windshield;
	this.geometry;
	this.gravityDec;
	this.special = false;
	this.OR_Y = 1.57;
	this.realSpeed;
	//
	this.MAX_FORWARD_SPEED = 500;
	this.MAX_BACKWARD_SPEED	= -1200;
	this.MAX_LEFT_SPEED = 900;
	this.MAX_RIGHT_SPEED = -900;
	//
	this.FRONT_ACCELERATION	= 100;
	this.BACK_ACCELERATION = 250;
	this.SIDE_ACCELERATION	= 200;
	//
	this.FRONT_DECCELERATION = 5;
	this.STEERING_RADIUS_RATIO = 0.0023;
	this.MAX_TILT_SIDES	= 0.1;
	this.MAX_TILT_FRONTBACK	= 0.25;
	//
	this.speed = 0;
	this.acceleration = 0;
	//
	this.side_speed = 0;
	this.side_acceleration = 0;
	//
	this.forwardDelta;
	this.sideDelta;
	//
	this.currentBodyMaterialName;
	this.currentBladesMaterialName;
	this.currentWindshieldMaterialName;
};

Aircraft.prototype = new EventDispatcher();
Aircraft.prototype.constructor = Aircraft;

Aircraft.prototype.init = function(gravityDec, bodyMaterial, bladesMaterial, glassMaterial)
{
	var self = this;
	var loader = new THREE.JSONLoader();
	loader.load( "modele/AIRraptor/AirRaptor.js", function(geometry) { self.modeleIsLoaded( geometry, gravityDec, bodyMaterial, bladesMaterial, glassMaterial ) } );
};

Aircraft.prototype.modeleIsLoaded = function(geometry, gravityDec, bodyMaterial, bladesMaterial, glassMaterial)
{
	this.geometry = geometry;
	this.gravityDec = gravityDec;
	
	var m = new THREE.MeshFaceMaterial();
	geometry.materials[ 1 ] = bodyMaterial.material;
	
	this.body = new THREE.Mesh( geometry, m );
	this.body.position.z = -4;
	this.body.position.x = gravityDec;
	
	this.firstBlade = new THREE.Mesh( new THREE.CubeGeometry( 500, 2, 20 ), bladesMaterial.material );
	this.secondBlade = new THREE.Mesh( new THREE.CubeGeometry( 20, 2, 500 ), bladesMaterial.material );
	this.firstBlade.position.y = this.secondBlade.position.y = 150;
	this.firstBlade.position.x = this.secondBlade.position.x = gravityDec;
	this.firstBlade.rotation.y = this.secondBlade.rotation.y = 10;
	
	this.rotor = new THREE.Mesh( new THREE.CylinderGeometry(10, 20, 40), bladesMaterial.material );
	this.rotor.position.y = 140;
	this.rotor.position.x = gravityDec;
	
	this.tailFirstBlade = new THREE.Mesh( new THREE.CubeGeometry( 10, 100, 2 ), bladesMaterial.material );
	this.tailSecondBlade = new THREE.Mesh( new THREE.CubeGeometry( 100, 10, 2 ), bladesMaterial.material );
	this.tailFirstBlade.position.y = this.tailSecondBlade.position.y = 100;
	this.tailFirstBlade.position.z = this.tailSecondBlade.position.z = 30;
	this.tailFirstBlade.position.x = this.tailSecondBlade.position.x = gravityDec - 320;
	
	this.tailRotor = new THREE.Mesh( new THREE.CylinderGeometry(5, 10, 20), bladesMaterial.material );
	this.tailRotor.position.y = 100;
	this.tailRotor.position.z = 30;
	this.tailRotor.position.x = gravityDec - 320;
	this.tailRotor.rotation.x = 1.6;
	
	this.windshield = new THREE.Mesh( new THREE.SphereGeometry(96, 40, 40), glassMaterial.material );
	this.windshield.scale.x = 0.85;
	this.windshield.scale.y = 0.28;
	this.windshield.scale.z = 0.3;
	this.windshield.rotation.z = -0.42;
	this.windshield.position.x = gravityDec + 132;
	this.windshield.position.y = 85;
	
	this.mesh.add(this.body);
	this.mesh.add(this.firstBlade);
	this.mesh.add(this.secondBlade);
	this.mesh.add(this.rotor);
	this.mesh.add(this.tailFirstBlade);
	this.mesh.add(this.tailSecondBlade);
	this.mesh.add(this.tailRotor);
	this.mesh.add(this.windshield);
	
	this.currentBodyMaterialName = bodyMaterial.name;
	this.currentBladesMaterialName = bladesMaterial.name;
	this.currentWindshieldMaterialName = glassMaterial.name;
	
	this.dispatchEvent(Event.IS_LOADED);
};

Aircraft.prototype.setGravityCenter = function(gravityDec)
{
	this.body.position.x = gravityDec;
	this.firstBlade.position.x = this.secondBlade.position.x = gravityDec;
	this.rotor.position.x = gravityDec;
	this.tailFirstBlade.position.x = this.tailSecondBlade.position.x = gravityDec - 320;
	this.tailRotor.position.x = gravityDec - 320;
	this.windshield.position.x = gravityDec + 132;
};

Aircraft.prototype.setBodyMaterial = function(material)
{
	this.special = false;
	this.currentBodyMaterialName = material.name;
	
	this.geometry.materials[ 1 ] = material.material;
};

Aircraft.prototype.getBodyMaterial = function()
{
	return this.geometry.materials[ 1 ];
};

Aircraft.prototype.setBladesMaterial = function(material)
{
	this.special = false;
	this.currentBladesMaterialName = material.name;
	
	this.firstBlade.material = material.material;
	this.secondBlade.material = material.material;
	this.rotor.material = material.material;
	this.tailFirstBlade.material = material.material;
	this.tailSecondBlade.material = material.material;
	this.tailRotor.material = material.material;
};

Aircraft.prototype.getBladesMaterial = function()
{
	return this.firstBlade.material;
};

Aircraft.prototype.setWindshieldMaterial = function(material)
{
	this.special = false;
	this.currentWindshieldMaterialName = material.name;
	
	this.windshield.material = material.material;
};

Aircraft.prototype.getWindshieldMaterial = function()
{
	return this.windshield.material;
};

Aircraft.prototype.setSpecialMaterial = function(material)
{
	this.special = true;
	
	this.geometry.materials[ 1 ] = material.material;
	this.firstBlade.material = material.material;
	this.secondBlade.material = material.material;
	this.rotor.material = material.material;
	this.tailFirstBlade.material = material.material;
	this.tailSecondBlade.material = material.material;
	this.tailRotor.material = material.material;
	this.windshield.material = material.material;
	
	this.currentBodyMaterialName = material.name;
	this.currentBladesMaterialName = material.name;
	this.currentWindshieldMaterialName = material.name;
};

Aircraft.prototype.animate = function(controls)
{
	var delta = 0.019;
	
	this.firstBlade.rotation.y += 0.3;
	this.secondBlade.rotation.y += 0.3;
	
	this.tailFirstBlade.rotation.z += 0.3;
	this.tailSecondBlade.rotation.z += 0.3;
	
	if(controls.moveForward) {
		this.speed = THREE.Math.clamp( this.speed + delta * this.FRONT_ACCELERATION, this.MAX_BACKWARD_SPEED, this.MAX_FORWARD_SPEED );
		this.acceleration = THREE.Math.clamp( this.acceleration + delta, -1, 1 );
	}

	if(controls.moveBackward) {
		this.speed = THREE.Math.clamp( this.speed - delta * this.BACK_ACCELERATION, this.MAX_BACKWARD_SPEED, this.MAX_FORWARD_SPEED );
		this.acceleration = THREE.Math.clamp( this.acceleration - delta, -1, 1 );
	}

	if(controls.moveRight) {
		this.side_speed = THREE.Math.clamp( this.side_speed + delta * this.SIDE_ACCELERATION, this.MAX_RIGHT_SPEED, this.MAX_LEFT_SPEED );
		this.side_acceleration = THREE.Math.clamp( this.side_acceleration + delta, -1, 1 );
	}

	if(controls.moveLeft) {
		this.side_speed = THREE.Math.clamp( this.side_speed - delta * this.SIDE_ACCELERATION, this.MAX_RIGHT_SPEED, this.MAX_LEFT_SPEED );
		this.side_acceleration = THREE.Math.clamp( this.side_acceleration - delta, -1, 1 );
	}

	if(!(controls.moveForward || controls.moveBackward)) {
		if(this.speed > 0) {
			var k = exponentialEaseOut( this.speed / this.MAX_FORWARD_SPEED );

			this.speed = THREE.Math.clamp( this.speed - k * delta * this.FRONT_DECCELERATION, 0, this.MAX_FORWARD_SPEED );
			this.acceleration = THREE.Math.clamp( this.acceleration - k * delta, 0, 1 );
		}else{
			var k = exponentialEaseOut( this.speed / this.MAX_BACKWARD_SPEED );

			this.speed = THREE.Math.clamp( this.speed + k * delta * this.BACK_ACCELERATION, this.MAX_BACKWARD_SPEED, 0 );
			this.acceleration = THREE.Math.clamp( this.acceleration + k * delta, -1, 0 );
		}
	}
	
	if(!(controls.moveLeft || controls.moveRight)) {
		if (this.side_speed > 0) {
			var k = exponentialEaseOut( this.side_speed / this.MAX_LEFT_SPEED );

			this.side_speed = THREE.Math.clamp( this.side_speed - k * delta * this.FRONT_DECCELERATION, 0, this.MAX_LEFT_SPEED );
			this.side_acceleration = THREE.Math.clamp( this.side_acceleration - k * delta, 0, 1 );
		}else{
			var k = exponentialEaseOut( this.side_speed / this.MAX_RIGHT_SPEED );

			this.side_speed = THREE.Math.clamp( this.side_speed + k * delta * this.BACK_ACCELERATION, this.MAX_RIGHT_SPEED, 0 );
			this.side_acceleration = THREE.Math.clamp( this.side_acceleration + k * delta, -1, 0 );
		}
	}

	this.forwardDelta = this.speed * delta;
	this.sideDelta = this.side_speed * delta;
	
	var tempSpeed = this.speed;
	tempSpeed = tempSpeed < 0 ? tempSpeed * -1 : tempSpeed;
	var tempSideSpeed = this.side_speed;
	tempSideSpeed = tempSideSpeed < 0 ? tempSideSpeed * -1 : tempSideSpeed;
	
	this.realSpeed = tempSpeed > tempSideSpeed ? Math.round((tempSpeed - tempSideSpeed * delta)*0.25) : Math.round((tempSideSpeed - tempSpeed * delta)*0.15);
	
	this.mesh.position.z += this.forwardDelta;
	this.mesh.position.x += this.sideDelta;

	this.mesh.rotation.z = this.MAX_TILT_FRONTBACK * this.acceleration;
	this.mesh.rotation.y = this.OR_Y + this.MAX_TILT_SIDES * this.side_acceleration;
};

function exponentialEaseOut(n) { return n === 1 ? 1 : -Math.pow(2, -10 * n) + 1;};
