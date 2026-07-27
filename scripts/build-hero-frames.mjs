import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = String.raw`C:\Users\vinsu\Downloads\frames\Video Frame Extractor 2026-07-27 20_15_33 GMT+8`;
const OUT_DESKTOP = path.resolve("public/images/hero-sequence/desktop");
const OUT_MOBILE = path.resolve("public/images/hero-sequence/mobile");

const DESKTOP_WIDTH = 1920; // native source width, no upscale/downscale
const MOBILE_WIDTH = 828; // retina-ish width for ~414px CSS containers
const MOBILE_STRIDE = 2; // every 2nd frame -> 60 frames on mobile

async function run() {
  await mkdir(OUT_DESKTOP, { recursive: true });
  await mkdir(OUT_MOBILE, { recursive: true });

  const files = (await readdir(SRC_DIR))
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();

  console.log(`Found ${files.length} source frames`);

  let desktopCount = 0;
  let mobileCount = 0;

  for (let i = 0; i < files.length; i++) {
    const srcPath = path.join(SRC_DIR, files[i]);
    const frameNum = i + 1;
    const outName = String(frameNum).padStart(3, "0") + ".webp";

    await sharp(srcPath)
      .resize({ width: DESKTOP_WIDTH })
      .webp({ quality: 90 })
      .toFile(path.join(OUT_DESKTOP, outName));
    desktopCount++;

    if (i % MOBILE_STRIDE === 0) {
      const mobileFrameNum = Math.floor(i / MOBILE_STRIDE) + 1;
      const mobileOutName = String(mobileFrameNum).padStart(3, "0") + ".webp";
      await sharp(srcPath)
        .resize({ width: MOBILE_WIDTH })
        .webp({ quality: 85 })
        .toFile(path.join(OUT_MOBILE, mobileOutName));
      mobileCount++;
    }
  }

  console.log(`Wrote ${desktopCount} desktop frames, ${mobileCount} mobile frames`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
