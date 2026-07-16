import { component$ } from "@builder.io/qwik";
// Hook qwik-speak : formate un nombre selon la locale active. Permet d'afficher
// 12,50 € en fr, 12.50 € en en, 12,50 € en es, sans dupliquer la logique Intl.
// IMPORTANT : ne pas confondre avec `useTranslate` (gestion des chaînes).
import { useFormatNumber } from "qwik-speak";
import styles from "./main.module.css";
import { PopoverImage } from "./Popover";

/**
 * Props de la carte d'un plat affichée dans le menu.
 * Le nom et la description arrivent DÉJÀ TRADUITS depuis la route (via le
 * fallback `translation?.name || item.nom`), ce qui explique pourquoi on
 * reçoit des `string` simples ici plutôt qu'un id i18n.
 * `src` est le chemin de l'image (optionnel, fallback géré dans <PopoverImage/>).
 * `color` est exposé par l'API publique mais non utilisé actuellement
 * (réservé pour une future indication visuelle vert/rouge par allergène).
 */
export interface FoodItemProps {
	name: string;
	description: string;
	price: number;
	src?: string;
	color?: "green" | "red";
}

/**
 * <FoodItem/> — carte d'un plat (image + nom + description + prix formaté).
 *
 * Rôle i18n : déléguer à qwik-speak le formatage du prix via useFormatNumber().
 * La locale utilisée pour Intl.NumberFormat est automatiquement celle résolue
 * par Qwik City (segment [lang]) → useQwikSpeak configuré dans root.tsx.
 *
 * BUG IDENTIFIÉ (non corrigé ici, à traiter séparément) :
 * Le 3ème argument `"es-CO"` force la locale de formatage à l'espagnol colombien,
 * indépendamment de la locale route courante (fr / en / es).
 * Devrait être retiré pour laisser qwik-speak décider, OU utilisé avec
 * `useSpeakLocale()` pour respecter la locale utilisateur.
 */
export default component$<FoodItemProps>((props) => {
	// `fn` est un QRL (fonction réactive): elle ne s'exécute que lors du rendu.
	const fn = useFormatNumber();
	return (
		<div class={[styles.menuGroup, styles.bg_ctr]}>
			<div class={styles.menuItem}>
				<PopoverImage src={props.src} />
				<div class={styles.menuItemText}>
					<h3 class={styles.menuItemHeading}>
						<span class={styles.menuItemName}>{props.name}</span>
						<span class={styles.menuItemPrice}>
							{/* Intl.NumberFormat via qwik-speak. Options:
							    - style: "currency" → 12.50 €
							    - currency: "COP"          → pesos colombiens (devrait dépendre de la locale)
							    - "es-CO" en 3e argument    → force UNE locale de formatage (VOIR BUG ci-dessus)
							    Ref: https://qwik-speak-docs.tools-aoa.com/internationalization/use-format-number/ */}
							{fn(props.price, { style: "currency", currency: "COP" }, "es-CO")}
						</span>
					</h3>
					<p class={styles.menuItemDescription}>{props.description}</p>
				</div>
			</div>
		</div>
	);
});
