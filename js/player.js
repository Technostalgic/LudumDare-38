///
///	code by Isaiah Smith
///		
///	https://technostalgic.itch.io  
///	twitter @technostalgicGM
///

class player extends character{
	constructor(){
		super();
		this.isAlias = false;
		this.size = 6;
		this.rotation = 0;
		this.inAir = true;
		this.focusPlanet = null;
		this.acc = 0;
		this.jumpPow = 0;
		this.firePow = 0;
		this.fireAdj = false;
		this.currentTracer = null;
		this.ammo = 3;
	}
	
	chooseRandPos(){
		this.pos = planets[Math.floor(rand(0, planets.length))].pos;
		this.pos = this.pos.plus(vec2.fromAng(rand(0, Math.PI * 2)));
	}
	
	control(controlstate){
		if(this.isDead) return;
		if(!this.inAir){
			if(!(controlstate.moveLeft && controlstate.moveRight)){
				if(controlstate.moveLeft)
					this.control_moveLeft();
				else if(controlstate.moveRight)
					this.control_moveRight();
				else
					this.acc = 0;
			} else this.acc = 0;
			if(controlstate.jump)
				this.control_jump();
			else if(this.jumpPow > 0)
				this.finishJump();
		} else this.acc = 0;
		if(controlstate.fire)
			this.control_fire();
		else if(this.firePow > 0)
			this.finishFire();
		if(this.firePow > 0){
			if(controlState.increasePow)
				this.control_increasePow();
			if(controlState.decreasePow)
				this.control_decreasePow();
		}
	}
	control_moveLeft(){
		var spd = 3;
		this.acc += 0.1;
		if(this.acc > spd)
			this.acc = spd;

		var mov = vec2.fromAng(this.rotation - Math.PI / 2, this.acc);
		mov = mov.plus(this.pos.minus(this.focusPlanet.pos).normalized(-1));

		if(this.vel.distance() < mov.distance())
			this.vel = mov;
	}
	control_moveRight(){
		var spd = 3;
		this.acc += 0.1; 
		if(this.acc > spd)
			this.acc = spd;

		var mov = vec2.fromAng(this.rotation + Math.PI / 2, this.acc);
		mov = mov.plus(this.pos.minus(this.focusPlanet.pos).normalized(-1));

		if(this.vel.distance() < mov.distance())
			this.vel = mov;
	}
	
	control_jump(){
		var power = 15;
		this.jumpPow = (this.jumpPow * 1.95 + power * 0.05) / 2;
		if(this.jumpPow > power)
			this.jumpPow = power;
	}
	finishJump(){
		if(this.jumpPow < 3){
			this.jumpPow = 0;
			return;
		}
		var jf = vec2.fromAng(this.rotation, this.jumpPow)
		this.vel = this.vel.plus(jf);
		this.jumpPow = 0;
		this.openTracer();
		if(!this.isAlias)
			playSound(sfx.jump);
	}
	control_fire(){
		if(this.ammo <= 0){
			playSound(sfx.empty, false);
			return;
		}
		if(this.fireAdj)
			return;
		var power = 18;
		this.firePow = (this.firePow * 1.97 + power * 0.03) / 2;
	}
	finishFire(){
		if(this.firePow < 2){
			this.firePow = 0;
			this.fireAdj = false;
			return;
		}
		playerProjectile.fire(this.pos, this.rotation, this.firePow);
		this.firePow = 0;
		this.fireAdj = false;
		this.ammo -= 1;
		if(!this.isAlias)
			playSound(sfx.shoot);
	}
	control_increasePow(){
		this.fireAdj = true;
		var power = 18;
		this.firePow = (this.firePow * 1.97 + power * 0.03) / 2;
	}
	control_decreasePow(){
		this.fireAdj = true;
		var power = 18;
		var f = (this.firePow * 1.97 + power * 0.03) / 2;
		this.firePow -= Math.max(f - this.firePow, 0.1);
		if(this.firePow <= 0)
			this.firePow = 0.00001;
	}
	
	checkCollisions(){
		super.checkCollisions();
		this.checkProjectileCollisions();
		this.checkItemCollisions();
	}
	checkProjectileCollisions(){
		for (var i = projectiles.length - 1; i >= 0; i--) {
			if(projectiles[i].team == 0)
				continue;
			if(this.pos.distance(projectiles[i].pos) <= this.size + projectiles[i].size){
				projectiles[i].remove();
				this.die();
			}
		}
	}
	checkItemCollisions(){
		for(var i = items.length - 1; i >= 0; i--){
			if(items[i].pos.distance(this.pos) <= this.size + items[i].size)
				items[i].pickUp();
		}
	}
	planetCollide(pl){
		super.planetCollide(pl);
		this.rotation = this.pos.minus(pl.pos).direction;
		this.focusPlanet = pl;
		this.vel = this.vel.multiply(0.8);
		this.inAir = false;
		this.closeTracer();
	}
	die(){
		if(!this.isDead){
			playSound(sfx.death);
			gib.createPlayerGibs(this.pos);
			setTimeout(endGame, 2500)
		}
		this.health = 0;
	}
	get isDead(){
		return this.health <= 0;
	}
	
	disableTracers(){
		this.tracePath = function(){};
		this.openTracer = function(){};
	}
	tracePath(){
		if(this.currentTracer == null){
			this.currentTracer = new tracer();
			this.currentTracer.add();
		}
		this.currentTracer.trace(this.pos.clone());
	}
	openTracer(){
		if(this.currentTracer == null){
			this.currentTracer = new tracer();
			this.currentTracer.add();
		}
		this.currentTracer.trace(this.pos.clone());
	}
	closeTracer(){
		if(this.currentTracer == null)
			return;
		this.currentTracer.trace(this.pos.clone());
		this.currentTracer.close();
		this.currentTracer = null;
	}

	drawJumpAim(ctx){
		var trace = [];
		var ja = this.jumpAlias;
			trace.push(ja.pos.clone());
		for(var i = 6; i > 0; i--){
			ja.update();
			trace.push(ja.pos.clone());
		}

		for(var i = 1; i < trace.length; i++){
			var i0 = i - 1;
			var a = 1 - (i + 1) / 6;
			ctx.lineWidth = Math.pow(a, 2) * 12 + 2;
			ctx.strokeStyle = "rgba(200, 200, 250, "+ a.toString() +")";
			ctx.beginPath();
			ctx.moveTo(trace[i0].x, trace[i0].y);
			ctx.lineTo(trace[i].x, trace[i].y);
			ctx.stroke();
		}
	}
	get jumpAlias(){
		var r = new player();
		r.isAlias = true;
		r.disableTracers();
		r.checkItemCollisions = function(){};
		r.checkProjectileCollisions = function(){};
		r.rotation = this.rotation;
		r.pos = this.pos.clone();
		r.vel = this.vel.clone();
		r.jumpPow = this.jumpPow;
		r.finishJump();
		return r;
	}

	drawFireAim(ctx){
		var trace = [];
		var fa = this.fireAlias;
		fa.currentTracer = null;
		trace.push(fa.pos.clone());
		for(var i = this.firePow; i > 0; i--){
			fa.update();
			if(fa.vel.x == NaN)
				break;
			trace.push(fa.pos.clone());
		}

		for(var i = 1; i < trace.length; i++){
			var i0 = i - 1;
			var a = 1 - (i + 1) / trace.length;
			ctx.lineWidth = Math.pow(a, 2) + 2;
			ctx.strokeStyle = "rgba(210, 200, 50, "+ a.toString() +")";
			ctx.beginPath();
			ctx.moveTo(trace[i0].x, trace[i0].y);
			ctx.lineTo(trace[i].x, trace[i].y);
			ctx.stroke();
		}
	}
	get fireAlias(){
		var p = new playerProjectile(this.pos);
		p.vel = vec2.fromAng(this.rotation, this.firePow);
		p.explode = function(){this.vel = new vec2(NaN)};
		return p;
	}

	update(){
		if(this.isDead) return;
		this.lia = this.inAir;
		this.inAir = true;
		super.update();
		if(this.inAir){
			this.applyGravity();
			this.tracePath();
		}
		this.vel = this.vel.multiply(0.99);
	}
	draw(ctx){
		if(this.isDead) return;
		ctx.fillStyle = "#ded";
		ctx.strokeStyle = "#070";
		ctx.lineWidth = 1;
		
		var vert1 = this.pos.plus(vec2.fromAng(this.rotation - Math.PI / 4, this.size * 1.4));
		var vert2 = this.pos.plus(vec2.fromAng(this.rotation + Math.PI / 4, this.size * 1.4));

		ctx.beginPath();
		ctx.closePath();
		ctx.arc(this.pos.x, this.pos.y, this.size, this.rotation + Math.PI / 2, this.rotation - Math.PI / 2);
		ctx.lineTo(vert1.x, vert1.y);
		ctx.lineTo(vert2.x, vert2.y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		if(this.jumpPow > 3 && !this.inAir)
			this.drawJumpAim(ctx);
		if(this.firePow > 2)
			this.drawFireAim(ctx);
	}
}