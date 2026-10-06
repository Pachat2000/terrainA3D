attribute vec3 aVertexPosition;
attribute vec2 aTexCoords;
attribute vec3 aNormals;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 texCoords;
varying vec3 normals;

void main(void) {
	texCoords = aTexCoords;
    normals = aNormals;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
