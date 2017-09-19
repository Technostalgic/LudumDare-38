///
///	code by Isaiah Smith
///		
///	https://technostalgic.itch.io  
///	twitter @technostalgicGM
///

/* class effect
	data structure that contains information for a visual 
	effect that appears on screen
*/
class effect{
	/* constructor(pos)
		initializes an effect object
		parameters:
			pos:vec2 - the location the effect will
				initialize
		member variables:
			public pos:vec2 - the location of the effect
			public size:Number - the radius of the effect
			public grow:Number - the amount it's size
				increases per tick
			public color:[Number] - the byte values of the
				color it's rendered as in RGB
			public life:Number - how long the effect lasts for
	*/
	constructor(pos){
		this.pos = pos;
		this.size = 25;
		this.grow = 2;
		this.color = [250,240,0];
		this.life = 10;
	}
	
	/* member function add() - public
		adds the effect to the effect query so it can be 
		rendered
	*/
	add(){
		effects.push(this);
	}
	/* member function remove() - public
		removes the effect from the effect query
	*/
	remove(){
		effects.splice(effects.indexOf(this), 1);
	}

	/* member function draw(ctx) - public
		renders the effect on screen
		parameters:
			ctx:CanvasRenderingContext2D - the context to 
				render with
	*/
	draw(ctx){
		this.size += this.grow;

		var fade = 10;
		var a = 1;
		if(this.life < fade)
			a = this.life / fade;

		ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
		ctx.fill();

		this.life -= 1;
		if(this.life <= 0)
			this.remove();
	}	
}

function drawEffects(ctx){
	/* function drawEffects(ctx) 
		draws all the effect objects in the query
	*/
	for (var i = effects.length - 1; i >= 0; i--) {
		effects[i].draw(ctx);
	}
}

/* class tracer
	data structure that allows entity trails to be
	drawn on screen
*/
class tracer{
	/* constructor()
		initializes a tracer object
		member variables:
			public points:[{vec2,Number}] - an array 
				of points that are connected to draw a 
				trails
			public color:[Number] - an array of 4 numbers 
				that represent RGB byte values
			public life:Number - the length of time that 
				each trail point has before it fades away
			public closed:Boolean - if true, the tracer
				will be removed from the tracer query when
				it is empty
	*/
	constructor(){
		this.points = [];
		this.color = [200, 250, 200]; //very light green
		this.life = 300;
		this.closed = false;
	}

	/* member function trace(tpos) - public
		adds a line segment to the trail that is drawn at
		the given position
		parameters:
			tpos:vec2 - the position of the line segment
	*/
	trace(tpos){
		var p = {
			pos: tpos,
			life: this.life
		};
		this.points.push(p);
	}

	/* member function close() - public
		closes the tracer so it gets removed when all of the
		line segments fade out
	*/
	close(){
		this.closed = true;
	}
	/* member function add() - public
		adds the tracer to the tracer query so it is rendered
		and updated
	*/
	add(){
		tracers.push(this);
	}
	/* member function remove() - public
		removes the tracer from the tracer query
	*/
	remove(){
		if(tracers.includes(this))
			tracers.splice(tracers.indexOf(this), 1);
	}

	/* member function update() - public
		main logic tick for the tracer
	*/
	update(){
		// removes this instance from the tracer query if it
		// is closed
		if(this.closed)
			if(this.points.length <= 0)
				this.remove();
			
		// iterates through each line segment and subtracts
		// their lifespan
		for (var i = this.points.length - 1; i >= 0; i--) {
			this.points[i].life -= 1;
			if(this.points[i].life <= 0)
				this.points.splice(i, 1);
		}
	}
	/* member function 
		renders the trail of the tracer
	*/
	draw(ctx){
		if(this.points.length <= 0) return;
		
		// the alpha component of the rounded end of the line
		var a = 1;
		// sets the alpha to appear as if the trail starts 
		// fading at 1/5th of it's max life
		if(this.points[0].life < this.life / 5 )
			a = this.points[0].life / (this.life / 5);
		
		// sets the fillStyle of the context, accounting for the alpha
		ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
		ctx.beginPath();
		ctx.arc(this.points[0].pos.x, this.points[0].pos.y, 4, 0, Math.PI * 2);
		ctx.fill(); // creates the rounded end of the trail
		
		// iterates through each line segment in the trail and
		// renders each of them
		for(var i = 1; i < this.points.length; i++){
			// i-not, represents the index of the previous segment
			var i0 = i - 1;
			
			// the alpha component of the segment
			var a = 1;
			// sets the alpha to appear as if the trail starts 
			// fading at 1/5th of it's max life
			if(this.points[i0].life < this.life / 5 )
				a = this.points[i0].life / (this.life / 5);
			
			// sets the strokeStyle of the context, accounting for the alpha
			ctx.strokeStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
			ctx.lineWidth = a * 2;
			ctx.beginPath();
			ctx.moveTo(this.points[i0].pos.x, this.points[i0].pos.y);
			ctx.lineTo(this.points[i].pos.x, this.points[i].pos.y);
			ctx.stroke(); //renders the line segment
		}
		
		// renders a rounded tip of the trail if it is closed
		if(this.closed){
			ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + a + ")";
			ctx.beginPath();
			ctx.arc(this.points[this.points.length - 1].pos.x, this.points[this.points.length - 1].pos.y, 3, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}

/* class flashText
	contains info and methods for drawing temporary dynamic text 
	in the game
*/
class flashText extends effect{
	/* constructor(pos, txt, fcol)
		initializes a flashText object
		parameters:
			pos:vec2 - where the text will be rendered
			txt:string - what the text will say
			fcol:[Number] - the color that the text flashes to,
				leave 'null' if the text doesn't flash
		member variables:
			public color:[Number] - an array of numbers that
				represent the byte values of RGB
			public fcolor:[Number] - the color that the text,
				flashes to, null if text deosn't flash
			public pos:vec2 - the position that the text will
				render at
			public life:Number - how long the text stays on 
				screen before fading away
	*/
	constructor(pos, txt, fcol = null){
		super();
		this.color = [50, 200, 40];
		this.fcolor = fcol;
		
		this.pos = pos;
		// lowers the position by 10 pixels so the text appears 
		// more vertically centered
		this.pos.y += 10;
		
		this.life = 45;
		this.txt = txt;
	}
	
	/* member function draw(ctx)
		renders the flashText object on screen
		parameters:
			ctx:CanvasRenderingContext2D - the context used to 
				render it on
	*/
	draw(ctx){
		//highers the text's postion every tick that it's drawn
		this.pos.y -= 0.5;
		
		var col = this.color;
		
		// if this.fcolor isn't null, then switch 'col' between
		// the values of 'this.color' and 'this.fcolor' every
		// 100 milliseconds
		if(this.fcolor)
			col = (timeElapsed % 200 >= 100) ? this.color : this.fcolor;
		
		// the lifetime at which it starts to fade
		var fade = 30;
		var a = 1;
		
		// fades the text if its life is below 'fade'
		if(this.life < fade)
			a = this.life / fade;
		
		ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + a + ")";
		ctx.font = "bold 16px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(this.txt, this.pos.x, this.pos.y);

		this.life -= 1;
		if(this.life <= 0)
			this.remove();
	}	
}

function updateTracers(){
	/* function updateTracers()
		updates all the tracers in the tracer query
	*/
	for (var i = tracers.length - 1; i >= 0; i--) {
		tracers[i].update();
	}
}
function drawTracers(ctx){
	/* function drawTracers(ctx)
		renders all the tracers in the tracer query
		parameters:
			ctx:CanvasRenderingContext2D - the context to render
				with
	*/
	tracers.forEach(function(tr){
		tr.draw(ctx);
	});
}