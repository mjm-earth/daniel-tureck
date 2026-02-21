const path = require("path");
const fs = require("fs");
const smartcrop = require("smartcrop-sharp");
const sharp = require("sharp");

module.exports = async function () {
  const imagesDir = path.join(__dirname, "..", "assets", "images", "picks");
  const files = fs.readdirSync(imagesDir).filter(f => /\.(jpe?g|png)$/i.test(f));
  const crops = {};

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const key = `/assets/images/picks/${file}`;

    try {
      const metadata = await sharp(filePath).metadata();
      const imgWidth = metadata.width;
      const imgHeight = metadata.height;

      // Wide crop target (matches the capped-height section photos)
      const targetWidth = 1920;
      const targetHeight = 480;

      const result = await smartcrop.crop(filePath, {
        width: targetWidth,
        height: targetHeight,
      });

      const crop = result.topCrop;

      // Convert crop center to object-position percentages
      const centerX = crop.x + crop.width / 2;
      const centerY = crop.y + crop.height / 2;

      const posX = Math.round((centerX / imgWidth) * 100);
      const posY = Math.round((centerY / imgHeight) * 100);

      crops[key] = `${posX}% ${posY}%`;
    } catch (err) {
      console.warn(`smartcrop failed for ${file}:`, err.message);
    }
  }

  return crops;
};
