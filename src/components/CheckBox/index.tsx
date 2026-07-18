import { $, component$, useContext } from "@builder.io/qwik";
import { AllergiesContext } from "~/contexts/allergies-context";
import type { Allergie } from "~/data/newmenu";

/**
 * Item d'un allergène pour la liste déroulante de checkboxes.
 * `label`  : texte affiché à l'utilisateur (TODO: devrait passer par t() qwik-speak).
 * `value`  : identifiant stable d'allergène (structuellement typé par Allergie).
 */
interface AllergieItem {
	label: string;
	value: Allergie;
}

/**
 * <CheckBox/> — panneau de filtrage du menu par allergènes exclus.
 *
 * Implante la partie "écriture" du filtre : c'est CE composant qui mut
 * `AllergiesContext` (le Signal global fourni par root.tsx via
 * useContextProvider). Aucune logique de filtrage du menu ici : on se contente
 * de cocher/décocher les allergènes, et la route [lang]/index.tsx réagit
 * automatiquement via useResource$ + track(AllergiesContext).
 *
 * Architecture :
 *   root.tsx (provider) ──context──> CheckBox (writer) ──mut──> allergies
 *                                  └──> [lang]/index.tsx (reader) track→ filtre
 *
 * Flux Qwik de la reactivité : aucun setState, aucun re-render manuel.
 * Le Signal<Allergie[]> est réactif finement : seul le useResource$ qui le track
 * est re-exécuté à chaque mutation (Resumability).
 */
export default component$(() => {
	// Récupère le Signal global créé dans root.tsx. ANTIPATTERN Qwik : ne jamais
	// appeler useSignal() ici — on partagerait alors un nouvel état distinct.
	const search = useContext(AllergiesContext);

	// "Réinitialiser" = muter le signal vers []. Comme le Signal est réactif,
	// la route [lang]/index.tsx re-exécutera automatiquement son useResource$.
	const handleReset = $(() => {
		search.value = [];
	});

	return (
		<div class="p-6 max-w-md mx-auto space-y-8">
			{/* DietaryForm : la liste des checkboxes. sépare de la racine pour
			    pouvoir réutiliser DietaryForm ailleurs sans le bouton reset. */}
			<DietaryForm />
			<button
				type="button"
				onClick$={handleReset}
				class="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors"
			>
				Réinitialiser les préférences
			</button>
		</div>
	);
});

/**
 * <DietaryForm/> — sous-composant qui énumère les 10 allergènes supportés
 * sous forme de checkboxes. La liste est en dur côté UI (les labels ne sont
 * PAS encore i18n-mutualisés dans public/i18n/<lang>/*.json — TODO).
 */
export const DietaryForm = component$(() => {
	const search = useContext(AllergiesContext);

	// Liste des allergènes proposés à l'utilisateur. L'ordre importe peu mais
	// doit rester IDENTIQUE entre locales (sinon la position "click-remembering"
	// des utilisateurs bascule d'une langue à l'autre).
	const items: AllergieItem[] = [
		{ label: "Sans Gluten", value: "gluten" },
		{ label: "Lactose", value: "lactose" },
		{ label: "Arachide", value: "arachide" },
		{ label: "Fruits à coque", value: "fruits à coque" },
		{ label: "Soja", value: "soja" },
		{ label: "Poisson", value: "poisson" },
		{ label: "Crustacés", value: "crustacés" },
		{ label: "Moutarde", value: "moutarde" },
		{ label: "Sésame", value: "sésame" },
		{ label: "Sulfites", value: "sulfites" },
	] as const;

	/**
	 * Toggle réactif d'un allergène.
	 * Immutabilité : on recrée un NOUVEAU tableau au lieu de pousser dans
	 * l'ancien (search.value = [...search.value, value]). Qwik compare les
	 * références du signal pour décider des re-exécutions → muter in-place
	 * avec push() ne déclencherait PAS le useResource$ consommateur.
	 */
	const toggleAllergie = $((value: Allergie, isChecked: boolean) => {
		if (isChecked) {
			if (!search.value.includes(value)) {
				// ← nouveau tableau (ref change) → Qwik détecte la mutation.
				search.value = [...search.value, value];
			}
		} else {
			// filter() retourne aussi un nouveau tableau → mutation détectée.
			search.value = search.value.filter((v) => v !== value);
		}
	});

	return (
		<div>
			<h2 class="text-xl font-bold mb-4">Allergènes à exclure</h2>
			<div class="space-y-2">
				{items.map((item) => (
					<label
						key={item.value}
						class="flex items-center space-x-2 cursor-pointer"
					>
						<input
							type="checkbox"
							value={item.value}
							checked={search.value.includes(item.value)}
							// onChange$ reçoit l'événement + le currentTarget typé.
							// On lit `currentTarget.checked` (DOM booléen) plutôt que de
							// retenir un state intermédiaire — pattern Qwik idiomatique.
							onChange$={(_, currentTarget) => {
								toggleAllergie(item.value, currentTarget.checked);
							}}
							class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
						/>
						<span>{item.label}</span>
					</label>
				))}
			</div>

			{/* Aperçu live de la sélection. Utile pour le debug utilisateur et
			    pour donner un feedback immédiat (le signal est réactif, donc ce
			    paragraphe se mets à jour instantanément sans logique supplémentaire). */}
			<div class="mt-6 p-4 bg-gray-100 rounded">
				<p class="font-medium">Allergènes exclus :</p>
				<p class="text-sm text-gray-700">
					{search.value.length > 0 ? search.value.join(", ") : "Aucun"}
				</p>
			</div>
		</div>
	);
});
