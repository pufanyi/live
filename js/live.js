let Live;

Live=function(element){
	const WIDTH=300;
	const HEIGHT=400;
	const thisLine=this;
	
	let canvas;
	let mouse;
	let lastPaintTime;
	let ctx;
	
	this.init=function(){
		element.style.position='fixed';
		$(element).width(WIDTH);
		$(element).height(HEIGHT);
		$(element).css('right',0);
		$(element).css('bottom',0);
		canvas=document.createElement('canvas');
		canvas.width=WIDTH;
		canvas.height=HEIGHT;
		element.appendChild(canvas);
		mouse={x:$(window).width()/2,y:$(window).height()/2};
		ctx=canvas.getContext('2d');
		lastPaintTime=new Date().getTime();
		this.initAct();
	}
	
	let 身;
	let 头;
	this.initAct=function(){
		身=new PtImg('img/身.jpg');
		头=new PtImg('img/头.jpg');
	}
	this.runAct=function(time){
	}
	$(window).mousemove(function(event){
		mouse={
			x:event.clientX-$(window).width()+WIDTH,
			y:event.clientY-$(window).height()+HEIGHT
		};
	});
	this.paint=function(){
		let thisPaintTime=new Date().getTime();
		let deltaPaintTime=thisPaintTime-lastPaintTime;
		this.runAct(deltaPaintTime);
		ctx.clearRect(0,0,WIDTH,HEIGHT);
		
		let drawPoint=function(x,y,color){
			if(x>=0&&x<WIDTH&&y>=0&&y<HEIGHT){
				ctx.fillStyle=color;
				ctx.fillRect(x,y,1,1);
			}
		}
		/*for(let x=0;x<WIDTH;x++){
			for(let y=0;y<HEIGHT;y++){
				drawPoint(x,y,身.getColor(x,y));
			}
		}
		for(let x=0;x<WIDTH;x++){
			for(let y=0;y<HEIGHT;y++){
				drawPoint(x,y,头.getColor(x,y));
			}
		}*/
		drawPoint(10,10,'black');
		drawPoint(10,11,'black');
		drawPoint(10,12,'black');
		drawPoint(10,13,'black');
		drawPoint(10,14,'black');
		lastPaintTime=thisPaintTime;
	}
	this.init();
}