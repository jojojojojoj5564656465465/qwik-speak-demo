import OpenAI from "openai";
import data from "../data/food.txt";


if (!process.env.NVIDIA_API_KEY) {
	console.error(
		"❌ Erreur : La variable NVIDIA_API_KEY n'est pas détectée dans votre .env",
	);
	process.exit(1);
}

const openai = new OpenAI({
	timeout: 15000,
	apiKey: process.env.NVIDIA_API_KEY,
	baseURL: "https://integrate.api.nvidia.com/v1",
});

export default async (x: string): Promise<string> => {
	try {
		console.log("🚀 Envoi de la requête déterministe à NVIDIA...");

		// ⏱️ Méthode 1 : Démarrage du console.time
		console.time("⏱️ Durée brute (console.time)");

		// ⏱️ Méthode 2 : Capture du timestamp précis pour le tableau
		const completetionStart = performance.now();

		const response = await openai.chat.completions.create({
			model: "z-ai/glm-5.2",
			max_tokens: 100,
			temperature: 0.3,
			//seed: 42,
			stream: false,
			messages: [
				{
					role: "system",
					content: `Tu es un assistant qui aide à filtrer un menu de restaurant. 
Tu reçois une requête utilisateur et tu dois retourner UNIQUEMENT la liste des IDs des plats qui CORRESPONDENT à cette requête, séparés par des virgules.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT avec des nombres séparés par des virgules (ex: "1,3,5")
2. Si AUCUN plat ne correspond, retourne "0"
3. Ne retourne JAMAIS de texte explicatif
4. Respecte les régimes alimentaires mentionnés (végétarien, sans gluten, etc.)
5. Priorise les plats qui contiennent TOUS les ingrédients demandés

voici le menu au format Toon:
${data}

Voici les id à concerver si l'utilisateur à ces demandes  :
"Enfant (sans allergie particulière)"[6]: 1,2,3,4,5,6
"Diabétique (sucre, glucides)"[2]: 1,5
"Allergie au gluten"[2]: 1,5
"Allergie au lait / produits laitiers"[2]: 1,5
"Allergie à l’arachide"[6]: 1,2,3,4,5,6
"Allergie aux fruits à coque"[6]: 1,2,3,4,5,6
"Allergie au soja"[6]: 1,2,3,4,5,6
"Allergie au poisson"[6]: 1,2,3,4,5,6
"Allergie aux crustacés"[6]: 1,2,3,4,5,6
"Allergie à la moutarde"[6]: 1,2,3,4,5,6
"Allergie au sésame"[6]: 1,2,3,4,5,6
"Allergie aux sulfites"[6]: 1,2,3,4,5,6
"Végétarien (sans viande)"[3]: 4,5,6
"Végétalien (sans produit animal)"[1]: 5
"Sans œuf"[6]: 1,2,3,4,5,6
"Sans porc"[5]: 2,3,4,5,6
"Sans bœuf"[5]: 1,3,4,5,6
"Sans poulet"[5]: 1,2,4,5,6
"Sans ananas"[5]: 2,3,4,5,6
"Sans jalapeños"[5]: 1,2,3,4,6
`,
				},

				{
					role: "user",
					content: x,
				},
			],
		});

		// ⏱️ Fin des mesures dès que la réponse arrive
		const completionEnd = performance.now();
		console.log("\n");
		console.timeEnd("⏱️ Durée brute (console.time)"); // Affiche directement ex: "⏱️ Durée brute (console.time): 450ms"

		const answer = response.choices[0]?.message?.content?.trim();
		const durationInSeconds = (
			(completionEnd - completetionStart) /
			1000
		).toFixed(2);

		console.log("\n✨ Réponse reçue :");
		console.log(answer);

		// 📊 Affichage des données d'usage ET de temps sous forme de tableau
		if (response.usage) {
			console.log("\n📊 Rapport de consommation & Performance :");~

			console.table({
				"Tokens d'entrée (Prompt)": response.usage.prompt_tokens,
				"Tokens de sortie (Completion)": response.usage.completion_tokens,
				"Total des Tokens": response.usage.total_tokens,
				"Temps de réponse de l'API": `${durationInSeconds} secondes`, // 🔥 Ajouté au tableau
			});
		}
		return answer || "0";
	} catch (error) {
		console.error("❌ Une erreur est survenue :", error);
		return "0";
	}
};
