export function cropBox(imageWidth:number,imageHeight:number,aspect:number,zoom=1,x=50,y=50){
 if(![imageWidth,imageHeight,aspect,zoom,x,y].every(Number.isFinite)||imageWidth<=0||imageHeight<=0||aspect<=0)throw new Error('Dimensions d’image invalides.');
 const width=aspect===1?800:1200,height=Math.max(1,Math.round(width/aspect));
 const scale=Math.max(width/imageWidth,height/imageHeight)*Math.max(1,Math.min(4,zoom));
 const sourceWidth=width/scale,sourceHeight=height/scale;
 const sx=Math.max(0,imageWidth-sourceWidth)*Math.max(0,Math.min(100,x))/100,sy=Math.max(0,imageHeight-sourceHeight)*Math.max(0,Math.min(100,y))/100;
 return {width,height,scale,sourceWidth,sourceHeight,sx,sy};
}
export function fitBox(imageWidth:number,imageHeight:number,width:number,height:number,zoom=1,x=50,y=50){
 if(![imageWidth,imageHeight,width,height,zoom,x,y].every(Number.isFinite)||imageWidth<=0||imageHeight<=0||width<=0||height<=0)throw new Error('Dimensions d’image invalides.');
 const scale=Math.min(width/imageWidth,height/imageHeight)*Math.max(1,Math.min(4,zoom));
 const drawnWidth=imageWidth*scale,drawnHeight=imageHeight*scale;
 return {drawnWidth,drawnHeight,dx:(width-drawnWidth)*Math.max(0,Math.min(100,x))/100,dy:(height-drawnHeight)*Math.max(0,Math.min(100,y))/100};
}
