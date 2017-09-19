"use strict";

var spawnDelay = 500;
var maxEnemies = 3;
var tilspawn = spawnDelay;
var ammoitems = 0;

function initSpawnVars() {
	spawnDelay = 600;
	maxEnemies = 3;
	tilspawn = spawnDelay;
}
function handleSpawns() {
	if (enemies.length < maxEnemies) {
		tilspawn -= 1;
		if (tilspawn <= 0) {
			spawnEnemy();
			recalculateSpawnVars();
		}
	}
	if (ammoitems <= 0) {
		spawnAmmoItem();
	}
}
function recalculateSpawnVars() {
	var etime = elapsedGameTime();
	spawnDelay = 470 / Math.max(etime / 60000, 1) + 30;
	maxEnemies = 2 + etime / 10000;
}
function spawnAmmoItem() {
	var tm = new item_ammo();
	tm.pos = planets[Math.floor(rand(0, planets.length))].pos;
	tm.pos = tm.pos.plus(vec2.fromAng(rand(0, Math.PI * 2)));
	tm.add();
	tm.update();
	tm.flash();
}
function spawnEnemy() {
	tilspawn = spawnDelay * enemies.length;
	var el = getSpawnEnemyList();
	var es = Math.floor(rand(0, el.length));
	var en = el[es];

	en.add();

	var ratio = 1 - (es + 1) / el.length;
	tilspawn -= rand(ratio * spawnDelay);
}
function getSpawnEnemyList() {
	var etime = elapsedGameTime();
	var r = [];
	r.push(new en_crawler());

	if (etime > 30000) r.push(new en_mover());

	if (etime > 60000) {
		r.push(new en_shooter());
		r.push(new en_orbiter());
	}

	if (etime > 90000) r.push(new en_mover());
	if (etime > 120000) r.push(new en_shooter());
	if (etime > 240000) r.push(new en_shooter());
	return r;
}
function updateTilSpawn() {
	recalculateSpawnVars();
	Math.min(tilspawn, spawnDelay * enemies.length);
}