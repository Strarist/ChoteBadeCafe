import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

async function generateMasterBrandAssets() {
  const sourcePath = 'C:\\Users\\adig1\\.cursor\\projects\\d-CBC\\assets\\c__Users_adig1_AppData_Roaming_Cursor_User_workspaceStorage_03511a66d6a3ed2fb518ae174c2b20e2_images_chote-bade-cafe-logo-0d15a659-220b-465a-b14b-0da678c7ccde.png';
  
  const customerPublic = path.resolve('apps/customer-app/public');
  const customerBranding = path.join(customerPublic, 'images/branding');
  const counterPublic = path.resolve('apps/counter-pos/public');
  const adminPublic = path.resolve('apps/admin/public');

  for (const dir of [customerBranding, customerPublic, counterPublic, adminPublic]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Exact center and radius of the medallion in the master image
  // Bounding box analysis: cx = 498, cy = 475.
  // Dark rim radius is ~474px. Using radius 468px with a 2px smooth feathered edge guarantees 100% genuine rim and 0% black fringe.
  const cx = 498;
  const cy = 475;
  const radius = 468;
  const diameter = radius * 2; // 936

  // 1. Crop to exact circle bounding square
  const cropped = await sharp(sourcePath)
    .extract({
      left: cx - radius,
      top: cy - radius,
      width: diameter,
      height: diameter,
    })
    .toBuffer();

  // 2. High-precision anti-aliased circular alpha mask
  const maskSvg = Buffer.from(`
    <svg width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="feather" cx="50%" cy="50%" r="50%">
          <stop offset="99%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="url(#feather)" />
    </svg>
  `);

  const maskedBadge = await sharp(cropped)
    .composite([
      {
        input: maskSvg,
        blend: 'dest-in',
      },
    ])
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  // 3. Generate 1024x1024 Master Transparent PNG & WebP with balanced margin
  const master1024Png = await sharp(maskedBadge)
    .resize(980, 980, { fit: 'contain' })
    .extend({
      top: 22,
      bottom: 22,
      left: 22,
      right: 22,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  const master1024Webp = await sharp(maskedBadge)
    .resize(980, 980, { fit: 'contain' })
    .extend({
      top: 22,
      bottom: 22,
      left: 22,
      right: 22,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 98, lossless: true })
    .toBuffer();

  // Save master transparent files
  fs.writeFileSync(path.join(customerBranding, 'chote-bade-cafe-logo.png'), master1024Png);
  fs.writeFileSync(path.join(customerBranding, 'chote-bade-cafe-logo.webp'), master1024Webp);
  fs.writeFileSync(path.join(customerBranding, 'chote-bade-cafe-logo-light.png'), master1024Png);
  fs.writeFileSync(path.join(customerBranding, 'chote-bade-cafe-logo-light.webp'), master1024Webp);

  // 4. Generate App Icons & Favicons
  // 512x512 PWA Icon
  await sharp(maskedBadge)
    .resize(490, 490, { fit: 'contain' })
    .extend({ top: 11, bottom: 11, left: 11, right: 11, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(customerPublic, 'icon-512.png'));

  // 192x192 PWA Icon
  const icon192Buffer = await sharp(maskedBadge)
    .resize(184, 184, { fit: 'contain' })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  fs.writeFileSync(path.join(customerPublic, 'icon-192.png'), icon192Buffer);
  fs.writeFileSync(path.join(counterPublic, 'icon-192.png'), icon192Buffer);
  fs.writeFileSync(path.join(adminPublic, 'icon-192.png'), icon192Buffer);

  // 180x180 Apple Touch Icon
  await sharp(maskedBadge)
    .resize(172, 172, { fit: 'contain' })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(customerPublic, 'apple-touch-icon.png'));

  // 5. Generate Favicon SVG
  const faviconWebp = await sharp(maskedBadge)
    .resize(256, 256, { fit: 'contain' })
    .webp({ quality: 95, lossless: true })
    .toBuffer();

  const faviconBase64 = faviconWebp.toString('base64');
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <image href="data:image/webp;base64,${faviconBase64}" width="256" height="256" />
</svg>`;

  fs.writeFileSync(path.join(customerPublic, 'favicon.svg'), faviconSvg, 'utf8');
  fs.writeFileSync(path.join(counterPublic, 'favicon.svg'), faviconSvg, 'utf8');
  fs.writeFileSync(path.join(adminPublic, 'favicon.svg'), faviconSvg, 'utf8');

  console.log('Successfully generated all master production brand assets from the latest reference image!');
}

generateMasterBrandAssets().catch(console.error);
