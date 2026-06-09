import { component$, Slot, useId, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./popover.css?inline";

interface PopoverProps {
	triggerLabel?: string;
}

export const Popover = component$<PopoverProps>(
	({ triggerLabel = "Open Popover" }) => {
		useStylesScoped$(styles);

		// Génère un ID unique et stable entre le serveur (SSR) et le client (Resumability)
		const id = useId();
		// Centralisation de l'ID pour correspondre à votre variable de bouton
		const popoverId = `popover-${id}`;

		return (
			<>
				{/* Bouton qui cible l'identifiant du popover */}
				<button type="button" popovertarget={popoverId}>
					{triggerLabel}
				</button>

				{/* Conteneur du popover natif HTML */}
				<div class="wuu" id={popoverId} popover="auto">
					{/* Intégration du bouton Fermer juste avant le contenu projeté */}
					<button
						type="button"
						popovertarget={popoverId}
						popovertargetaction="hide"
						class="close-btn"
						aria-label="Fermer la fenêtre"
					>
						&times;{" "}
						{/* Entité HTML pour afficher un joli signe de multiplication (croix) */}
					</button>

					{/* Contenu externe injecté par le parent */}
					<Slot />
				</div>
			</>
		);
	},
);