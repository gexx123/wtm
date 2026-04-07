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
  console.log('Generating PWA icons with Exact Brand Green (#2c4e30)...');

  try {
    // The EXACT University Green provided by the user: #2c4e30
    const bgGreen = { r: 44, g: 78, b: 48, alpha: 1 };
    
    /**
     * Function to generate a SOLID zoomed-in logo icon
     */
    const generateZoomedLogo = async (targetSize, outputFile) => {
      await sharp(iconSource)
        .trim() // Cut away the huge green background to find the "MU"
        .resize(Math.round(targetSize * 0.85), Math.round(targetSize * 0.85), { 
          fit: 'contain', 
          background: bgGreen // Start with exact solid green immediately
        })
        .extend({
          top: Math.round(targetSize * 0.075),
          bottom: Math.round(targetSize * 0.075),
          left: Math.round(targetSize * 0.075),
          right: Math.round(targetSize * 0.075),
          background: bgGreen // Keep the same exact green for margins
        })
        .flatten({ background: bgGreen }) // FINAL Hardening for solid finish
        .toFile(outputFile);
    };

    // 1. Android/PWA Icon (192x192 - Zoomed "MU" on #2c4e30)
    await generateZoomedLogo(192, path.join(publicDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png (Exact Brand Color)');

    // 2. Standard Splash Icon (512x512 - Keep White for Splash)
    await sharp(splashSource)
      .trim()
      .resize(512, 512, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png (Mody Splash)');

    // 3. Maskable Splash Icon (512x512)
    await sharp(splashSource)
      .trim()
      .resize(Math.round(512 * 0.8), Math.round(512 * 0.8), { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      .extend({
        top: Math.round(512 * 0.1),
        bottom: Math.round(512 * 0.1),
        left: Math.round(512 * 0.1),
        right: Math.round(512 * 0.1),
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toFile(path.join(publicDir, 'icon-maskable-512.png'));
    console.log('✅ Generated icon-maskable-512.png (Mody Splash)');

    // 4. Apple Touch Icon (180x180 - Zoomed "MU" on #2c4e30)
    await generateZoomedLogo(180, path.join(publicDir, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png (Exact Brand Color)');

    // 5. Favicon ICO (64x64 - Zoomed "MU" on #2c4e30)
    const tempIcoPng = path.join(publicDir, 'temp-64.png');
    await generateZoomedLogo(64, tempIcoPng);
    const buf = await pngToIco(tempIcoPng);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf);
    fs.unlinkSync(tempIcoPng);
    console.log('✅ Generated favicon.ico (Exact Brand Color)');
    
    console.log('🎉 Brand Perfected: Using exact color #2c4e30!');
  } catch (err) {
    console.error('❌ Error generating icons:', err);
  }
}

generateIcons();
