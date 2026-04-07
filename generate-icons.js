const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIcoRaw = require('png-to-ico');
const pngToIco = typeof pngToIcoRaw === 'function' ? pngToIcoRaw : pngToIcoRaw.default;

// Use image2.png as the source for EVERYTHING
const sourceImage = path.join(__dirname, 'public', 'assets', 'image2.png');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Generating PWA icons with custom zoom levels...');

  try {
    const bg = { r: 0, g: 0, b: 0, alpha: 0 };
    
    // 192x192 (Android/PWA Icon - ZOOMED IN with solid BG)
    await sharp(sourceImage)
      .trim()
      .resize(200, 200, { // Slightly larger to ensure coverage
        fit: 'cover',
        kernel: 'lanczos3'
      })
      .resize(192, 192) // Back to target size
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Solid white background
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png (Solid White BG, Max Zoom)');

    // 512x512 (Splash Screen Icon - FULL IMAGE as requested)
    await sharp(sourceImage)
      .trim()
      .resize(512, 512, { 
        fit: 'cover', // Changed to cover for splash screen
        background: { r: 255, g: 255, b: 255 }, // Solid white background
        kernel: 'lanczos3'
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png (Full/Cover)');

    // 180x180 (Apple Touch Icon - ZOOMED IN with solid BG)
    await sharp(sourceImage)
      .trim()
      .resize(190, 190, { // Slightly larger to ensure coverage
        fit: 'cover',
        kernel: 'lanczos3'
      })
      .resize(180, 180) // Back to target size
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Solid white background
      .toFile(path.join(publicDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png (Solid White BG, Max Zoom)');

    // Generate temporary 64x64 PNG for ICO conversion (Full/Contain)
    const tempIcoPng = path.join(publicDir, 'temp-64.png');
    await sharp(sourceImage)
      .trim()
      .resize(64, 64, { 
        fit: 'contain', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(tempIcoPng);

    // Convert to true .ico format
    const buf = await pngToIco(tempIcoPng);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf);
    console.log('✅ Generated favicon.ico (Full/Contain)');

    // Cleanup temp file
    fs.unlinkSync(tempIcoPng);
    
    console.log('🎉 Icons successfully generated with your custom mix!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
}

generateIcons();
