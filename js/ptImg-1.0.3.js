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
		x=parseInt(x);
		y=parseInt(y);
		if(ans[x]!=null&&ans[x][y]!=null)return ans[x][y];
		return 0;
	}
}