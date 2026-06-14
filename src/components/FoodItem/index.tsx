import { component$, useSignal } from "@builder.io/qwik";
import { useFormatNumber } from "qwik-speak";
import styles from "./main.module.css";
import { PopoverImage } from "./Popover";

export interface FoodItemProps {
	name: string;
	description: string;
	price: number;
	src?: string;
}

export default component$<FoodItemProps>((props) => {
	const fn = useFormatNumber();
	return (
		<div class={styles.menuGroup}>
			<div class={styles.menuItem}>
				<PopoverImage src={props.src} />
				<div class={styles.menuItemText}>
					<h3 class={styles.menuItemHeading}>
						<span class={styles.menuItemName}>{props.name}</span>
						<span class={styles.menuItemPrice}>{fn(props.price, { style: "currency", currency: "COP" }, "es-CO")}</span>
					</h3>
					<p class={styles.menuItemDescription}>{props.description}</p>
				</div>
			</div>
		</div>
	);
});
