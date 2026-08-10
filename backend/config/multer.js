import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists at startup
const uploadDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.error('Could not create uploads dir:', e.message);
}

/**
 * Save a base64 image string to the uploads folder.
 * @param {string} base64String - e.g. "data:image/jpeg;base64,/9j/4AAQ..."
 * @param {string} fieldname - used in filename prefix
 * @returns {string} filename of the saved file
 */
export function saveBase64Image(base64String, fieldname = 'image') {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid base64 image: empty or wrong type');
  }

  // Trim any whitespace / newlines
  const trimmed = base64String.trim();

  // Extract header and data – use indexOf for reliability on long strings
  const commaIdx = trimmed.indexOf(',');
  if (commaIdx === -1 || !trimmed.startsWith('data:')) {
    throw new Error('Invalid base64 image format – missing data: header');
  }

  const header = trimmed.substring(0, commaIdx);   // e.g. "data:image/jpeg;base64"
  const base64Data = trimmed.substring(commaIdx + 1); // everything after the comma

  // Derive extension from mime type
  const mimeMatch = header.match(/data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const ext = mimeType.split('/')[1]
    .replace('jpeg', 'jpg')
    .replace('svg+xml', 'svg')
    .split(';')[0]; // strip any trailing ;charset etc.

  const filename = `${fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  // Write the file
  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  console.log(`[upload] Saved image: ${filename} (${Math.round(base64Data.length * 0.75 / 1024)}KB)`);

  return filename;
}

export default { saveBase64Image };
