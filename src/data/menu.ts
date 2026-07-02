export type Menu = {
	id: string;
	price: number;
	src: string;
};

const menu: Menu[] = [
	{
		id: "1",
		price: 12.5,
		src: "/pizza.jpg",
	},
	{
		id: "2",
		price: 14.99,
		src: "/pizza.jpg",
	},
	{
		id: "3",
		price: 13.75,
		src: "/pizza.jpg",
	},
	{
		id: "4",
		price: 10.99,
		src: "/pizza.jpg",
	},
	{
		id: "5",
		price: 8.5,
		src: "/pizza.jpg",
	},
	{
		id: "6",
		price: 6.99,
		src: "/pizza.jpg",
	},
];

export default menu;
