const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIcoRaw = require('png-to-ico');
const pngToIco = typeof pngToIcoRaw === 'function' ? pngToIcoRaw : pngToIcoRaw.default;

const pwaSource = path.join(__dirname, 'public', 'assets', 'splash-bg.png');
const logoSource = path.join(__dirname, 'public', 'assets', 'image.png');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Generating PWA icons...');

  try {
    const bg = { r: 0, g: 0, b: 0, alpha: 0 };
    
    // 192x192 (Android/PWA Icon - Using clean logo zoomed in)
    await sharp(logoSource)
      .trim()
      .resize(192, 192, { 
        fit: 'cover', // Zooms in to fill the entire square
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png (from clean logo, Zoomed/Cover)');

    // 512x512 - DISABLED as requested: "leave icon 512 as it is"
    // console.log('⏭️ Skipping icon-512.png');

    // 180x180 (Apple Touch Icon - ZOOMED IN to fill space)
    await sharp(logoSource)
      .trim()
      .resize(180, 180, { 
        fit: 'cover', // Zooms in to fill the entire square
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(path.join(publicDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png (Zoomed/Cover)');

    // Generate temporary 64x64 PNG for ICO conversion
    const tempIcoPng = path.join(publicDir, 'temp-64.png');
    await sharp(logoSource)
      .trim() // Keep trim for favicon but LEAVE AS IS (contain)
      .resize(64, 64, { 
        fit: 'contain', 
        background: bg,
        kernel: 'lanczos3'
      })
      .toFile(tempIcoPng);

    // Convert to true .ico format
    const buf = await pngToIco(tempIcoPng);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf);
    console.log('✅ Generated favicon.ico (Maintained "contain" style)');

    // Cleanup temp file
    fs.unlinkSync(tempIcoPng);
    
    console.log('🎉 All icons successfully generated!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
}

generateIcons();
