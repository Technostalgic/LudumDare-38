///
///	code by Isaiah Smith
///		
///	https://technostalgic.itch.io  
///	twitter @technostalgicGM
///

/* class planet
	an object primarily used as a medium of terrain for the 
	player to navigate
*/
class planet{
	/* constructor()
		initializes a planet object
		member variables:
			public pos:vec2 - the location of the planet
			publuc size:Number - the radius of the planet
			public get mass:Number - the mass of the planet
	*/
	constructor(pos, size = 100){
		this.pos = pos;
		this.size = size;
	}
	
	/* member function draw(ctx) - public
		renders the planet on screen
	*/
	draw(ctx){
		ctx.strokeStyle = "#000";
		ctx.fillStyle = "#ddd";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	/* member field get mass:Number - public
		returns the area of the planet since all planets
		are equal in density; used for calculating 
		gravitational pull
	*/
	get mass(){
		return Math.pow(this.size, 2) * Math.PI;
	}

	/* static function generatePlanets() = - public
		generates between 1 and 10 planets in the world with
		a good amount if distance between each one
	*/
	static generatePlanets(){
		var r = [];
		
		//spawns the planets
		for(var  i = 10; i > 0; i--)
			planet.spawnPlanet(r);
		
		//removes the planets that are too small
		for(var i = r.length - 1; i >= 0; i--)
			if(r[i].size < 10)
				r.splice(i, 1);
		
		return r;
	}
	/* static function spawnPlanet(list) - public
	*/
	static spawnPlanet(list){
		//the minimum amount of distace between each planet's surface
		var emptySpace = 50;

		//the size of the planet; randomly determined
		var sz = rand(rand(50, 75), 100);
		var m; // the position of the planet

		var rd = false; // if the planet is too close too other planets to spawn;
						// breaks the loop if false
		var iterations = 0; // how many times the do-while loop has iterated
		do {
			// if the planet has unsuccessfully tried to spawn 10 or 
			// more times, it's size is halved so it can fit into 
			// a smaller spot
			if(iterations > 10){
				iterations = 0;
				sz /= 2;
			}
			//creates a new random position within the world's bounds
			m = new vec2(rand(sz + emptySpace , 600 - sz - emptySpace), rand(50 + sz + emptySpace, 600 - sz - emptySpace));
			
			// checks to see if the position of the planet is too close to any other planets
			// if it is, the spawn was it will try a new position
			rd = false;
			for(var i in list){
				if(m.distance(list[i].pos) <= sz + list[i].size + emptySpace)
					rd = true;
			}
			iterations++;
		} while(rd);
		
		list.push(new planet(m, sz));
	}
}

function drawPlanets(list, ctx){
	/* function drawPlanets(list, ctx)
		renders all the planets in the specified list
		parameters:
			list:[planet] - the list of planets to render
			ctx:renderingContext2D - the context o render with
	*/
	list.forEach(function(pl){
		pl.draw(ctx);
	});
}