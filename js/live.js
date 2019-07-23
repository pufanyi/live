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
		mouse=null;
		ctx=canvas.getContext('2d');
		lastPaintTime=new Date().getTime();
		this.initAct();
	}
	
	let head;
	let gzw;
	this.initAct=function(){
		head={x:150,y:150};
		gzw=new PtImg('img/gzw.jpg');
	}
	this.runAct=function(time){
		if(mouse!=null){
			if(mouse.x<head.x&&head.x>130){
				head.x-=time*0.05;
			}
			if(mouse.x>head.x&&head.x<170){
				head.x+=time*0.05;
			}
			if(mouse.y<head.y&&head.y>145){
				head.y-=time*0.05;
			}
			if(mouse.y>head.y&&head.y<160){
				head.y+=time*0.05;
			}
		}
	}
	element.onmousemove=function(event){
		mouse={
			x:event.clientX-$(window).width()+WIDTH,
			y:event.clientY-$(window).height()+HEIGHT
		};
	}
	element.onmouseleave=function(){
		mouse=null;
	}
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
		for(let i=0;i<WIDTH;i++){
			drawPoint(i,0,'blue');
			drawPoint(i,1,'blue');
			drawPoint(i,2,'blue');
		}
		for(let i=0;i<HEIGHT;i++){
			drawPoint(0,i,'blue');
			drawPoint(1,i,'blue');
			drawPoint(2,i,'blue');
		}
		for(let i=0;i<WIDTH;i++){
			for(let j=0;j<HEIGHT;j++){
				let sq=(i-head.x)*(i-head.x)+(j-head.y)*(j-head.y);
				let eev=(head.x-150)*(250-j)*(250-j)/(250-head.y)/(250-head.y)+150;
				if(sq>=32*32){
					if(sq<=35*35){
						drawPoint(i,j,'black');
					}else if(i>=eev-2&&i<=eev+2&&j>=head.y&&j<=250){
						drawPoint(i,j,'black');
					}else if(j>=198+Math.abs(i-eev)/2&&j<=202+Math.abs(i-eev)/2&&i>=(eev-150)*4+100&&i<=(eev-150)*4+200){
						drawPoint(i,j,'black');
					}else if(j>=248+Math.abs(i-150)&&j<=252+Math.abs(i-150)&&i>=100&&i<=200){
						drawPoint(i,j,'black');
					}
				}else{
					let v='rgb('+parseInt(180+Math.random()*20)+','+parseInt(180+Math.random()*20)+','+parseInt(180+Math.random()*20)+')';
					if(Math.random()<0.1){
						for(let k=i;k<i+10;k++){
							for(let l=j;l<j+10;l++){
								drawPoint(k,l,v);
							}
						}
					}
					if(gzw.isloaded()){
						let ww=gzw.getWidth();
						let hh=gzw.getHeight();
						drawPoint(i,j,gzw.getColor((i-head.x+32)/64*ww,(j-head.y+32)/64*hh));
						console.log(gzw.getColor((i-head.x+32)/64*ww,(j-head.y+32)/64*hh));
					}
				}
			}
		}
		lastPaintTime=thisPaintTime;
	}
	this.init();
}