type Allergie =
	| "gluten"
	| "lactose"
	| "arachide"
	| "fruits à coque"
	| "soja"
	| "poisson"
	| "crustacés"
	| "moutarde"
	| "sésame"
	| "sulfites";

type Item = {
	id: number;
	nom: string;
	description: string;
	prix: number;
	allergenes?: Allergie[];
	vegetarien?: boolean;
	src?: string;
};

type Menu = {
	entrees?: Item[];
	plats?: Item[];
	desserts?: Item[];
};

export const menu: Menu = {
	entrees: [
		{
			id: 1,
			nom: "Salade de chèvre chaud",
			description: "Salade verte, toast de chèvre, miel, noix",
			prix: 12.5,
			allergenes: ["gluten", "lactose"],
			vegetarien: true,
			src: "/salade-chevre.jpg",
		},
		{
			id: 2,
			nom: "Velouté de potiron",
			description: "Soupe onctueuse aux graines de courge torréfiées",
			prix: 9.0,
			allergenes: ["lactose"],
			vegetarien: true,
			src: "/veloute-potiron.jpg",
		},
	],
	plats: [
		{
			id: 3,
			nom: "Magret de canard",
			description: "Magret de canard, sauce aux figues, purée maison",
			prix: 24.0,
			allergenes: ["lactose"],
			vegetarien: false,
			src: "/magret-canard.jpg",
		},
		{
			id: 4,
			nom: "Risotto aux champignons",
			description: "Risotto crémeux aux cèpes et parmesan",
			prix: 19.5,
			allergenes: ["lactose"],
			vegetarien: true,
			src: "/risotto-champignons.jpg",
		},
	],
	desserts: [
		{
			id: 5,
			nom: "Fondant au chocolat",
			description: "Cœur coulant au chocolat noir, glace vanille",
			prix: 8.5,
			allergenes: ["gluten", "lactose"],
			vegetarien: true,
			src: "/fondant-chocolat.jpg",
		},
		{
			id: 6,
			nom: "Tarte tatin",
			description: "Tarte aux pommes caramélisées, crème fraîche",
			prix: 7.5,
			allergenes: ["gluten", "lactose"],
			vegetarien: true,
			src: "/tarte-tatin.jpg",
		},
	]
}
