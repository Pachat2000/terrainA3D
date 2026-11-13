#version 100

precision mediump float;

uniform vec3 uLightPos;
uniform vec4 uAmbiantLight;
uniform bool uLighting;
uniform vec4 uLightColor; //L_diff
uniform vec4 uLightSpecular;

uniform vec4 uMaterialColor; // C_mat
uniform vec4 uMaterialSpecular;
uniform float uMaterialShininess; 


uniform sampler2D uTextureUnit; // texture
uniform sampler2D uSampler; // bumpmap
uniform bool uTexturing;

uniform mat3 uNormalMatrix;

uniform bool uNormalizing;

varying vec3 vPosition;
varying vec2 texCoords;
varying vec3 vViewVec;  
varying vec3 vLightVec;

void main(void)
{
    vec4 color = uMaterialColor;
	if(uTexturing) color = texture2D(uTextureUnit,texCoords) * uMaterialColor;
	
	if (uLighting)
	{
		vec3 normalMap = texture2D(uSampler, texCoords).rgb * 2.0 - 1.0;
		vec3 normal = normalize(uNormalMatrix * normalMap);
		
		//vec3 normal = vec3(normalMap.x, normalMap.z, -normalMap.y);
		vec3 pos = normalize(vPosition);

		vec3 v = normalize(vViewVec);
		vec3 l = normalize(vLightVec);
		vec3 h = normalize(l + v);

		float nDotL = max(dot(normal, l), 0.0);
		float nDotH = max(dot(normal, h), 0.0);
		
		vec4 diffuse = color * (uAmbiantLight + nDotL * uLightColor);
		vec4 specular = vec4(0.0);
		if (nDotL > 0.0) {
			float specWeight = pow(nDotH, uMaterialShininess); // (n.h)^b 
			specular = uLightSpecular * specWeight * uMaterialSpecular;
		}
	  	gl_FragColor = diffuse + specular;
    }
	else gl_FragColor = color;
	

	// LAMBERT
	//vec3 normal = texture2D(uSampler, texCoords).rgb * 2.0 - 1.0;
	//vec3 pos = vPosition;
	//if (uNormalizing) normal=normalize(normal);
	//vec3 lightdir=normalize(uLightPos-pos.xyz);
	//float weight = max(dot(normal, lightdir),0.0);
	//gl_FragColor = color*(uAmbiantLight+weight*uLightColor);

	// BUMP MAP BASE
	//gl_FragColor = texture2D(uSampler, texCoords);;

    // test affichage
	//vec3 colorSample = texture2D(uSampler, texCoords).rgb;
    //gl_FragColor = vec4(colorSample, 1.0);
}