#version 100

precision mediump float;

uniform vec3 uLightPos;
uniform vec4 uMaterialColor; // C_mat
uniform vec4 uAmbiantLight;
uniform vec4 uLightColor; //L_diff

uniform sampler2D uTextureUnit;
uniform bool uTexturing;
uniform bool uNormalizing;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main(void) {
	vec4 textCoord = uMaterialColor;
	if(uTexturing) textCoord = texture2D(uTextureUnit,vTexCoord) * uMaterialColor;
	vec3 normal = vNormal;
    vec3 pos = vPosition;
	if (uNormalizing) normal=normalize(normal);
	vec3 lightdir=normalize(uLightPos-pos.xyz);
	float weight = max(dot(normal, lightdir),0.0);
	gl_FragColor = textCoord*(uAmbiantLight+weight*uLightColor);
}
