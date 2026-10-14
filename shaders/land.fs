#version 100

precision mediump float;

// Light source definition
uniform vec3 uLightPos;
uniform vec4 uAmbiantLight;
uniform bool uLighting;
uniform vec4 uLightColor; //L_diff
uniform bool uNormalizing;
uniform vec4 uMaterialColor; // C_mat
uniform vec4 uLightSpecular;    // L_spec 
uniform vec4 uMaterialSpecular; // C_spec 
uniform float uMaterialShininess; //b
uniform sampler2D uTextureUnit;
uniform bool uTexturing;



// Only color is interpolated
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewVec;  
varying vec3 vLightVec;
varying vec2 vTexCoord;
varying float vHeight;


void main(void) {
	//   vec3 normal = vNormal;
    //   vec3 pos = vPosition;
	//   if (uNormalizing) normal=normalize(normal);
	//   vec3 lightdir=normalize(uLightPos-pos.xyz);
	//   float weight = max(dot(normal, lightdir),0.0);
	//   gl_FragColor = uMaterialColor*(uAmbiantLight+weight*uLightColor);
	//vColor = vec4(abs(aVertexNormal), 1);
	vec4 textCoord = uMaterialColor;
	if(uTexturing) textCoord = texture2D(uTextureUnit,vTexCoord) * uMaterialColor;
	else{
		if(vHeight > 0.8) textCoord = vec4(1.,1.,1.,1.);
		else if(vHeight > 0.4) textCoord = vec4(0.4, 0.25, 0.1, 1.0);
		else textCoord = vec4(0.,1.,0.,1.);

	}
    if (uLighting)
	{
	  vec3 normal = normalize(vNormal);
      vec3 pos = normalize(vPosition);

	  vec3 v = normalize(vViewVec);
      vec3 l = normalize(vLightVec);
	  vec3 h = normalize(l + v);

	  float nDotL = max(dot(normal, l), 0.0);
      float nDotH = max(dot(normal, h), 0.0);
	  
	  vec4 diffuse = textCoord * (uAmbiantLight + nDotL * uLightColor);
	  vec4 specular = vec4(0.0);
	  if (nDotL > 0.0) {
			float specWeight = pow(nDotH, uMaterialShininess); // (n.h)^b 
			specular = uLightSpecular * specWeight * uMaterialSpecular;
	  }
	  gl_FragColor = diffuse + specular;
    }
	else gl_FragColor = textCoord;
}
