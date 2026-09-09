import sharp from "sharp";

const srcPath = "public/images/aboutsagrika.png";
const outPath = "public/images/aboutsagrika.png";

const { data, info } = await sharp(srcPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h } = info;
const px = data;

const isNearWhite = (r, g, b) => r > 232 && g > 232 && b > 228;

for (let i = 0; i < px.length; i += 4) {
  let r = px[i];
  let g = px[i + 1];
  let b = px[i + 2];
  let a = px[i + 3];

  if (a === 0) {
    px[i] = 0;
    px[i + 1] = 0;
    px[i + 2] = 0;
    continue;
  }

  // Drop faint white fringe left by the white studio backdrop.
  if (a < 90 && isNearWhite(r, g, b)) {
    px[i] = 0;
    px[i + 1] = 0;
    px[i + 2] = 0;
    px[i + 3] = 0;
    continue;
  }

  const af = a / 255;
  if (af < 1) {
    // Un-premultiply against white so leftover backdrop doesn't halo.
    r = Math.min(255, Math.max(0, Math.round((r - 255 * (1 - af)) / af)));
    g = Math.min(255, Math.max(0, Math.round((g - 255 * (1 - af)) / af)));
    b = Math.min(255, Math.max(0, Math.round((b - 255 * (1 - af)) / af)));
  }

  if (a < 18) {
    a = 0;
    r = 0;
    g = 0;
    b = 0;
  } else if (a >= 200) {
    a = 255;
  }

  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
  px[i + 3] = a;
}

// Second pass: kill remaining white edge pixels that sit next to transparency.
const next = Buffer.from(px);
const idx = (x, y) => (y * w + x) * 4;
for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const i = idx(x, y);
    const a = px[i + 3];
    if (a === 0 || a === 255) continue;
    if (!isNearWhite(px[i], px[i + 1], px[i + 2])) continue;
    let open = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (px[idx(x + dx, y + dy) + 3] < 20) open++;
      }
    }
    if (open >= 2) {
      next[i] = 0;
      next[i + 1] = 0;
      next[i + 2] = 0;
      next[i + 3] = 0;
    }
  }
}

await sharp(next, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(outPath);

// Previews for visual check
const cleaned = sharp(outPath);
const meta = await cleaned.metadata();

await cleaned
  .clone()
  .flatten({ background: { r: 255, g: 0, b: 255 } })
  .resize(900)
  .png()
  .toFile("tmp-corners/cut-on-magenta.png");

await sharp("public/images/about.png")
  .resize(1400)
  .composite([
    {
      input: await sharp(outPath)
        .resize({ height: 1400, fit: "contain" })
        .toBuffer(),
      gravity: "south",
    },
  ])
  .jpeg({ quality: 88 })
  .toFile("tmp-corners/cut-on-about.jpg");

console.log("cleaned", meta.width, meta.height);
