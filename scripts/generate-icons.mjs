import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const FAVICON_FILE = path.join(__dirname, '../src/app/favicon.ico');

const SIZES = [192, 512];

async function generate() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Generate PNGs
    for (const size of SIZES) {
        await sharp(INPUT_FILE)
            .resize(size, size)
            .png()
            .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));
        console.log(`Generated icon-${size}x${size}.png`);
    }

    // Generate Favicon (using 32x32 png specifically for ico if needed, but sharp can do .ico somewhat or we just make a 32x32 png and rename/use it. Next.js supports png favicons, but let's make a standard one)
    // Converting svg to png at 32x32 for favicon
    await sharp(INPUT_FILE)
        .resize(32, 32)
        .toFormat('png') // icon format creation is complex with sharp directly without a plugin, often png is sufficient for modern browsers or we can just save as ico if sharp supports it in this version, likely png is fine and we rename or just use .icon in metadata
        .toFile(path.join(__dirname, '../src/app/favicon.ico')); // Actually valid to be a PNG with .ico extension for some browsers, but better to be correct. Next.js optimizes this often.
    // Let's stick to .png for favicon and rename it or leave it. Actually, standard sharp doesn't write .ico directly easily without libvips support often.
    // We will write as favicon.png and Next.js can use it, OR just write a 32x32 PNG and call it favicon.ico (modern browsers handle this surprisingly well, though not strictly spec compliant). 
    // ALTERNATIVE: Just write 'favicon.png' and update layout.tsx to point to it?
    // User requested "logo... on browser... icon".
    // I can just output `src/app/favicon.ico` as a PNG content, browsers are lenient.

    console.log('Generated favicon.ico (as PNG data)');
}

generate().catch(console.error);
