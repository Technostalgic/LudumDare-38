"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var effect = function () {
	function effect(pos) {
		_classCallCheck(this, effect);

		this.pos = pos;
		this.size = 25;
		this.grow = 2;
		this.color = [250, 240, 0];
		this.life = 10;
	}

	_createClass(effect, [{
		key: "add",
		value: function add() {
			effects.push(this);
		}
	}, {
		key: "remove",
		value: function remove() {
			effects.splice(effects.indexOf(this), 1);
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			this.size += this.grow;

			var fade = 10;
			var a = 1;
			if (this.life < fade) a = this.life / fade;

			ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
			ctx.fill();

			this.life -= 1;
			if (this.life <= 0) this.remove();
		}
	}]);

	return effect;
}();

function drawEffects(ctx) {
	for (var i = effects.length - 1; i >= 0; i--) {
		effects[i].draw(ctx);
	}
}

var tracer = function () {
	function tracer() {
		_classCallCheck(this, tracer);

		this.points = [];
		this.color = [200, 250, 200];
		this.life = 300;
		this.closed = false;
	}

	_createClass(tracer, [{
		key: "trace",
		value: function trace(tpos) {
			var p = {
				pos: tpos,
				life: this.life
			};
			this.points.push(p);
		}
	}, {
		key: "close",
		value: function close() {
			this.closed = true;
		}
	}, {
		key: "add",
		value: function add() {
			tracers.push(this);
		}
	}, {
		key: "remove",
		value: function remove() {
			if (tracers.includes(this)) tracers.splice(tracers.indexOf(this), 1);
		}
	}, {
		key: "update",
		value: function update() {
			if (this.closed) if (this.points.length <= 0) this.remove();
			for (var i = this.points.length - 1; i >= 0; i--) {
				this.points[i].life -= 1;
				if (this.points[i].life <= 0) this.points.splice(i, 1);
			}
		}
	}, {
		key: "draw",
		value: function draw(ctx) {
			if (this.points.length <= 0) return;

			var a = 1;
			if (this.points[0].life < this.life / 5) a = this.points[0].life / (this.life / 5);

			ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
			ctx.beginPath();
			ctx.arc(this.points[0].pos.x, this.points[0].pos.y, 4, 0, Math.PI * 2);
			ctx.fill();
			for (var i = 1; i < this.points.length; i++) {
				var i0 = i - 1;
				var a = 1;
				if (this.points[i0].life < this.life / 5) a = this.points[i0].life / (this.life / 5);
				ctx.strokeStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
				ctx.lineWidth = a * 2;
				ctx.beginPath();
				ctx.moveTo(this.points[i0].pos.x, this.points[i0].pos.y);
				ctx.lineTo(this.points[i].pos.x, this.points[i].pos.y);
				ctx.stroke();
			}
			if (this.closed) {
				ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
				ctx.beginPath();
				ctx.arc(this.points[this.points.length - 1].pos.x, this.points[this.points.length - 1].pos.y, 3, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}]);

	return tracer;
}();

var flashText = function (_effect) {
	_inherits(flashText, _effect);

	function flashText(pos, txt) {
		var fcol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

		_classCallCheck(this, flashText);

		var _this = _possibleConstructorReturn(this, (flashText.__proto__ || Object.getPrototypeOf(flashText)).call(this));

		_this.color = [50, 200, 40];
		_this.fcolor = fcol;
		_this.pos = pos;
		_this.pos.y += 10;
		_this.life = 45;
		_this.txt = txt;
		return _this;
	}

	_createClass(flashText, [{
		key: "draw",
		value: function draw(ctx) {
			this.pos.y -= 0.5;

			var col = this.color;
			if (this.fcolor) col = timeElapsed % 200 >= 100 ? this.color : this.fcolor;

			var fade = 30;
			var a = 1;
			if (this.life < fade) a = this.life / fade;

			ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + a + ")";
			ctx.font = "bold 16px sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(this.txt, this.pos.x, this.pos.y);

			this.life -= 1;
			if (this.life <= 0) this.remove();
		}
	}]);

	return flashText;
}(effect);

function updateTracers() {
	for (var i = tracers.length - 1; i >= 0; i--) {
		tracers[i].update();
	}
}
function drawTracers(ctx) {
	tracers.forEach(function (tr) {
		tr.draw(ctx);
	});
}