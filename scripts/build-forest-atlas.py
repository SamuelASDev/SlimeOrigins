from PIL import Image
from build_sprite_atlases import write_atlas
file='forest-decor-anime-v2'
with Image.open('public/assets/sprites/'+file+'.png') as im:w,h=im.size
names=['oak','willow','iron','crystal','herbs','log']
regions=[(name,((i%3)*(w//3),(i//3)*(h//2),(i%3+1)*(w//3),(i//3+1)*(h//2))) for i,name in enumerate(names)]
print(write_atlas('forestDecor',regions,file))
