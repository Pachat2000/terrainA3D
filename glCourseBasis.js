
// =====================================================
var gl;

// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var rotMatrix = mat4.create();
var distCENTER;
var lightPos = [0.0, 4.0, -3.0];
// =====================================================

var OBJ1 = null;
var PLANE = null;
var CUBE = null;
var LAND = null;
var PHONG = null;
var RIVER = null;
var LAMBERT = null;
var isWireframe = false;
var isTextured = false;
var isLandDisplay = false;
var isObjDisplay = false;
var selectedObj = null;
var isWaterDisplay = false;

// =====================================================
// OBJET 3D, lecture fichier obj
// =====================================================

class objmesh {

	// --------------------------------------------
	constructor(objFname) {
		this.objName = objFname;
		this.shaderName = 'obj';
		this.loaded = -1;
		this.shader = null;
		this.mesh = null;
		
		loadObjFile(this);
		loadShaders(this);
	}

	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.nAttrib = gl.getAttribLocation(this.shader, "aVertexNormal");
		gl.enableVertexAttribArray(this.shader.nAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
		gl.vertexAttribPointer(this.shader.nAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.rMatrixUniform = gl.getUniformLocation(this.shader, "uRMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	}
	
	// --------------------------------------------
	setMatrixUniforms() {
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.uniformMatrix4fv(this.shader.rMatrixUniform, false, rotMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
	}
	
	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4 && this.mesh != null) {
			this.setShadersParams();
			this.setMatrixUniforms();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
			gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_INT, 0);
		}
	}
}

class land{
		
	// --------------------------------------------
	constructor() {
		this.shaderName='land';
		this.loaded=-1;
		this.shader=null;
		this.initAll();
	}

		
	// --------------------------------------------
	initAll() {
		var img = new Image();
		img.src = "heightmap/texture2.png"; //heighMap
		img.onload = () => {

            this.buildTerrain(img.width, img.height);
			this.initHeighMap(img)
		};

		var img2 = new Image();
		img2.src = "texture/snow.jpg"; //texture
		img2.onload = () => {

			this.initTexture(img2)
		};
		loadShaders(this);
	}
	

	// --------------------------------------------
	buildTerrain(width, height){

		var terrainSize = 3.0;
		var vertices = [];
		var indices = [];

		var textures = [];
		for(var z = 0; z < height; z++){
			for(var x = 0; x < width; x++){
				var xPos = (x / (width - 1)) * terrainSize - (terrainSize / 2.0);
				var zPos = (z / (height - 1)) * terrainSize - (terrainSize / 2.0);
				vertices.push(xPos, zPos, 0.0);

				var u = x / (width - 1);  
                var v = z / (height - 1); 
                
                textures.push(u, v);
			}
		}

		for(var z = 0; z < height-1; z++){
			for(var x = 0; x < width-1; x++){
				var topLeft = (z * width + x);
				var topRight = (z * width + x) +1;
				var bottomLeft = ((z + 1) * width + x);
				var bottomRight = ((z + 1)  * width + x) +1;

				indices.push(topLeft, bottomRight,  bottomLeft);
				indices.push(topLeft, topRight, bottomRight);
			}
		}


		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = vertices.length;

		this.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
		this.iBuffer.numItems = indices.length;

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = textures.length;
	}
	
	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");//
		this.shader.vAttribP = gl.getAttribLocation(this.shader, "aVertexNormal");//
		this.shader.vAttribT = gl.getAttribLocation(this.shader, "aTexCoords");//


		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uProjectionMatrix");//
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uModelViewMatrix");//
		this.shader.uNormalMatrix = gl.getUniformLocation(this.shader, "uNormalMatrix");
		this.shader.uLightPos = gl.getUniformLocation(this.shader, "uLightPos");//

		this.shader.uNormalizing = gl.getUniformLocation(this.shader, "uNormalizing");//
		this.shader.uMaterialColor = gl.getUniformLocation(this.shader, "uMaterialColor");//
		this.shader.uMaterialSpecular = gl.getUniformLocation(this.shader, "uMaterialSpecular");//
		this.shader.uMaterialShininess = gl.getUniformLocation(this.shader, "uMaterialShininess");//
		
		this.shader.uLightSpecular = gl.getUniformLocation(this.shader, "uLightSpecular");//
		this.shader.uLighting = gl.getUniformLocation(this.shader, "uLighting");//
		this.shader.uLightColor = gl.getUniformLocation(this.shader, "uLightColor");//
		this.shader.uAmbiantLight = gl.getUniformLocation(this.shader, "uAmbiantLight");//

		this.shader.uTextureUnit = gl.getUniformLocation(this.shader, "uTextureUnit");
		this.shader.uHeightMap = gl.getUniformLocation(this.shader, "uHeightMap");
		this.shader.uTexturing = gl.getUniformLocation(this.shader, "uTexturing");

		this.shader.terrain = gl.getUniformLocation(this.shader, "terrain");

		gl.enableVertexAttribArray(this.shader.vAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(this.shader.vAttribT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.vertexAttribPointer(this.shader.vAttribT, this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);


		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(this.shader.uNormalMatrix, false, normalMatrix);


		gl.uniform1i(this.shader.uLighting, true); // lumiere ?
		gl.uniform1i(this.shader.uTextureUnit, 1);
		gl.uniform1i(this.shader.uTexturing, isTextured); // text ??


		gl.uniform4fv(this.shader.uMaterialSpecular, [.3, .3, .3,1.0]); 
		gl.uniform1i(this.shader.terrain, 1);
		gl.uniform1i(this.shader.uHeightMap, 0);

		gl.uniform4fv(this.shader.uMaterialSpecular, [.3, .3, .3,1.0]); 
        gl.uniform1f(this.shader.uMaterialShininess, 10.0);

		gl.uniform1i(this.shader.uNormalizing, 1);
		gl.uniform4fv(this.shader.uLightSpecular, [.5, .5, .5, 1.0]);
		gl.uniform3fv(this.shader.uLightPos, lightPos);     // Position de la lumière
		gl.uniform4fv(this.shader.uAmbiantLight, [0.2, 0.2, 0.2, 1.0]);
		gl.uniform4fv(this.shader.uLightColor, [0.8, 0.8, 0.8, 1.0]);

	}

	// --------------------------------------------
	initTexture(texturePath)
	{
		this.textureTerrain = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, this.textureTerrain);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texturePath);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.activeTexture(gl.TEXTURE1);	
	}

	initHeighMap(img)
	{
		this.heighMap = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, this.heighMap);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.activeTexture(gl.TEXTURE0);
	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4 && this.vBuffer) {
			this.setShadersParams();

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.heighMap);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.textureTerrain);

			gl.uniform4fv(this.shader.uMaterialColor, [1.0, 1.0, 1.0, 1.0]); // Rouge
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
			if(isWireframe){
				gl.drawElements(gl.LINE_STRIP, this.iBuffer.numItems, gl.UNSIGNED_INT, 0); // fils de fers
			}
			else{
				gl.drawElements(gl.TRIANGLES, this.iBuffer.numItems, gl.UNSIGNED_INT, 0);				
			}
			
		
		}
	}

}

// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

class plane {
	
	// --------------------------------------------
	constructor() {
		this.shaderName='plane';
		this.loaded=-1;
		this.shader=null;
		this.initAll();
	}
		
	// --------------------------------------------
	initAll() {
		var size=1.0;
		var vertices = [
			-size, -size, 0.1,
			 size, -size, 0.1,
			 size, size, 0.1,
			-size, size, 0.1
		];

		var texcoords = [
			0.0,0.0,
			0.0,1.0,
			1.0,1.0,
			1.0,0.0
		];

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 4;

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = 4;

		loadShaders(this);
	}
	
	
	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

		gl.bindVertexArray(null);
	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4) {		
			this.setShadersParams();
			gl.bindVertexArray(this.vao);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
			gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
		}
	}

}

class river {
	
	// --------------------------------------------
	constructor() {
		this.shaderName='river';
		this.loaded=-1;
		this.shader=null;
		this.texture = null;
		this.bumpmap = null;
		this.initAll();
	}

	loadTexture(src)
	{
		var texImage = new Image();
		var texture = gl.createTexture();

		texImage.onload = function () {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, null);
		};
		texImage.src = src;
		return texture;
	}

	initTexture(){
		this.texture = this.loadTexture("texture/river.jpg");
		this.bumpmap = this.loadTexture("bumpmap/river_normal.jpg")
	}
		
	// --------------------------------------------
	initAll() {
		var size=1.0;
		var vertices = [
			-size, -size, 0.1,
			 size, -size, 0.1,
			 size, size, 0.1,
			-size, size, 0.1
		];

		var texcoords = [
			0.0,0.0,
			0.0,1.0,
			1.0,1.0,
			1.0,0.0
		];


		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 4;

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = 4;

		/*
		this.nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		this.nBuffer.itemSize = 3;
		this.nBuffer.numItems = 4;
		*/

		loadShaders(this);
		this.initTexture()
	}
	
	
	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");//
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");//
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		/*
		this.shader.nAttrib = gl.getAttribLocation(this.shader, "aNormals");//
		gl.enableVertexAttribArray(this.shader.nAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.shader.nAttrib, this.nBuffer.itemSize, gl.FLOAT, false, 0, 0);
		*/
		
		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");//
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");//

		this.shader.uNormalMatrix = gl.getUniformLocation(this.shader, "uNormalMatrix");//
		this.shader.uNormalizing = gl.getUniformLocation(this.shader, "uNormalizing");//
		this.shader.uMaterialColor = gl.getUniformLocation(this.shader, "uMaterialColor");//
		this.shader.uTexturing = gl.getUniformLocation(this.shader, "uTexturing");//

		this.shader.uLightPos = gl.getUniformLocation(this.shader, "uLightPos");//
		this.shader.uLightColor = gl.getUniformLocation(this.shader, "uLightColor");//
		this.shader.uAmbiantLight = gl.getUniformLocation(this.shader, "uAmbiantLight");//
		this.shader.uLighting = gl.getUniformLocation(this.shader, "uLighting");//

		this.shader.uTextureUnit = gl.getUniformLocation(this.shader, "uTextureUnit");
		this.shader.uSampler = gl.getUniformLocation(this.shader, "uSampler");

		this.shader.uLightSpecular = gl.getUniformLocation(this.shader, "uLightSpecular");//
		this.shader.uMaterialSpecular = gl.getUniformLocation(this.shader, "uMaterialSpecular");//
		this.shader.uMaterialShininess = gl.getUniformLocation(this.shader, "uMaterialShininess");//

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(this.shader.uNormalMatrix, false, normalMatrix);

		gl.uniform1i(this.shader.uNormalizing, 1);
		gl.uniform1i(this.shader.uTexturing, 1); // texture activation
		gl.uniform4fv(this.shader.uMaterialColor, [0.5, 0.5, 0.5, 1.0]);

		gl.uniform3fv(this.shader.uLightPos, lightPos);
		gl.uniform4fv(this.shader.uAmbiantLight, [0.05, 0.2, 0.3, 1.0]);
		gl.uniform4fv(this.shader.uLightColor, [0.9, 0.95, 1.0, 1.0])
		gl.uniform1i(this.shader.uTextureUnit, 0);
		gl.uniform1i(this.shader.uSampler, 1);
		gl.uniform1i(this.shader.uLighting, true);

		gl.uniform4fv(this.shader.uLightSpecular, [1.0, 1.0, 1.0, 1.0]);    
		gl.uniform4fv(this.shader.uMaterialSpecular, [1.0, 1.0, 1.0, 1.0]);
		gl.uniform1f(this.shader.uMaterialShininess, 200.0);

		gl.uniform1i(this.shader.uTextureUnit, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.uniform1i(this.shader.uSampler, 1);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.bumpmap);
	}

	// --------------------------------------------
	draw() {
		if(this.shader && this.loaded==4) {		
			this.setShadersParams();
			
			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
			gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
		}
	}
}

// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================



// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("webgl2");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.clearColor(0.7, 0.7, 0.7, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK); 
	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}


// =====================================================
loadObjFile = function(OBJ3D)
{
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var tmpMesh = new OBJ.Mesh(xhttp.responseText);
			OBJ.initMeshBuffers(gl,tmpMesh);
			OBJ3D.mesh=tmpMesh;
		}
	}



	xhttp.open("GET", OBJ3D.objName, true);
  xhttp.overrideMimeType('text/plain');
	xhttp.send();
}



// =====================================================
function loadShaders(Obj3D) {
	loadShaderText(Obj3D,'.vs');
	loadShaderText(Obj3D,'.fs');
}

// =====================================================
function loadShaderText(Obj3D,ext) {   // lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		if(ext=='.vs') { Obj3D.vsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(ext=='.fs') { Obj3D.fsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(Obj3D.loaded==2) {
			Obj3D.loaded ++;
			compileShaders(Obj3D);
			Obj3D.loaded ++;
		}
	}
  }
  
  Obj3D.loaded = 0;
  xhttp.open("GET",'shaders/' + Obj3D.shaderName + ext, true);
  xhttp.overrideMimeType('text/plain');
  xhttp.send();
}


// =====================================================
function compileShaders(Obj3D)
{
	Obj3D.vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
	gl.compileShader(Obj3D.vshader);
	if (!gl.getShaderParameter(Obj3D.vshader, gl.COMPILE_STATUS)) {
		console.log("Vertex Shader FAILED... "+Obj3D.shaderName+".vs");
		console.log(gl.getShaderInfoLog(Obj3D.vshader));
	}

	Obj3D.fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
	gl.compileShader(Obj3D.fshader);
	if (!gl.getShaderParameter(Obj3D.fshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader FAILED... "+Obj3D.shaderName+".fs");
		console.log(gl.getShaderInfoLog(Obj3D.fshader));
	}

	Obj3D.shader = gl.createProgram();
    gl.attachShader(Obj3D.shader, Obj3D.vshader);
    gl.attachShader(Obj3D.shader, Obj3D.fshader);
    gl.linkProgram(Obj3D.shader);
    if (!gl.getProgramParameter(Obj3D.shader, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
		console.log(gl.getShaderInfoLog(Obj3D.shader));
	}
}


// =====================================================
function webGLStart() {


	
	var canvas = document.getElementById("WebGL-test");

	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	canvas.onwheel = handleMouseWheel;

	initGL(canvas);

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(rotMatrix);
	mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
	mat4.rotate(rotMatrix, rotY, [0, 0, 1]);

	distCENTER = vec3.create([0.0, -0.5, -5.0]);
	
	PLANE = new plane();
	LAND = new land();
	RIVER = new river();

	OBJ1 = new objmesh('obj/bunny.obj');
	//OBJ2 = new objmesh('porsche.obj');
	
	tick();
}


// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//PLANE.draw();
	if(isLandDisplay) LAND.draw();
	if(isObjDisplay) OBJ1.draw();
	if(isWaterDisplay) RIVER.draw();
}

document.addEventListener("DOMContentLoaded", () => {
    var toggle = document.getElementById("wireframeSwitch");
    if (toggle) {
		isWireframe = toggle.checked;
        toggle.addEventListener("change", (e) => {
            isWireframe = e.target.checked;
        });
    }

	var toggleText = document.getElementById("textureActivation");
    if (toggleText) {
		isTextured = toggleText.checked;
        toggleText.addEventListener("change", (e) => {
            isTextured = e.target.checked;
        });
    }

	var toggleDisplay = document.getElementById("landDisplay");
    if (toggleDisplay) {
		isLandDisplay = toggleDisplay.checked;
        toggleDisplay.addEventListener("change", (e) => {
            isLandDisplay = e.target.checked;
        });
    }

	document.getElementById("terrainSelect").addEventListener("change", (e) => {
		if(!LAND) returnl;
		var newImg = new Image();
		newImg.src = e.target.value;
		newImg.onload = () => {
			LAND.buildTerrain(newImg.width, newImg.height);
			LAND.initHeighMap(newImg);
		};
	});

	document.getElementById("textureSelect").addEventListener("change", (e) => {
		var newText = new Image();
		newText.src = e.target.value;
		newText.onload = () => {
			if (!LAND) return;
			LAND.initTexture(newText);
		};
	});

	var toggleText = document.getElementById("objDisplay");
    if (toggleText) {
		isObjDisplay = toggleText.checked;
        toggleText.addEventListener("change", (e) => {
            isObjDisplay = e.target.checked;
        });
    }

	document.getElementById("objSelect").addEventListener("change", (e) => {
		if (!OBJ1) return;
		OBJ1 = new objmesh('obj/'+ e.target.value);
	});

	var toggleText = document.getElementById("waterDisplay");
    if (toggleText) {
		isWaterDisplay = toggleText.checked;
        toggleText.addEventListener("change", (e) => {
            isWaterDisplay = e.target.checked;
        });
    }

	document.getElementById("waterTextureSelect").addEventListener("change", (e) => {
		if (!RIVER) return;
		RIVER.texture = RIVER.loadTexture('texture/' + e.target.value);
	});

	document.getElementById("waterBumMapSelect").addEventListener("change", (e) => {
		if (!RIVER) return;
		RIVER.bumpmap = RIVER.loadTexture('bumpmap/' + e.target.value);
	});
});



