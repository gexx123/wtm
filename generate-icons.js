const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIcoRaw = require('png-to-ico');
const pngToIco = typeof pngToIcoRaw === 'function' ? pngToIcoRaw : pngToIcoRaw.default;

// Sources for different purposes
const iconSource = path.join(__dirname, 'public', 'assets', 'favicon.png');
const splashSource = path.join(__dirname, 'public', 'assets', 'mody-logo.png');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Generating PWA icons with Hard Fix for Splash branding...');

  try {
    const bg = { r: 255, g: 255, b: 255, alpha: 1 };
    
    // 1. Android/PWA Icon (192x192 from favicon.png)
    await sharp(iconSource)
      .trim()
      .resize(192, 192, { fit: 'contain', background: bg })
      .flatten({ background: bg })
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png');

    // 2. Standard Splash Icon (512x512 from mody-logo.png)
    await sharp(splashSource)
      .trim()
      .resize(512, 512, { fit: 'contain', background: bg })
      .flatten({ background: bg })
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png');

    // 3. NEW: Maskable Splash Icon (512x512 with Safe Zone padding)
    // Maskable icons need ~10% padding to avoid being cut off by phone masks
    await sharp(splashSource)
      .trim()
      .resize(Math.round(512 * 0.8), Math.round(512 * 0.8), { 
        fit: 'contain', 
        background: bg 
      })
      .extend({
        top: Math.round(512 * 0.1),
        bottom: Math.round(512 * 0.1),
        left: Math.round(512 * 0.1),
        right: Math.round(512 * 0.1),
        background: bg
      })
      .flatten({ background: bg })
      .toFile(path.join(publicDir, 'icon-maskable-512.png'));
    console.log('✅ Generated icon-maskable-512.png (Hard Fix Activated)');

    // 4. Apple Touch Icon (180x180 from favicon.png)
    await sharp(iconSource)
      .trim()
      .resize(180, 180, { fit: 'contain', background: bg })
      .flatten({ background: bg })
      .toFile(path.join(publicDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png');

    // 5. Favicon ICO (64x64 from favicon.png)
    const tempIcoPng = path.join(publicDir, 'temp-64.png');
    await sharp(iconSource)
      .trim()
      .resize(64, 64, { fit: 'contain', background: bg })
      .toFile(tempIcoPng);
    const buf = await pngToIco(tempIcoPng);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf);
    fs.unlinkSync(tempIcoPng);
    console.log('✅ Generated favicon.ico');
    
    console.log('🎉 Icons successfully generated with Maskable Hard Fix!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
}

generateIcons();
