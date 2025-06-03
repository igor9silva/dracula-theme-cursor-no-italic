const fs = require("node:fs");
const path = require("node:path");
const generate = require("./generate");

const SRC_DIR = path.join(__dirname, "..", "src");
const THEME_DIR = path.join(__dirname, "..", "theme");
const ROOT_DIR = process.cwd();

(async () => {
  console.log("\n🛠  Starting theme generation process.");

  if (!fs.existsSync(THEME_DIR)) {
    fs.mkdirSync(THEME_DIR);
    console.log(`📁 Created themes directory at: ${THEME_DIR}.`);
  } else {
    console.log(`📁 Themes directory already exists at: ${THEME_DIR}.`);
  }

  const files = await fs.promises.readdir(SRC_DIR);
  const ymlFiles = files.filter((file) => file.endsWith(".yml"));
  console.log(`🔍 Found ${ymlFiles.length} YAML file(s) in: ${SRC_DIR}.`);

  const themePromises = ymlFiles.map(async (file) => {
    const themeName = path.basename(file, ".yml");
    const themeFileName = `${themeName}.json`;
    const { base } = await generate(themeName);

    const destPath = path.join(THEME_DIR, themeFileName);
    await fs.promises.writeFile(destPath, JSON.stringify(base, null, 4));
    console.log(`✅ Generated theme file: ${themeFileName}.`);
  });

  const rootFiles = await fs.promises.readdir(ROOT_DIR);
  const readmeRaw = rootFiles.find((f) => f.toLowerCase() === "readme.md");

  if (readmeRaw && readmeRaw !== "README.md") {
    console.log(`✏️  Renaming ${readmeRaw} → README.md for consistency.`);
    await fs.promises.rename(
      path.join(ROOT_DIR, readmeRaw),
      path.join(ROOT_DIR, "README.md"),
    );
  } else if (!readmeRaw) {
    console.warn("⚠️  No README.md found in project root.");
  } else {
    console.log("📄 README.md is correctly named.");
  }

  if (readmeRaw) {
    const srcReadme = path.join(ROOT_DIR, "README.md");
    const destReadme = path.join(THEME_DIR, "README.md");
    await fs.promises.copyFile(srcReadme, destReadme);
    console.log(`📄 Copied README.md to: ${THEME_DIR}.`);
  }

  await Promise.all(themePromises);
  console.log("🎉 All themes generated and README included successfully!\n");
})().catch((error) => {
  console.error("❌ Error during theme generation:", error, "\n");
  process.exit(1);
});
