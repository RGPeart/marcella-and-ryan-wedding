// Build web images from the originals in assets/: hero photo, favicons, and the link-preview card.
// Usage: node scripts/make-images.mjs
import sharp from "sharp";

const CREAM = { r: 249, g: 244, b: 237, alpha: 1 };
const out = (name) => new URL(`../docs/${name}`, import.meta.url).pathname;
const src = (name) => new URL(`../assets/${name}`, import.meta.url).pathname;

// Hero photo
await sharp(src("venue-original.jpg")).rotate().jpeg({ quality: 82, mozjpeg: true }).toFile(out("cover.jpg"));

// Logo: trim transparent padding, then pad to a square.
const trimmed = await sharp(src("logo-original.png")).trim().png().toBuffer();
const { width, height } = await sharp(trimmed).metadata();
const side = Math.max(width, height);
const square = await sharp(trimmed)
  .extend({
    top: Math.floor((side - height) / 2), bottom: Math.ceil((side - height) / 2),
    left: Math.floor((side - width) / 2), right: Math.ceil((side - width) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png().toBuffer();

// Browser tab icons (transparent)
await sharp(square).resize(32, 32).png().toFile(out("favicon-32.png"));
await sharp(square).resize(192, 192).png().toFile(out("icon-192.png"));

// iPhone home-screen icon: iOS fills transparency with black, so put it on cream.
const inner = await sharp(square).resize(150, 150).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: CREAM } })
  .composite([{ input: inner, gravity: "center" }]).png().toFile(out("apple-touch-icon.png"));

// Link preview card (iMessage, WhatsApp, etc.)
const card = await sharp(square).resize(520, 520).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: CREAM } })
  .composite([{ input: card, gravity: "center" }]).jpeg({ quality: 88 }).toFile(out("preview.jpg"));

console.log(`Logo trimmed to ${width}x${height}; wrote cover.jpg, favicons, apple-touch-icon.png, preview.jpg`);
