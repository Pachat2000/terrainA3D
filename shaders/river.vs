#version 100
precision mediump float;

// Matrices
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNormalMatrix;

uniform bool uNormalizing;
uniform vec4 uMaterialColor;
uniform vec3 uLightPos;

// vertex attributes
attribute vec3 aVertexPosition;
//attribute vec3 aNormals;
attribute vec2 aTexCoords;

varying vec2 texCoords;
//varying vec3 normals;
varying vec3 vPosition;
varying vec3 vViewVec;  
varying vec3 vLightVec;

void main(void) {
    vec4 pos=uMVMatrix*vec4(aVertexPosition, 1.0);
    //vec3 normal = uNormalMatrix * aNormals;

    vPosition = aVertexPosition;
    //normals = normal;
    texCoords = aTexCoords;

    vViewVec = -pos.xyz;
    vLightVec = uLightPos - pos.xyz;

    gl_Position= uPMatrix*pos;
	//gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}