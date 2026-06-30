type Menu = {
	id: string;
	name: string;
	description: string;
	price: number;
	src: string;
};

const menu: Menu[] = [
	{
		id: "1",
		name: "Tacos Al Pastor",
		description:
			"Tortillas de maïs garnies de porc mariné, d'ananas, d'oignons et de coriandre fraîche.",
		price: 12.5,
		src: "/pizza.jpg",
	},
	{
		id: "2",
		name: "Burrito Supreme",
		description:
			"Grand tortilla de blé remplie de bœuf haché, riz, haricots noirs, fromage, crème sure et guacamole.",
		price: 14.99,
		src: "/pizza.jpg",
	},
	{
		id: "3",
		name: "Enchiladas Verdes",
		description:
			"Tortillas de maïs farcies au poulet, nappées de sauce verte tomatillo et gratinées au fromage.",
		price: 13.75,
		src: "/pizza.jpg",
	},
	{
		id: "4",
		name: "Quesadillas",
		description:
			"Tortilla pliée garnie de fromage fondu, avec une option de poulet ou de bœuf, servie avec salsa.",
		price: 10.99,
		src: "/pizza.jpg",
	},
	{
		id: "5",
		name: "Guacamole & Chips",
		description:
			"Avocats frais écrasés avec oignons, tomates, jalapeños et citron vert, servis avec des chips de maïs croustillantes.",
		price: 8.5,
		src: "/pizza.jpg",
	},
	{
		id: "6",
		name: "Churros au Chocolat",
		description:
			"Beignets frits saupoudrés de sucre et de cannelle, accompagnés d'une sauce chocolat chaud riche.",
		price: 6.99,
		src: "/pizza.jpg",
	},
];

export default menu;
