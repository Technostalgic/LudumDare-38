"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var player = function (_character) {
	_inherits(player, _character);

	function player() {
		_classCallCheck(this, player);

		var _this = _possibleConstructorReturn(this, (player.__proto__ || Object.getPrototypeOf(player)).call(this));

		_this.isAlias = false;
		_this.size = 6;
		_this.rotation = 0;
		_this.inAir = true;
		_this.focusPlanet = null;
		_this.acc = 0;
		_this.jumpPow = 0;
		_this.firePow = 0;
		_this.fireAdj = false;
		_this.currentTracer = null;
		_this.ammo = 3;
		return _this;
	}

	_createClass(player, [{
		key: "chooseRandPos",
		value: function chooseRandPos() {
			this.pos = planets[Math.floor(rand(0, planets.length))].pos;
			this.pos = this.pos.plus(vec2.fromAng(rand(0, Math.PI * 2)));
		}
	}, {
		key: "control",
		value: function control(controlstate) {
			if (this.isDead) return;
			if (!this.inAir) {
				if (!(controlstate.moveLeft && controlstate.moveRight)) {
					if (controlstate.moveLeft) this.control_moveLeft();else if (controlstate.moveRight) this.control_moveRight();else this.acc = 0;
				} else this.acc = 0;
				if (controlstate.jump) this.control_jump();else if (this.jumpPow > 0) this.finishJump();
			} else this.acc = 0;
			if (controlstate.fire) this.control_fire();else if (this.firePow > 0) this.finishFire();
			if (this.firePow > 0) {
				if (controlState.increasePow) this.control_increasePow();
				if (controlState.decreasePow) this.control_decreasePow();
			}
		}
	}, {
		key: "control_moveLeft",
		value: function control_moveLeft() {
			var spd = 3;
			this.acc += 0.1;
			if (this.acc > spd) this.acc = spd;

			var mov = vec2.fromAng(this.rotation - Math.PI / 2, this.acc);
			mov = mov.plus(this.pos.minus(this.focusPlanet.pos).normalized(-1));

			if (this.vel.distance() < mov.distance()) this.vel = mov;
		}
	}, {
		key: "control_moveRight",
		value: function control_moveRight() {
			var spd = 3;
			this.acc += 0.1;
			if (this.acc > spd) this.acc = spd;

			var mov = vec2.fromAng(this.rotation + Math.PI / 2, this.acc);
			mov = mov.plus(this.pos.minus(this.focusPlanet.pos).normalized(-1));

			if (this.vel.distance() < mov.distance()) this.vel = mov;
		}
	}, {
		key: "control_jump",
		value: function control_jump() {
			var power = 15;
			this.jumpPow = (this.jumpPow * 1.95 + power * 0.05) / 2;
			if (this.jumpPow > power) this.jumpPow = power;
		}
	}, {
		key: "finishJump",
		value: function finishJump() {
			if (this.jumpPow < 3) {
				this.jumpPow = 0;
				return;
			}
			var jf = vec2.fromAng(this.rotation, this.jumpPow);
			this.vel = this.vel.plus(jf);
			this.jumpPow = 0;
			this.openTracer();
			if (!this.isAlias) playSound(sfx.jump);
		}
	}, {
		key: "control_fire",
		value: function control_fire() {
			if (this.ammo <= 0) {
				playSound(sfx.empty, false);
				return;
			}
			if (this.fireAdj) return;
			var power = 18;
			this.firePow = (this.firePow * 1.97 + power * 0.03) / 2;
		}
	}, {
		key: "finishFire",
		value: function finishFire() {
			if (this.firePow < 2) {
				this.firePow = 0;
				this.fireAdj = false;
				return;
			}
			playerProjectile.fire(this.pos, this.rotation, this.firePow);
			this.firePow = 0;
			this.fireAdj = false;
			this.ammo -= 1;
			if (!this.isAlias) playSound(sfx.shoot);
		}
	}, {
		key: "control_increasePow",
		value: function control_increasePow() {
			this.fireAdj = true;
			var power = 18;
			this.firePow = (this.firePow * 1.97 + power * 0.03) / 2;
		}
	}, {
		key: "control_decreasePow",
		value: function control_decreasePow() {
			this.fireAdj = true;
			var power = 18;
			var f = (this.firePow * 1.97 + power * 0.03) / 2;
			this.firePow -= Math.max(f - this.firePow, 0.1);
			if (this.firePow <= 0) this.firePow = 0.00001;
		}
	}, {
		key: "checkCollisions",
		value: function checkCollisions() {
			_get(player.prototype.__proto__ || Object.getPrototypeOf(player.prototype), "checkCollisions", this).call(this);
			this.checkProjectileCollisions();
			this.checkItemCollisions();
		}
	}, {
		key: "checkProjectileCollisions",
		value: function checkProjectileCollisions() {
			for (var i = projectiles.length - 1; i >= 0; i--) {
				if (projectiles[i].team == 0) continue;
				if (this.pos.distance(projectiles[i].pos) <= this.size + projectiles[i].size) {
					projectiles[i].remove();
					this.die();
				}
			}
		}
	}, {
		key: "checkItemCollisions",
		value: function checkItemCollisions() {
			for (var i = items.length - 1; i >= 0; i--) {
				if (items[i].pos.distance(this.pos) <= this.size + items[i].size) items[i].pickUp();
			}
		}
	}, {
		key: "planetCollide",
		value: function planetCollide(pl) {
			_get(player.prototype.__proto__ || Object.getPrototypeOf(player.prototype), "planetCollide", this).call(this, pl);
			this.rotation = this.pos.minus(pl.pos).direction;
			this.focusPlanet = pl;
			this.vel = this.vel.multiply(0.8);
			this.inAir = false;
			this.closeTracer();
		}
	}, {
		key: "die",
		value: function die() {
			if (!this.isDead) {
				playSound(sfx.death);
				gib.createPlayerGibs(this.pos);
				setTimeout(endGame, 2500);
			}
			this.health = 0;
		}
	}, {
		key: "disableTracers",
		value: function disableTracers() {
			this.tracePath = function () {};
			this.openTracer = function () {};
		}
	}, {
		key: "tracePath",
		value: function tracePath() {
			if (this.currentTracer == null) {
				this.currentTracer = new tracer();
				this.currentTracer.add();
			}
			this.currentTracer.trace(this.pos.clone());
		}
	}, {
		key: "openTracer",
		value: function openTracer() {
			if (this.currentTracer == null) {
				this.currentTracer = new tracer();
				this.currentTracer.add();
			}
			this.currentTracer.trace(this.pos.clone());
		}
	}, {
		key: "closeTracer",
		value: function closeTracer() {
			if (this.currentTracer == null) return;
			this.currentTracer.trace(this.pos.clone());
			this.currentTracer.close();
			this.currentTracer = null;
		}
	}, {
		key: "drawJumpAim",
		value: function drawJumpAim(ctx) {
			var trace = [];
			var ja = this.jumpAlias;
			trace.push(ja.pos.clone());
			for (var i = 6; i > 0; i--) {
				ja.update();
				trace.push(ja.pos.clone());
			}

			for (var i = 1; i < trace.length; i++) {
				var i0 = i - 1;
				var a = 1 - (i + 1) / 6;
				ctx.lineWidth = Math.pow(a, 2) * 12 + 2;
				ctx.strokeStyle = "rgba(200, 200, 250, " + a.toString() + ")";
				ctx.beginPath();
				ctx.moveTo(trace[i0].x, trace[i0].y);
				ctx.lineTo(trace[i].x, trace[i].y);
				ctx.stroke();
			}
		}
	}, {
		key: "drawFireAim",
		value: function drawFireAim(ctx) {
			var trace = [];
			var fa = this.fireAlias;
			fa.currentTracer = null;
			trace.push(fa.pos.clone());
			for (var i = this.firePow; i > 0; i--) {
				fa.update();
				if (fa.vel.x == NaN) break;
				trace.push(fa.pos.clone());
			}

			for (var i = 1; i < trace.length; i++) {
				var i0 = i - 1;
				var a = 1 - (i + 1) / trace.length;
				ctx.lineWidth = Math.pow(a, 2) + 2;
				ctx.strokeStyle = "rgba(210, 200, 50, " + a.toString() + ")";
				ctx.beginPath();
				ctx.moveTo(trace[i0].x, trace[i0].y);
				ctx.lineTo(trace[i].x, trace[i].y);
				ctx.stroke();
			}
		}
	}, {
		key: "update",
		value: function update() {
			if (this.isDead) return;
			this.lia = this.inAir;
			this.inAir = true;
			_get(player.prototype.__proto__ || Object.getPrototypeOf(player.prototype), "update", this).call(this);
			if (this.inAir) {
				this.applyGravity();
				this.tracePath();
			}
			this.vel = this.vel.multiply(0.99);
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			if (this.isDead) return;
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

			if (this.jumpPow > 3 && !this.inAir) this.drawJumpAim(ctx);
			if (this.firePow > 2) this.drawFireAim(ctx);
		}
	}, {
		key: "isDead",
		get: function get() {
			return this.health <= 0;
		}
	}, {
		key: "jumpAlias",
		get: function get() {
			var r = new player();
			r.isAlias = true;
			r.disableTracers();
			r.checkItemCollisions = function () {};
			r.checkProjectileCollisions = function () {};
			r.rotation = this.rotation;
			r.pos = this.pos.clone();
			r.vel = this.vel.clone();
			r.jumpPow = this.jumpPow;
			r.finishJump();
			return r;
		}
	}, {
		key: "fireAlias",
		get: function get() {
			var p = new playerProjectile(this.pos);
			p.vel = vec2.fromAng(this.rotation, this.firePow);
			p.explode = function () {
				this.vel = new vec2(NaN);
			};
			return p;
		}
	}]);

	return player;
}(character);