"""Measure four isolated poses, preserve PNG pixels and a fixed horizontal body anchor."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]/'public/assets/sprites'
name='cave-serpent-boss-v2'
with Image.open(root/(name+'.png')) as im:
 w,h=im.size;cw,ch=w//2,h//2;alpha=im.getchannel('A');poses=[]
 for i in range(4):
  left=(i%2)*cw;top=(i//2)*ch;box=alpha.crop((left,top,left+cw,top+ch)).point(lambda a:255 if a>=150 else 0).getbbox()
  if box is None:raise ValueError('Empty pose')
  x0,y0,x1,y1=box
  if min(x0,y0,cw-x1,ch-y1)<1:raise ValueError(f'Pose {i} touches cell boundary')
  poses.append((left,top,x0,y0,x1-x0,y1-y0))
 height=max(p[5] for p in poses)+8;frames={}
 for i,(left,top,x0,y0,fw,fh) in enumerate(poses):
  frames[str(i)]={'frame':{'x':left+x0,'y':top+y0,'w':fw,'h':fh},'rotated':False,'trimmed':True,'spriteSourceSize':{'x':x0,'y':height-4-fh,'w':fw,'h':fh},'sourceSize':{'w':cw,'h':height}}
 meta={'image':name+'.png','size':{'w':w,'h':h},'scale':'1','app':'Slime Origens / fixed cell anchor and shared ground baseline'}
 (root/(name+'.json')).write_text(json.dumps({'frames':frames,'meta':meta},indent=2),encoding='utf-8')
 print('Boss: four isolated cells, fixed anchor, common ground baseline')
