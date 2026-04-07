const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIcoRaw = require('png-to-ico');
const pngToIco = typeof pngToIcoRaw === 'function' ? pngToIcoRaw : pngToIcoRaw.default;

const inputImagePath = path.join(__dirname, 'public', 'assets', 'image.png');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Generating PWA icons...');

  try {
    const bg = { r: 255, g: 255, b: 255, alpha: 0 };
    
    // 192x192
    await sharp(inputImagePath)
      .resize(192, 192, { 
        fit: 'contain', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png');

    // 512x512
    await sharp(inputImagePath)
      .resize(512, 512, { 
        fit: 'contain', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png');

    // 180x180 (Apple Touch Icon)
    await sharp(inputImagePath)
      .resize(180, 180, { 
        fit: 'contain', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png');

    // Generate temporary 64x64 PNG for ICO conversion
    const tempIcoPng = path.join(publicDir, 'temp-64.png');
    await sharp(inputImagePath)
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
    
    console.log('🎉 All icons successfully generated!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
}

generateIcons();
