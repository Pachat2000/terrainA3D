
precision mediump float;

varying vec2 texCoords;
uniform vec3 uColor;

void main(void)
{
	gl_FragColor = vec4(uColor, 1);
	
}



