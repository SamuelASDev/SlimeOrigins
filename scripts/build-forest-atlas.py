"""Measure independent prop frames; preserve the generated PNG unchanged."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
file='forest-decor-anime-v3'
names=['oak','willow','iron','crystal','herbs','log']
with Image.open(ROOT/'public/assets/sprites'/f'{file}.png') as im:
 w,h=im.size;alpha=im.getchannel('A');frames={}
 for i,name in enumerate(names):
  left=(i%3)*(w//3);top=(i//3)*(h//2)
  box=alpha.crop((left,top,left+w//3,top+h//2)).point(lambda a:255 if a>=150 else 0).getbbox()
  if box is None:raise ValueError(f'{name}: empty frame')
  x0,y0,x1,y1=box
  if min(x0,y0,w//3-x1,h//2-y1)<20:raise ValueError(f'{name}: insufficient transparent margin')
  fw,fh=x1-x0,y1-y0
  frames[name]={'frame':{'x':left+x0,'y':top+y0,'w':fw,'h':fh},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':fw,'h':fh},'sourceSize':{'w':fw,'h':fh}}
 atlas={'frames':frames,'meta':{'image':file+'.png','size':{'w':w,'h':h},'scale':'1','app':'Slime Origens / independent source-preserving props'}}
 (ROOT/'public/assets/sprites'/f'{file}.json').write_text(json.dumps(atlas,ensure_ascii=False,indent=2),encoding='utf-8')
 print(f'{file}: six isolated props, independent anchors, PNG unchanged')
