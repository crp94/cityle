import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_LOGO = path.join(__dirname, '..', '..', 'public', 'cityle-logo.png');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'public', 'icons');

// Matches `--bg` / `background_color` in globals.css and manifest.ts — the
// app's actual dark canvas color, used behind the maskable icon so OS icon
// masks (circle/squircle/rounded-square) crop into a color that matches the
// app shell instead of a random fill.
const BACKGROUND_COLOR = '#0A0C10';

// The maskable spec's safe zone is a circle of radius 40% of the icon size
// (centered) — content outside that circle can be clipped by aggressive
// masks (some Android launchers use blob/squircle shapes more aggressive
// than a plain circle). We measure the source logo's actual non-transparent
// content bounding box and only add padding if it doesn't already clear
// that safe zone with real margin, rather than blindly padding a logo that
// doesn't need it.
const MASKABLE_LOGO_SCALE = 0.8; // logo occupies 80% of the maskable canvas, 10% margin per side

async function measureContentBoundingBoxFraction(imagePath: string): Promise<{
  widthFraction: number;
  heightFraction: number;
}> {
  const image = sharp(imagePath);
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const ALPHA_THRESHOLD = 10;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + 3];
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  return {
    widthFraction: contentWidth / width,
    heightFraction: contentHeight / height,
  };
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const metadata = await sharp(SOURCE_LOGO).metadata();
  console.log(`Source logo: ${SOURCE_LOGO}`);
  console.log(`  ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}`);

  const { widthFraction, heightFraction } = await measureContentBoundingBoxFraction(SOURCE_LOGO);
  console.log(
    `  Content bounding box occupies ${(widthFraction * 100).toFixed(1)}% x ${(heightFraction * 100).toFixed(1)}% of the canvas.`
  );

  // Safe-zone check: the maskable spec wants content within a centered circle
  // of radius 40% of the canvas (diameter 80%). A content bounding box needs
  // real headroom below that, since a square/rectangular bounding box's
  // *corners* sit further from center than its edges — a box occupying 80%
  // of the canvas already has corners well outside a 40%-radius circle.
  // The source logo here is a near-edge-to-edge circular mark (~81-83% of
  // the canvas on each axis, only ~8-9% margin per side), which does not
  // leave adequate, comfortable safe-zone headroom, so we pad it.
  const SAFE_FRACTION_THRESHOLD = 0.7; // content should occupy no more than ~70% of the canvas to be safely maskable
  const needsPadding = widthFraction > SAFE_FRACTION_THRESHOLD || heightFraction > SAFE_FRACTION_THRESHOLD;
  console.log(
    `  ${needsPadding ? 'Needs' : 'Does NOT need'} extra padding for the maskable icon (threshold: content <= ${(SAFE_FRACTION_THRESHOLD * 100).toFixed(0)}% of canvas).`
  );

  // --- icon-192.png: plain (purpose: "any") resize, transparent background kept ---
  const icon192Path = path.join(OUTPUT_DIR, 'icon-192.png');
  await sharp(SOURCE_LOGO)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(icon192Path);
  console.log(`Wrote ${icon192Path}`);

  // --- icon-512.png: plain (purpose: "any") resize, transparent background kept ---
  const icon512Path = path.join(OUTPUT_DIR, 'icon-512.png');
  await sharp(SOURCE_LOGO)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(icon512Path);
  console.log(`Wrote ${icon512Path}`);

  // --- icon-512-maskable.png: solid background canvas + logo composited at reduced scale ---
  const maskableSize = 512;
  const maskablePath = path.join(OUTPUT_DIR, 'icon-512-maskable.png');

  const logoTargetSize = needsPadding ? Math.round(maskableSize * MASKABLE_LOGO_SCALE) : maskableSize;
  const resizedLogo = await sharp(SOURCE_LOGO)
    .resize(logoTargetSize, logoTargetSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toFile(maskablePath);
  console.log(
    `Wrote ${maskablePath} (logo composited at ${logoTargetSize}x${logoTargetSize} on a ${maskableSize}x${maskableSize} ${BACKGROUND_COLOR} canvas)`
  );

  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
