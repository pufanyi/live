let PtImg;
PtImg=function(filename){
	let img=new Image();
	img.src=filename;
	let ans=[];
	let imgload=false;
	img.onload=function(){
		imgload=true;
		let canvas=document.createElement('canvas');
		canvas.width=img.width;
		canvas.height=img.height;
		let ctx=canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.drawImage(img,0,0);
		let vs=ctx.getImageData(0,0,img.width,img.height).data;
		for(let x=0;x<img.width;x++){
			ans[x]=[];
			for(let y=0;y<img.height;y++){
				let vp=(y*img.width+x)*4;
				let v=[vs[vp],vs[vp+1],vs[vp+2],vs[vp+3]];
				ans[x][y]=((v[0]*256+v[1])*256+v[2])*256+v[3];
			}
		}
	}
	this.getColor=function(x,y){
		let getVC=function(x,y){
			if(ans[x]!=null&&ans[x][y]!=null)return ans[x][y];
			return 0;
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
		let lx=parseInt(x);
		let ly=parseInt(y);
		x-=lx;
		y-=ly;
		let v1=mix(getVC(lx,ly),getVC(lx+1,ly),x);
		ly++;
		let v2=mix(getVC(lx,ly),getVC(lx+1,ly),x);
		return mix(v1,v2,y);
	}
}