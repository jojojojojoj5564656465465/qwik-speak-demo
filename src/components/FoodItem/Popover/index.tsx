import { component$, useId, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./popover.css?inline";

interface PopoverImageProps {
	src?: string;
	alt?: string;
}

export const PopoverImage = component$<PopoverImageProps>(
	({
		src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
		alt = "Photo du plat",
	}) => {
		useStylesScoped$(styles);

		const id = useId();
		const popoverId = `popover-IMG-${id}`;

		return (
			<>
				{/* Bouton déclencheur — thumbnail rond, toujours 64px */}
				<button
					type="button"
					class="popover-trigger"
					popovertarget={popoverId}
					aria-label={`Agrandir : ${alt}`}
				>
					<img
						src={src}
						loading="lazy"
						decoding="async"
						width={80}
						height={80}
						alt={alt}
						class="popover-trigger__img"
					/>
				</button>

				{/* Popover natif — la taille du modal suit le ratio réel
				    de l'image (portrait ou paysage), plafonnée par le CSS */}
				<div id={popoverId} popover="auto" class="popover-modal">
					<div class="popover-modal__img-wrap">
						<button
							type="button"
							class="popover-modal__close"
							popovertarget={popoverId}
							popovertargetaction="hide"
							aria-label="Fermer"
						>
							&times;
						</button>

						{/* <img> natif plutôt que <Image> unpic ici :
						    on ne connaît pas les dimensions réelles à l'avance
						    (portrait vs paysage selon le plat), donc on laisse
						    le navigateur utiliser le ratio intrinsèque et le
						    CSS (object-fit: contain + max-width/max-height)
						    fait le travail de contrainte. */}
						{/* <img> natif plutôt que <Image> unpic ici :
						    on ne connaît pas les dimensions réelles à l'avance
						    (portrait vs paysage selon le plat), donc on laisse
						    le navigateur utiliser le ratio intrinsèque et le
						    CSS (object-fit: contain + max-width/max-height)
						    fait le travail de contrainte. width/height servent
						    uniquement à réserver l'espace et éviter le CLS. */}
						<img
							src={src}
							width={600}
							height={400}
							loading="lazy"
							decoding="async"
							alt={alt}
							class="popover-modal__img"
						/>
					</div>
				</div>
			</>
		);
	},
);