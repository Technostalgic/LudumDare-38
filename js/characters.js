///
///	code by Isaiah Smith
///		
///	https://technostalgic.itch.io  
///	twitter @technostalgicGM
///

/* Character.js
	contains data structures for dynamic physics entities
*/


/* class character
	contains information and methods for dynamic physics entities
	acts as a template for more detailed entities
*/
class character{
	/* constructor()
		initializes a character entity
		member variables:
			public pos:vec2 - stores the on screen coordinates of
				this entity
			public vel:vec2 - represents the change in position
				between this and the next step
			public size:Number - the radius in which collisions occur
			public health:Number - this entity is destroyed when less
				than or equal to 0
	*/
	constructor(){
		this.pos = new vec2();
		this.vel = new vec2();
		this.size = 10;

		this.health = 1;
	}

	/* member function applyGravity()
		applies gravitational pull on the entity from each planet
		taking into account the planet's mass and distance
	*/
	applyGravity(){
		/* var f
			variable used to store the cumulative gravitational force 
			from each planet
		*/
		var f = new vec2();
		/* var ths 
			required for reference within the scope of
			planets.forEach, since 'this' keyword is not valid in
			the local scope
		*/
		var ths = this; 
		planets.forEach(function(pl){
			var dir = pl.pos.minus(ths.pos).direction;
			var mag = pl.mass / Math.pow(pl.pos.distance(ths.pos), 2);
			var df = vec2.fromAng(dir, mag / 2)
			f = f.plus(df);
		});
		
		//adds the cumulative gravitational force to our velocity
		this.vel = this.vel.plus(f);
	}
	
	/* member function checkCollisions() - public virtual
		checks to see if any collisions between this and other objects happen
	*/
	checkCollisions(){
		/* var ths 
			required for reference within the scope of
			planets.forEach, since 'this' keyword is not valid in
			the local scope
		*/
		var ths = this;
		planets.forEach(function(pl){
			if(ths.isCollidingWithPlanet(pl))
				ths.planetCollide(pl);
		})
	}
	/* member function planetCollide(pl) - public
		applies a collision to this with the specified planet
		parameters:
			pl:planet - the planet to collide with
	*/
	planetCollide(pl){
		var dir = this.pos.minus(pl.pos).direction;
		var mag = this.size + pl.size;
		
		// sets this position so that this entity is on the edge of 
		// the planet
		this.pos = pl.pos.plus(vec2.fromAng(dir, mag));
	}
	/* member function isCollidingWithPlanet(pl) - public
		returns true if this is collidind with the specified planet
		parameters:
			pl:planet - the planet to check collision with
	*/
	isCollidingWithPlanet(pl){
		return (this.pos.distance(pl.pos) <= this.size + pl.size)
	}

	/* member function update() - public virtual
		the entry point for the per-step action of this entity,
		called once at the beginning of each logic step
	*/
	update(){
		this.pos = this.pos.plus(this.vel);
		this.checkCollisions();
	}
	/* member function draw(ctx) - public virtual
		renders this entity on the canvas; if not overridden, it
		is rendered as a gray circle with a radius of this.size
		parameters:
			ctx:CanvasRenderingContext2D - the drawing context 
				that is used to render this entity
	*/
	draw(ctx){
		ctx.strokeStyle = "#000";
		ctx.fillStyle = "#ddd";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

/* class projectile - character
	data structure used for entities that are typically used to
	damage and destroy other entities
*/
class projectile extends character{
	/* constructor(pos)
		initializes a projectile entity
		parameters:
			pos:vec2 - initializes this entity with the given position
		member variables: inherits from class "character"
			public team:Number - will not damage entities on the same team
			public currentTracer:tracer - particle effect that creates the
				trail behind this entity
	*/
	constructor(pos){
		super();
		this.team = 0;
		this.pos = pos;
		this.size = 3;
		this.currentTracer = null;
		
		//starts a new tracer particle effect 
		this.openTracer();
	}

	/* static function fire(pos, angle, power)
		initializes a projectile enity and sets it in motion with the given
		information
		parameters:
			pos:vec2 - the position of which to spawn the projectile
			angle:Number - in radians, the direction the projectile is fired
			power:Number - the speed of which the projectile travels at
	*/
	static fire(pos, angle, power){
		var p = new Projectile(pos);
		p.vel = vec2.fromAng(angle, power);
		projectiles.push(p);
	}
	
	/* member function planetCollide(pl) - public override
		applies a collision with the specified planet
		parameters:
			pl:planet - the planet to collide with
	*/
	planetCollide(pl){
		super.planetCollide(pl);
		this.remove();
	}
	
	/* member function remove() - public
		removes this entity from the world
	*/
	remove(){
		//stops and removes the tracer effect from the world
		if(this.currentTracer)
			this.currentTracer.close();
		
		//removes this entity from the dynamic projectile query
		if(projectiles.includes(this))
			projectiles.splice(projectiles.indexOf(this), 1);
	}
	
	/* member function openTracer() - public
		initializes and adds a new tracer effect to the world
	*/
	openTracer(){
		this.currentTracer = new tracer();
		this.currentTracer.color = [245,235,50]; // yellow
		this.currentTracer.add();
	}
	
	/* member function update() - public override
		the entry point for the per-step action of this entity,
		called once at the beginning of each logic step
	*/
	update(){
		// calles the inherited update method
		super.update()
		
		// creates a tracer segment if the tracer exists
		if(this.currentTracer)
			this.currentTracer.trace(this.pos.clone());
	}
	/* member funtion update(ctx) - public override
		renders this entity on the canvas
		parameters:
			ctx:CanvasRenderingContext2D - the drawing context 
				that is used to render this entity
	*/
	draw(ctx){
		ctx.strokeStyle = "#a90"; // dark yellow
		ctx.fillStyle = "#ffa"; // light yellow
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

/* class playerProjectile - projectile character
	a projectile entity that is created by the player
*/
class playerProjectile extends projectile{
	/* constructor(pos)
		initializes a playerProjectile entity
		parameters:
			pos:vec2 - where the entity will be initialized
		member variables: inherits from class "projectile"
			public flightTime:Number - the time the the 
				projectile has been in flight for	
	*/
	constructor(pos){
		super(pos);
		this.team = 0;
		this.size = 3;
		this.flightTime = 0;
	}

	/* static function fire(pos, angle, power) - public override
		see projectile.fire(pos, angle, power)
	*/
	static fire(pos, angle, power){
		var p = new playerProjectile(pos);
		p.vel = vec2.fromAng(angle, power);
		projectiles.push(p);
	}

	/* member function planetCollide(pl) - public override
		see inherited; also explodes
	*/
	planetCollide(pl){
		//calls inherited function
		super.planetCollide(pl);
		
		//causes an explosion
		this.explode();
	}
	
	/* member field getter scoreMultiplier() - public
		returns the score multiplier that is applicable to this projectile, 
		the longer the flight time the higher the multiplier
	*/
	get scoreMultiplier(){
		return Math.min(4, Math.floor(this.flightTime / 30) + 1);
	}
	/* member function explode() - public
		causes an explosion that damages nearby enemies
	*/
	explode(){
		// the explosion's collision radius
		var size = 25;
		
		// creates a visual effect
		var e = new effect(this.pos);
		e.size = size;
		e.add();
		this.remove();
		// plays the explosion sound
		playSound(sfx.explosion);
		
		//checks collision for all the enemies
		for (var i = enemies.length - 1; i >= 0; i--) {
			if(enemies.tilSpawn > 0)
				continue;
			if(enemies[i].pos.distance(this.pos) <= size + enemies[i].size){
				enemies[i].points *= this.scoreMultiplier;
				enemies[i].die();
			}
		}
	}
	
	/* member function update() - public override
		see inherited
	*/
	update(){
		//calls inherited function
		super.update()
		
		this.applyGravity();
		this.flightTime += 1;
	}
}
class enemyProjectile extends projectile{
	constructor(pos){
		super(pos);
		this.team = 1;
		this.size = 5;
	}

	static fire(pos, angle, power){
		var p = new enemyProjectile(pos);
		p.vel = vec2.fromAng(angle, power);
		projectiles.push(p);
	}

	openTracer(){
		this.currentTracer = new tracer();
		this.currentTracer.color = [255,150,150];
		this.currentTracer.life = 60;
		this.currentTracer.add();
	}
	
	remove(){
		super.remove();
		playSound(sfx.explosionSmall);
	}
	
	update(){
		super.update();
		if(this.x <= -this.size ||
			this.x >= 600 + this.size ||
			this.y <= -this.size ||
			this.y >= 600 + this.size)
			this.remove();
	}
	draw(ctx){
		ctx.strokeStyle = "#a11";
		ctx.fillStyle = "#faa";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

/*class item - character
	data structure used for entities that are collectible by the
	player
*/
class item extends character{
	/* constructor()
		initializes an item entity
		member variables: inherits from class "character"
			public staticPos:boolean - doesn't update if true
	*/
	constructor(){
		super();
		this.size = 4;
		this.staticPos = false;
		this.openTracer();
	}
	
	/* member function planetCollide(pl) - public
		see inherited;
	*/
	planetCollide(pl){
		super.planetCollide(pl);
		
		// sets this entity to stop updating because there's no 
		// longer any need for it
		this.staticPos = true;
		this.currentTracer.trace(this.pos);
		
		//closes the tracer since it will not be moving anymore
		this.currentTracer.close();
	}

	/* member function add() - public
		adds the item to the dynamic item query
	*/
	add(){
		items.push(this);
	}
	/* member function remove() - public
		removes the item from the dynamic item query
	*/
	remove(){
		//removes it's tracer
		if(this.currentTracer)
			this.currentTracer.close();
		if(items.includes(this))
			items.splice(items.indexOf(this), 1);
	}
	/* member function pickUp() - public virtual
		called when the player touches the item
	*/
	pickUp(){
		//creates an audio and visual effect
		this.flash();
		playSound(sfx.pickup);
		
		//removes from the query
		this.remove();
	}
	/* member function flash() - public
		creates a small but noticable effect that puts emphasis on
		the item
	*/
	flash(){
		var e = new effect(this.pos);
		e.size = this.size;
		e.color = [160, 160, 255]; //light blue
		e.add();
	}

	/* member function openTracer() - public
		adds a tracer effect to this item
	*/
	openTracer(){
		this.currentTracer = new tracer();
		this.currentTracer.color = [160, 160, 255];
		this.currentTracer.life = 100;
		this.currentTracer.add();
	}

	/* member function update() - public override
		see inherited
	*/
	update(){
		//returns if the item no longer needs to move around
		if(this.staticPos)
			return;
		
		//adds a segment to the tracer
		this.currentTracer.trace(this.pos);
		
		//calls inherited update method
		super.update();
		
		this.applyGravity();
	}
	/* member function draw(ctx) - public override
		see inherited
	*/
	draw(ctx){
		ctx.strokeStyle = "#55f";
		ctx.fillStyle = "#aaf";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}
 /* class item_ammo - item character
	a customized item data structure that is used for giving 
	the player ammo
 */
class item_ammo extends item{
	/* constructor()
		see inherited
	*/
	constructor(){
		//calls the inherited constructor
		super();
	}
	
	/* member function pickUp() - public override
	*/
	pickUp(){
		//calls the inherited pickUp() method
		super.pickUp();
		player1.ammo += 1;
	}
	
	/* member function add() - public
		see inherited
	*/
	add(){
		super.add();
		
		// adds one to the ammoitem counter so that the game can 
		// regulate how many ammo items are on screen
		ammoitems += 1;
	}
	
	/* member function remove() - public
		see inherited
	*/
	remove(){
		super.remove();
		
		// subtracts one from the ammoitem counter so that the game 
		// can regulate how many ammo items are on screen
		ammoitems -= 1;
	}
}

function updateCharacters(charlist){
	/* function updateCharacters(charlist)
		updates all the characters in the given query
		paramaters:
			charlist:Array - the query of characters to update
	*/
	for (var i = charlist.length - 1; i >= 0; i--) {
		if(charlist[i])
			charlist[i].update();
	}
}
function drawCharacters(charlist, ctx){
	/* function drawCharacters(charlist, ctx)
		renders all the characters in the given query on to the
		screen
		parameters:
			charlist:Array - the query of characters to render
			ctx:CanvasRenderingContext2D - the context to render
				them with
	*/
	charlist.forEach(function(ch){
		ch.draw(ctx);
	});
}
