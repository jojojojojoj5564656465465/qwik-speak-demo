import { component$, useId, useStylesScoped$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import styles from "./popover.css?inline";

interface PopoverImageProps {
	src?: string;
}

export const PopoverImage = component$<PopoverImageProps>(
	({
		src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
	}) => {
		useStylesScoped$(styles);

		// Génère un ID unique et stable entre le serveur (SSR) et le client (Resumability)
		const id = useId();
		// Centralisation de l'ID pour correspondre à votre variable de bouton
		const popoverId = `popover-IMG-${id}`;

		return (
			<>
				{/* Bouton qui cible l'identifiant du popover */}
				<button type="button" popovertarget={popoverId}>
					<Image
						src={src}
						layout="constrained"
						width={80}
						height={80}
						alt="pasta"
						class="menuItemImage"
					/>
				</button>

				{/* Conteneur du popover natif HTML */}
				<div class="max-inline-size-mobile" id={popoverId} popover="auto">
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
					<Image
						src={src}
						layout="constrained"
						width={350}
						height={450}
						alt="pasta"
						
					/>
				</div>
			</>
		);
	},
);
