// scripts/upload-images.js
// One-time upload of scraped catalogue images to Cloudinary.  (ALREADY DONE —
// all images are on Cloudinary and recorded in scripts/upload-map.json.
// Re-running requires the original image folders, which were deleted.)
// - sha1-hashes every file and uploads each UNIQUE file exactly once
//   (many products share the same picture; identical bytes are uploaded once)
// - resumable: files already recorded in scripts/upload-map.json are skipped
// - concurrency 5, retries 3x per file
//
// Run from backend/:  node scripts/upload-images.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("../utils/cloudinary");

const SOURCE_DIR = path.resolve(__dirname, "../../scarpping/output"); // images were deleted after upload
const MAP_FILE = path.resolve(__dirname, "upload-map.json");
const FOLDER_PREFIX = "uday-traders";
const CONCURRENCY = 5;
const RETRIES = 3;

const walk = (dir, base) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
};

const cloudinaryFolder = (relPath) => {
  const [root, part, brand] = relPath.split("/");
  const kind = root === "images" ? "products" : "catalogue";
  return [FOLDER_PREFIX, kind, brand].join("/");
};

const uploadWithRetry = (buffer, folder, publicId) =>
  new Promise((resolve, reject) => {
    const attempt = async (n) => {
      try {
        const result = await cloudinary.uploader.unsigned_upload(
          `data:image/webp;base64,${buffer.toString("base64")}`,
          "udaytraders_preset",
          {
            folder,
            public_id: publicId,
          }
        );
        resolve(result);
      } catch (err) {
        if (err.http_code === 400 && /already exists/i.test(err.message || "")) {
          resolve({
            secure_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${folder}/${publicId}.webp`,
            public_id: `${folder}/${publicId}`,
          });
          return;
        }
        if (n < RETRIES) {
          const delay = 1000 * Math.pow(2, n - 1);
          console.warn(`  retry ${n}/${RETRIES} after ${delay}ms: ${err.message}`);
          setTimeout(() => attempt(n + 1), delay);
        } else {
          reject(err);
        }
      }
    };
    attempt(1);
  });

const main = async () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.error("Missing Cloudinary credentials in backend/.env");
    process.exit(1);
  }

  const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, "utf-8")) : {};
  const hashToResult = {};
  for (const [file, entry] of Object.entries(map)) hashToResult[entry.sha1] = entry;

  const inPartFolder = (f) => /^\/part-[ab]\/[^/]+\/.+/.test(f.slice(f.indexOf("/")));
  const relFiles = [
    ...walk(path.join(SOURCE_DIR, "images"), SOURCE_DIR).filter(
      (f) => f.endsWith(".webp") && inPartFolder(f)
    ),
    ...walk(path.join(SOURCE_DIR, "catalogue"), SOURCE_DIR).filter(
      (f) => f.endsWith(".webp") && inPartFolder(f)
    ),
  ];

  const pending = relFiles.filter((f) => !map[f]);
  console.log(`Found ${relFiles.length} files, ${relFiles.length - pending.length} already uploaded, ${pending.length} to go`);

  let done = 0;
  let failed = 0;
  const queue = [...pending];

  const saveMap = () => fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));

  const worker = async () => {
    while (queue.length > 0) {
      const rel = queue.shift();
      if (!rel) break;
      const abs = path.join(SOURCE_DIR, rel);
      try {
        const buffer = fs.readFileSync(abs);
        const sha1 = crypto.createHash("sha1").update(buffer).digest("hex");

        let entry = hashToResult[sha1];
        if (!entry) {
          const parts = rel.split("/");
          const ext = path.extname(parts[parts.length - 1]);
          const publicId = path.basename(rel, ext);
          const result = await uploadWithRetry(buffer, cloudinaryFolder(rel), publicId);
          entry = {
            sha1,
            url: result.secure_url,
            public_id: result.public_id,
          };
          hashToResult[sha1] = entry;
        }

        map[rel] = entry;
        done++;
        if (done % 25 === 0) {
          saveMap();
          console.log(`Progress: ${done}/${pending.length} uploaded`);
        }
      } catch (err) {
        failed++;
        console.error(`FAILED: ${rel} — ${err.message}`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  saveMap();

  console.log(`Done. Uploaded/linked ${done} files, ${failed} failed. Map saved to ${MAP_FILE}`);
  if (failed > 0) process.exit(1);
};

main();
