let PtImg;
PtImg=function(filename){
	let img;
	let canvas;
	let ctx;
	let loaded=false;
	img=document.createElement('img');
	img.src=filename;
	img.onload=function(){
		canvas=document.createElement('canvas');
		canvas.width=img.width;
		canvas.height=img.height;
		ctx=canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.drawImage(img,0,0);
		loaded=true;
	}
	this.isloaded=function(){
		return loaded;
	}
	this.getWidth=function(){
		return img.width;
	}
	this.getHeight=function(){
		return img.height;
	}
	this.getColor=function(i,j){
		i=parseInt(i);
		j=parseInt(j);
		if(i<0||j<0||i>=img.width||j>=img.height)return 'rgba(0,0,0,0)';
		let v=ctx.getImageData(i,j,1,1);
		return 'rgba('+v[0]+','+v[1]+','+v[2]+','+(v[3]/255)+')';
	}
}