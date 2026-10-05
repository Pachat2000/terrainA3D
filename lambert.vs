#version 100

// Matrices
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform bool uNormalizing;
uniform vec4 uMaterialColor;
// vertex attributes
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTexCoord;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main(void) {
	vec4 pos=uModelViewMatrix*vec4(aVertexPosition, 1.0);
	vec3 normal = uNormalMatrix * aVertexNormal;

    vPosition = pos.xyz;
    vNormal = normal;
    vTexCoord = aTexCoord;

	gl_Position= uProjectionMatrix*pos;
}
