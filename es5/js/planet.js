"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var planet = function () {
	function planet(pos) {
		var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

		_classCallCheck(this, planet);

		this.pos = pos;
		this.size = size;
	}

	_createClass(planet, [{
		key: "draw",
		value: function draw(ctx) {
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#ddd";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}, {
		key: "mass",
		get: function get() {
			return Math.pow(this.size, 2) * Math.PI;
		}
	}], [{
		key: "generatePlanets",
		value: function generatePlanets() {
			var r = [];
			for (var i = 10; i > 0; i--) {
				planet.spawnPlanet(r);
			}for (var i = r.length - 1; i >= 0; i--) {
				if (r[i].size < 10) r.splice(i, 1);
			}return r;
		}
	}, {
		key: "spawnPlanet",
		value: function spawnPlanet(list) {
			var emptySpace = 50;

			var sz = rand(rand(50, 75), 100);
			var hsz = sz / 2 + emptySpace;
			var m;

			var rd = false;
			var iterations = 0;
			do {
				if (iterations > 10) {
					iterations = 0;
					sz /= 2;
				}
				m = new vec2(rand(sz + emptySpace, 600 - sz - emptySpace), rand(50 + sz + emptySpace, 600 - sz - emptySpace));
				rd = false;
				for (var i in list) {
					if (m.distance(list[i].pos) <= sz + list[i].size + emptySpace) rd = true;
				}
				iterations++;
			} while (rd);

			list.push(new planet(m, sz));
		}
	}]);

	return planet;
}();

function drawPlanets(list, ctx) {
	list.forEach(function (pl) {
		pl.draw(ctx);
	});
}