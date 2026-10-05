// Generate a print-quality QR code for the live site URL.
// Usage: node scripts/make-qr.mjs https://your-site.example
import QRCode from "qrcode";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/make-qr.mjs <url>");
  process.exit(1);
}

await QRCode.toFile("qr-code.png", url, { width: 1200, margin: 2, errorCorrectionLevel: "H" });
await QRCode.toFile("qr-code.svg", url, { type: "svg", margin: 2, errorCorrectionLevel: "H" });
console.log(`QR codes for ${url} written to qr-code.png and qr-code.svg`);
