#version 100

precision mediump float;

// Matrices
uniform mat4 uModelViewMatrix;// k
uniform mat4 uProjectionMatrix; //k
uniform mat3 uNormalMatrix; // k
uniform vec3 uLightPos; //k

// vertex attributes
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTexCoord;
// Interpolated data

uniform bool terrain;
uniform sampler2D uHeightMap;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewVec;  
varying vec3 vLightVec;
varying vec2 vTexCoord;
varying float vHeight;


void main(void) {
    vec3 positionFinale = aVertexPosition;
	vec3 normal = uNormalMatrix * aVertexNormal;

    if(terrain) {
        float h = texture2D(uHeightMap, aTexCoord).r;
        positionFinale.y = h;
        vHeight = h;
        float decalageTex = 0.01; 
        float ecartPhysique = 0.1;

        float hL = texture2D(uHeightMap, aTexCoord + vec2(-decalageTex, 0.0)).r * 0.5;
        float hR = texture2D(uHeightMap, aTexCoord + vec2(decalageTex, 0.0)).r * 0.5;
        float hT = texture2D(uHeightMap, aTexCoord + vec2(0.0, -decalageTex)).r * 0.5;
        float hB = texture2D(uHeightMap, aTexCoord + vec2(0.0, decalageTex)).r * 0.5;

        vec3 normaleCalculee = normalize(vec3(
            -(hR - hL) / (2.0 * ecartPhysique),
            1.0,
            -(hB - hT) / (2.0 * ecartPhysique)
        ));

        normal = (uNormalMatrix * normaleCalculee);
    }

	vec4 pos=uModelViewMatrix*vec4(positionFinale, 1.0);

    vPosition = pos.xyz;
    vNormal = normal;
    
    vTexCoord = aTexCoord;

    vViewVec = -pos.xyz; // Le vecteur vers la caméra (qui est en 0,0,0) 
    vLightVec = uLightPos - pos.xyz;
	gl_Position= uProjectionMatrix*pos;
}
