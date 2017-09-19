"use strict";

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var timeElapsed = 0;
var gameStart = 0;
var dt = 0;
var odt = 0;

var mode = 0;

var saveKey = "technostalgic_LD38_highschore";
var score = 0;
var hiscore = 0;
var planets = [];
var enemies = [];
var projectiles = [];
var items = [];
var gibs = [];
var effects = [];
var tracers = [];
var player1;
var controls = [37, 39, 38, 40, 88, 67, 32];
var controlState = { moveLeft: false, moveRight: false, increasePow: false, decreasePow: false, jump: false, fire: false, menu: false };

var musicOn = true;
var sfx = {};

function clearScreen(ctx) {
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hook_controls() {
	/*
 canvas.addEventListener('click', function(event){
 	player1.health = 1;
 	player1.ammo = Math.max(3, player1.ammo);
 	player1.pos = new vec2(event.offsetX, event.offsetY);
 	player1.vel = new vec2();
 });
 */
	document.addEventListener('keydown', handleControlsDown);
	document.addEventListener('keyup', handleControlsUp);
}
function handleControlsDown(event) {
	console.log(event.key + ":" + event.keyCode);
	//m key:
	if (event.keyCode == 77) toggleMusic();
	switch (event.keyCode) {
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
function handleControlsUp(event) {
	switch (event.keyCode) {
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
//[prevents arrow key / space scrolling]
window.addEventListener("keydown", function (e) {
	// space and arrow keys
	if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
		e.preventDefault();
	}
}, false);

function elapsedGameTime() {
	return timeElapsed - gameStart;
}

function init() {
	loadSound();
	loadHighScore();
	mode = 0;
	hook_controls();
	requestAnimationFrame(step);
}
function step() {
	odt += dt;
	while (odt >= 16.66667) {
		update();
		odt -= 16.66667;
	}
	draw(context);

	requestAnimationFrame(step);
	dt = Math.max(0, performance.now() - timeElapsed);
	timeElapsed = performance.now();
}
function update() {
	if (mode != 1) {
		menuUpdate();
		return;
	}
	updateGame();
	handleSpawns();
}
function draw(ctx) {
	clearScreen(ctx);
	if (mode != 1) {
		if (mode == 2) drawEndScreen(ctx);else drawStartScreen(ctx);
		return;
	}
	drawGame(ctx);
	drawHUD(ctx);
}

function loadSound() {
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

function updateGame() {
	updateCharacters(enemies);
	player1.update();
	player1.control(controlState);
	updateCharacters(projectiles);
	updateCharacters(items);
	updateCharacters(gibs);
	updateTracers();
}
function drawGame(ctx) {
	drawTracers(ctx);
	drawPlanets(planets, ctx);
	drawCharacters(enemies, ctx);
	drawCharacters(projectiles, ctx);
	drawCharacters(items, ctx);
	drawCharacters(gibs, ctx);
	player1.draw(ctx);
	drawEffects(ctx);
}

function drawHUD(ctx) {
	ctx.fillStyle = "rgba(100,100,0,0.1)";
	ctx.fillRect(0, 0, 600, 50);

	ctx.lineWidth = 3;
	ctx.fillStyle = "#ded";
	ctx.strokeStyle = "#070";
	ctx.textAlign = "left";
	ctx.font = "bold 36px sans-serif";
	ctx.strokeText(score.toString(), 2, 42);
	ctx.fillText(score.toString(), 2, 42);

	ctx.font = "bold 12px sans-serif";
	ctx.strokeText("SCORE  |  HIGH : " + hiscore.toString() + " ", 0, 10);
	ctx.fillText("SCORE  |  HIGH : " + hiscore.toString() + " ", 0, 10);

	ctx.fillStyle = "#ffa";
	if (controlState.fire && player1.ammo <= 0) ctx.fillStyle = timeElapsed % 200 > 100 ? "#f66" : "#ffa";
	ctx.strokeStyle = "#a90";
	ctx.textAlign = "center";

	ctx.font = "bold 12px sans-serif";
	ctx.strokeText("AMMO", 300, 10);
	ctx.fillText("AMMO", 300, 10);

	ctx.font = "bold 36px sans-serif";
	ctx.strokeText(player1.ammo.toString(), 300, 42);
	ctx.fillText(player1.ammo.toString(), 300, 42);
}

function menuUpdate() {
	if (controlState.menu) startGame();
}
function drawStartScreen(ctx) {
	startscreen_drawTitle(ctx);
	startscreen_drawStartPrompt(ctx);
}
function drawEndScreen(ctx) {
	updateGame();
	drawGame(ctx);
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillRect(0, 0, 600, 600);
	console.log(mode);

	endscreen_drawGameover(ctx);
	endscreen_drawScore(ctx);
	endscreen_drawStartPrompt(ctx);
}

function startscreen_drawStartPrompt(ctx) {
	var col = "#ddd";
	if (timeElapsed % 500 >= 250) col = "#777";
	ctx.fillStyle = col;
	ctx.textAlign = "center";
	ctx.font = "bold 28px sans-serif";
	ctx.fillText("PRESS SPACE TO START", 300, 500);
}
function startscreen_drawTitle(ctx) {
	ctx.fillStyle = "#bfb";
	ctx.strokeStyle = "#5c5";
	ctx.lineWidth = 1;
	ctx.textAlign = "center";
	ctx.font = "bold 86px sans-serif";
	ctx.fillText("Hopper.", 300, 100);
	ctx.strokeText("Hopper.", 300, 100);
}

function endscreen_drawGameover(ctx) {
	ctx.fillStyle = "#faa";
	ctx.strokeStyle = "#a11";
	ctx.lineWidth = 1;
	ctx.textAlign = "center";
	ctx.font = "bold 86px sans-serif";
	ctx.fillText("GAME OVER", 300, 100);
	ctx.strokeText("GAME OVER", 300, 100);
}
function endscreen_drawScore(ctx) {
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
function endscreen_drawStartPrompt(ctx) {
	var col = "#ddd";
	if (timeElapsed % 500 >= 250) col = "#777";
	ctx.fillStyle = col;
	ctx.textAlign = "center";
	ctx.font = "bold 28px sans-serif";
	ctx.fillText("PRESS SPACE TO RESTART", 300, 500);
}

function startGame() {
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
function endGame() {
	mode = 2;
	saveHighScore();
}
function addScore(pts) {
	var foc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	if (player1.isDead) return;
	if (foc) {
		var ft = new flashText(foc.clone(), pts.toString());
		if (pts >= 200) ft.fcolor = [60, 255, 160];
		ft.add();
	}
	score += pts;
}

function loadHighScore() {
	try {
		var hi = localStorage.getItem(saveKey);
		if (hi == null) {
			hiscore = 0;
			return;
		}
		hiscore = Number.parseInt(hi);
	} catch (err) {
		alert("Warning: You have site storage disabled!\nYou can still play the game, but your high scores will not be saved.");
		hiscore = 0;
		return;
	}
}
function saveHighScore() {
	hiscore = Math.max(score, hiscore);
	try {
		localStorage.setItem(saveKey, hiscore);
	} catch (err) {}
}

function playSound(snd) {
	var startover = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	if (startover) snd.currentTime = 0;
	snd.play();
}
function loopMusic() {
	if (!musicOn) return;
	sfx.music.addEventListener('ended', startMusicLoop);
	sfx.music.play();
}
function startMusicLoop() {
	if (!musicOn) return;
	sfx.music.currentTime = 0;
	sfx.music.play();
}
function toggleMusic() {
	musicOn = !musicOn;
	if (!musicOn) {
		if (!sfx.music.paused) sfx.music.pause();
	} else loopMusic();
}

function DEBUGSTART() {
	//for(var i = 10; i > 0; i--){
	//	var tm = new item();
	//	tm.pos = new vec2(rand(0, 600), rand(0, 600));
	//	tm.add()
	//}
	var en = new en_shooter();
	en.add();
}

//life easier
function rand() {
	var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

	return Math.random() * (max - min) + min;
}
function mod(div, max) {
	if (div > 0) return div % max;
	return div % max + max;
}
function angDist(source, target) {
	var dif = target - source;
	dif = mod(dif + Math.PI, Math.PI * 2) - Math.PI;
	return dif;
}

init();