import sharp from 'sharp';

async function scanRimContour() {
  const sourcePath = 'C:\\Users\\adig1\\.cursor\\projects\\d-CBC\\assets\\c__Users_adig1_AppData_Roaming_Cursor_User_workspaceStorage_03511a66d6a3ed2fb518ae174c2b20e2_images_chote-bade-cafe-logo-0d15a659-220b-465a-b14b-0da678c7ccde.png';
  const { data, info } = await sharp(sourcePath).raw().toBuffer({ resolveWithObject: true });
  
  const width = info.width;
  const height = info.height;

  // Let's test a range of radii and centers
  // For center (498, 475), let's inspect the pixels at radius 455, 460, 465, 470
  // Specifically at 45 degrees (top-right, top-left, bottom-left, bottom-right corners)
  const angles = [45, 135, 225, 315];
  for (const deg of angles) {
    const rad = (deg * Math.PI) / 180;
    console.log(`\nAngle ${deg} deg:`);
    for (let r = 450; r <= 475; r += 2) {
      const x = Math.round(498 + r * Math.cos(rad));
      const y = Math.round(475 + r * Math.sin(rad));
      const idx = (y * width + x) * 3;
      console.log(`r=${r} (x=${x}, y=${y}): RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
    }
  }
}

scanRimContour();
