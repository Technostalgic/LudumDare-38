"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var character = function () {
	function character() {
		_classCallCheck(this, character);

		this.pos = new vec2();
		this.vel = new vec2();
		this.size = 10;

		this.health = 1;
	}

	_createClass(character, [{
		key: "applyGravity",
		value: function applyGravity() {
			var f = new vec2();
			var ths = this;
			planets.forEach(function (pl) {
				var dir = pl.pos.minus(ths.pos).direction;
				var mag = pl.mass / Math.pow(pl.pos.distance(ths.pos), 2);
				var df = vec2.fromAng(dir, mag / 2);
				f = f.plus(df);
			});
			this.vel = this.vel.plus(f);
		}
	}, {
		key: "checkCollisions",
		value: function checkCollisions() {
			var ths = this;
			planets.forEach(function (pl) {
				if (ths.isCollidingWithPlanet(pl)) ths.planetCollide(pl);
			});
		}
	}, {
		key: "planetCollide",
		value: function planetCollide(pl) {
			var dir = this.pos.minus(pl.pos).direction;
			var mag = this.size + pl.size;
			this.pos = pl.pos.plus(vec2.fromAng(dir, mag));
		}
	}, {
		key: "isCollidingWithPlanet",
		value: function isCollidingWithPlanet(pl) {
			return this.pos.distance(pl.pos) <= this.size + pl.size;
		}
	}, {
		key: "update",
		value: function update() {
			this.pos = this.pos.plus(this.vel);
			this.checkCollisions();
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#ddd";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
	}]);

	return character;
}();

var projectile = function (_character) {
	_inherits(projectile, _character);

	function projectile(pos) {
		_classCallCheck(this, projectile);

		var _this = _possibleConstructorReturn(this, (projectile.__proto__ || Object.getPrototypeOf(projectile)).call(this));

		_this.team = 0;
		_this.pos = pos;
		_this.size = 3;
		_this.openTracer();
		return _this;
	}

	_createClass(projectile, [{
		key: "planetCollide",
		value: function planetCollide(pl) {
			_get(projectile.prototype.__proto__ || Object.getPrototypeOf(projectile.prototype), "planetCollide", this).call(this, pl);
			this.remove();
		}
	}, {
		key: "remove",
		value: function remove() {
			if (this.currentTracer) this.currentTracer.close();
			if (projectiles.includes(this)) projectiles.splice(projectiles.indexOf(this), 1);
		}
	}, {
		key: "openTracer",
		value: function openTracer() {
			this.currentTracer = new tracer();
			this.currentTracer.color = [245, 235, 50];
			this.currentTracer.add();
		}
	}, {
		key: "update",
		value: function update() {
			_get(projectile.prototype.__proto__ || Object.getPrototypeOf(projectile.prototype), "update", this).call(this);
			if (this.currentTracer) this.currentTracer.trace(this.pos.clone());
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			ctx.strokeStyle = "#a90";
			ctx.fillStyle = "#ffa";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
	}], [{
		key: "fire",
		value: function fire(pos, angle, power) {
			var p = new Projectile(pos);
			p.vel = vec2.fromAng(angle, power);
			projectiles.push(p);
		}
	}]);

	return projectile;
}(character);

var playerProjectile = function (_projectile) {
	_inherits(playerProjectile, _projectile);

	function playerProjectile(pos) {
		_classCallCheck(this, playerProjectile);

		var _this2 = _possibleConstructorReturn(this, (playerProjectile.__proto__ || Object.getPrototypeOf(playerProjectile)).call(this, pos));

		_this2.team = 0;
		_this2.size = 3;
		_this2.flightTime = 0;
		return _this2;
	}

	_createClass(playerProjectile, [{
		key: "planetCollide",
		value: function planetCollide(pl) {
			_get(playerProjectile.prototype.__proto__ || Object.getPrototypeOf(playerProjectile.prototype), "planetCollide", this).call(this, pl);
			this.explode();
		}
	}, {
		key: "explode",
		value: function explode() {
			var size = 25;

			var e = new effect(this.pos);
			e.size = size;
			e.add();
			this.remove();
			playSound(sfx.explosion);

			for (var i = enemies.length - 1; i >= 0; i--) {
				if (enemies.tilSpawn > 0) continue;
				if (enemies[i].pos.distance(this.pos) <= size + enemies[i].size) {
					enemies[i].points *= this.scoreMultiplier;
					enemies[i].die();
				}
			}
		}
	}, {
		key: "update",
		value: function update() {
			_get(playerProjectile.prototype.__proto__ || Object.getPrototypeOf(playerProjectile.prototype), "update", this).call(this);
			this.applyGravity();
			this.flightTime += 1;
		}
	}, {
		key: "scoreMultiplier",
		get: function get() {
			return Math.min(4, Math.floor(this.flightTime / 30) + 1);
		}
	}], [{
		key: "fire",
		value: function fire(pos, angle, power) {
			var p = new playerProjectile(pos);
			p.vel = vec2.fromAng(angle, power);
			projectiles.push(p);
		}
	}]);

	return playerProjectile;
}(projectile);

var enemyProjectile = function (_projectile2) {
	_inherits(enemyProjectile, _projectile2);

	function enemyProjectile(pos) {
		_classCallCheck(this, enemyProjectile);

		var _this3 = _possibleConstructorReturn(this, (enemyProjectile.__proto__ || Object.getPrototypeOf(enemyProjectile)).call(this, pos));

		_this3.team = 1;
		_this3.size = 5;
		return _this3;
	}

	_createClass(enemyProjectile, [{
		key: "openTracer",
		value: function openTracer() {
			this.currentTracer = new tracer();
			this.currentTracer.color = [255, 150, 150];
			this.currentTracer.life = 60;
			this.currentTracer.add();
		}
	}, {
		key: "remove",
		value: function remove() {
			_get(enemyProjectile.prototype.__proto__ || Object.getPrototypeOf(enemyProjectile.prototype), "remove", this).call(this);
			playSound(sfx.explosionSmall);
		}
	}, {
		key: "update",
		value: function update() {
			_get(enemyProjectile.prototype.__proto__ || Object.getPrototypeOf(enemyProjectile.prototype), "update", this).call(this);
			if (this.x <= -this.size || this.x >= 600 + this.size || this.y <= -this.size || this.y >= 600 + this.size) this.remove();
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			ctx.strokeStyle = "#a11";
			ctx.fillStyle = "#faa";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
	}], [{
		key: "fire",
		value: function fire(pos, angle, power) {
			var p = new enemyProjectile(pos);
			p.vel = vec2.fromAng(angle, power);
			projectiles.push(p);
		}
	}]);

	return enemyProjectile;
}(projectile);

var item = function (_character2) {
	_inherits(item, _character2);

	function item() {
		_classCallCheck(this, item);

		var _this4 = _possibleConstructorReturn(this, (item.__proto__ || Object.getPrototypeOf(item)).call(this));

		_this4.size = 4;
		_this4.staticPos = false;
		_this4.openTracer();
		return _this4;
	}

	_createClass(item, [{
		key: "planetCollide",
		value: function planetCollide(pl) {
			_get(item.prototype.__proto__ || Object.getPrototypeOf(item.prototype), "planetCollide", this).call(this, pl);
			this.staticPos = true;
			this.checkCollisions = function () {};
			this.currentTracer.trace(this.pos);
			this.currentTracer.close();
		}
	}, {
		key: "add",
		value: function add() {
			items.push(this);
		}
	}, {
		key: "remove",
		value: function remove() {
			if (this.currentTracer) this.currentTracer.close();
			if (items.includes(this)) items.splice(items.indexOf(this), 1);
		}
	}, {
		key: "pickUp",
		value: function pickUp() {
			this.flash();
			this.remove();
			playSound(sfx.pickup);
		}
	}, {
		key: "flash",
		value: function flash() {
			var e = new effect(this.pos);
			e.size = this.size;
			e.color = [160, 160, 255];
			e.add();
		}
	}, {
		key: "openTracer",
		value: function openTracer() {
			this.currentTracer = new tracer();
			this.currentTracer.color = [160, 160, 255];
			this.currentTracer.life = 100;
			this.currentTracer.add();
		}
	}, {
		key: "update",
		value: function update() {
			if (this.staticPos) return;
			this.currentTracer.trace(this.pos);
			_get(item.prototype.__proto__ || Object.getPrototypeOf(item.prototype), "update", this).call(this);
			this.applyGravity();
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			ctx.strokeStyle = "#55f";
			ctx.fillStyle = "#aaf";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
	}]);

	return item;
}(character);

var item_ammo = function (_item) {
	_inherits(item_ammo, _item);

	function item_ammo() {
		_classCallCheck(this, item_ammo);

		return _possibleConstructorReturn(this, (item_ammo.__proto__ || Object.getPrototypeOf(item_ammo)).call(this));
	}

	_createClass(item_ammo, [{
		key: "pickUp",
		value: function pickUp() {
			_get(item_ammo.prototype.__proto__ || Object.getPrototypeOf(item_ammo.prototype), "pickUp", this).call(this);
			player1.ammo += 1;
		}
	}, {
		key: "add",
		value: function add() {
			_get(item_ammo.prototype.__proto__ || Object.getPrototypeOf(item_ammo.prototype), "add", this).call(this);
			ammoitems += 1;
		}
	}, {
		key: "remove",
		value: function remove() {
			_get(item_ammo.prototype.__proto__ || Object.getPrototypeOf(item_ammo.prototype), "remove", this).call(this);
			ammoitems -= 1;
		}
	}]);

	return item_ammo;
}(item);

function updateCharacters(charlist) {
	for (var i = charlist.length - 1; i >= 0; i--) {
		if (charlist[i]) charlist[i].update();
	}
}
function drawCharacters(charlist, ctx) {
	charlist.forEach(function (ch) {
		ch.draw(ctx);
	});
}