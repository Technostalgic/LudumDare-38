"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Created by Technostalgic Games
//

var vec2 = function () {
  function vec2() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;

    _classCallCheck(this, vec2);

    this.x = x;
    this.y = y;
  }

  _createClass(vec2, [{
    key: "normalized",
    value: function normalized() {
      var magnitude = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      //returns a vector 2 with the same direction as this but
      //with a specified magnitude
      return this.multiply(magnitude / this.distance());
    }
  }, {
    key: "multiply",
    value: function multiply(factor) {
      //returns this multiplied by a specified factor    
      return new vec2(this.x * factor, this.y * factor);
    }
  }, {
    key: "plus",
    value: function plus(vec) {
      //returns the result of this added to another specified vector2
      return new vec2(this.x + vec.x, this.y + vec.y);
    }
  }, {
    key: "minus",
    value: function minus(vec) {
      //returns the result of this subtracted to another specified vector2
      return this.plus(vec.inverted);
    }
  }, {
    key: "rotate",
    value: function rotate(rot) {
      //rotates the vector by the specified angle
      var ang = this.direction;
      var mag = this.distance();
      ang += rot;
      return vec2.fromAng(ang, mag);
    }
  }, {
    key: "equals",
    value: function equals(vec) {
      var leniency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0001;

      //returns true if the difference between rectangular distance of the two vectors is less than the specified leniency
      return Math.abs(this.x - vec.x) <= leniency && Math.abs(this.y - vec.y) <= leniency;
    }
  }, {
    key: "toPhysVector",
    value: function toPhysVector() {
      return Matter.Vector.create(this.x, this.y);
    }
  }, {
    key: "distance",
    value: function distance() {
      var vec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      //returns the distance between this and a specified vector2
      if (vec === null) vec = new vec2();
      var d = Math.sqrt(Math.pow(this.x - vec.x, 2) + Math.pow(this.y - vec.y, 2));
      return d;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new vec2(this.x, this.y);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "vector<" + this.x + ", " + this.y + ">";
    }
  }, {
    key: "inverted",
    get: function get() {
      //returns the opposite of this vector
      return this.multiply(-1);
    }
  }, {
    key: "direction",
    get: function get() {
      //returns the angle this vector is pointing in radians
      return Math.atan2(this.y, this.x);
    }
  }], [{
    key: "fromAng",
    value: function fromAng(angle) {
      var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      //returns a vector which points in the specified angle
      //and has the specified magnitude
      return new vec2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }
  }, {
    key: "fromOther",
    value: function fromOther(vector) {
      return new vec2(vector.x, vector.y);
    }
  }]);

  return vec2;
}();

var transformation = function () {
  function transformation() {
    var translate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new vec2();
    var rotate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var origin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new vec2();

    _classCallCheck(this, transformation);

    this.translate = translate;
    this.rotate = rotate;
    this.scale = scale;
    this.origin = origin;
  }

  _createClass(transformation, [{
    key: "transformPoint",
    value: function transformPoint(point) {
      var v = point;
      v = v.minus(this.origin);

      v = v.plus(this.translate);
      v = v.multiply(this.scale);

      var ang = v.direction;
      var mag = v.distance();
      v = vec2.fromAng(ang - this.rotate, mag);

      v = v.plus(this.origin);
      return v;
    }
  }]);

  return transformation;
}();

var dot = function () {
  function dot(pos) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    _classCallCheck(this, dot);

    this.pos = pos;
    this.size = size;
  }

  _createClass(dot, [{
    key: "distort",
    value: function distort(distortion) {
      this.pos = distortion.distortPoint(this.pos);
      this.size *= distortion.distortTransAtPoint(this.pos).scale;
    }
  }, {
    key: "transform",
    value: function transform(translate) {
      var rotate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var trans = new transformation(translate, rotate, scale);
      this.pos = trans.transformPoint(this.pos);
      this.size *= scale;
    }
  }, {
    key: "drawFill",
    value: function drawFill(ctx) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#fff";

      ctx.fillStyle = color;
      ctx.fillRect(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
    }
  }]);

  return dot;
}();

var line = function () {
  function line(start, end) {
    _classCallCheck(this, line);

    this.start = start;
    this.end = end;
  }

  _createClass(line, [{
    key: "distort",
    value: function distort(distortion) {
      this.start = distortion.distortPoint(this.start);
      this.end = distortion.distortPoint(this.end);
    }
  }, {
    key: "transform",
    value: function transform(translate) {
      var rotate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var trans = new transformation(translate, rotate, scale);
      this.start = trans.transformPoint(this.start);
      this.end = trans.transformPoint(this.end);
    }
  }, {
    key: "drawOutline",
    value: function drawOutline(ctx) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#ff0";
      var linewidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      ctx.strokeStyle = color;
      ctx.lineWidth = linewidth;
      ctx.beginPath();
      ctx.moveTo(this.start.x, this.start.y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
    }
  }]);

  return line;
}();

var polygon = function () {
  //type for drawing shapes and doing geometry calculations
  function polygon() {
    _classCallCheck(this, polygon);

    this._points = [];
    this._position = new vec2();
    this._scale = 1;
    this._rotation = 0;
    this._absVerts = [];
    this._boundingbox = null;
    this._flipped = false;
  }

  _createClass(polygon, [{
    key: "updateBoundingBox",
    value: function updateBoundingBox() {
      var absverts = this.absVerts;
      if (absverts.length < 1) return new box(this._position.x, this._position.y);
      var l = absverts[0].x;
      var r = absverts[0].x;
      var t = absverts[0].y;
      var b = absverts[0].y;
      for (var i = 1; i < absverts.length; i += 1) {
        l = Math.min(l, absverts[i].x);
        r = Math.max(r, absverts[i].x);
        t = Math.min(t, absverts[i].y);
        b = Math.max(b, absverts[i].y);
      }
      this._boundingbox = new box(l, t, r - l, b - t);
    }
  }, {
    key: "updateAbsVerts",
    value: function updateAbsVerts() {
      this._absVerts = [];
      for (var i = 0; i < this._points.length; i += 1) {
        var v = this._points[i];

        var ang = v.direction;
        var mag = v.distance();
        v = vec2.fromAng(ang + this._rotation, mag);

        v = v.multiply(this._scale);
        v = v.plus(this._position);
        this._absVerts.push(v);
      }
      this.updateBoundingBox();
    }
  }, {
    key: "setVerts",
    value: function setVerts(vertices) {
      this._points = vertices;
      this.updateAbsVerts();
    }
  }, {
    key: "distort",
    value: function distort(distortion) {
      var nv = [];
      this.absVerts.forEach(function (vert) {
        var v = distortion.distortPoint(vert);
        nv.push(v);
      });
      this._absVerts = nv;
    }
  }, {
    key: "move",
    value: function move(translation) {
      this._position = this._position.plus(translation);
      this._absVerts = null;
      return this;
    }
  }, {
    key: "setPos",
    value: function setPos(pos) {
      this._position = pos;
      this._absVerts = null;
      return this;
    }
  }, {
    key: "setScale",
    value: function setScale(scale) {
      this._scale = scale;
      this._absVerts = null;
      return this;
    }
  }, {
    key: "setRotation",
    value: function setRotation(angle) {
      this._rotation = angle;
      this._absVerts = null;
      return this;
    }
  }, {
    key: "setFlipped",
    value: function setFlipped() {
      var flip = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this._flipped = flip;
      this._absVerts = null;
    }
  }, {
    key: "transform",
    value: function transform(translate) {
      var rotate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      //transforms the point data of the polygon
      for (var i = 0; i < this._points.length; i += 1) {
        var trans = new transformation(translate, rotate, scale);
        var v = trans.transformPoint(this._points[i]);
        this._points[i] = v;
      }
      this._absVerts = null;
    }
  }, {
    key: "worldPointToLocal",
    value: function worldPointToLocal(position) {
      //transforms an absolute position to the same position in the scope of this polygon
      var v = position;

      v = v.minus(this.pos);
      v = v.multiply(1 / this.scale);

      var ang = v.direction;
      var mag = v.distance();
      v = vec2.fromAng(ang - this.rotation, mag);

      return v;
    }
  }, {
    key: "drawOutline",
    value: function drawOutline(ctx) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#888";
      var thickness = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var absverts = this.absVerts;
      if (absverts.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(absverts[0].x, absverts[0].y);
      for (var i = 0; i < absverts.length; i += 1) {
        var i2 = i + 1;
        if (i2 >= absverts.length) i2 = 0;
        ctx.lineTo(absverts[i2].x, absverts[i2].y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }, {
    key: "drawFill",
    value: function drawFill(ctx) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#888";

      var absverts = this.absVerts;
      if (absverts.length < 3) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(absverts[0].x, absverts[0].y);
      for (var i = 0; i < absverts.length; i += 1) {
        var i2 = i + 1;
        if (i2 >= absverts.length) i2 = 0;
        ctx.lineTo(absverts[i2].x, absverts[i2].y);
      }
      ctx.fill();
    }
  }, {
    key: "boundingBox",
    get: function get() {
      if (this._boundingBox == null) this.updateBoundingBox();
      return this._boundingbox;
    }
  }, {
    key: "absoluteVertices",
    get: function get() {
      if (this._absVerts == null) this.updateAbsVerts();
      return this._absVerts;
    }
  }, {
    key: "absVerts",
    get: function get() {
      return this.absoluteVertices;
    }
  }, {
    key: "verts",
    get: function get() {
      return this._points;
    }
  }, {
    key: "pos",
    get: function get() {
      return this._position;
    }
  }, {
    key: "scale",
    get: function get() {
      return this._scale;
    }
  }, {
    key: "rotation",
    get: function get() {
      return this._rotation;
    }
  }, {
    key: "flipped",
    get: function get() {
      return this._flipped;
    }
  }], [{
    key: "Rectangle",
    value: function Rectangle(width) {
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : width;

      var p = new polygon();
      var verts = [new vec2(width / -2, height / -2), new vec2(width / -2, height / 2), new vec2(width / 2, height / 2), new vec2(width / 2, height / -2)];
      p.setVerts(verts);
      return p;
    }
  }, {
    key: "Circle",
    value: function Circle(radius) {
      var segments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 12;

      var p = new polygon();
      var verts = [];
      for (var i = 0; i < segments; i += 1) {
        var ang = i / segments * (Math.PI * 2);
        var vec = vec2.fromAng(ang, radius);
        verts.push(vec);
      }
      p.setVerts(verts);
      return p;
    }
  }]);

  return polygon;
}();

var box = function () {
  //axis aligned bounding box
  function box() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var w = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, box);

    this.position = new vec2(x, y);
    this.size = new vec2(w, h);
  }

  _createClass(box, [{
    key: "drawOutline",
    value: function drawOutline(ctx) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#888";
      var thickness = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
  }, {
    key: "drawFill",
    value: function drawFill(ctx) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#888";

      ctx.fillStyle = color;
      ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
  }, {
    key: "containsPoint",
    value: function containsPoint(point) {
      return point.x >= this.position.x && point.x <= this.right() && point.y >= this.position.y && point.y <= this.bottom();
    }
  }, {
    key: "overlaps",
    value: function overlaps(boxB) {
      return !(boxB.left > this.right || boxB.right < this.left || boxB.top > this.bottom || boxB.bottom < this.top);
    }
  }, {
    key: "top",
    get: function get() {
      return this.position.y;
    }
  }, {
    key: "bottom",
    get: function get() {
      return this.position.y + this.size.y;
    }
  }, {
    key: "left",
    get: function get() {
      return this.position.x;
    }
  }, {
    key: "right",
    get: function get() {
      return this.position.x + this.size.x;
    }
  }]);

  return box;
}();

function wrapValue(value) {
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 256;

  if (value < 0) return max + value % max;
  if (value >= max) return value % max;
  return value;
}