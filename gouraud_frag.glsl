#version 100

precision mediump float;

// Only color is interpolated
varying vec4 vColor;

void main(void) {
	gl_FragColor = vColor;
}
