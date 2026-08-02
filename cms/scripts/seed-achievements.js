// Seeds the 2025-2026 competition results into the achievement collection.
// Safe to re-run — each achievement is skipped individually if its name already exists.
const { createStrapi } = require("@strapi/strapi");
const path = require("node:path");
const fs = require("node:fs/promises");
const os = require("node:os");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadRemoteImage(strapi, url, filename, alt, attempt = 1) {
  const res = await fetch(url, {
    headers: { "User-Agent": "GrobotsSeedBot/1.0 (contact: grobotsclub@gmail.com)" },
  });
  if (!res.ok) {
    if (res.status === 429 && attempt <= 3) {
      await sleep(2000 * attempt);
      return uploadRemoteImage(strapi, url, filename, alt, attempt + 1);
    }
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "grobots-seed-"));
  const tmpPath = path.join(tmpDir, filename);
  await fs.writeFile(tmpPath, buf);
  try {
    const [uploaded] = await strapi
      .plugin("upload")
      .service("upload")
      .upload({
        data: { fileInfo: { alternativeText: alt || "" } },
        files: {
          filepath: tmpPath,
          originalFilename: filename,
          mimetype: "image/jpeg",
          size: buf.length,
        },
      });
    return uploaded;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function publish(strapi, uid, documentId) {
  await strapi.documents(uid).publish({ documentId });
}

// ---------------------------------------------------------------------------
// Content
//
// Multiple wins at the same fest are merged into one achievement record with
// several `results` entries, matching how the achievement schema models it.
// Images are real, freely-licensed photos from Wikimedia Commons, fetched via
// the stable Special:FilePath redirect so no internal hash path is guessed.

const WIKI = "https://commons.wikimedia.org/wiki/Special:FilePath/";

const ACHIEVEMENTS = [
  {
    name: "Techkriti 2026",
    location: "IIT Kanpur",
    year: 2026,
    results: [{ event: "Robo War", category: "15kg", position: 1 }],
    image: `${WIKI}Robot_Wars_Carbide.jpg`,
  },
  {
    name: "Prometeo 2026",
    location: "IIT Jodhpur",
    year: 2026,
    results: [{ event: "Robo War", category: "30kg", position: 1 }],
    image: `${WIKI}Dantomkia_Robot_Wars.jpg`,
  },
  {
    name: "Technex 2026",
    location: "IIT (BHU) Varanasi",
    year: 2026,
    results: [
      { event: "Robo War", category: "8kg", position: 1 },
      { event: "Drone Competition", category: null, position: 1 },
    ],
    image: `${WIKI}Qav250-rtf-g10-built-front%281%29.jpg`,
  },
  {
    name: "Nimbus 2026",
    location: "NIT Hamirpur",
    year: 2026,
    results: [{ event: "Robo War", category: "15kg", position: 1 }],
    image: `${WIKI}Robot_Wars_Apollo.jpg`,
  },
  {
    name: "Technoxian World Cup 2025",
    location: null,
    year: 2025,
    results: [{ event: "Robo War", category: "30kg", position: 2 }],
    image: `${WIKI}Kan-Opener_Robot_Wars.jpg`,
  },
  {
    name: "Concetto 2025",
    location: "IIT (ISM) Dhanbad",
    year: 2025,
    results: [
      { event: "Robo War", category: "15kg", position: 2 },
      { event: "Robo War", category: "8kg", position: 2 },
    ],
    image: `${WIKI}Robot_Wars_Arena.jpg`,
  },
  {
    name: "Infotsav 2025",
    location: "IIITM Gwalior",
    year: 2025,
    results: [{ event: "Robo War", category: "8kg", position: 1 }],
    image: `${WIKI}Dantomkia_Robot_Wars_%281%29.jpg`,
  },
  {
    name: "Techfest 2025",
    location: "IIT Bombay",
    year: 2025,
    // Participation only — no placement, so no results entries (position is
    // a required field on the result component and can't be left blank).
    results: [],
    image: `${WIKI}Technoholix_Crowd_at_Techfest%2C_IIT_Bombay.jpg`,
  },
];

// ---------------------------------------------------------------------------

async function seed() {
  const strapi = createStrapi({ appDir: process.cwd(), distDir: path.join(process.cwd(), "dist") });
  await strapi.load();

  try {
    await seedAchievements(strapi);
    console.log("[seed-achievements] Done.");
  } finally {
    await strapi.destroy();
  }
}

async function seedAchievements(strapi) {
  const uid = "api::achievement.achievement";

  let created = 0;
  for (const a of ACHIEVEMENTS) {
    const existing = await strapi.documents(uid).findFirst({ filters: { name: a.name } });
    if (existing) {
      console.log(`[seed-achievements] "${a.name}" already exists, skipping`);
      continue;
    }

    const { image: imageUrl, ...rest } = a;
    let imageId;
    try {
      console.log(`[seed-achievements] uploading image for "${a.name}"...`);
      const filename = decodeURIComponent(imageUrl.split("/").pop());
      const uploaded = await uploadRemoteImage(strapi, imageUrl, filename, a.name);
      imageId = uploaded.id;
    } catch (err) {
      console.warn(`[seed-achievements] image upload failed for "${a.name}": ${err.message}`);
    }
    await sleep(500);

    const doc = await strapi.documents(uid).create({ data: { ...rest, image: imageId } });
    await publish(strapi, uid, doc.documentId);
    created += 1;
  }
  console.log(`[seed-achievements] ${created} achievements created`);
}

seed().catch((err) => {
  console.error("[seed-achievements] failed:", err);
  process.exit(1);
});
