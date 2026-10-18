"""Read source PNGs and write Phaser trim/animation metadata; never modify PNGs.

Requires Pillow. All raster generation is performed with imagegen, not this script.
"""
import json
import argparse
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'assets' / 'sprites'
MONSTERS = ['beetle', 'snake', 'wolf', 'mushroom', 'moth', 'frog', 'wisp', 'bat', 'guardian']


def write_atlas(name, regions, filename=None):
    filename = filename or name
    source = ASSETS / f'{filename}.png'
    with Image.open(source) as image:
        alpha = image.convert('RGBA').getchannel('A')
        # Ignore almost-invisible matte fringe when measuring, preserve original alpha.
        solid = alpha.point(lambda a: 255 if a >= 150 else 0)
        measured = []
        for label, bounds in regions:
            left, top, right, bottom = bounds
            box = solid.crop(bounds).getbbox()
            if box is None:
                raise ValueError(f'{name}/{label}: empty frame')
            x0, y0, x1, y1 = box
            cropped_mask = solid.crop((left + x0, top + y0, left + x1, top + y1))
            mask_width = x1 - x0
            total = weighted = 0
            for index, pixel in enumerate(cropped_mask.tobytes()):
                if pixel:
                    total += 1
                    weighted += index % mask_width
            # Keep the creature's visual mass stable even when jaws or particles extend.
            anchor = round(weighted / max(1, total)) if name != 'slime' else mask_width // 2
            measured.append((label, left + x0, top + y0, mask_width, y1 - y0, anchor))
        radius = max(max(frame[5], frame[3] - frame[5]) for frame in measured)
        width = radius * 2 + 8
        height = max(frame[4] for frame in measured) + 8
        frames = {}
        for label, x, y, w, h, anchor in measured:
            frames[label] = {
                'frame': {'x': x, 'y': y, 'w': w, 'h': h},
                'rotated': False, 'trimmed': True,
                'spriteSourceSize': {'x': width // 2 - anchor, 'y': height - h - 4, 'w': w, 'h': h},
                'sourceSize': {'w': width, 'h': height},
            }
        atlas = {'frames': frames, 'meta': {'image': f'{filename}.png', 'size': {'w': image.width, 'h': image.height}, 'scale': '1', 'app': 'Slime Origens / source-preserving atlas'}}
        (ASSETS / f'{filename}.json').write_text(json.dumps(atlas, ensure_ascii=False, indent=2), encoding='utf-8')
        return {'name': name, 'source': [image.width, image.height], 'logicalFrame': [width, height], 'frames': len(frames)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--variant', default='', help='Optional monster filename suffix, e.g. anime-v2')
    args = parser.parse_args()
    reports = []
    # User's irregular sheet: choose explicit, non-overlapping source regions.
    # Regions cover neutral, locomotion, attacks and reactions without repacking pixels.
    slime_regions = []
    for i, bounds in enumerate([(30, 72, 235, 210), (245, 72, 440, 210), (455, 72, 650, 210), (665, 72, 860, 210)]):
        slime_regions.append((f'idle-{i}', bounds))
    for i, bounds in enumerate([(30, 285, 235, 425), (250, 300, 435, 425), (435, 245, 635, 420), (665, 240, 865, 420), (890, 280, 1110, 425), (1120, 300, 1310, 425)]):
        slime_regions.append((f'walk-{i}', bounds))
    for i, bounds in enumerate([(30, 465, 325, 640), (330, 510, 570, 640), (575, 465, 855, 640)]):
        slime_regions.append((f'attack-{i}', bounds))
    slime_regions.append(('hurt-0', (35, 680, 260, 815)))
    slime_regions.append(('happy-0', (635, 845, 855, 1000)))
    if (ASSETS / 'slime.png').exists():
        reports.append(write_atlas('slime', slime_regions))
    for name in MONSTERS:
        filename = f'{name}-{args.variant}' if args.variant else name
        path = ASSETS / f'{filename}.png'
        if not path.exists():
            continue
        with Image.open(path) as image:
            w, h = image.size
        regions = [(str(row * 2 + col), (col * (w // 2), row * (h // 2), (col + 1) * (w // 2), (row + 1) * (h // 2))) for row in range(2) for col in range(2)]
        reports.append(write_atlas(name, regions, filename))
    print(json.dumps(reports, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
