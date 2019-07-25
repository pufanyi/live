let PtImg;
PtImg=function(filename){
	let img;
	let canvas;
	let ctx;
	let loaded=false;
	img=document.createElement('img');
	img.src=filename;
	let ans=[];
	img.onload=function(){
		canvas=document.createElement('canvas');
		canvas.width=img.width;
		canvas.height=img.height;
		ctx=canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		//ctx.drawImage(img,0,0);
		loaded=true;
	}
	this.getWidth=function(){
		return img.width;
	}
	this.getHeight=function(){
		return img.height;
	}
	let ak=false;
	this.getColor=function(i,j){
		if(!loaded)return 0;
		i=parseInt(i);
		j=parseInt(j);
		if(i<0||j<0||i>=img.width||j>=img.height)return 0;
		let g=i*img.height+j;
		if(ans[g]!=null)return ans[g];
		let v=ctx.getImageData(i,j,1,1).data;
		ans[g]=((v[0]*256+v[1])*256+v[2])*256+v[3];
		return ans[g];
	}
}