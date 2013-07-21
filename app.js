var Asteroids = (function() {

	const maxPos = {
		x: 500,
		y: 500
	}

	function MovingObject(pos, vel, rad) {
		this.pos = pos;
		this.vel = vel;
		this.rad = rad;

		var rot = Math.atan( vel['y'] / vel['x'] )
		if (rot !== rot) rot = -(Math.PI / 2)
		this.rot = rot
	}

	MovingObject.prototype.updatePos = function() {
		this.pos['x'] += this.vel['dx'];
		this.pos['y'] += this.vel['dy'];
	}

	MovingObject.prototype.offScreen = function() {
		return this.pos['x'] > maxPos['x'] || this.pos['x'] < 0
		|| this.pos['y'] > maxPos['y'] || this.pos['y'] < 0;
	}

	MovingObject.prototype.wrap = function() {
		if (this.pos['x'] > maxPos['x']) {
			this.pos['x'] -= maxPos['x']
		} else if (this.pos['x'] < 0) {
			this.pos['x'] += maxPos['x']
		}
		if (this.pos['y'] > maxPos['y']) {
			this.pos['y'] -= maxPos['y']
		} else if (this.pos['y'] < 0) {
			this.pos['y'] += maxPos['y']
		}
	}

	MovingObject.prototype.isHit = function(asteroids, game) {
		that = this
		var len = asteroids.length
		var result = asteroids.filter(function(asteroid) {
			var hit = Math.sqrt(
				Math.pow(that.pos['x'] - asteroid.pos['x'], 2) +
			  Math.pow(that.pos['y'] - asteroid.pos['y'], 2)) <=
				(that.rad + asteroid.rad);
			return !hit;
		});
		game.asteroids = result;

		if (len !== result.length) return true;
	}

	function Game(ctx, numAsteroids) {
		this.ctx = ctx;
		this.asteroids = [];
		this.populate.call(this, numAsteroids);
		this.ship = new Ship();
		this.bullets = [];
		this.draw = this.draw.bind(this)
	}

	Game.prototype.start = function() {
		var that = this;

		window.setInterval(function() {
			if(key.isPressed("up")) { that.ship.power.call(that.ship, 0.4) };
			if(key.isPressed("down")) { that.ship.power.call(that.ship, -0.4) };
			if(key.isPressed("left")) { that.ship.rotate.call(that.ship, -0.2) };
			if(key.isPressed("right")) { that.ship.rotate.call(that.ship, 0.2) };
			if(key.isPressed("space")) { that.ship.fireBullet.call(that.ship, that) };

			that.update();
			that.draw();
		}, 31);
	}

	Game.prototype.populate = function(numAsteroids) {
		for (i = 0; i < numAsteroids; i++) {
			this.asteroids.push( Asteroid.randomAsteroid() );
		}
	}

	Game.prototype.update = function() {
		var that = this
		that.asteroids.forEach( function(asteroid) {
			asteroid.updatePos.call(asteroid);
			if (asteroid.offScreen.call(asteroid)) {
				asteroid.wrap.call(asteroid);
			}
		});
		that.ship.updatePos.call(that.ship);
		if (that.ship.offScreen.call(that.ship)) {
			that.ship.wrap.call(that.ship);
		}
		that.bullets = that.bullets.filter( function(bullet) {
			bullet.updatePos.call(bullet);
			if (bullet.isHit.call(bullet, that.asteroids, that)) {
				return false;
			}
			if (bullet.offScreen.call(bullet)) {
				return false;
			}
			return true
		});
		if (that.ship.isHit.call(that.ship, that.asteroids, that)) {
			console.log("Hit!");
		}

	}

	Game.prototype.draw = function() {
		var that = this
		that.ctx.clearRect(0, 0, maxPos['x'], maxPos['y']);

		that.ship.draw(that.ctx);
		that.asteroids.forEach( function(asteroid) {
			asteroid.draw(that.ctx);
		});

		that.bullets.forEach( function(bullets) {
			bullets.draw(that.ctx);
		});
	}

	function MovingObjectSurrogate() {
		this.constructor = Asteroid;
	}
	MovingObjectSurrogate.prototype = MovingObject.prototype;

	function Asteroid(pos, vel, rad) {
		MovingObject.call(this, pos, vel, rad);
	}

	Asteroid.prototype = new MovingObjectSurrogate();

	Asteroid.prototype.draw = function(ctx) {
		ctx.fillStyle = "white"
		ctx.beginPath();

		ctx.arc(
			this.pos['x'],
			this.pos['y'],
			this.rad,
			0,
			2 * Math.PI,
			false
		);
		ctx.fill();
	}

	Asteroid.randomAsteroid = function() {
		var pos = {
			x: maxPos['x'] * Math.random(),
			y: maxPos['y'] * Math.random()
		}
		var vel = {
			dx: 4 * (Math.random() * 2 - 1),
			dy: 4 * (Math.random() * 2 - 1)
		}
		return new Asteroid(pos, vel, 15)
	}

	function MovingObjectSurrogate() {
		this.constructor = Ship;
	}
	MovingObjectSurrogate.prototype = MovingObject.prototype;

	function Ship() {
		var pos = {
			x: (maxPos['x'] / 2),
			y: (maxPos['y'] / 2)
		};

		var vel = {
			dx: 0,
			dy: 0
		};

		MovingObject.call(this, pos, vel, 10);
	}

	Ship.prototype = new MovingObjectSurrogate()

	Ship.prototype.draw = function(ctx) {
		ctx.fillStyle = "red"
		ctx.beginPath();
		ctx.lineWidth   = 4;

		ctx.arc(
			this.pos['x'],
			this.pos['y'],
			this.rad,
			0,
			2 * Math.PI,
			false
		);
		ctx.moveTo(this.pos['x'], this.pos['y']);
		var x = this.pos['x'] + this.rad * Math.cos(this.rot)
		var y = this.pos['y'] + this.rad * Math.sin(this.rot)
		ctx.lineTo(x, y);

		ctx.fill();
		ctx.stroke();
	}

	Ship.prototype.rotate = function(d0) {
		this.rot += d0
		if (this.rot > Math.PI) {
			this.rot -= (Math.PI * 2)
		} else if (this.rot < -Math.PI){
			this.rot += (Math.PI * 2)
		}
	}

	Ship.prototype.power = function(dr) {
		this.vel['dx'] += Math.cos(this.rot) * dr;
		this.vel['dy'] += Math.sin(this.rot) * dr;
	}

	Ship.prototype.fireBullet = function(game) {
		game.bullets.push(new Bullet(this.pos, this.vel, this.rot));
	}

	function MovingObjectSurrogate() {
		this.constructor = Bullet;
	}
	MovingObjectSurrogate.prototype = MovingObject.prototype;

	function Bullet(basePos, baseVel, rot) {
		var pos = {
			x: basePos['x'],
			y: basePos['y']
		}

		var vel = {
			dx: baseVel['dx'] + 5 * Math.cos(rot),
			dy: baseVel['dy'] + 5 * Math.sin(rot)
		};

		MovingObject.call(this, pos, vel, 1);
	}

	Bullet.prototype = new MovingObjectSurrogate()

	Bullet.prototype.draw = function(ctx) {
		ctx.fillStyle = "green"
		ctx.beginPath();

		ctx.arc(
			this.pos['x'],
			this.pos['y'],
			this.rad,
			0,
			2 * Math.PI,
			false
		);

		ctx.fill();
	}


	return {
		Game: Game
	};
})();

canvas = document.getElementById('game');
console.log(canvas)
new Asteroids.Game(canvas.getContext("2d"), 20 ).start();
