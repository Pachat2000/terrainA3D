
// =====================================================
var gl;

// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var rotMatrix = mat4.create();
var distCENTER;
// =====================================================

var OBJ1 = null;
var PLANE = null;
var CUBE = null;
var LAND = null;
var PHONG = null;
var RIVER = null;
var LAMBERT = null;

// =====================================================
// OBJET 3D, lecture fichier obj
// =====================================================

class objmesh {

    // --------------------------------------------
    constructor(objFname) {
        this.objName = objFname;
        this.mesh = null;
        
        loadObjFile(this); 
		this.initTexture("texture3.png")
    }

    // --------------------------------------------
    setShadersParams(shaderActif) {
        gl.useProgram(shaderActif.shader);

        gl.enableVertexAttribArray(shaderActif.shader.vAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(shaderActif.shader.vAttribP);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttribP, this.mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(shaderActif.shader.vAttribT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.textureBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttribT, this.mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, distCENTER);
        mat4.multiply(mvMatrix, rotMatrix);

        gl.uniformMatrix4fv(shaderActif.shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderActif.shader.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderActif.shader.uNormalMatrix, false, normalMatrix);

		gl.uniform4fv(shaderActif.shader.uMaterialSpecular, [1.0, 1.0, 1.0,1.0]); 
        gl.uniform1f(shaderActif.shader.uMaterialShininess, 32.0);

        gl.uniform1i(shaderActif.shader.uLighting, 1);

		gl.uniform1i(shaderActif.shader.uTextureUnit, 0);
		gl.uniform1i(shaderActif.shader.uTexturing, true);
    }

	initTexture(texturePath)
	{
		var texImage = new Image();
		texImage.src = texturePath;

		var texture = gl.createTexture();
		texture.image = texImage;

		texImage.onload = function () {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			
			gl.activeTexture(gl.TEXTURE0);
		}
		
	}
    
    // --------------------------------------------
    draw(shaderActif) {
        if(shaderActif.shader && shaderActif.loaded == 4 && this.mesh != null) {
            
            if (!shaderActif.Init) {
                shaderActif.initShadersParams();
            }
            this.setShadersParams(shaderActif);
            gl.uniform4fv(shaderActif.shader.uMaterialColor, [1., 0.6, 0.6, 1.0]); 

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
		img.src = "texture2.png"; //heighMap
		img.onload = () => {

            this.buildTerrain(img.width, img.height);
			this.initHeighMap(img)
		};

		var img2 = new Image();
		img2.src = "ocean.webp"; //texture
		img2.onload = () => {

			this.initTexture(img2)
		};
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
				vertices.push(xPos, 0.0, zPos);

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

				indices.push(topLeft, bottomLeft, bottomRight);
				indices.push(topLeft, bottomRight, topRight);
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
	setShadersParams(shaderActif) {
		gl.useProgram(shaderActif.shader);

		gl.enableVertexAttribArray(shaderActif.shader.vAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(shaderActif.shader.vAttribT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttribT, this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);


		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(shaderActif.shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderActif.shader.mvMatrixUniform, false, mvMatrix);

		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderActif.shader.uNormalMatrix, false, normalMatrix);

		gl.uniform1i(shaderActif.shader.uLighting, true);
		gl.uniform1i(shaderActif.shader.uTextureUnit, 1);
		gl.uniform1i(shaderActif.shader.uTexturing, true);

		gl.uniform1i(shaderActif.shader.terrain, 1);
		gl.uniform1i(shaderActif.shader.uHeightMap, 0);

		gl.uniform4fv(shaderActif.shader.uMaterialSpecular, [.3, .3, .3,1.0]); 
        gl.uniform1f(shaderActif.shader.uMaterialShininess, 10.0);

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
	draw(shaderActif) {
		if(shaderActif && shaderActif.loaded==4) {
			if (!shaderActif.Init) {
                shaderActif.initShadersParams();
            }
			else{
				this.setShadersParams(shaderActif);

				gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.heighMap);

				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, this.textureTerrain);

				gl.uniform4fv(shaderActif.shader.uMaterialColor, [1.0, 1.0, 1.0, 1.0]); // Rouge
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
				//gl.drawElements(gl.TRIANGLES, this.iBuffer.numItems, gl.UNSIGNED_INT, 0);
				gl.drawElements(gl.LINE_STRIP, this.iBuffer.numItems, gl.UNSIGNED_INT, 0); // fils de fers
			}			
			
		}
	}

}

class phong {
	
	// --------------------------------------------
	constructor() {
		this.shaderName='phong';
		this.loaded=-1;
		this.shader=null;
		this.Init = false;
		this.initAll();
	}
		
	// --------------------------------------------
	initAll() {
		loadShaders(this);
	}
	
	
	// --------------------------------------------
	initShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");//
		this.shader.vAttribP = gl.getAttribLocation(this.shader, "aVertexNormal");//
		this.shader.vAttribT = gl.getAttribLocation(this.shader, "aTexCoord");//


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
		this.shader.uTexturing = gl.getUniformLocation(this.shader, "uTexturing");

		this.shader.terrain = gl.getUniformLocation(this.shader, "terrain");//si utilise une heighMap
		
		gl.uniform1i(this.shader.uNormalizing, 1);
		gl.uniform4fv(this.shader.uLightSpecular, [.5, .5, .5, 1.0]);
		gl.uniform3fv(this.shader.uLightPos, [0.0, 5.0, 3.0]);     // Position de la lumière
		gl.uniform4fv(this.shader.uAmbiantLight, [0.2, 0.2, 0.2, 1.0]);
		gl.uniform4fv(this.shader.uLightColor, [0.8, 0.8, 0.8, 1.0]);

	

		this.Init = true;
	}
}

class lambert {
	
	// --------------------------------------------
	constructor() {
		this.shaderName='lambert';
		this.loaded=-1;
		this.shader=null;
		this.Init = false;
		this.initAll();
	}
		
	// --------------------------------------------
	initAll() {
		loadShaders(this);
	}
	
	
	// --------------------------------------------
	initShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");//
		this.shader.vAttribP = gl.getAttribLocation(this.shader, "aVertexNormal");//
		this.shader.vAttribT = gl.getAttribLocation(this.shader, "aTexCoord");//

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uProjectionMatrix");//
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uModelViewMatrix");//
		this.shader.uNormalMatrix = gl.getUniformLocation(this.shader, "uNormalMatrix");
		
		this.shader.uLightPos = gl.getUniformLocation(this.shader, "uLightPos");//

		this.shader.uNormalizing = gl.getUniformLocation(this.shader, "uNormalizing");//
		this.shader.uMaterialColor = gl.getUniformLocation(this.shader, "uMaterialColor");//

	
		this.shader.uLightColor = gl.getUniformLocation(this.shader, "uLightColor");//
		this.shader.uAmbiantLight = gl.getUniformLocation(this.shader, "uAmbiantLight");//
		this.shader.uTextureUnit = gl.getUniformLocation(this.shader, "uTextureUnit");
		this.shader.uTexturing = gl.getUniformLocation(this.shader, "uTexturing");
		
		
		gl.uniform1i(this.shader.uNormalizing, 1);
		gl.uniform3fv(this.shader.uLightPos, [5.0, 5.0, 0.0]);  
		gl.uniform4fv(this.shader.uAmbiantLight, [0.2, 0.2, 0.2, 1.0]);
		gl.uniform4fv(this.shader.uLightColor, [0.8, 0.8, 0.8, 1.0]);

	

		this.Init = true;
	}
}

class cube{

	// --------------------------------------------
	constructor() {
		this.shaderName='cube';
		this.loaded=-1;
		this.shader=null;
		this.initAll();
	}

	// --------------------------------------------
	initAll() {
		
		var vertices = [
			// Front face
			-1.0, -1.0,  1.0,
			1.0, -1.0,  1.0,
			1.0,  1.0,  1.0,
			-1.0,  1.0,  1.0,

			// Back face
			-1.0, -1.0, -1.0,
			-1.0,  1.0, -1.0,
			1.0,  1.0, -1.0,
			1.0, -1.0, -1.0,

			// Top face
			-1.0,  1.0, -1.0,
			-1.0,  1.0,  1.0,
			1.0,  1.0,  1.0,
			1.0,  1.0, -1.0,

			// Bottom face
			-1.0, -1.0, -1.0,
			1.0, -1.0, -1.0,
			1.0, -1.0,  1.0,
			-1.0, -1.0,  1.0,

			// Right face
			1.0, -1.0, -1.0,
			1.0,  1.0, -1.0,
			1.0,  1.0,  1.0,
			1.0, -1.0,  1.0,

			// Left face
			-1.0, -1.0, -1.0,
			-1.0, -1.0,  1.0,
			-1.0,  1.0,  1.0,
			-1.0,  1.0, -1.0
		];

		var normals = [
			// front face
			0.0,  0.0,  1.0,
			0.0,  0.0,  1.0,
			0.0,  0.0,  1.0,
			0.0,  0.0,  1.0,

			// back face
			0.0,  0.0, -1.0,
			0.0,  0.0, -1.0,
			0.0,  0.0, -1.0,
			0.0,  0.0, -1.0,

			// top face
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,

			// bottom face
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,

			// right face
			1.0,  0.0,  0.0,
			1.0,  0.0,  0.0,
			1.0,  0.0,  0.0,
			1.0,  0.0,  0.0,

			// left face
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0
		];


		var plafond = [
			0,  1,  2,      
			0,  2,  3,   
		];
		this.plafondBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.plafondBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(plafond), gl.STATIC_DRAW);
		this.plafondBuffer.numItems = plafond.length;

		var sol = [
			4,  5,  6,      
			4,  6,  7, 
		];
		this.solBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.solBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sol), gl.STATIC_DRAW);
		this.solBuffer.numItems = sol.length;

		var fond = [
			8,  9,  10,     
			8,  10, 11, 
		];
		this.fondBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fondBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fond), gl.STATIC_DRAW);
		this.fondBuffer.numItems = fond.length;

		var face = [
			12, 13, 14,     
			12, 14, 15,  
		];
		this.faceBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.faceBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(face), gl.STATIC_DRAW);
		this.faceBuffer.numItems = face.length;

		var droit = [
			16, 17, 18,     
			16, 18, 19, 
		];

		this.droitBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.droitBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(droit), gl.STATIC_DRAW);
		this.droitBuffer.numItems = droit.length;

		var gauche = [
			20, 21, 22,     
			20, 22, 23
		];
		this.gaucheBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gaucheBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gauche), gl.STATIC_DRAW);
		this.gaucheBuffer.numItems = gauche.length;

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 24;

		this.nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		this.nBuffer.itemSize = 3;
		this.nBuffer.numItems = 24;

	}

	// --------------------------------------------
	setShadersParams(shaderActif) {
		gl.useProgram(shaderActif.shader);

		gl.enableVertexAttribArray(shaderActif.shader.vAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);


		gl.enableVertexAttribArray(shaderActif.shader.vAttribP);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttribP, this.nBuffer.itemSize, gl.FLOAT, false, 0, 0);

		mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, distCENTER); // Recule le cube de 3 unités
        mat4.multiply(mvMatrix, rotMatrix);

        gl.uniform4fv(shaderActif.shader.uMaterialSpecular, [1.0, 1.0, 1.0,1.0]); 
        gl.uniform1f(shaderActif.shader.uMaterialShininess, 32.0);
		
		gl.uniformMatrix4fv(shaderActif.shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderActif.shader.mvMatrixUniform, false, mvMatrix);
		
		var normalMatrix = mat3.create();
		mat4.toInverseMat3(mvMatrix, normalMatrix);
		mat3.transpose(normalMatrix);
		gl.uniformMatrix3fv(shaderActif.shader.uNormalMatrix, false, normalMatrix);

		gl.uniform1i(shaderActif.shader.uLighting, 1);
	}

	// --------------------------------------------
	draw(shaderActif) {
		if(shaderActif && shaderActif.loaded==4) {	
			if (!shaderActif.shader.Init) {
                shaderActif.initShadersParams();
            }	
			this.setShadersParams(shaderActif);

		
			gl.uniform4fv(shaderActif.shader.uMaterialColor, [0.8, 0.1, 0.1, 1.0]); // Rouge

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.plafondBuffer);
			gl.drawElements(gl.TRIANGLES, this.plafondBuffer.numItems, gl.UNSIGNED_SHORT, 0);

			gl.uniform4fv(shaderActif.shader.uMaterialColor, [0.8, 0.1, 0.1, 1.0]); // Rouge

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.faceBuffer);
			gl.drawElements(gl.TRIANGLES, this.faceBuffer.numItems, gl.UNSIGNED_SHORT, 0);

			gl.uniform4fv(shaderActif.shader.uMaterialColor, [0.8, 0.1, 0.1, 1.0]); // Rouge

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.solBuffer);
			gl.drawElements(gl.TRIANGLES, this.solBuffer.numItems, gl.UNSIGNED_SHORT, 0);

			gl.uniform4fv(shaderActif.shader.uMaterialColor, [0.8, 0.1, 0.1, 1.0]); // Rouge

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gaucheBuffer);
			gl.drawElements(gl.TRIANGLES, this.gaucheBuffer.numItems, gl.UNSIGNED_SHORT, 0);

			gl.uniform4fv(shaderActif.shader.uMaterialColor, [0.8, 0.1, 0.1, 1.0]); // Rouge

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.droitBuffer);
			gl.drawElements(gl.TRIANGLES, this.droitBuffer.numItems, gl.UNSIGNED_SHORT, 0);

			gl.uniform4fv(shaderActif.shader.uMaterialColor, [0.8, 0.1, 0.1, 1.0]); // Rouge

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.fondBuffer);
			gl.drawElements(gl.TRIANGLES, this.fondBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}

}

// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

class plane {
	
	// --------------------------------------------
	constructor(shader) {
		this.shaderName='plane';
		this.loaded=-1;
		this.shader=null;
		this.initAll(shader);
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

		var normals = [
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
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

		this.nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		this.nBuffer.itemSize = 3;
		this.nBuffer.numItems = 4;

		this.initTexture("ocean.webp")
		
	}

	initTexture(texturePath)
	{
		var texImage = new Image();
		texImage.src = texturePath;

		var texture = gl.createTexture();
		texture.image = texImage;

		texImage.onload = function () {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.activeTexture(gl.TEXTURE0);
		}
	}
	
	
	// --------------------------------------------
	setShadersParams(shaderActif) {
		gl.useProgram(shaderActif.shader);

		gl.enableVertexAttribArray(shaderActif.shader.vAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(shaderActif.shader.vAttribP);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttribP, this.nBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(shaderActif.shader.vAttribT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.vertexAttribPointer(shaderActif.shader.vAttribT, this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(shaderActif.shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderActif.shader.mvMatrixUniform, false, mvMatrix);

		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderActif.shader.uNormalMatrix, false, normalMatrix);

		gl.uniform4fv(shaderActif.shader.uMaterialSpecular, [1.0, 1.0, 1.0,1.0]); 
        gl.uniform1f(shaderActif.shader.uMaterialShininess, 32.0);

		gl.uniform1i(shaderActif.shader.uLighting, 1);

		gl.uniform1i(shaderActif.shader.uTexturing, true);
		gl.uniform1i(shaderActif.shader.uTextureUnit, 1);

		gl.uniform1i(shaderActif.shader.terrain, 0);
		gl.uniform1i(shaderActif.shader.uHeightMap, 0);
	}

	// --------------------------------------------
	draw(shaderActif) {
		if(shaderActif && shaderActif.loaded==4) {	
			if (!shaderActif.Init) {
                shaderActif.initShadersParams();
            }	
			else{
				this.setShadersParams(shaderActif);
				gl.uniform4fv(shaderActif.shader.uMaterialColor, [1., 1., 1., 1.0]);
				gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
				//gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
			}
		}
	}

}

class river {
	
	// --------------------------------------------
	constructor() {
		this.shaderName='river';
		this.loaded=-1;
		this.shader=null;
		this.initAll();
	}

	initTexture()
	{
		var texImage = new Image();
		texImage.src = "Surface10.png";

		var texture = gl.createTexture();
		texture.image = texImage;

		texImage.onload = function () {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.activeTexture(gl.TEXTURE0);
		}
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

		var normals = [
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
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

		this.nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		this.nBuffer.itemSize = 3;
		this.nBuffer.numItems = 4;

		loadShaders(this);
		this.initTexture()
	}
	
	
	// --------------------------------------------
	setShadersParams() {
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.nAttrib = gl.getAttribLocation(this.shader, "aNormals");
		gl.enableVertexAttribArray(this.shader.nAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.shader.nAttrib, this.nBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);

		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
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
  xhttp.open("GET", Obj3D.shaderName+ext, true);
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
        
        // LA CORRECTION EST ICI : getProgramInfoLog
        console.log(gl.getProgramInfoLog(Obj3D.shader)); 
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

	//RIVER = new river();

	PHONG = new phong();	
	
	PLANE = new plane();

	//CUBE = new cube();

	LAND = new land();

	//LAMBERT = new lambert();

	//OBJ1 = new objmesh('porsche.obj');
	//OBJ2 = new objmesh('porsche.obj');
	
	tick();
}


// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	PLANE.draw(PHONG);
    //CUBE.draw(PHONG);
	//OBJ1.draw(PHONG);
	LAND.draw(PHONG);
	//RIVER.draw();
	//OBJ2.draw();
}



