///
///	code by Isaiah Smith
///		
///	https://technostalgic.itch.io  
///	twitter @technostalgicGM
///

/* spawner.js
	contains methods for periodically spawning enemies and
	and increasing the difficulty by spawning harder 
	enemies as time goes on
	also handles spawning items
*/

// the amount of time in between enemy spawns; decreases as time goes on
var spawnDelay = NaN;
// the dynamic variable that acts as a timer, spawning enemies when it reaches zero
var tilspawn = NaN;
// maximum amount of enemies aloud on screen, increases as time goes on
var maxEnemies = NaN;

// the amount of ammo items currently in the world
var ammoitems = 0;

function initSpawnVars(){
	/* function initSpawnVars()
		initializes the spawn variables to what they should 
		be when the game starts at the easiest difficulty
	*/
	spawnDelay = 600;
	maxEnemies = 3;
	tilspawn = spawnDelay;
}
function handleSpawns(){
	/* function handleSpawns()
		the main logic tick for spawn handling
	*/
	
	// handles enemy spawns
	if(enemies.length < maxEnemies){
		tilspawn -= 1;
		if(tilspawn <= 0){
			spawnEnemy();
			recalculateSpawnVars();
		}
	}
	
	// handles item spawns
	if(ammoitems <= 0){
		spawnAmmoItem();
	}
}
function recalculateSpawnVars(){
	/* function recalculateSpawnVars()
		sets the spawn variables to be more difficult the longer
		the round has been going on
	*/
	var etime = elapsedGameTime();
	spawnDelay = 470 / Math.max(etime / 60000, 1) + 30; // spawn delay effectively halves every minute
	maxEnemies = 2 + (etime / 10000); // starts at 2 and increases by 1 every 10 seconds
}
function spawnAmmoItem(){
	/* function spawnAmmoItem()
		spawns an ammo item on a random planet
	*/
	var tm = new item_ammo();
	tm.pos = planets[Math.floor(rand(0, planets.length))].pos; // picks a random planet to place the item on
	tm.pos = tm.pos.plus(vec2.fromAng(rand(0, Math.PI * 2))); // moves the item in a random direction by one pixel
	tm.add(); // adds the item to the world
	tm.update(); // performs a collision check that then places the item on the surface of the planet
	tm.flash(); // creates a visual effect to show that the item spawned
}
function spawnEnemy(){
	/* function spawnEnemy()
		spawns a random enemy
	*/
	tilspawn = spawnDelay * enemies.length;
	var el = getSpawnEnemyList();
	var es = Math.floor(rand(0, el.length)); // index of enemy to spawn in the list
	var en = el[es]; // the enemy to spawn

	en.add();
	
	// the difficulty ratio of the enemy just spawned
	var ratio = 1 - ((es + 1) / el.length);
	tilspawn -= rand(ratio * spawnDelay); // deducts some of the spawn delay if the enemy was an easy one
}
function getSpawnEnemyList(){
	/* function getSpawnEnemyList()
		returns a list of increasingly difficult enemies as time goes on
	*/
	var etime = elapsedGameTime();
	var r = [];
	r.push(new en_crawler());

	if(etime > 30000) // 30 sec
		r.push(new en_mover());

	if(etime > 60000){ // 1 min
		r.push(new en_shooter());
		r.push(new en_orbiter());
	}
	
	if(etime > 90000) r.push(new en_mover()); // 1 min 30 sec
	if(etime > 120000) r.push(new en_shooter()); // 2 min
	if(etime > 240000) r.push(new en_shooter()); // 4 mins
	return r;
}
function updateTilSpawn(){
	/* function updateTilSpawn()
		used to update the spawn variables in a pinch
	*/
	recalculateSpawnVars();
	// Math.min(tilspawn, spawnDelay * enemies.length); //don't know why I put this here
}
