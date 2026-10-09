
precision mediump float;

varying vec2 texCoords;
varying vec3 normals;
uniform sampler2D uSampler;


void main(void)
{
	gl_FragColor = texture2D(uSampler, texCoords);
}



