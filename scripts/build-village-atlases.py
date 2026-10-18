"""Build source-preserving Phaser metadata for generated 2x2 NPC sheets."""
import json
from PIL import Image
from build_sprite_atlases import ASSETS, write_atlas

for name in ('kaijin', 'benimaru', 'shuna'):
    filename = f'npc-{name}-anime-v2'
    with Image.open(ASSETS / f'{filename}.png') as im:
        width, height = im.size
        assert width % 2 == height % 2 == 0
        alpha = im.convert('RGBA').getchannel('A')
        assert alpha.getextrema()[0] == 0, f'{name}: missing transparency'
        for row in range(2):
            for col in range(2):
                bounds = (col*width//2,row*height//2,(col+1)*width//2,(row+1)*height//2)
                mask = alpha.crop(bounds)
                box = mask.point(lambda a: 255 if a >= 150 else 0).getbbox()
                assert box and box[0]>0 and box[1]>0 and box[2]<width//2 and box[3]<height//2, f'{name}: clipped frame'
    regions = [(str(row*2+col), (col*width//2,row*height//2,(col+1)*width//2,(row+1)*height//2)) for row in range(2) for col in range(2)]
    print(json.dumps(write_atlas(f'npc-{name}',regions,filename)))
