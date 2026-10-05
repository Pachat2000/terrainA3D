#version 100

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

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewVec;  
varying vec3 vLightVec;
varying vec2 vTexCoord;

void main(void) {
	vec4 pos=uModelViewMatrix*vec4(aVertexPosition, 1.0);
	vec3 normal = uNormalMatrix * aVertexNormal;

    vPosition = pos.xyz;
    vNormal = normal;
    
    vTexCoord = aTexCoord;

    vViewVec = -pos.xyz; // Le vecteur vers la caméra (qui est en 0,0,0) 
    vLightVec = uLightPos - pos.xyz;
	gl_Position= uProjectionMatrix*pos;
}
