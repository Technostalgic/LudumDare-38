///
///	code by Isaiah Smith
///		
///	https://technostalgic.itch.io  
///	twitter @technostalgicGM
///

/* game.js
	the main entry point for the game, interlaces all data structures and 
	initializes the game loop where all game logic is processed, also contains
	some global general all-purpose functions for making my life easier
*/

// prevents arrow key / space scrolling on the web page
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var timeElapsed = 0; //represents the total time elapsed since the page loaded
var gameStart = 0; //represents the start of the current round in milliseconds elapsed since page load
var dt = 0; //the amount of time between frames
var odt = 0; //the overlap of dt, when too much accumulates, the game is updated multiple times per tick to match real world time

var mode = 0;

var saveKey = "technostalgic_LD38_highschore"; //used to store highscore data in the browser's local data cache
var score = 0;
var hiscore = 0;
var planets = []; //dynamic planet query
var enemies = []; //dynamic enemy query
var projectiles = []; //dynamic projectil query
var items = []; //dynamic item query
var gibs = []; //dynamic gib query
var effects = []; //dynamic effect query
var tracers = []; //dynamic tracer query
var player1;
var controls = [37, 39, 38, 40, 88, 67, 32]; //the control scheme in keyCodes
var controlState = {moveLeft:false, moveRight:false, increasePow:false, decreasePow:false, jump:false, fire:false, menu:false};

var musicOn = true;
var sfx = {};

function clearScreen(ctx){
	/* function clearScreen(ctx)
		clears the canvas to a plain white
		params: 
			ctx:canvasRenderingContext2D - the context to render with
	*/
	ctx.fillStyle = "#fff"; //opaque white
	ctx.fillRect(0, 0, canvas.width, canvas.height); //a rectangle the size of the screen
}

function hook_controls(){
	/*
	canvas.addEventListener('click', function(event){
		player1.health = 1;
		player1.ammo = Math.max(3, player1.ammo);
		player1.pos = new vec2(event.offsetX, event.offsetY);
		player1.vel = new vec2();
	});
	*/
	document.addEventListener('keydown', handleControlsDown); //handleControlsDown(e) is now called whenever a key press is detected
	document.addEventListener('keyup', handleControlsUp); //handleControlsUp(e) is now called whenever a key release is detected
}
function handleControlsDown(event){
	/* function handleControlsDown(event)
		updates the game data to inform that a control is being triggered
	*/
	//console.log(event.key + ":" + event.keyCode); //used for debugging
	//m key:
	if(event.keyCode == 77)
		toggleMusic();
	switch(event.keyCode){
		case controls[0]:
			controlState.moveLeft = true;
			break;
		case controls[1]:
			controlState.moveRight = true;
			break;
		case controls[2]:
			controlState.increasePow = true;
			break;
		case controls[3]:
			controlState.decreasePow = true;
			break;
		case controls[4]:
			controlState.jump = true;
			break;
		case controls[5]:
			controlState.fire = true;
			break;
		case controls[6]:
			controlState.menu = true;
			break;
	}
}
function handleControlsUp(event){
	/* function handleControlsDown(event)
		updates the game data to inform that a control is done being triggered
	*/
	switch(event.keyCode){
		case controls[0]:
			controlState.moveLeft = false;
			break;
		case controls[1]:
			controlState.moveRight = false;
			break;
		case controls[2]:
			controlState.increasePow = false;
			break;
		case controls[3]:
			controlState.decreasePow = false;
			break;
		case controls[4]:
			controlState.jump = false;
			break;
		case controls[5]:
			controlState.fire = false;
			break;
		case controls[6]:
			controlState.menu = false;
			break;
	}
}

function elapsedGameTime(){
	/* function elapsedGameTime()
		returns the amount of time in milliseconds that the round has been going on for
		value:Number
	*/
	return timeElapsed - gameStart;
}

function init(){
	/* function init()
		initializes all the game data when the page is loaded
	*/
	loadSound();
	loadHighScore();
	mode = 0;
	hook_controls();
	requestAnimationFrame(step); //starts the game loop
}
function step(){
	/* function step()
		main logic loop entry point
	*/
	
	//updates the game loop while trying to match real 
	//world time as close as possibles
	odt += dt;
	while(odt >= 16.66667){
		update();
		odt -= 16.66667;
	}
	draw(context); //renders everything at the end of each tick
	
	requestAnimationFrame(step); // sets the next step to be called recursively
	dt = Math.max(0, performance.now() - timeElapsed); //measures the time between the last step and this step
	timeElapsed = performance.now();
}
function update(){
	/* function update()
		main logic entry point for the game loop
	*/
	if(mode != 1){ //if not in the middle of a round
		menuUpdate();
		return;
	}
	updateGame();
	handleSpawns();
}
function draw(ctx){
	/* function draw(ctx)
		renders everything on screen
	*/
	clearScreen(ctx);
	if(mode != 1){ //draw menus if need be
		if(mode == 2) drawEndScreen(ctx);
		else drawStartScreen(ctx);
		return;
	}
	drawGame(ctx);
	drawHUD(ctx);
}

function loadSound(){
	/*function loadSound()
		downloads all the sound to the client that the game needs
	*/
	sfx = {
		music: new Audio("sfx/music.wav"),
		startGame: new Audio("sfx/startGame.wav"),
		shoot: new Audio("sfx/shoot.wav"),
		empty: new Audio("sfx/empty.wav"),
		jump: new Audio("sfx/jump.wav"),
		land: new Audio("sfx/land.wav"),
		pickup: new Audio("sfx/pickup.wav"),
		explosion: new Audio("sfx/explosion.wav"),
		explosionSmall: new Audio("sfx/explosionSmall.wav"),
		death: new Audio("sfx/death.wav"),
		enemySpawn: new Audio("sfx/enemy_spawn.wav"),
		enemyDeath: new Audio("sfx/enemy_death.wav"),
		shooterDeath: new Audio("sfx/shooter_death.wav"),
		shooterShoot: new Audio("sfx/shooter_shoot.wav")
	};
}

function updateGame(){
	/* function updateGame()
		handles update logic for the game when a round is in session
	*/
	updateCharacters(enemies);
	player1.update();
	player1.control(controlState);
	updateCharacters(projectiles);
	updateCharacters(items);
	updateCharacters(gibs);
	updateTracers();
}
function drawGame(ctx){
	/* drawGame(ctx)
		handles rendering when a round is in session
		parameters:
			ctx:canvasRenderingContext2D - context to render with
	*/
	drawTracers(ctx);
	drawPlanets(planets, ctx);
	drawCharacters(enemies, ctx);
	drawCharacters(projectiles, ctx);
	drawCharacters(items, ctx);
	drawCharacters(gibs, ctx);
	player1.draw(ctx);
	drawEffects(ctx);
}

function drawHUD(ctx){
	/* function drawHUD(ctx)
		renders text that represents useful data such as the current score,
		high score, and how much ammo the player has left.
		params:
			ctx:canvasRenderingContext2D - context to render with
	*/
	ctx.fillStyle = "rgba(100,100,0,0.1)"; // translucent dull yellow
	ctx.fillRect(0, 0, 600, 50);
	
	ctx.lineWidth = 3;
	ctx.fillStyle = "#ded"; // very light and dull green
	ctx.strokeStyle = "#070"; // dark green
	ctx.textAlign = "left";
	ctx.font = "bold 36px sans-serif";
	ctx.strokeText(score.toString(), 2, 42);
	ctx.fillText(score.toString(), 2, 42);
	
	ctx.font = "bold 12px sans-serif"
	var txx = "SCORE  |  HIGH : " + hiscore.toString() + " ";
	ctx.strokeText(txx, 0, 10);
	ctx.fillText(txx, 0, 10);
	
	ctx.fillStyle = "#ffa"; // light yellow
	if(controlState.fire && player1.ammo <= 0) //flashes if out of ammo and player is trying to fire
		ctx.fillStyle = timeElapsed % 200 > 100 ? "#f66" : "#ffa";
	ctx.strokeStyle = "#a90"; // dark yellow
	ctx.textAlign = "center";
	
	ctx.font = "bold 12px sans-serif";
	ctx.strokeText("AMMO", 300, 10);
	ctx.fillText("AMMO", 300, 10);
	
	ctx.font = "bold 36px sans-serif";
	ctx.strokeText(player1.ammo.toString(), 300, 42);
	ctx.fillText(player1.ammo.toString(), 300, 42);
}

function menuUpdate(){
	/* function menuUpdate()
		logic step for menu mode
	*/
	if(controlState.menu)
		startGame();
}
function drawStartScreen(ctx){
	/* drawStartScreen(ctx)
		renders the start screen
		parameters:
			ctx:canvasRenderingContext2D - context to render with
	*/
	startscreen_drawTitle(ctx);
	startscreen_drawStartPrompt(ctx);
}
function drawEndScreen(ctx){
	/* function drawEndScreen(ctx)
		renders the screen that appears when you die
		params:
			ctx:canvasRenderingContext2D - context to render with
	*/
	updateGame();
	drawGame(ctx);
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
	ctx.fillRect(0,0,600,600);
	console.log(mode);
	
	endscreen_drawGameover(ctx);
	endscreen_drawScore(ctx);
	endscreen_drawStartPrompt(ctx);
}

function startscreen_drawStartPrompt(ctx){
	/*do i really need to explain*/
	var col = "#ddd";
	if(timeElapsed % 500 >= 250)
		col = "#777";
	ctx.fillStyle = col;
	ctx.textAlign = "center";
	ctx.font = "bold 28px sans-serif"
	ctx.fillText("PRESS SPACE TO START", 300, 500);
}
function startscreen_drawTitle(ctx){
	ctx.fillStyle = "#bfb";
	ctx.strokeStyle = "#5c5";
	ctx.lineWidth = 1;
	ctx.textAlign = "center";
	ctx.font = "bold 86px sans-serif"
	ctx.fillText("Hopper.", 300, 100);
	ctx.strokeText("Hopper.", 300, 100);
}

function endscreen_drawGameover(ctx){
	ctx.fillStyle = "#faa";
	ctx.strokeStyle = "#a11";
	ctx.lineWidth = 1;
	ctx.textAlign = "center";
	ctx.font = "bold 86px sans-serif"
	ctx.fillText("GAME OVER", 300, 100);
	ctx.strokeText("GAME OVER", 300, 100);
}
function endscreen_drawScore(ctx){
	ctx.fillStyle = "#fff";
	ctx.textAlign = "center";
	ctx.font = "bold 24px sans-serif";
	ctx.fillText("YOUR SCORE", 300, 150);
	ctx.fillText("HIGH SCORE", 300, 300);
	
	ctx.fillStyle = "#dfd";
	ctx.lineWidth = 1;
	ctx.font = "bold 62px sans-serif";
	ctx.fillText(score.toString(), 300, 205);
	
	ctx.font = "bold 42px sans-serif";
	ctx.fillText(hiscore.toString(), 300, 340);
}
function endscreen_drawStartPrompt(ctx){
	var col = "#ddd";
	if(timeElapsed % 500 >= 250)
		col = "#777";
	ctx.fillStyle = col;
	ctx.textAlign = "center";
	ctx.font = "bold 28px sans-serif";
	ctx.fillText("PRESS SPACE TO RESTART", 300, 500);
}

function startGame(){
	initSpawnVars();
	mode = 1;
	enemies = [];
	projectiles = [];
	effects = [];
	tracers = [];
	items = [];
	gibs = [];
	planets = planet.generatePlanets();
	gameStart = timeElapsed;
	score = 0;
	ammoitems = 0;
	
	playSound(sfx.startGame);
	loopMusic();
	
	player1 = new player();
	player1.chooseRandPos();
	//tests all the implemented mechanics:
	//DEBUGSTART();
}
function endGame(){
	mode = 2;
	saveHighScore();
}
function addScore(pts, foc = null){
	if(player1.isDead) return;
	if(foc){
		var ft = new flashText(foc.clone(), pts.toString());
		if(pts >= 200)
			ft.fcolor = [60, 255, 160];
		ft.add();
	}
	score += pts;
}

function loadHighScore(){
	try{
		var hi = localStorage.getItem(saveKey)
		if(hi == null){
			hiscore = 0;
			return;
		}
		hiscore = Number.parseInt(hi);
	}
	catch(err){
		alert("Warning: You have site storage disabled!\nYou can still play the game, but your high scores will not be saved.");
		hiscore = 0;
		return;
	}
}
function saveHighScore(){
	hiscore = Math.max(score, hiscore);
	try{
		localStorage.setItem(saveKey, hiscore);
	}
	catch(err){}
}

function playSound(snd, startover = true){
	if(startover)
		snd.currentTime = 0;
	snd.play();
}
function loopMusic(){
	if(!musicOn)
		return;
	sfx.music.addEventListener('ended', startMusicLoop);
	sfx.music.play();
}
function startMusicLoop(){
	if(!musicOn)
		return;
	sfx.music.currentTime = 0;
	sfx.music.play();
}
function toggleMusic(){
	musicOn = !musicOn;
	if(!musicOn){
		if(!sfx.music.paused)
			sfx.music.pause();
	}
	else
		loopMusic();
}

function DEBUGSTART(){
	//for(var i = 10; i > 0; i--){
	//	var tm = new item();
	//	tm.pos = new vec2(rand(0, 600), rand(0, 600));
	//	tm.add()
	//}
	var en = new en_shooter();
	en.add();
}

//life easier
function rand(min = 0, max = 1){
	return (Math.random() * (max - min) + min);
}
function mod(div, max){
	if(div > 0)
		return div % max;
	return div % max + max;
}
function angDist(source, target){
	var dif = target - source;
	dif = mod(dif + Math.PI, Math.PI * 2) - Math.PI;
	return dif;
}

init();