attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying float Color;

void main(void) {
    Color = aVertexPosition.y;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
