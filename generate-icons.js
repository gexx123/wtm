const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIcoRaw = require('png-to-ico');
const pngToIco = typeof pngToIcoRaw === 'function' ? pngToIcoRaw : pngToIcoRaw.default;

// Use image2.png as the source for EVERYTHING
const sourceImage = path.join(__dirname, 'public', 'assets', 'image2.png');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Generating PWA icons from image2.png...');

  try {
    const bg = { r: 0, g: 0, b: 0, alpha: 0 };
    
    // 192x192 (Android/PWA Icon - Zoomed to fill)
    await sharp(sourceImage)
      .trim()
      .resize(192, 192, { 
        fit: 'cover', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png');

    // 512x512 (Splash Screen Icon - Zoomed to fill)
    await sharp(sourceImage)
      .trim()
      .resize(512, 512, { 
        fit: 'cover', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png');

    // 180x180 (Apple Touch Icon - Zoomed to fill)
    await sharp(sourceImage)
      .trim()
      .resize(180, 180, { 
        fit: 'cover', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png');

    // Generate temporary 64x64 PNG for ICO conversion
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
    console.log('✅ Generated favicon.ico');

    // Cleanup temp file
    fs.unlinkSync(tempIcoPng);
    
    console.log('🎉 All icons successfully switched to image2.png!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
}

generateIcons();
