// Anthony Moran, Michael Zbytniewski

var canvas;
var gl;
var n = 21; 
var moveShape = 0;
var flag = [];
var u_ModelMatrix;
var modelMatrix, projection;

var a_position;
var vColor;
var vertexBuffer;
var cBuffer;

var near = -100;
var far = 100;
var left = -3;
var right = 3;
var ytop = 3;
var bottom = -3;

var points = [];
var score = 0;

var vertices = [];
var timer = 0.00;
var program;
var scoreboard = "Score = ";

var x = [0.035, 0.0275, 0.03, 0.02, 0.025];

var colors = [
  vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
  vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
  vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
  vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
  vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
  vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
  
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.9, 0.5, 0.0, 1.0),   // orange
  
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.9, 0.5, 0.0, 1.0),   // orange
  
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.9, 0.5, 0.0, 1.0),   // orange
  
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.9, 0.5, 0.0, 1.0),   // orange
  
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
  vec4( 0.9, 0.5, 0.0, 1.0)   // orange
]; 

function drawshapes(timer){
	var flags = checkFlags();
	if ((timer%7) > 5) {
		flag[0] = 1;
	}
	if ((timer%8) > 6){
		flag[1] = 1;
	}
	if ((timer%9) > 4){
		flag[2] = 1;
	}
	if ((timer%6) > 5){
		flag[3] = 1;
	}
	if ((timer%8) > 7){
		flag[4] = 1;
	}
	if ((timer%9) > 8){
		flag[flags] = 1;
	}
}

function checkFlags(){ // Checks to see which flag is "open", meaning that the current shape represented by the flag is unused
	if (flag[0] == 0){ return 0;}
	else if (flag[1] == 0){ return 1;}
	else if (flag[2] == 0){ return 2;}
	else if (flag[3] == 0){ return 3;}
	else if (flag[4] == 0){ return 4;}
	else return 5;
}

function makeshape() {
	  vertices = [ 
				   vec2(-2.75, -0.5), 
				   vec2(-2.75, 0.5), 
				   vec2(-2.5, 0.5),
				   
				   vec2(-2.75, -0.5),
				   vec2(-2.5, 0.5),
				   vec2(-2.5, -0.5),
				   
				   vec2(3.5,1.75),
				   vec2(3.5,1.25),
				   vec2(3,1.5),
				   
				   vec2(3.5,-1.25),
				   vec2(3.5,-1.75),
				   vec2(3,-1.5),
				   
				   vec2(3.5,0.25),
				   vec2(3.5,-0.25),
				   vec2(3,0),
				   
				   vec2(3.5,3),
				   vec2(3.5,2.5),
				   vec2(3,2.75),
				   
				   vec2(3.5,-2.5),
				   vec2(3.5,-3),
				   vec2(3,-2.75)
				];
	for ( var i = 0; i < 21; i++) {
		points.push( vertices[i]);
	} 
}

window.onload = function init(){
  // Retrieve <canvas> element
  canvas = document.getElementById('gl-canvas');

  // Get the rendering context for WebGL
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  //  Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );

  gl.clearColor(0, 0, 0, 1);

  // Initialize shaders
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  makeshape();
  document.getElementById("showScore").innerHTML = scoreboard;
  // Create a buffer object
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  
  // Assign the buffer object to a_Position variable
  a_Position = gl.getAttribLocation(program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
 
  cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );
  
  projection = ortho(left, right, bottom, ytop, near, far);
  
  gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
  false, flatten(projection));

  document.onkeydown = function(ev){ keydown(ev);};

  render();
};

function keydown(ev) {
    if(ev.keyCode == 83) { // The down arrow key was pressed
      moveShape = 1;
    }
    if(ev.keyCode == 87) { // The up arrow key was pressed
      moveShape = 2;
    } 
}

// Collision Detection
function collision(){
	for (var i = 6; i < 21; i++){
		if (vertices[i][0] <= -2.5){
			if ((vertices[i][1] <= vertices[4][1]) && (vertices[i][1] >= vertices[5][1])) {
				timer = 0;
				reset(0);
				score = 0;
			}
		}
	}
	if (score < 200){
	document.getElementById("score1").innerHTML = score;
	}
	else {
	document.getElementById("score1").innerHTML = "Congradulations! You Win!";	
	}
}

// Reset function
function reset(vert) {
	if (vert == 6) {
		flag[0] = 0;
		x[0] = (Math.floor((Math.random() * 21) + 20))*0.0010;
		vertices[6] = vec2(3.5,1.75);
		vertices[7] = vec2(3.5,1.25);
		vertices[8] = vec2(3,1.5);
	}
	else if (vert == 9) {
		flag[1] = 0;
		x[1] = (Math.floor((Math.random() * 21) + 20))*0.0010;
		vertices[9] = vec2(3.5,-1.25);
		vertices[10] = vec2(3.5,-1.75);
		vertices[11] = vec2(3,-1.5);
	}
	else if (vert == 12) {
		flag[2] = 0;
		x[2] = (Math.floor((Math.random() * 21) + 20))*0.0010;
		vertices[12] = vec2(3.5,0.25);
		vertices[13] = vec2(3.5,-0.25);
		vertices[14] = vec2(3,0);
	}
	else if (vert == 15) {
		flag[3] = 0;
		x[3] = (Math.floor((Math.random() * 21) + 20))*0.0010;
		vertices[15] = vec2(3.5,3);
		vertices[16] = vec2(3.5,2.5);
		vertices[17] = vec2(3,2.75);
	}
	else if (vert == 18) {
		flag[4] = 0;
		x[4] = (Math.floor((Math.random() * 21) + 20))*0.0010;
		vertices[18] = vec2(3.5,-2.5);
		vertices[19] = vec2(3.5,-3);
		vertices[20] = vec2(3,-2.75);
	}
	else if (vert == 0) {
		flag[0] = 0;
		flag[1] = 0;
		flag[2] = 0;
		flag[3] = 0;
		flag[4] = 0;
		x = [0.035, 0.0275, 0.03, 0.02, 0.025];
		vertices[0] = vec2(-2.75, -0.5);
		vertices[1] = vec2(-2.75, 0.5);
		vertices[2] = vec2(-2.5, 0.5);
		vertices[3] = vec2(-2.75, -0.5);
		vertices[4] = vec2(-2.5, 0.5);
		vertices[5] = vec2(-2.5, -0.5);
		vertices[6] = vec2(3.5,1.75);
		vertices[7] = vec2(3.5,1.25);
		vertices[8] = vec2(3,1.5);
		vertices[9] = vec2(3.5,-1.25);
		vertices[10] = vec2(3.5,-1.75);
		vertices[11] = vec2(3,-1.5);
		vertices[12] = vec2(3.5,0.25);
		vertices[13] = vec2(3.5,-0.25);
		vertices[14] = vec2(3,0);
		vertices[15] = vec2(3.5,3);
		vertices[16] = vec2(3.5,2.5);
		vertices[17] = vec2(3,2.75);
		vertices[18] = vec2(3.5,-2.5);
		vertices[19] = vec2(3.5,-3);
		vertices[20] = vec2(3,-2.75);
	}
}

function movePlayer(){
	  for (var i = 0; i < 6; i++){
		if (((moveShape == 2) && (vertices[i][1] > 2.9)) || ((moveShape == 1) && (vertices[i][1] < -2.9))){
			moveShape = 0; // Boundary Handling
		}
	  }	 
	  
	  // Calling Collision Function
	 collision();
	  
	 if (moveShape == 1){
		vertices[0][1] = vertices[0][1] - 0.1;
		vertices[1][1] = vertices[1][1] - 0.1;
		vertices[2][1] = vertices[2][1] - 0.1;
		vertices[3][1] = vertices[3][1] - 0.1;
		vertices[4][1] = vertices[4][1] - 0.1;
		vertices[5][1] = vertices[5][1] - 0.1;
		moveShape = 0;
	  } // These move the player
	  else if (moveShape == 2){
		vertices[0][1] = vertices[0][1] + 0.1;
		vertices[1][1] = vertices[1][1] + 0.1;
		vertices[2][1] = vertices[2][1] + 0.1;
		vertices[3][1] = vertices[3][1] + 0.1;
		vertices[4][1] = vertices[4][1] + 0.1;
		vertices[5][1] = vertices[5][1] + 0.1;
		moveShape = 0;
	  }
	  // The next parts move the incoming triangles
	  if (flag[0] == 1){
		vertices[6][0] = vertices[6][0] - x[0];
		vertices[7][0] = vertices[7][0] - x[0];
		vertices[8][0] = vertices[8][0] - x[0];
	  }
	  
	  if (flag[1] == 1){
		vertices[9][0] = vertices[9][0] - x[1];
		vertices[10][0] = vertices[10][0] - x[1];
		vertices[11][0] = vertices[11][0] - x[1];
	  }
	  
	  if (flag[2] == 1){
		vertices[12][0] = vertices[12][0] - x[2];
		vertices[13][0] = vertices[13][0] - x[2];
		vertices[14][0] = vertices[14][0] - x[2];
	  }
	  
	  if (flag[3] == 1){
		vertices[15][0] = vertices[15][0] - x[3];
		vertices[16][0] = vertices[16][0] - x[3];
		vertices[17][0] = vertices[17][0] - x[3];
	  }
	  
	  if (flag[4] == 1){
		vertices[18][0] = vertices[18][0] - x[4];
		vertices[19][0] = vertices[19][0] - x[4];
		vertices[20][0] = vertices[20][0] - x[4];
	  }
	  // The next parts reset the triangles to their default positions after they leave the screen
	  
	  if (vertices[6][0] < -3){
		reset(6);
		score++;
	  }
	  if (vertices[9][0] < -3){
		reset(9);
		score++;
	  }
	  if (vertices[12][0] < -3){
		reset(12);
		score++;
	  }
	  if (vertices[15][0] < -3){
		reset(15);
		score++;
	  }
	  if (vertices[18][0] < -3){
		reset(18);
		score++;
	  }
	  // The next parts put the points in the buffer, and then load the buffer to the GPU
	  for (var i = 0; i < 21; i++){
		 points.pop();
	  }  
	  for (var i = 0; i < 21; i++){
		 points.push(vertices[i]);
	  }
	  
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW); 
  
  a_Position = gl.getAttribLocation(program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
 
  cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );
}
function getScore(){
	return score;
}

function render() {
  timer = timer + 0.02;
  if (score < 200){
	drawshapes(timer);
  }
  else {
	document.getElementById("showScore").innerHTML = " ";
  }
  movePlayer(); 
  gl.clear( gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  window.requestAnimFrame(render);
}
