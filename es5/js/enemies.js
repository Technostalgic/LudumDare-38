"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var enemy = function (_character) {
	_inherits(enemy, _character);

	function enemy() {
		_classCallCheck(this, enemy);

		var _this = _possibleConstructorReturn(this, (enemy.__proto__ || Object.getPrototypeOf(enemy)).call(this));

		_this.ss = true;
		_this.size = 15;
		_this.tilSpawn = 120;
		_this.chooseRandomPosition();
		_this.points = 50;
		return _this;
	}

	_createClass(enemy, [{
		key: "chooseRandomPosition",
		value: function chooseRandomPosition() {
			this.pos = new vec2(rand(50, 550), rand(100, 550));
		}
	}, {
		key: "add",
		value: function add() {
			enemies.push(this);
		}
	}, {
		key: "remove",
		value: function remove() {
			if (enemies.includes(this)) {
				enemies.splice(enemies.indexOf(this), 1);
			}
			updateTilSpawn();
		}
	}, {
		key: "die",
		value: function die() {
			if (!enemies.includes(this)) return;
			if (this.tilSpawn > 0) return;
			this.explode();
			this.remove();
			addScore(this.points, this.pos);
		}
	}, {
		key: "explode",
		value: function explode() {
			var e = new effect(this.pos);
			e.size = this.size * 2;
			e.color = [255, 150, 150];
			e.add();
			gib.createGibs(this.pos, 8, 10);
			playSound(sfx.enemyDeath);
		}
	}, {
		key: "canSeePlayer",
		value: function canSeePlayer() {
			var tpos = this.pos.clone();
			var ppos = player1.pos.clone();
			var pdist = ppos.distance(tpos);
			var pang = ppos.minus(tpos).direction;

			for (var i = planets.length - 1; i >= 0; i--) {
				var pl = planets[i];
				if (tpos.distance(pl.pos) > pdist) continue;
				var pldist = tpos.distance(pl.pos);
				if (vec2.fromAng(pang, pldist).plus(tpos).distance(pl.pos) <= pl.size) return false;
			}
			return true;
		}
	}, {
		key: "overlapsPlanet",
		value: function overlapsPlanet() {
			var r = false;
			var ths = this;
			planets.forEach(function (pl) {
				if (ths.pos.distance(pl.pos) <= ths.size + pl.size) r = true;
			});
			return r;
		}
	}, {
		key: "behave",
		value: function behave() {}
	}, {
		key: "checkCollisions",
		value: function checkCollisions() {
			_get(enemy.prototype.__proto__ || Object.getPrototypeOf(enemy.prototype), "checkCollisions", this).call(this);
			var ths = this;
			for (var i = projectiles.length - 1; i >= 0; i--) {
				if (projectiles[i].team == 1) continue;
				if (projectiles[i].pos.distance(this.pos) <= projectiles[i].size + this.size) this.projectileCollide(projectiles[i]);
			}
			if (player1.pos.distance(this.pos) <= player1.size + this.size) {
				this.playerCollide(player1);
			}
		}
	}, {
		key: "projectileCollide",
		value: function projectileCollide(proj) {
			this.points *= proj.scoreMultiplier;
			this.die();
			proj.explode();
		}
	}, {
		key: "playerCollide",
		value: function playerCollide(plr) {
			plr.die();
		}
	}, {
		key: "drawSpawnPoint",
		value: function drawSpawnPoint(ctx) {
			var maxSize = this.size * 3;
			var a = 1 - this.tilSpawn / 120;
			a = Math.pow(a, 5);
			ctx.fillStyle = "rgba(255, 120, 120, " + (a + 0.05) + ")";
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, maxSize - a * maxSize + this.size, 0, Math.PI * 2);
			ctx.fill();
		}
	}, {
		key: "update",
		value: function update() {
			if (this.tilSpawn > 0) {
				this.tilSpawn -= 1;
				if (this.ss) if (this.tilSpawn < 10) {
					playSound(sfx.enemySpawn);
					this.ss = false;
				}
				return;
			}
			_get(enemy.prototype.__proto__ || Object.getPrototypeOf(enemy.prototype), "update", this).call(this);
			this.behave();
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			if (this.tilSpawn > 0) {
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
	}]);

	return enemy;
}(character);

var en_mover = function (_enemy) {
	_inherits(en_mover, _enemy);

	function en_mover() {
		_classCallCheck(this, en_mover);

		var _this2 = _possibleConstructorReturn(this, (en_mover.__proto__ || Object.getPrototypeOf(en_mover)).call(this));

		_this2.size = 10;
		_this2.points = 100;
		return _this2;
	}

	_createClass(en_mover, [{
		key: "chooseRandomPosition",
		value: function chooseRandomPosition() {
			this.speed = rand(0.5, rand(0.5, 1));

			do {
				this.pos = new vec2(rand(50, 550), rand(100, 550));
			} while (this.overlapsPlanet());

			this.vel = vec2.fromAng(rand(0, Math.PI * 2), this.speed);
		}
	}, {
		key: "planetCollide",
		value: function planetCollide(pl) {
			_get(en_mover.prototype.__proto__ || Object.getPrototypeOf(en_mover.prototype), "planetCollide", this).call(this, pl);
			this.vel = vec2.fromAng(rand(0, Math.PI * 2), this.speed);
		}
	}, {
		key: "behave",
		value: function behave() {
			if (player1.isDead) return;
			if (this.pos.x <= this.size || this.pos.x >= 600 - this.size || this.pos.y <= this.size || this.pos.y >= 600 - this.size) {

				this.vel = vec2.fromAng(rand(0, Math.PI * 2), this.speed);
				this.pos = new vec2(Math.min(Math.max(this.pos.x, this.size), 600 - this.size), Math.min(Math.max(this.pos.y, this.size), 600 - this.size));
			}
			if (this.canSeePlayer()) this.vel = vec2.fromAng(player1.pos.minus(this.pos).direction, this.speed);
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			if (this.tilSpawn > 0) {
				this.drawSpawnPoint(ctx);
				return;
			}
			var anm = Math.abs(350 - timeElapsed % 700) / 350;
			var ang = this.vel.direction;
			var paddle1 = vec2.fromAng(ang + Math.PI * 1.5 / 3, this.size * anm + 0.5);
			var paddle2 = vec2.fromAng(ang - Math.PI * 1.5 / 3, this.size * anm + 0.5);

			var verts = [vec2.fromAng(ang - Math.PI / 5, this.size).plus(this.pos), vec2.fromAng(ang, this.size).plus(this.pos), vec2.fromAng(ang + Math.PI / 5, this.size).plus(this.pos), paddle1.plus(this.pos), vec2.fromAng(ang + Math.PI * 4 / 5, this.size * 1.5).plus(this.pos), vec2.fromAng(ang - Math.PI * 4 / 5, this.size * 1.5).plus(this.pos), paddle2.plus(this.pos)];

			ctx.strokeStyle = "#a11";
			ctx.fillStyle = "#faa";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(verts[0].x, verts[0].y);
			verts.forEach(function (vert) {
				ctx.lineTo(vert.x, vert.y);
			});
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}]);

	return en_mover;
}(enemy);

var en_shooter = function (_enemy2) {
	_inherits(en_shooter, _enemy2);

	function en_shooter() {
		_classCallCheck(this, en_shooter);

		var _this3 = _possibleConstructorReturn(this, (en_shooter.__proto__ || Object.getPrototypeOf(en_shooter)).call(this));

		_this3.fireWait = 0;
		_this3.rotation = rand(0, Math.PI * 2);
		_this3.tilfire = 60;
		_this3.points = 150;
		return _this3;
	}

	_createClass(en_shooter, [{
		key: "chooseRandomPosition",
		value: function chooseRandomPosition() {
			do {
				this.pos = new vec2(rand(50, 550), rand(100, 550));
			} while (this.overlapsPlanet());
		}
	}, {
		key: "behave",
		value: function behave() {
			this.tilfire -= 1;
			if (player1.isDead) {
				this.tilfire = 30;
				return;
			}
			if (this.canSeePlayer()) {
				this.rotateToPlayer();
				if (this.tilfire <= 0) this.shoot();
			} else this.tilfire = Math.max(30, this.tilfire);
		}
	}, {
		key: "rotateToPlayer",
		value: function rotateToPlayer() {
			var ang = player1.pos.minus(this.pos).direction;
			var rotspd = Math.PI / 90;
			var rdir = angDist(this.rotation, ang);
			if (Math.abs(rdir) < rotspd) {
				this.rotation = ang;
				return;
			}
			rdir = Math.sign(rdir);
			this.rotation += rdir * rotspd;
		}
	}, {
		key: "shoot",
		value: function shoot() {
			this.tilfire = 60;
			var ang = this.rotation;
			ang += rand(-.1, .1);
			enemyProjectile.fire(this.pos, ang, 7.5);
			playSound(sfx.shooterShoot);
		}
	}, {
		key: "explode",
		value: function explode() {
			var e = new effect(this.pos);
			e.size = this.size * 2;
			e.color = [255, 150, 150];
			e.add();
			gib.createGibs(this.pos, 10, 10);
			playSound(sfx.shooterDeath);
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			if (this.tilSpawn > 0) {
				this.drawSpawnPoint(ctx);
				return;
			}
			var ang = this.rotation;

			var verts = [vec2.fromAng(ang - Math.PI * 2 / 5, this.size).plus(this.pos), vec2.fromAng(ang - Math.PI * 1 / 5, this.size / 2).plus(this.pos), vec2.fromAng(ang, this.size * (0.5 + this.tilfire / 60)).plus(this.pos), vec2.fromAng(ang + Math.PI * 1 / 5, this.size / 2).plus(this.pos), vec2.fromAng(ang + Math.PI * 2 / 5, this.size).plus(this.pos), vec2.fromAng(ang + Math.PI * 4 / 5, this.size).plus(this.pos), vec2.fromAng(ang - Math.PI * 4 / 5, this.size).plus(this.pos)];

			ctx.strokeStyle = "#a11";
			ctx.fillStyle = "#faa";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(verts[0].x, verts[0].y);
			verts.forEach(function (vert) {
				ctx.lineTo(vert.x, vert.y);
			});
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}]);

	return en_shooter;
}(enemy);

var en_orbiter = function (_enemy3) {
	_inherits(en_orbiter, _enemy3);

	function en_orbiter() {
		_classCallCheck(this, en_orbiter);

		//		this.focusPlanet; defined in this.chooseRandomPosition()
		//		this.orbitDist; defined in this.chooseRandomPosition()
		var _this4 = _possibleConstructorReturn(this, (en_orbiter.__proto__ || Object.getPrototypeOf(en_orbiter)).call(this));

		_this4.size = 10;
		_this4.speed = rand(1, rand(1, 3)) * (Math.floor(rand(0, 2)) * 2 - 1);
		_this4.rotation = rand(0, Math.PI * 2);
		return _this4;
	}

	_createClass(en_orbiter, [{
		key: "chooseRandomPosition",
		value: function chooseRandomPosition() {
			this.orbitDist = rand(20, 35);
			var pl = planets[Math.floor(rand(0, planets.length))];
			this.focusPlanet = pl;
			var ang = rand(0, Math.PI * 2);
			this.pos = this.focusPlanet.pos.plus(vec2.fromAng(ang, this.orbitDist + this.focusPlanet.size));
		}
	}, {
		key: "behave",
		value: function behave() {
			var pang = this.pos.minus(this.focusPlanet.pos).direction;
			var mov = vec2.fromAng(pang + Math.PI / 2, this.speed);
			this.vel = mov;

			this.pos = this.focusPlanet.pos.plus(vec2.fromAng(pang, this.orbitDist + this.focusPlanet.size));
			this.rotation += this.speed / 25;
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			if (this.tilSpawn > 0) {
				this.drawSpawnPoint(ctx);
				return;
			}
			var verts = [vec2.fromAng(this.rotation, this.size * 1.4).plus(this.pos), vec2.fromAng(Math.PI / 2 + this.rotation, this.size * 1.4).plus(this.pos), vec2.fromAng(Math.PI + this.rotation, this.size * 1.4).plus(this.pos), vec2.fromAng(Math.PI / -2 + this.rotation, this.size * 1.4).plus(this.pos)];

			ctx.strokeStyle = "#a11";
			ctx.fillStyle = "#faa";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(verts[0].x, verts[0].y);
			verts.forEach(function (vert) {
				ctx.lineTo(vert.x, vert.y);
			});
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}]);

	return en_orbiter;
}(enemy);

var en_crawler = function (_enemy4) {
	_inherits(en_crawler, _enemy4);

	function en_crawler() {
		_classCallCheck(this, en_crawler);

		//	this.focusPlanet; defined in this.chooseRandomPosition()
		//	this.size; defined in this.chooseRandomPosition()
		var _this5 = _possibleConstructorReturn(this, (en_crawler.__proto__ || Object.getPrototypeOf(en_crawler)).call(this));

		_this5.speed = rand(0.5, rand(0.5, 1.5)) * (Math.floor(rand(0, 2)) * 2 - 1);
		return _this5;
	}

	_createClass(en_crawler, [{
		key: "chooseRandomPosition",
		value: function chooseRandomPosition() {
			this.size = 10;
			var pl = planets[Math.floor(rand(0, planets.length))];
			this.focusPlanet = pl;
			var ang = rand(0, Math.PI * 2);
			this.pos = this.focusPlanet.pos.plus(vec2.fromAng(ang, this.focusPlanet.size + this.size));
		}
	}, {
		key: "explode",
		value: function explode() {
			var e = new effect(this.pos);
			e.size = this.size * 2;
			e.color = [255, 150, 150];
			e.add();
			gib.createGibs(this.pos, 6, 7, this.pos.minus(this.focusPlanet.pos).direction);
			playSound(sfx.enemyDeath);
		}
	}, {
		key: "behave",
		value: function behave() {
			var pang = this.pos.minus(this.focusPlanet.pos).direction;
			var mov = vec2.fromAng(pang + Math.PI / 2, this.speed);
			this.vel = mov;
			this.pos = this.focusPlanet.pos.plus(vec2.fromAng(pang, this.size + this.focusPlanet.size));
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			if (this.tilSpawn > 0) {
				this.drawSpawnPoint(ctx);
				return;
			}
			var ang = this.pos.minus(this.focusPlanet.pos).direction;
			var anm = Math.abs(timeElapsed % 500 - 250) / 250;
			var rps = vec2.fromAng(ang, -this.size);

			var spike1 = vec2.fromAng(ang - Math.PI / 4, this.size + anm * 10);
			var spike2 = vec2.fromAng(ang + Math.PI / 4, this.size + (1 - anm) * 10);

			var verts = [vec2.fromAng(ang - Math.PI / 2, this.size / 2).plus(this.pos).plus(rps), spike1.plus(this.pos).plus(rps), vec2.fromAng(ang, this.size / 2).plus(this.pos).plus(rps), spike2.plus(this.pos).plus(rps), vec2.fromAng(ang + Math.PI / 2, this.size / 2).plus(this.pos).plus(rps)];

			ctx.strokeStyle = "#a11";
			ctx.fillStyle = "#faa";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(verts[0].x, verts[0].y);
			verts.forEach(function (vert) {
				ctx.lineTo(vert.x, vert.y);
			});
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}]);

	return en_crawler;
}(enemy);

var gib = function (_item) {
	_inherits(gib, _item);

	function gib(pos) {
		_classCallCheck(this, gib);

		var _this6 = _possibleConstructorReturn(this, (gib.__proto__ || Object.getPrototypeOf(gib)).call(this));

		_this6.pos = pos;
		_this6.size = 5;
		return _this6;
	}

	_createClass(gib, [{
		key: "add",
		value: function add() {
			gibs.push(this);
		}
	}, {
		key: "remove",
		value: function remove() {
			if (gibs.includes(this)) gibs.splice(gibs.indexOf(this), 1);
		}
	}, {
		key: "openTracer",
		value: function openTracer() {
			this.color = [Math.floor(rand(rand(220, 255), 255)), 200, 200];
			this.currentTracer = new tracer();
			this.currentTracer.color = this.color;
			this.currentTracer.life = 100;
			this.currentTracer.add();
		}
	}, {
		key: "playerTracer",
		value: function playerTracer() {
			this.color = [200, 250, 200];
			this.currentTracer = new tracer();
			this.currentTracer.color = this.color;
			this.currentTracer.life = 100;
			this.currentTracer.add();
		}
	}, {
		key: "checkCollisions",
		value: function checkCollisions() {
			_get(gib.prototype.__proto__ || Object.getPrototypeOf(gib.prototype), "checkCollisions", this).call(this);
			this.checkEnemyCollisions();
		}
	}, {
		key: "checkEnemyCollisions",
		value: function checkEnemyCollisions() {
			for (var i = enemies.length - 1; i >= 0; i--) {
				if (this.pos.distance(enemies[i].pos) <= enemies[i].size + this.size) this.enemyCollide(enemies[i]);
			}
		}
	}, {
		key: "enemyCollide",
		value: function enemyCollide(en) {
			en.points *= 2;
			en.die();
			this.explode();
		}
	}, {
		key: "planetCollide",
		value: function planetCollide(pl) {
			_get(gib.prototype.__proto__ || Object.getPrototypeOf(gib.prototype), "planetCollide", this).call(this, pl);
			this.explode();
		}
	}, {
		key: "explode",
		value: function explode() {
			this.remove();
			var e = new effect(this.pos);
			e.size = 5;
			e.color = this.color;
			e.add();
			playSound(sfx.explosionSmall);
		}
	}, {
		key: "draw",
		value: function draw(ctx) {}
	}], [{
		key: "createGibs",
		value: function createGibs(pos, count, force) {
			var dir = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

			var ang = rand(0, Math.PI * 2);
			var inc = 1 / count * Math.PI * 2;
			for (var i = count; i > 0; i--) {
				var gb = new gib(pos);
				if (dir) ang = dir + rand(-Math.PI / 2, Math.PI / 2);
				gb.vel = vec2.fromAng(ang + rand(-inc, inc), rand(force / 2, force));
				gb.add();
				ang += inc;
			}
		}
	}, {
		key: "createPlayerGibs",
		value: function createPlayerGibs(pos) {
			var count = 10;
			var force = 10;
			var ang = rand(0, Math.PI * 2);
			var inc = 1 / count * Math.PI * 2;
			for (var i = count; i > 0; i--) {
				var gb = new gib(pos);
				gb.playerTracer();
				gb.pickUp = function () {};
				gb.vel = vec2.fromAng(ang + rand(-inc, inc), rand(force / 2, force));
				gb.add();
				ang += inc;
			}
		}
	}]);

	return gib;
}(item);