import sys
from pathlib import Path
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parent))
from build_sprite_atlases import write_atlas
for name,file in [('spider','cave-spider-v2'),('caveBoss','cave-serpent-boss'),('caveDecor','cave-decor-v2')]:
 with Image.open(Path('public/assets/sprites')/(file+'.png')) as image:w,h=image.size
 regions=[(str(r*2+c),(c*(w//2),r*(h//2),(c+1)*(w//2),(r+1)*(h//2))) for r in range(2) for c in range(2)]
 print(write_atlas(name,regions,file))
