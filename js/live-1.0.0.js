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
		身=new PtImg(imgBase.身);
		头=new PtImg(imgBase.头);
	}
	this.runAct=function(time){
		身.cLoad();
		头.cLoad();
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
		
		const recolor=['','0','00','000','0000','00000','000000','0000000','00000000'];
		let drawPoint=function(x,y,color){
			if(color==0)return;
			if(x>=0&&x<WIDTH&&y>=0&&y<HEIGHT){
				color=color.toString(16);
				color='#'+recolor[8-color.length]+color;
				ctx.fillStyle=color;
				ctx.fillRect(x,y,1,1);
			}
		}
		for(let x=0;x<WIDTH;x++){
			for(let y=0;y<HEIGHT;y++){
				drawPoint(x,y,身.getColor(x,y));
			}
		}
		for(let x=0;x<WIDTH;x++){
			for(let y=0;y<HEIGHT;y++){
				drawPoint(x,y,头.getColor(x,y));
			}
		}
		lastPaintTime=thisPaintTime;
	}
	this.init();
}