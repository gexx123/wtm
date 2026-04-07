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
  console.log('Generating PWA icons with split sources (Favicon vs Splash)...');

  try {
    const bg = { r: 255, g: 255, b: 255, alpha: 1 };
    
    // 192x192 (Android/PWA Icon - Using favicon.png)
    await sharp(iconSource)
      .trim()
      .resize(192, 192, { 
        fit: 'contain',
        background: bg,
        kernel: 'lanczos3'
      })
      .flatten({ background: bg })
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png (from favicon.png)');

    // 512x512 (Splash Screen Icon - Using mody-logo.png)
    await sharp(splashSource)
      .trim()
      .resize(512, 512, { 
        fit: 'contain',
        background: bg,
        kernel: 'lanczos3'
      })
      .flatten({ background: bg })
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png (from mody-logo.png)');

    // 180x180 (Apple Touch Icon - Using favicon.png)
    await sharp(iconSource)
      .trim()
      .resize(180, 180, { 
        fit: 'contain',
        background: bg,
        kernel: 'lanczos3'
      })
      .flatten({ background: bg })
      .toFile(path.join(publicDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png (from favicon.png)');

    // Generate temporary 64x64 PNG for ICO conversion (Using favicon.png)
    const tempIcoPng = path.join(publicDir, 'temp-64.png');
    await sharp(iconSource)
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
    console.log('✅ Generated favicon.ico (from favicon.png)');

    // Cleanup temp file
    fs.unlinkSync(tempIcoPng);
    
    console.log('🎉 Icons successfully synchronized with split branding!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
}

generateIcons();
