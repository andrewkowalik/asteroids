	var Asteroids = (function() {

	const maxPos = {
		x: $(window).width() * .95,
		y: $(window).height() * .95
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
		that = this;
		var len = asteroids.length;
		var newAsteroids = [];
		var hitObject = false;
		var result = asteroids.filter(function(asteroid) {
			var hit = Math.sqrt(
				Math.pow(that.pos['x'] - asteroid.pos['x'], 2) +
			  Math.pow(that.pos['y'] - asteroid.pos['y'], 2)) <=
				(that.rad + asteroid.rad);
			newPos = jQuery.extend(true, {}, asteroid.pos);

			if (hit) {
				// newAsteroids.push(Asteroid.randomAsteroid(asteroid.pos, newVel));
				// newAsteroids.push(Asteroid.randomAsteroid(asteroid.pos, asteroid.vel));
				newAsteroids.push(asteroid);
				hitObject = true
			}
			return !hit;
		});

		_.each(newAsteroids, function(asteroidPos) {
			result.push(Asteroid.randomAsteroid());
			// result.push(Asteroid.randomAsteroid(asteroidPos));
		})
		game.asteroids = result;
		return hitObject;
	}

	function Game(ctx, numAsteroids) {
		this.ctx = ctx;
		this.asteroids = [];
		this.populate.call(this, numAsteroids);
		this.ship = new Ship();
		this.bullets = [];
		this.draw = this.draw.bind(this);
		this.bulletTimer = 0;
		this.points = 0;
		this.side = 0;
	}

	Game.prototype.start = function() {
		var that = this;

		this.timer = window.setInterval(function() {
			if(key.isPressed("up")) { that.ship.power.call(that.ship, 0.4) };
			if(key.isPressed("down")) { that.ship.power.call(that.ship, -0.4) };
			if(key.isPressed("left")) { that.ship.rotate.call(that.ship, -0.2) };
			if(key.isPressed("right")) { that.ship.rotate.call(that.ship, 0.2) };
			if(key.isPressed("space")) { that.ship.fireBullet.call(that.ship, that) };
			if (that.bulletTimer !== 0) {
				that.bulletTimer -= 1;
			}
			that.update();
			that.draw();
		}, 31);
	}

	Game.prototype.populate = function(numAsteroids) {
		for (i = 0; i < numAsteroids; i++) {
			this.asteroids.push( Asteroid.randomAsteroid(i) );
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
				that.points += 10;
				return false;
			}
			if (bullet.offScreen.call(bullet)) {
				return false;
			}
			return true
		});
		if (that.ship.isHit.call(that.ship, that.asteroids, that)) {
			clearInterval(this.timer);
			alert("You Lose")
		}

	}

	Game.prototype.drawPoints = function(ctx, points) {
		var that = this;
		ctx.fillStyle = "White";
		ctx.font="30px sans-serif"
		ctx.fillText(points, maxPos['x'] * .5, 25);
	}

	Game.prototype.draw = function() {
		var that = this
		that.ctx.clearRect(0, 0, maxPos['x'], maxPos['y']);
		that.ctx.fillStyle="black";
		that.ctx.fillRect(0, 0, maxPos['x'], maxPos['y']);;

		that.ship.draw(that.ctx);
		that.asteroids.forEach( function(asteroid) {
			asteroid.draw(that.ctx);
		});

		that.bullets.forEach( function(bullets) {
			bullets.draw(that.ctx);
		});

		that.drawPoints(that.ctx, that.points)
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
		$("canvas").drawImage({
		  source: backgroundImg,
		  x: this.pos['x'], y: this.pos['y'],
		  scale: this.rad/190,
		});
	}

	Asteroid.randomAsteroid = function(count) {
		var newx = 0;
		var newy = 0;
		side = Math.round(Math.random()*(4-1)+1)
		if (side===1){
			newX = maxPos['x'] * .001 * Math.random();
			newY = maxPos['y'] * Math.random();
		} else if(side===2) {
			newX = maxPos['x'] * Math.random();
			newY = Math.random() * (maxPos['y'] - maxPos['y']*.999) + maxPos['y']*.999;
		} else if(side===3) {
			newX = Math.random() * (maxPos['x'] - maxPos['x']*.999) + maxPos['x']*.999;
			newY = maxPos['y'] * Math.random();
		} else if(side===4) {
			newX = maxPos['x'] * Math.random();
			newY = maxPos['y'] * .001 * Math.random();
		}
		pos = {
			x: newX,
			y: newY
		}
		vel = {
			dx: 5 * (Math.random() * 2 - 1),
			dy: 5 * (Math.random() * 2 - 1)
		}

		rad = Math.random() * (50 - 10) + 10
		return new Asteroid(pos, vel, rad)
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

		MovingObject.call(this, pos, vel, 20);
	}

	Ship.prototype = new MovingObjectSurrogate()

	Ship.prototype.draw = function(ctx) {
		$("canvas").drawImage({
		  source: treesImg,
		  x: this.pos['x'], y: this.pos['y'],
		  scale: 0.35,
		  rotate: (57.2957795 * (this.rot + 1.5707963267948966))
		});
	}

	Ship.prototype.rotate = function(d0) {
		this.rot += d0
		if (this.rot > (Math.PI * 2)) {
			this.rot -= (Math.PI * 2)
		} else if (this.rot < (0)){
			this.rot += (Math.PI * 2)
		}
	}

	Ship.prototype.power = function(dr) {
		this.vel['dx'] += Math.cos(this.rot) * dr;
		this.vel['dy'] += Math.sin(this.rot) * dr;
	}

	Ship.prototype.fireBullet = function(game) {
		if (game.bulletTimer === 0) {
			game.bullets.push(new Bullet(this.pos, this.vel, this.rot));
			game.bulletTimer = 5;
		}
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

		MovingObject.call(this, pos, vel, 2);
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

var loader = new PxLoader(),
    backgroundImg = loader.addImage('planet.png'),
    treesImg = loader.addImage('ship.png')

loader.addCompletionListener(function() {
	height = $(window).height() * .95
	width = $(window).width() * .95
	$('canvas').attr('height', height)
	$('canvas').attr('width', width)
	canvas = document.getElementById('game');

  new Asteroids.Game(canvas.getContext("2d"), 20 ).start();
});

loader.start();


