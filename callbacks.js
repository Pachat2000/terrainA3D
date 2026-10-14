

// =====================================================
// Mouse management
// =====================================================
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var rotY = 0;
var rotX = -1;

// =====================================================
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback,
									/* DOMElement Element */ element)
         {
            window.setTimeout(callback, 1000/60);
         };
})();

// ==========================================
function tick() {
	requestAnimFrame(tick);
	drawScene();
}

// =====================================================
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}


// =====================================================
function handleMouseWheel(event) {

	distCENTER[2] += event.deltaY/10.0;
}

// =====================================================
function handleMouseDown(event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}


// =====================================================
function handleMouseUp(event) {
	mouseDown = false;
}


// =====================================================
function handleMouseMove(event) {
	
	
	if (!mouseDown) return;

	var dx = event.clientX - lastMouseX;
    var dy = event.clientY - lastMouseY;
	if (event.shiftKey) {
        
        lightPos[0] += dx ;
        lightPos[2] += dy ;
        
        return;
    }

	var newX = event.clientX;
	var newY = event.clientY;	
	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;
	
	if(event.ctrlKey) {
		distCENTER[2] += deltaY/100.0;
	} else {

		rotY += degToRad(deltaX / 5);
		rotX += degToRad(deltaY / 5);

		mat4.identity(rotMatrix);
		mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
		mat4.rotate(rotMatrix, rotY, [0, 0, 1]);
	}
	
	lastMouseX = newX
	lastMouseY = newY;
}

// Variable globale ou accessible dans votre boucle de rendu WebGL
var rotationSpeed = 50;

function updateSliderValue(val) {
	// 1. Mise à jour de l'affichage du texte à côté du curseur
	document.getElementById("speedValue").innerText = val;

	// 2. Traitement de la valeur (convertie en nombre)
	rotationSpeed = parseFloat(val);

	// Facultatif : si vous souhaitez normaliser la valeur (ex: entre 0.0 et 1.0)
	// float normalizedVal = val / 100.0;
}
