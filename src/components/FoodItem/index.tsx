import { component$, useSignal } from "@builder.io/qwik";
import styles from "./main.module.css";
import { PopoverImage } from "./Popover";

export interface FoodItemProps {
	nom: string;
	description: string;
	price: number;
}

export default component$<FoodItemProps>((props) => {
	const _selected = useSignal(false);
	return (
		<div class={styles.menuGroup}>
			<div class={styles.menuItem}>
				<PopoverImage />
				<div class={styles.menuItemText}>
					<h3 class={styles.menuItemHeading}>
						<span class={styles.menuItemName}>{props.nom}</span>
						<span class={styles.menuItemPrice}>${props.price.toFixed(2)}</span>
					</h3>
					<p class={styles.menuItemDescription}>{props.description}</p>
				</div>
			</div>
		</div>
	);
});
