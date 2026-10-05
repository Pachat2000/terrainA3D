
precision mediump float;

varying float Color;


void main(void)
{
    vec3 finalColor;

    // On prépare nos "pots de peinture" RVB
    vec3 snow  = vec3(1.0, 1.0, 1.0);      // Blanc
    vec3 rock  = vec3(0.5, 0.35, 0.2);     // Marron
    vec3 grass = vec3(0.2, 0.6, 0.2);      // Vert

    // On applique les couleurs selon l'altitude (qui va de 0.0 à 0.5)
    if (Color > 0.4) {
        finalColor = snow;  // Les pics enneigés
    } else if (Color > 0.2) {
        finalColor = rock;  // La montagne en roche
    } else {
        finalColor = grass; // La plaine en herbe
    }
	gl_FragColor = vec4(finalColor, 1);
	
}



