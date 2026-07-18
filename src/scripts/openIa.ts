import OpenAI from "openai";

//import data from "../data/food.txt";

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

entrees[30]{id,nom,description,prix,allergenes}:
  1,Salade de crudités,"Carottes râpées, betteraves, vinaigrette maison",8.5,""
  2,Soupe de légumes du soleil,"Courgettes, poivrons, tomates, basilic frais",7.5,""
  3,Carpaccio de courgettes,"Courgettes crues en fines tranches, citron, huile d'olive",9,""
  4,Gaspacho andalou,"Soupe froide de tomates, concombres, poivrons",7,""
  5,Salade de quinoa aux herbes,"Quinoa, persil, menthe, citron vert",10,""
  6,Bruschetta tomates basilic,"Pain grillé à l'ail, tomates fraîches, basilic",9.5,gluten
  7,Nems au porc,"Galettes de riz, porc haché, légumes croquants",8,gluten
  8,Salade de chèvre chaud,"Salade verte, toast de chèvre, miel, noix",12.5,lactose
  9,Velouté de potiron,Soupe onctueuse aux graines de courge torréfiées,9,lactose
  10,Tartare de saumon à la crème,"Saumon frais, crème fraîche, ciboulette",14,lactose
  11,Salade thaï au poulet,"Poulet grillé, légumes croquants, sauce cacahuète",11,arachide
  12,Bouchées de crevettes sauce arachide,"Crevettes croustillantes, sauce satay",12,arachide
  13,Salade aux noix et roquefort,"Salade, noix, roquefort, vinaigrette au miel",11.5,fruits à coque
  14,Tartine avocat et amandes,"Pain complet, avocat, effiloché d'amandes",10.5,fruits à coque
  15,Edamams à la fleur de sel,"Fèves de soja vapeur, fleur de sel",7,soja
  16,Rouleaux de printemps au tofu,"Galettes de riz, tofu, légumes, sauce soja",9,soja
  17,Tartare de saumon,"Saumon frais, citron, aneth, câpres",14.5,poisson
  18,Rillettes de thon,"Thon émietté, citron, huile d'olive",9,poisson
  19,Cocktail de crevettes,"Crevettes roses, sauce cocktail, citron",13,crustacés
  20,Soupe de crustacés,"Bisque de crevettes, crustacés variés, croûtons",14,crustacés
  21,Salade de pommes de terre au jambon,"Pommes de terre, jambon, vinaigrette moutardée",10,moutarde
  22,Blinis au saumon fumé,"Blinis, saumon fumé, crème moutardée",12,moutarde
  23,Boulettes de viande au sésame,"Bœuf haché, graines de sésame, sauce sucrée",11,sésame
  24,Salade de concombre au sésame,"Concombre, vinaigre de riz, graines de sésame",8,sésame
  25,Assiette de charcuterie,"Jambon cru, saucisson, coppa",13.5,sulfites
  26,Vinaigre balsamique vieilli,Assortiment de pains et vinaigre balsamique,6,sulfites
  27,Salade complète au saumon,"Saumon, avocat, noix, sauce moutarde",15,poisson|fruits à coque|moutarde
  28,Wok de poulet aux cacahuètes,"Poulet, légumes, arachide, soja, sésame",13,arachide|soja|sésame
  29,Pâté en croûte maison,"Porc, volaille, pistaches, œufs",11,gluten|fruits à coque
  30,Feuilleté aux fruits de mer,"Pâte feuilletée, crevettes, poisson, béchamel",16,gluten|crustacés|poisson|lactose
plats[32]{id,nom,description,prix,allergenes}:
  31,Poulet rôti aux herbes,"Poulet fermier, herbes de Provence, jus au thym",18,""
  32,Steak frites,"Steak de bœuf, frites maison, salade verte",22,""
  33,Filet de bar en croûte de sel,"Filet de bar, gros sel, légumes grillés",28,""
  34,Riz sauté aux légumes,"Riz basmati, légumes variés, épices douces",15,""
  35,Gratin de courgettes au parmesan,"Courgettes, parmesan, chapelure",16,""
  36,Pâtes carbonara,"Spaghetti, lardons, crème, parmesan",17,gluten
  37,Burger maison,"Pain brioché, steak, cheddar, salade, tomate",19,gluten
  38,Pizza margherita,"Sauce tomate, mozzarella, basilic",15,gluten
  39,Magret de canard,"Magret de canard, sauce aux figues, purée maison",24,lactose
  40,Risotto aux champignons,Risotto crémeux aux cèpes et parmesan,19.5,lactose
  41,Gratin dauphinois,"Pommes de terre, crème, ail, noix de muscade",16,lactose
  42,Poulet satay,"Brochettes de poulet, sauce cacahuète, riz",18,arachide
  43,Curry thaï au bœuf,"Bœuf, lait de coco, arachide, légumes",20,arachide
  44,Canard aux noix et miel,"Magret de canard, noix, miel, sauce aigre-douce",25,fruits à coque
  45,Saumon en croûte de pistaches,"Filet de saumon, pistaches, épinards",27,fruits à coque
  46,Tofu grillé sauce teriyaki,"Tofu ferme, sauce soja, riz, légumes",16,soja
  47,Bœuf sauté au soja,"Bœuf, brocolis, carottes, sauce soja",21,soja
  48,Filet de saumon grillé,"Saumon atlantique, beurre citronné, asperges",26,poisson
  49,Lotte au beurre blanc,"Queue de lotte, beurre blanc, riz pilaf",29,poisson
  50,Risotto aux fruits de mer,"Risotto, crevettes, moules, calamars",28,crustacés
  51,Homard grillé,"Homard breton, beurre à l'ail, pommes sautées",45,crustacés
  52,Porc à la moutarde,"Filet mignon, sauce moutarde à l'ancienne, purée",22,moutarde
  53,Rôti de bœuf sauce moutarde,"Rôti de bœuf, sauce moutarde au poivre, légumes",24,moutarde
  54,Poulet au sésame,"Poulet laqué, graines de sésame, riz cantonais",19,sésame
  55,Buddha bowl au sésame,"Quinoa, légumes, tofu, graines de sésame",17,sésame
  56,Côtes d'agneau grillées,"Côtes d'agneau, romarin, légumes grillés",26,sulfites
  57,Cassoulet toulousain,"Haricots blancs, saucisse, confit de canard",22,sulfites
  58,Poulet aux amandes et soja,"Poulet, amandes, sauce soja, riz",20,fruits à coque|soja
  59,Pâtes aux fruits de mer,"Linguine, crevettes, moules, sauce crème",27,gluten|crustacés|lactose
  60,Canard laqué aux cacahuètes,"Magret de canard, sauce cacahuète, sésame",26,arachide|sésame
  61,Burger au saumon fumé,"Pain brioché, saumon fumé, fromage frais",21,gluten|poisson|lactose
  62,Pizza aux fruits de mer,"Pâte à pizza, crevettes, calamars, mozzarella",22,gluten|crustacés|lactose
desserts[29]{id,nom,description,prix,allergenes}:
  63,Sorbet citron,Sorbet rafraîchissant au citron frais,6,""
  64,Salade de fruits frais,Fruits de saison coupés en dés,7,""
  65,Mousse au chocolat noir,"Chocolat noir 70%, œufs, sucre",8,""
  66,Pêche Melba,"Pêche, sorbet framboise, coulis",9,""
  67,Ananas rôti,"Ananas, vanille, sucre de canne",7.5,""
  68,Fondant au chocolat,"Cœur coulant au chocolat noir, glace vanille",8.5,gluten
  69,Tarte tatin,"Tarte aux pommes caramélisées, crème fraîche",7.5,gluten
  70,Crème brûlée,"Crème vanille, caramel croustillant",7,gluten
  71,Île flottante,"Meringue pochée, crème anglaise, caramel",8,lactose
  72,Tiramisu classique,"Mascarpone, café, cacao, biscuits",9,lactose
  73,Panna cotta,"Crème vanille, coulis de fruits rouges",7.5,lactose
  74,Glace à la cacahuète,Glace artisanale à la cacahuète grillée,6.5,arachide
  75,Brownie aux cacahuètes,"Brownie au chocolat, cacahuètes caramélisées",8,arachide
  76,Tarte aux noix de pécan,"Noix de pécan caramélisées, pâte sablée",8.5,fruits à coque
  77,Parfait aux amandes,"Amandes grillées, miel, yaourt",7,fruits à coque
  78,Gâteau aux noisettes,Gâteau moelleux aux noisettes torréfiées,7.5,fruits à coque
  79,Crème dessert au soja,"Crème végétale au soja, vanille",5.5,soja
  80,Mousse au tofu soyeux,"Tofu soyeux, chocolat, sucre",7,soja
  81,Terrine de poisson en gelée,"Terrine de saumon, gelée d'aspic",10,poisson
  82,Biscuit aux crevettes,Biscuit salé-sucré aux crevettes séchées,6,crustacés
  83,Pain d'épices à la moutarde,"Pain d'épices, moutarde douce, miel",6.5,moutarde
  84,Halva au sésame,"Pâte de sésame, miel, pistaches",7,sésame
  85,Cookie au sésame,"Cookie croustillant, graines de sésame noir",5,sésame
  86,Abricots secs caramélisés,"Abricots secs, sucre, vanille",6,sulfites
  87,Gâteau aux fruits confits,"Fruits confits, rhum, pâte sablée",8,sulfites
  88,Tarte aux amandes et chocolat,"Pâte sablée, crème d'amandes, chocolat",9,gluten|fruits à coque|lactose
  89,Crème glacée aux cacahuètes et soja,"Glace soja, cacahuètes, caramel",7.5,arachide|soja
  90,Baklava,"Pâte filo, noix, miel, beurre",8.5,gluten|fruits à coque|lactose
  91,Muffin aux noix et chocolat,"Muffin, noix, pépites de chocolat",6.5,gluten|fruits à coque|lactose

Voici les id à concerver si l'utilisateur à ces demandes  :
"Prix économique (moins de 10€)"[56]: 1,2,3,4,5,6,7,9,11,13,14,15,16,17,18,21,23,24,25,26,29,34,35,38,41,46,55,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Prix premium (plus de 25€)"[12]: 33,44,45,48,49,50,51,56,59,60,61,62
"Plats légers / Healthy"[14]: 1,2,3,4,5,15,16,24,34,46,55,63,64,67
"Plats réconfortants"[12]: 31,32,36,37,39,40,41,42,43,52,53,57
"Cuisine française traditionnelle"[11]: 31,32,39,41,52,53,56,57,69,70,71
"Cuisine asiatique"[15]: 7,11,12,16,23,24,28,42,43,46,47,54,55,58,60
"Cuisine méditerranéenne"[8]: 2,3,4,6,33,38,40,50
"Fruits de mer"[20]: 10,12,17,18,19,20,22,27,30,33,45,48,49,50,51,59,61,62,81,82
"Viandes grillées"[7]: 31,32,39,44,52,53,56
"Pâtes et riz"[9]: 34,36,40,42,47,54,55,58,59
Pizzas[2]: 38,62
Burgers[2]: 37,61
Salades[6]: 1,5,8,11,13,27
"Soupes et veloutés"[4]: 2,4,9,20
"Plats épicés"[6]: 11,12,28,42,43,60
"Plats sucrés-salés"[6]: 8,13,27,44,58,60
"Desserts chocolat"[5]: 65,68,75,88,91
"Desserts fruités"[7]: 63,64,66,67,73,86,87
"Desserts classiques français"[4]: 69,70,71,72
"Glaces et sorbets"[3]: 63,74,89
"Petit budget (moins de 15€ complet)"[56]: 1,2,3,4,5,6,7,9,11,13,14,15,16,17,18,21,23,24,25,26,29,34,35,38,41,46,55,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Menu enfant"[20]: 1,2,3,4,31,32,34,36,37,38,41,63,64,65,66,68,70,72,75,85
"Pour partager"[16]: 7,12,19,20,25,26,29,30,32,33,37,38,50,51,62,90
"Plats du jour recommandés"[7]: 31,33,39,45,49,51,57
"Rapide à préparer"[63]: 1,2,3,4,5,6,7,8,9,11,13,14,15,16,17,18,19,21,23,24,25,26,27,28,29,30,34,35,36,37,38,41,46,55,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Plats gourmands"[20]: 32,36,37,39,40,44,45,49,51,52,53,57,60,61,62,68,72,88,90,91
"Plats végétariens élaborés"[12]: 5,8,13,14,34,35,36,38,40,41,46,55
"Sans agrume (citron, citron vert)"[85]: 1,2,4,6,7,8,9,11,12,13,14,15,16,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans épices"[75]: 1,2,3,4,5,6,8,9,10,13,14,15,17,18,19,20,21,22,25,26,27,29,30,31,32,33,35,36,37,38,39,40,41,44,45,48,49,50,51,52,53,56,57,59,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Riches en protéines"[40]: 7,10,11,12,17,18,19,20,21,22,23,27,28,29,30,31,32,33,36,37,39,42,43,44,45,47,48,49,50,51,52,53,54,56,57,58,59,60,61,62
"Faibles en calories"[14]: 1,2,3,4,5,15,16,24,34,46,55,63,64,67
"Plats sans cuisson"[8]: 1,3,4,5,17,18,24,26
Chaud[53]: 2,6,7,8,9,10,11,12,13,14,16,19,20,21,22,23,25,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62
Froid[12]: 1,3,4,5,15,17,18,24,26,63,64,66
"Pour l'été"[13]: 1,3,4,5,15,16,24,34,46,55,63,64,67
"Pour l'hiver"[14]: 2,9,20,31,35,36,39,40,41,42,43,52,53,57
Brunch[16]: 5,6,8,10,14,17,22,36,37,68,69,70,71,72,88,91
"Apéritif"[10]: 6,7,12,15,19,25,26,29,30,82
"Pour diabétique (sans sucre ajouté)"[45]: 1,2,3,4,7,8,9,10,11,12,13,17,18,19,20,21,22,23,24,25,27,28,29,30,31,32,33,35,39,44,45,47,48,49,50,51,52,53,56,57,58,59,60,61,62
"Sans maïs"[91]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans carotte"[90]: 2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans poivron"[90]: 1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans courgette"[89]: 1,2,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans champignon"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans pomme de terre"[88]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,24,25,26,27,28,29,30,31,33,34,35,36,37,38,39,40,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans riz"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans pain"[80]: 1,2,3,4,5,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,63,64,65,66,67,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,89
"Sans fromage"[63]: 1,2,3,4,5,7,11,12,15,16,17,18,19,20,21,23,24,25,26,28,29,30,31,32,33,34,37,42,43,46,47,48,49,50,51,52,53,54,55,56,57,58,60,63,64,65,66,67,74,75,76,77,78,79,80,81,82,83,84,85,86,87,89
"Sans beurre"[67]: 1,2,3,4,5,6,7,11,12,15,16,17,18,19,20,21,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,42,43,46,47,48,49,50,51,52,53,54,55,56,57,58,60,63,64,65,66,67,74,75,76,77,78,79,80,81,82,83,84,85,86,87,89
"Sans crème"[67]: 1,2,3,4,5,6,7,11,12,15,16,17,18,19,20,21,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,42,43,46,47,48,49,50,51,52,53,54,55,56,57,58,60,63,64,65,66,67,74,75,76,77,78,79,80,81,82,83,84,85,86,87,89
"Sans miel"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans noix"[87]: 1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans amande"[87]: 1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,78,79,80,81,82,83,84,85,86,87,89,90,91
"Sans pistache"[91]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans cacahuète"[82]: 1,2,3,4,5,6,7,8,9,10,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,41,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,61,62,63,64,65,66,67,68,69,70,71,72,73,76,77,78,79,80,81,82,83,84,85,86,87,88,90,91
"Sans sésame"[83]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,56,57,58,59,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,86,87,88,89,90,91
"Sans soja"[81]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,17,18,19,20,21,22,23,24,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,48,49,50,51,52,53,54,56,57,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,81,82,83,84,85,86,87,88,90,91
"Sans œuf"[91]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans lait"[67]: 1,2,3,4,5,6,7,11,12,14,15,16,17,18,19,20,21,23,24,25,26,28,29,30,31,32,33,34,36,37,38,42,43,46,47,48,49,50,51,52,53,54,55,56,57,58,60,63,64,65,66,67,74,75,76,77,78,79,80,81,82,83,84,85,86,87,89
"Sans poisson"[78]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,19,20,21,22,23,24,25,26,28,29,31,32,34,35,36,37,38,39,40,41,42,43,44,46,47,51,52,53,54,55,56,57,58,60,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,82,83,84,85,86,87,88,89,90,91
"Sans crustacé"[83]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,52,53,54,55,56,57,58,60,61,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,83,84,85,86,87,88,89,90,91
"Sans viande rouge"[86]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50,51,54,55,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans volaille"[84]: 1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,32,33,34,35,36,37,38,39,40,41,43,44,45,46,47,48,49,50,51,52,53,56,57,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans canard"[87]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,40,41,42,43,45,46,47,48,49,50,51,52,53,54,55,56,58,59,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans agneau"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans porc"[87]: 1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,24,26,27,28,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans bœuf"[86]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31,33,34,35,36,37,38,39,40,41,42,44,45,46,48,49,50,51,52,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans poulet"[84]: 1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,32,33,34,35,36,37,38,39,40,41,43,44,45,46,47,48,49,50,51,52,53,56,57,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans saumon"[84]: 1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,46,47,49,50,51,52,53,54,55,56,57,58,59,60,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,82,83,84,85,86,87,88,89,90,91
"Sans thon"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans crevette"[84]: 1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,52,53,54,55,56,57,58,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,83,84,85,86,87,88,89,90,91
"Sans moule"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans calamar"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans homard"[90]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans avocat"[89]: 1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans tomate"[85]: 1,2,5,7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans oignon"[91]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans ail"[91]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans citron"[85]: 1,2,4,6,7,8,9,11,12,13,14,15,16,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans basilic"[89]: 1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans persil"[90]: 1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans menthe"[90]: 1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans coriandre"[91]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans aneth"[91]: 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
"Sans ciboulette"[90]: 1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91
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
			console.log("\n📊 Rapport de consommation & Performance :");
			~console.table({
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
