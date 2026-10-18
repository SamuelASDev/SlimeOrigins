"""Build independent cave prop metadata without changing the source PNG."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'public/assets/sprites'
old=json.loads((root/'cave-decor-v2.json').read_text(encoding='utf-8-sig'))
frames={}
for key,name in [('0','ore'),('1','pillar'),('2','herbs'),('3','web')]:
 frame=old['frames'][key]['frame'];w,h=frame['w'],frame['h']
 frames[name]={'frame':frame,'rotated':False,'trimmed':False,'sourceSize':{'w':w,'h':h},'spriteSourceSize':{'x':0,'y':0,'w':w,'h':h}}
(root/'cave-props-v3.json').write_text(json.dumps({'frames':frames,'meta':{**old['meta'],'app':'Slime Origens / independent cave prop anchors'}},indent=2),encoding='utf-8')
print('Four independent cave props; source PNG unchanged.')
