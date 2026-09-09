import sharp from "sharp";

const origBuf = await sharp("dist/images/aboutsagrika.png")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const maskBuf = await sharp("public/images/aboutsagrika.png")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h } = origBuf.info;
const orig = origBuf.data;
const mask = maskBuf.data;
const out = Buffer.alloc(orig.length);

const idx = (x, y) => (y * w + x) * 4;
const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const nearWhite = (r, g, b) => r >= 248 && g >= 248 && b >= 246;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = idx(x, y);
    const or = orig[i];
    const og = orig[i + 1];
    const ob = orig[i + 2];
    let a = mask[i + 3];

    if (a === 0) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
      continue;
    }

    if (nearWhite(or, og, ob) && a < 255) {
      let darkN = 0;
      let openN = 0;
      const r0 = Math.max(0, x - 3);
      const r1 = Math.min(w - 1, x + 3);
      const c0 = Math.max(0, y - 3);
      const c1 = Math.min(h - 1, y + 3);
      for (let yy = c0; yy <= c1; yy++) {
        for (let xx = r0; xx <= r1; xx++) {
          const j = idx(xx, yy);
          if (luma(orig[j], orig[j + 1], orig[j + 2]) < 90) darkN++;
          if (mask[j + 3] < 20) openN++;
        }
      }
      if (darkN >= 2 && openN >= 2) {
        a = 0;
      }
    }

    if (a > 0 && a < 90 && nearWhite(or, og, ob)) a = 0;

    if (a === 0) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
      continue;
    }

    let r = or;
    let g = og;
    let b = ob;
    const af = a / 255;
    if (af < 1) {
      r = Math.min(255, Math.max(0, Math.round((or - 255 * (1 - af)) / af)));
      g = Math.min(255, Math.max(0, Math.round((og - 255 * (1 - af)) / af)));
      b = Math.min(255, Math.max(0, Math.round((ob - 255 * (1 - af)) / af)));
    }

    if (a >= 200) a = 255;
    else if (a < 16) a = 0;

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = a;
  }
}

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile("public/images/aboutsagrika.png");

await sharp("public/images/aboutsagrika.png")
  .flatten({ background: { r: 255, g: 0, b: 255 } })
  .resize(900)
  .png()
  .toFile("tmp-corners/cut-on-magenta.png");

const portrait = await sharp("public/images/aboutsagrika.png")
  .resize({ width: 640, height: 900, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp("public/images/about.png")
  .resize(1600, 900, { fit: "cover", position: "centre" })
  .composite([{ input: portrait, gravity: "south" }])
  .jpeg({ quality: 90 })
  .toFile("tmp-corners/cut-on-about.jpg");

await sharp("public/images/aboutsagrika.png")
  .flatten({ background: { r: 40, g: 180, b: 80 } })
  .extract({ left: 1400, top: 380, width: 700, height: 520 })
  .png()
  .toFile("tmp-corners/crop-hair.png");

console.log("refined");
