// scripts/generate-i18n.js
import { execSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const LANGS = ["en-US", "fr-FR", "it-IT"];
const ASSETS_DIR = "i18n";
const REQUIRED_ASSETS = ["app", "runtime"];

console.log("🔄 Extraction des clés de traduction...");
execSync("npm run i18n:extract", { stdio: "inherit" });

console.log("📁 Vérification de la structure i18n...");
for (const lang of LANGS) {
	const langDir = join(ASSETS_DIR, lang);
	if (!existsSync(langDir)) mkdirSync(langDir, { recursive: true });

	for (const asset of REQUIRED_ASSETS) {
		const filePath = join(langDir, `${asset}.json`);
		if (!existsSync(filePath)) {
			writeFileSync(filePath, JSON.stringify({}, null, 2));
			console.log(`✅ Créé : ${filePath}`);
		} else {
			// Vérifie que le JSON est valide
			try {
				JSON.parse(readFileSync(filePath, "utf-8"));
			} catch {
				console.error(`❌ JSON invalide : ${filePath}`);
				process.exit(1);
			}
		}
	}
}

console.log("🌍 Fichiers prêts pour traduction externe.");
console.log(
	"💡 Astuce : traduis les valeurs dans i18n/[lang]/app.json, puis lance npm run preview",
);
