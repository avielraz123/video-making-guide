"""Generate 4 abstract still images (1920x1080) with Pillow, so the slideshow
has royalty-free pictures that we made ourselves.

Usage:  python gen_images.py        -> writes media/slide1.png ... slide4.png
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

W, H = 1920, 1080
NAVY, DEEP, AMBER, CREAM = (15, 27, 51), (8, 15, 30), (255, 181, 71), (232, 238, 248)
OUT = Path(__file__).parent / "media"
OUT.mkdir(exist_ok=True)
random.seed(7)  # same images every run


def vertical_gradient(top, bottom):
    """A full-size image fading from `top` color to `bottom` color."""
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
    return img


def mix(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


# 1) Sunset over layered hills
img = vertical_gradient((40, 46, 92), (255, 150, 80))
d = ImageDraw.Draw(img)
d.ellipse([W * 0.6 - 140, H * 0.45 - 140, W * 0.6 + 140, H * 0.45 + 140], fill=(255, 214, 140))
for i, base in enumerate([0.62, 0.72, 0.84]):
    pts = [(x, H * base + 60 * math.sin(x / (230 - i * 40) + i * 2)) for x in range(0, W + 20, 20)]
    d.polygon(pts + [(W, H), (0, H)], fill=mix((60, 50, 90), DEEP, i / 2))
img.save(OUT / "slide1.png")

# 2) Glowing concentric rings
img = vertical_gradient((28, 44, 82), DEEP)
d = ImageDraw.Draw(img)
for r in range(60, 900, 70):
    d.ellipse([W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r], outline=mix(AMBER, NAVY, r / 900), width=8)
img = ImageChops.screen(img, img.filter(ImageFilter.GaussianBlur(14)))  # add a soft glow
img.save(OUT / "slide2.png")

# 3) Dot grid shaped by a wave
img = vertical_gradient(DEEP, NAVY)
d = ImageDraw.Draw(img)
for gx in range(0, W, 48):
    for gy in range(0, H, 48):
        s = 0.5 + 0.5 * math.sin(gx / 160 + gy / 110)  # 0..1 wave value
        r = 3 + 12 * s
        d.ellipse([gx - r, gy - r, gx + r, gy + r], fill=mix((60, 90, 150), AMBER, s))
img.save(OUT / "slide3.png")

# 4) Soft bokeh circles
img = vertical_gradient((20, 30, 70), (70, 30, 80))
layer = Image.new("RGB", (W, H))
d = ImageDraw.Draw(layer)
for _ in range(32):
    x, y, r = random.randint(0, W), random.randint(0, H), random.randint(30, 160)
    d.ellipse([x - r, y - r, x + r, y + r], fill=random.choice([AMBER, CREAM, (120, 170, 255)]))
img = Image.blend(img, layer.filter(ImageFilter.GaussianBlur(36)), 0.5)
img.save(OUT / "slide4.png")

print("wrote 4 images to", OUT)
