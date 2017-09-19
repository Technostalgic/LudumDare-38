///
///	code by Isaiah Smith
///		
///	https://technostalgic.itch.io  
///	twitter @technostalgicGM
///

/* class enemy - character
	data structure that contains information and methods to 
	simulate a malicious entity
*/
class enemy extends character{
	/* constructor() 
		initializes an enemy entity
		member variables: inherits from character
			private ss:Boolean - sound flag; ensures spawn sound
				is only played once
			public size:Number - collision radius
			private tilSpawn:Number - ticks before the enemy
				spawns
			public points:Number - how many points the player
				gains upon the death of this enemy
	*/
	constructor(){
		super();
		this.ss = true;
		this.size = 15;
		this.tilSpawn = 120;
		this.chooseRandomPosition();
		this.points = 50;
	}
	
	/* member function chooseRandomPosition() - public
		returns a random position on the surface of a
		random planet
	*/
	chooseRandomPosition(){
		this.pos = new vec2(rand(50, 550), rand(100, 550));
	}
	/* member function add() - public
		adds the enemy to the enemy query
	*/
	add(){
		enemies.push(this);
	}
	/* member function remove() - public
		removes the enemy from the enemy query
	*/
	remove(){
		if(enemies.includes(this)){
			enemies.splice(enemies.indexOf(this), 1);
		}
		updateTilSpawn();
	}
	/* member function die() - public
		destroys the enemy object
	*/
	die(){
		if(!enemies.includes(this))
			return;
		if(this.tilSpawn > 0)
			return;
		
		// releases gibs
		this.explode();
		
		// removes from world
		this.remove();
		
		// gives the player points
		addScore(this.points, this.pos);
	}
	/* member function explode() - public
		causes the enemy to release gibs that destroy 
		other enemies
	*/
	explode(){
		var e = new effect(this.pos);
		e.size = this.size * 2;
		e.color = [255, 150, 150];
		e.add();
		gib.createGibs(this.pos, 8, 10);
		playSound(sfx.enemyDeath);
	}
	
	/* member function canSeePlayer() - public
		returns true if the enemy has a clear line of
		sight to the player
	*/
	canSeePlayer(){
		var tpos = this.pos.clone(); //this pos
		var ppos = player1.pos.clone(); //player pos
		var pdist = ppos.distance(tpos); //distance between this and player
		var pang = ppos.minus(tpos).direction; //angle pointing toward player from this
		
		// iterate through each planet to see if it's
		// blocking the line of sight
		for (var i = planets.length - 1; i >= 0; i--) {
			var pl = planets[i]; //the planet to test against
			
			// continues if the planet is out of range
			if(tpos.distance(pl.pos) > pdist)
				continue;
			
			var pldist = tpos.distance(pl.pos); //the distance between the planet and this
			
			//super simple raycast:
			// creates an imaginary point equidistant from this and the planet 
			// but still pointing toward the player. tests so see if that point
			// is colliding witht the planet, if it was, there is a collision and
			// and therefore no direct line of sight
			if(vec2.fromAng(pang, pldist).plus(tpos).distance(pl.pos) <= pl.size)
				return false;
		}
		return true;
	}
	/* member function overlapsPlanet() - public
		returns true if this is overlapping the planet
		pretty self explanitory
	*/
	overlapsPlanet(){
		var r = false;
		var ths = this; //used because `this` keyword is inaccurate inside the scope of a forEach loop
		
		// iterates through each planet and checks for collision
		planets.forEach(function(pl){
			if(ths.pos.distance(pl.pos) <= ths.size + pl.size)
				r = true;
		});
		return r;
	}
	/* member function behave() - public virtual
		used to be overriden for specific enemy types to have 
		their own AI behaviors
	*/
	behave(){
	}
	
	/* member function checkCollisions() - public
		checks all the possible collisions
	*/
	checkCollisions(){
		super.checkCollisions();
		var ths = this;
		for(var i = projectiles.length - 1; i >= 0; i--){
			if(projectiles[i].team == 1) continue;
			if(projectiles[i].pos.distance(this.pos) <= projectiles[i].size + this.size)
				this.projectileCollide(projectiles[i]);
		}
		if(player1.pos.distance(this.pos) <= player1.size + this.size){
			this.playerCollide(player1);
		}
	}
	/* member function projectileCollide(proj) - public
		applies a projectile collision to the enemy
		parameters:
			proj:projectile - the projectile to collide with
	*/
	projectileCollide(proj){
		this.points *= proj.scoreMultiplier;
		this.die();
		proj.explode();
	}
	/* member function playerCollide(plr) - public
		applies a player collision
		parameters:
			plr:player - the player to collide with
	*/
	playerCollide(plr){
		plr.die();
	}
	
	/* member function drawSpawnPoint(ctx) - public
		draws the spawnpoint so the player knows where
		the enemy will spawn
		parameters:
			ctx:RenderingContext2D - the context to render with
	*/
	drawSpawnPoint(ctx){
		var maxSize = this.size * 3;
		// represents the animated element to the spawnpoint
		var a = 1 - this.tilSpawn / 120;
		// adds some easing in to the fade
		a = Math.pow(a, 5);
		
		ctx.fillStyle = "rgba(255, 120, 120, " + (a + 0.05) + ")"; // light red
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, (maxSize - a * maxSize) + this.size, 0, Math.PI * 2);
		ctx.fill();
	}
	
	/* member function update() - public
		see inherited
	*/
	update(){
		if(this.tilSpawn > 0){
			this.tilSpawn -= 1;
			if(this.ss)
				if(this.tilSpawn < 10){
					playSound(sfx.enemySpawn);
					this.ss = false;
				}
			return;
		}
		super.update();
		this.behave();
	}
	/* member function draw(ctx) - public
		see inherited
	*/
	draw(ctx){
		if(this.tilSpawn > 0){
			this.drawSpawnPoint(ctx);
			return;
		}
		ctx.strokeStyle = "#a11";
		ctx.fillStyle = "#faa";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

/* class en_mover - enemy character
	enemy that flies toward the player when it's in 
	their line of sight
*/
class en_mover extends enemy{
	constructor(){
		super();
		this.size = 10;
		this.points = 100;
	}
	chooseRandomPosition(){
		this.speed = rand(0.5, rand(0.5, 1));
		
		do{
			this.pos = new vec2(rand(50, 550), rand(100, 550));
		} while(this.overlapsPlanet());
		
		this.vel = vec2.fromAng(rand(0, Math.PI * 2), this.speed);
	}
	planetCollide(pl){
		super.planetCollide(pl);
		this.vel = vec2.fromAng(rand(0, Math.PI * 2), this.speed);
	}
	
	behave(){
		if(player1.isDead) return;
		if(this.pos.x <= this.size ||
			this.pos.x >= 600 - this.size ||
			this.pos.y <= this.size ||
			this.pos.y >= 600 - this.size){
			
			this.vel = vec2.fromAng(rand(0, Math.PI * 2), this.speed);
			this.pos = new vec2(
				Math.min(Math.max(this.pos.x, this.size), 600 - this.size) ,
				Math.min(Math.max(this.pos.y, this.size), 600 - this.size) );
		}
		if(this.canSeePlayer())
			this.vel = vec2.fromAng(player1.pos.minus(this.pos).direction, this.speed);
	}
	draw(ctx){
		if(this.tilSpawn > 0){
			this.drawSpawnPoint(ctx);
			return;
		}
		var anm = Math.abs(350 - (timeElapsed % 700)) / 350;
		var ang = this.vel.direction;
		var paddle1 = vec2.fromAng(ang + Math.PI * 1.5 / 3, this.size * anm + 0.5);
		var paddle2 = vec2.fromAng(ang - Math.PI * 1.5 / 3, this.size * anm + 0.5);

		var verts = [
			vec2.fromAng(ang - Math.PI / 5, this.size).plus(this.pos),
			vec2.fromAng(ang, this.size).plus(this.pos),
			vec2.fromAng(ang + Math.PI / 5, this.size).plus(this.pos),
			paddle1.plus(this.pos),
			vec2.fromAng(ang + Math.PI * 4 / 5, this.size * 1.5).plus(this.pos),
			vec2.fromAng(ang - Math.PI * 4 / 5, this.size * 1.5).plus(this.pos),
			paddle2.plus(this.pos)
			];
		
		ctx.strokeStyle = "#a11";
		ctx.fillStyle = "#faa";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(verts[0].x, verts[0].y);
		verts.forEach(function(vert){
			ctx.lineTo(vert.x, vert.y);
		});
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}
/* class en_shooter - enemy character
	enemy that fires at the player if its in the line
	of sight
*/
class en_shooter extends enemy{
	constructor(){
		super();
		this.fireWait = 0;
		this.rotation = rand(0, Math.PI * 2);
		this.tilfire = 60;
		this.points = 150;
	}
	chooseRandomPosition(){
		do{
			this.pos = new vec2(rand(50, 550), rand(100, 550));
		} while(this.overlapsPlanet());
	}

	behave(){
		this.tilfire -= 1;
		if(player1.isDead) {
			this.tilfire = 30;
			return;
		}
		if(this.canSeePlayer()){
			this.rotateToPlayer();
			if(this.tilfire <= 0)
				this.shoot();
		}
		else
			this.tilfire = Math.max(30, this.tilfire);
	}
	rotateToPlayer(){
		var ang = player1.pos.minus(this.pos).direction;
		var rotspd = Math.PI / 90;
		var rdir = angDist(this.rotation, ang);
		if(Math.abs(rdir) < rotspd){
			this.rotation = ang;
			return;
		}
		rdir = Math.sign(rdir);
		this.rotation += rdir * rotspd;
	}
	shoot(){
		this.tilfire = 60;
		var ang = this.rotation;
		ang += rand(-.1, .1);
		enemyProjectile.fire(this.pos, ang, 7.5);
		playSound(sfx.shooterShoot);
	}

	explode(){
		var e = new effect(this.pos);
		e.size = this.size * 2;
		e.color = [255, 150, 150];
		e.add();
		gib.createGibs(this.pos, 10, 10);
		playSound(sfx.shooterDeath);
	}
	
	draw(ctx){
		if(this.tilSpawn > 0){
			this.drawSpawnPoint(ctx);
			return;
		}
		var ang = this.rotation;

		var verts = [
			vec2.fromAng(ang - Math.PI * 2 / 5, this.size).plus(this.pos),
			vec2.fromAng(ang - Math.PI * 1 / 5, this.size / 2).plus(this.pos),
			vec2.fromAng(ang, this.size * (0.5 + this.tilfire / 60)).plus(this.pos),
			vec2.fromAng(ang + Math.PI  * 1 / 5, this.size / 2).plus(this.pos),
			vec2.fromAng(ang + Math.PI  * 2 / 5, this.size).plus(this.pos),
			vec2.fromAng(ang + Math.PI * 4 / 5, this.size).plus(this.pos),
			vec2.fromAng(ang - Math.PI * 4 / 5, this.size).plus(this.pos)
		]

		ctx.strokeStyle = "#a11";
		ctx.fillStyle = "#faa";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(verts[0].x, verts[0].y);
		verts.forEach(function(vert){
			ctx.lineTo(vert.x, vert.y);
		});
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}
/* class en_orbiter - enemy character
	enemy that orbits around the nearest planet
*/
class en_orbiter extends enemy{
	constructor(){
		super();
		//		this.focusPlanet; defined in this.chooseRandomPosition()
		//		this.orbitDist; defined in this.chooseRandomPosition()
		this.size = 10;
		this.speed = rand(1, rand(1, 3)) * (Math.floor(rand(0, 2)) * 2 - 1);
		this.rotation = rand(0, Math.PI * 2);
	}
	
	chooseRandomPosition(){
		this.orbitDist = rand(20, 35);
		var pl = planets[Math.floor(rand(0, planets.length))];
		this.focusPlanet = pl;
		var ang = rand(0, Math.PI * 2);
		this.pos = this.focusPlanet.pos.plus(vec2.fromAng(ang, this.orbitDist + this.focusPlanet.size));
	}
	
	behave(){
		var pang = this.pos.minus(this.focusPlanet.pos).direction;
		var mov = vec2.fromAng(pang + Math.PI / 2, this.speed);
		this.vel = mov;
		
		this.pos = this.focusPlanet.pos.plus(vec2.fromAng(pang, this.orbitDist + this.focusPlanet.size));
		this.rotation += this.speed / 25;
	}
	draw(ctx){
		if(this.tilSpawn > 0){
			this.drawSpawnPoint(ctx);
			return;
		}
		var verts = [
			vec2.fromAng(this.rotation, this.size * 1.4).plus(this.pos),
			vec2.fromAng(Math.PI / 2 + this.rotation, this.size * 1.4).plus(this.pos),
			vec2.fromAng(Math.PI + this.rotation, this.size * 1.4).plus(this.pos),
			vec2.fromAng(Math.PI / -2 + this.rotation, this.size * 1.4).plus(this.pos)
		];

		ctx.strokeStyle = "#a11";
		ctx.fillStyle = "#faa";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(verts[0].x, verts[0].y);
		verts.forEach(function(vert){
			ctx.lineTo(vert.x, vert.y);
		});
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}
/* class en_crawler - enemy character
	enemy that crawls along the surface of a planet
*/
class en_crawler extends enemy{
	constructor(){
		super();
		//	this.focusPlanet; defined in this.chooseRandomPosition()
		//	this.size; defined in this.chooseRandomPosition()
		this.speed = rand(0.5, rand(0.5, 1.5)) * (Math.floor(rand(0, 2)) * 2 - 1);
	}
	
	chooseRandomPosition(){
		this.size = 10;
		var pl = planets[Math.floor(rand(0, planets.length))];
		this.focusPlanet = pl;
		var ang = rand(0, Math.PI * 2);
		this.pos = this.focusPlanet.pos.plus(vec2.fromAng(ang, this.focusPlanet.size + this.size));
	}
	
	explode(){
		var e = new effect(this.pos);
		e.size = this.size * 2;
		e.color = [255, 150, 150];
		e.add();
		gib.createGibs(this.pos, 6, 7, this.pos.minus(this.focusPlanet.pos).direction);
		playSound(sfx.enemyDeath);
	}
	
	behave(){
		var pang = this.pos.minus(this.focusPlanet.pos).direction;
		var mov = vec2.fromAng(pang + Math.PI / 2, this.speed);
		this.vel = mov;
		this.pos = this.focusPlanet.pos.plus(vec2.fromAng(pang, this.size + this.focusPlanet.size));
	}
	draw(ctx){
		if(this.tilSpawn > 0){
			this.drawSpawnPoint(ctx);
			return;
		}
		var ang = this.pos.minus(this.focusPlanet.pos).direction;
		var anm = Math.abs(timeElapsed % 500 - 250) / 250;
		var rps = vec2.fromAng(ang, -this.size);
		
		var spike1 = vec2.fromAng(ang - Math.PI / 4, this.size + (anm * 10));
		var spike2 = vec2.fromAng(ang + Math.PI / 4, this.size + ((1 - anm) * 10));
		
		var verts = [
			vec2.fromAng(ang - Math.PI / 2, this.size / 2).plus(this.pos).plus(rps),
			spike1.plus(this.pos).plus(rps),
			vec2.fromAng(ang, this.size / 2).plus(this.pos).plus(rps),
			spike2.plus(this.pos).plus(rps),
			vec2.fromAng(ang + Math.PI / 2, this.size / 2).plus(this.pos).plus(rps)
		];
		
		ctx.strokeStyle = "#a11";
		ctx.fillStyle = "#faa";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(verts[0].x, verts[0].y);
		verts.forEach(function(vert){
			ctx.lineTo(vert.x, vert.y);
		});
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}

/* class gib - item character
	a projectile-like entity that is released when
	an enemy is killed; damages other enemies
*/
class gib extends item{
	/* constructor() 
		initializes a gib object
		member variables: inherits from item
	*/
	constructor(pos){
		super();
		this.pos = pos;
		this.size = 5;
	}
	
	/* static function createGibs(pos, count, force, dir)
		creates a specified amount of gibs and scatters
		them in all directions
		parameters:
			pos:vec2 - where the gibs are spawned from
			count:Number - the amount of gibs to spawn
			force:Number - how fast the gib will travel
			dir:Number - the direction in radians the gib
				will travel in plus or minus pi/2, leave
				null for random
	*/
	static createGibs(pos, count, force, dir = null){
		var ang = rand(0, Math.PI * 2);
		var inc = (1 / count) * Math.PI * 2;
		for(var i = count; i > 0; i--){
			var gb = new gib(pos);
			if(dir) ang = dir + rand(-Math.PI / 2, Math.PI / 2);
			gb.vel = vec2.fromAng(ang + rand(-inc, inc), rand(force / 2, force));
			gb.add();
			ang += inc;
		}
	}
	/* static function createPlayerGibs(pos)
		more specific extention of createGibs(), used for
		when the player dies
		parameters:
			pos:vec2 - where to spawn the gibs
	*/
	static createPlayerGibs(pos){
		var count = 10;
		var force = 10;
		var ang = rand(0, Math.PI * 2);
		var inc = (1 / count) * Math.PI * 2;
		for(var i = count; i > 0; i--){
			var gb = new gib(pos);
			gb.playerTracer();
			gb.pickUp = function(){};
			gb.vel = vec2.fromAng(ang + rand(-inc, inc), rand(force / 2, force));
			gb.add();
			ang += inc;
		}
	}
	
	/* member function add() - public
		adds the gib to the dynamic gib query
		so it gets updated and rendered
	*/
	add(){
		gibs.push(this);
	}
	/* member function remove() - public
		removes the gib from the dynamic gib query
	*/
	remove(){
		if(gibs.includes(this))
			gibs.splice(gibs.indexOf(this), 1);
	}
	
	/* member function openTracer() - public
		initializes a new tracer to draw the gib's
		trail as it moves
	*/
	openTracer(){
		this.color = [Math.floor(rand(rand(220, 255), 255)), 200, 200]; // varying shades of red
		this.currentTracer = new tracer();
		this.currentTracer.color = this.color;
		this.currentTracer.life = 100;
		this.currentTracer.add();
	}
	/* member function playerTracer() - public
		same as openTracer(), but for gibs spawned 
		from the player so they are green instead
		of red
	*/
	playerTracer(){
		this.color = [200, 250, 200]; // light green
		this.currentTracer = new tracer();
		this.currentTracer.color = this.color;
		this.currentTracer.life = 100;
		this.currentTracer.add();
	}
	
	/* member function checkCollisions() - public
		performs all the required collision checks
		for this object
	*/
	checkCollisions(){
		super.checkCollisions();
		this.checkEnemyCollisions();
	}
	/* member function checkEnemyCollisions() - public
		performs all the enemy collision checks
		for this object
	*/
	checkEnemyCollisions(){
		for(var i = enemies.length - 1; i >= 0; i--){
			if(this.pos.distance(enemies[i].pos) <= enemies[i].size + this.size)
				this.enemyCollide(enemies[i]);
		}
	}
	/* member function enemyCollide(en) - public
		performs a collision with an enemy
		parameters:
			en:enemy - the enemy object to collide 
				with
	*/
	enemyCollide(en){
		en.points *= 2;
		en.die();
		this.explode();
	}
	
	/* member function planetCollide(pl) - public
		performs a collisions with a planet object
		parameters:
			pl:planet - the planet object to collide 
				with
	*/
	planetCollide(pl){
		super.planetCollide(pl);
		this.explode();
	}
	/* member function explode() - public 
		creates a small explosion effect and destroys
		the gib instance
	*/
	explode(){
		this.remove();
		var e = new effect(this.pos);
		e.size = 5;
		e.color = this.color;
		e.add();
		playSound(sfx.explosionSmall);
	}
	
	/* member function draw(ctx) - public
		renders the gib on screen
	*/
	draw(ctx){}
}