"""
AutoQr branding asset generator.

Produces premium modern app icons and splash assets from a single
vector-style definition using Pillow.

Palette:
    Blue:  #1D4ED8
    White: #FFFFFF
    Dark:  #111827
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

BLUE = (29, 78, 216, 255)
WHITE = (255, 255, 255, 255)
DARK = (17, 24, 39, 255)
TRANSPARENT = (0, 0, 0, 0)

ROOT = Path(__file__).resolve().parent.parent.parent


def rounded_square_mask(size: int, radius: int) -> Image.Image:
    """Return a grayscale mask (L-mode) of a rounded square."""
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def draw_finder_square(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    color: tuple[int, int, int, int],
    hole_color: tuple[int, int, int, int],
    inner_color: tuple[int, int, int, int],
) -> None:
    """Draw a classic QR finder pattern (nested concentric rounded squares)."""
    x0, y0, x1, y1 = box
    size = x1 - x0
    outer_r = int(size * 0.22)
    inner_r = int(size * 0.16)
    core_r = int(size * 0.10)

    draw.rounded_rectangle(box, radius=outer_r, fill=color)

    pad1 = int(size * 0.16)
    draw.rounded_rectangle(
        (x0 + pad1, y0 + pad1, x1 - pad1, y1 - pad1),
        radius=inner_r,
        fill=hole_color,
    )

    pad2 = int(size * 0.30)
    draw.rounded_rectangle(
        (x0 + pad2, y0 + pad2, x1 - pad2, y1 - pad2),
        radius=core_r,
        fill=inner_color,
    )


def draw_car_silhouette(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    color: tuple[int, int, int, int],
) -> None:
    """Draw a minimal modern car silhouette inside the given box."""
    x0, y0, x1, y1 = box
    w = x1 - x0
    h = y1 - y0

    body_top = y0 + int(h * 0.45)
    body_bottom = y0 + int(h * 0.80)
    body_left = x0 + int(w * 0.05)
    body_right = x1 - int(w * 0.05)

    draw.rounded_rectangle(
        (body_left, body_top, body_right, body_bottom),
        radius=int(h * 0.22),
        fill=color,
    )

    roof_points = [
        (x0 + int(w * 0.22), body_top + 2),
        (x0 + int(w * 0.35), y0 + int(h * 0.18)),
        (x0 + int(w * 0.68), y0 + int(h * 0.18)),
        (x0 + int(w * 0.82), body_top + 2),
    ]
    draw.polygon(roof_points, fill=color)

    wheel_r = int(h * 0.14)
    wheel_y = body_bottom
    wheel_left_cx = x0 + int(w * 0.28)
    wheel_right_cx = x0 + int(w * 0.72)

    for cx in (wheel_left_cx, wheel_right_cx):
        draw.ellipse(
            (cx - wheel_r, wheel_y - wheel_r, cx + wheel_r, wheel_y + wheel_r),
            fill=color,
        )


def render_icon(size: int, *, transparent_bg: bool = False, inset: float = 0.0) -> Image.Image:
    """Render the master AutoQr icon at the requested pixel size.

    transparent_bg=True produces the Android adaptive foreground (safe area 66%).
    inset compresses the artwork inward (0..0.3) to respect adaptive safe areas.
    """
    canvas = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)

    if not transparent_bg:
        radius = int(size * 0.22)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=BLUE)

    margin = int(size * (0.14 + inset))
    inner_size = size - 2 * margin

    finder_size = int(inner_size * 0.32)

    if transparent_bg:
        finder_color = BLUE
        hole_color = TRANSPARENT
        inner_color = BLUE
        car_color = BLUE
    else:
        finder_color = WHITE
        hole_color = BLUE
        inner_color = WHITE
        car_color = WHITE

    tl = (margin, margin, margin + finder_size, margin + finder_size)
    tr = (size - margin - finder_size, margin, size - margin, margin + finder_size)
    bl = (margin, size - margin - finder_size, margin + finder_size, size - margin)

    draw_finder_square(draw, tl, finder_color, hole_color, inner_color)
    draw_finder_square(draw, tr, finder_color, hole_color, inner_color)
    draw_finder_square(draw, bl, finder_color, hole_color, inner_color)

    car_box = (
        size - margin - finder_size - int(finder_size * 0.05),
        size - margin - finder_size - int(finder_size * 0.05),
        size - margin + int(finder_size * 0.05),
        size - margin + int(finder_size * 0.05),
    )
    draw_car_silhouette(draw, car_box, car_color)

    dot = max(2, int(size * 0.018))
    dot_color = WHITE if not transparent_bg else BLUE
    cx = margin + finder_size + int(inner_size * 0.14)
    cy = margin + int(finder_size * 0.45)
    for i in range(3):
        draw.ellipse(
            (cx - dot, cy - dot, cx + dot, cy + dot),
            fill=dot_color,
        )
        cx += int(inner_size * 0.08)

    return canvas


def render_monochrome_icon(size: int, color: tuple[int, int, int, int]) -> Image.Image:
    """Flat, single-color silhouette for notification icons."""
    canvas = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(canvas)

    margin = int(size * 0.10)
    inner_size = size - 2 * margin
    finder_size = int(inner_size * 0.32)

    for box in (
        (margin, margin, margin + finder_size, margin + finder_size),
        (size - margin - finder_size, margin, size - margin, margin + finder_size),
        (margin, size - margin - finder_size, margin + finder_size, size - margin),
    ):
        draw.rounded_rectangle(box, radius=int(finder_size * 0.22), fill=color)
        pad = int(finder_size * 0.30)
        x0, y0, x1, y1 = box
        draw.rounded_rectangle(
            (x0 + pad, y0 + pad, x1 - pad, y1 - pad),
            radius=int(finder_size * 0.10),
            fill=TRANSPARENT,
        )

    car_box = (
        size - margin - finder_size,
        size - margin - finder_size,
        size - margin,
        size - margin,
    )
    draw_car_silhouette(draw, car_box, color)

    return canvas


def find_font(preferred: list[str], size: int) -> ImageFont.ImageFont:
    candidates = preferred + [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def render_splash(width: int = 2048, height: int = 2048) -> Image.Image:
    """Render the splash screen: white background, centered icon, brand text."""
    canvas = Image.new("RGBA", (width, height), WHITE)

    icon_size = int(min(width, height) * 0.32)
    icon = render_icon(icon_size, transparent_bg=False)
    icon_x = (width - icon_size) // 2
    icon_y = (height - icon_size) // 2 - int(height * 0.04)
    canvas.paste(icon, (icon_x, icon_y), icon)

    font_size = int(min(width, height) * 0.065)
    font = find_font(
        [
            "/System/Library/Fonts/SFNS.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ],
        font_size,
    )
    draw = ImageDraw.Draw(canvas)
    title = "AutoQr"
    bbox = draw.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    text_x = (width - tw) // 2
    text_y = icon_y + icon_size + int(height * 0.03)
    draw.text((text_x, text_y), title, font=font, fill=DARK)

    tag_size = int(font_size * 0.32)
    tag_font = find_font(
        ["/System/Library/Fonts/Supplemental/Arial.ttf"], tag_size
    )
    tagline = "Secure Vehicle Contact QR"
    tag_bbox = draw.textbbox((0, 0), tagline, font=tag_font)
    tw2 = tag_bbox[2] - tag_bbox[0]
    draw.text(
        ((width - tw2) // 2, text_y + th + int(height * 0.015)),
        tagline,
        font=tag_font,
        fill=BLUE,
    )

    return canvas


def render_splash_logo(size: int = 1024) -> Image.Image:
    """Transparent splash logo (no background) for use with Expo splash config."""
    return render_icon(size, transparent_bg=True)


def save(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({img.size[0]}x{img.size[1]})")


def main() -> None:
    assets = ROOT / "assets"
    icons = assets / "icons"
    splash_dir = assets / "splash"
    branding = assets / "branding"

    master = render_icon(1024)
    save(master, assets / "icon.png")
    save(master, icons / "icon.png")
    save(master, icons / "icon-1024.png")
    save(master, icons / "ios-icon.png")

    save(render_icon(512), icons / "icon-512.png")
    save(render_icon(192), icons / "icon-192.png")
    save(render_icon(180), icons / "apple-touch-icon.png")
    save(render_icon(96), icons / "favicon-96.png")
    save(render_icon(48), icons / "favicon-48.png")
    save(render_icon(32), icons / "favicon-32.png")
    save(render_icon(16), icons / "favicon-16.png")
    save(render_icon(32), assets / "favicon.png")

    adaptive_fg = render_icon(1024, transparent_bg=True, inset=0.06)
    save(adaptive_fg, icons / "adaptive-icon.png")
    save(adaptive_fg, assets / "adaptive-icon.png")

    bg = Image.new("RGBA", (1024, 1024), BLUE)
    save(bg, icons / "adaptive-background.png")

    notif = render_monochrome_icon(96, WHITE)
    save(notif, icons / "notification-icon.png")
    save(notif, assets / "notification-icon.png")

    splash = render_splash(2048, 2048)
    save(splash, splash_dir / "splash.png")
    save(splash, assets / "splash.png")

    splash_logo = render_splash_logo(1024)
    save(splash_logo, splash_dir / "splash-logo.png")

    save(render_icon(1024), branding / "autoqr-icon-1024.png")
    save(render_icon(512), branding / "autoqr-icon-512.png")
    save(render_splash(2048, 2048), branding / "autoqr-splash.png")


if __name__ == "__main__":
    main()
