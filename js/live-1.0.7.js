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
		mouse={x:0,y:0};
		ctx=canvas.getContext('2d');
		lastPaintTime=new Date().getTime();
		this.initAct();
	}
	
	let 身;
	let 头;
	let 闭眼头;
	
	const pc={x:133,y:60,r:65};
	let type;
	this.initAct=function(){
		身=new PtImg(imgBase.身);
		头=new PtImg(imgBase.头);
		闭眼头=new PtImg(imgBase.闭眼头);
		type={
			x:pc.x,
			y:pc.y,
			状态:'正常',
			持续时间:0
		};
	}
	this.runAct=function(time){
		type.持续时间+=time;
		if(type.状态=='正常'){
			if(type.持续时间>300){
				if(Math.random()<0.2){
					type.状态='闭眼';
					type.头混合=0;
				}
				type.持续时间=0;
			}
		}else if(type.状态=='闭眼'){
			if(type.持续时间<1000){
				type.头混合+=time*(1/1000);
				if(type.头混合>1)type.头混合=1;
			}else if(type.持续时间<1500){
			}else if(type.持续时间<2000){
				type.头混合-=time*(1/500);
				if(type.头混合<0)type.头混合=0;
			}else{
				type.状态='正常';
				type.持续时间=0;
			}
		}
		let dis=function(x1,y1,x2,y2){
			return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		}
		let k=dis(mouse.x,mouse.y,pc.x,pc.y);
		if(k!=0)k=5/k;
		type.x+=time/300*((mouse.x-pc.x)*k+pc.x-type.x);
		type.y+=time/300*((mouse.y-pc.y)*k+pc.y-type.y);
	}
	$(window).mousemove(function(event){
		mouse={
			x:event.clientX-$(window).width()+WIDTH,
			y:event.clientY-$(window).height()+HEIGHT
		};
	});
	let p=0;
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
		let dis=function(x1,y1,x2,y2){
			return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		}
		let et=function(x,y){
			if(x==type.x&&y==type.y){
				return {x:pc.x,y:pc.y};
			}
			let l=1e-6,r=400;
			x-=type.x;
			y-=type.y;
			while(Math.abs(r-l)>1e-6){
				let mid=(l+r)/2;
				if(dis(x*mid+type.x,y*mid+type.y,pc.x,pc.y)<=pc.r){
					l=mid;
				}else{
					r=mid;
				}
			}
			return {x:pc.x+x+(type.x-pc.x)/l,y:pc.y+y+(type.y-pc.y)/l};
		}
		let mix=function(cola,colb,mxb){
			if(cola==colb)return cola;
			let va=[];
			for(let i=0;i<4;i++){
				va.push(cola%256);
				cola-=cola%256;
				cola/=256;
			}
			let vb=[];
			for(let i=0;i<4;i++){
				vb.push(colb%256);
				colb-=colb%256;
				colb/=256;
			}
			let ans=0;
			for(let i=3;i>=0;i--){
				ans=ans*256+Math.round(va[i]*(1-mxb)+vb[i]*mxb);
			}
			return ans;
		}
		for(let x=0;x<WIDTH;x++){
			for(let y=0;y<HEIGHT;y++){
				let color=身.getColor(x,y);
				drawPoint(x,y,color);
			}
		}
		for(let x=0;x<WIDTH;x++){
			for(let y=0;y<HEIGHT;y++){
				let v=et(x,y);
				let color;
				if(type.状态=='闭眼'){
					color=mix(头.getColor(v.x,v.y),闭眼头.getColor(v.x,v.y),type.头混合);
				}else{
					color=头.getColor(v.x,v.y);
				}
				drawPoint(x,y,color);
			}
		}
		lastPaintTime=thisPaintTime;
	}
	this.init();
}