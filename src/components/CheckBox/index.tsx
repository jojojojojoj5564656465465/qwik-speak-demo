import { $, component$, useContext } from "@builder.io/qwik";
import { inlineTranslate, type Translation } from "qwik-speak";
import { AllergiesContext } from "~/contexts/allergies-context";
import type { Allergie } from "~/data/newmenu";

/**
 * Item d'un allergène pour la liste déroulante de checkboxes.
 * `label`  : texte affiché à l'utilisateur (traduit via qwik-speak).
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
	const t = inlineTranslate();

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
				{t("allergies.resetButton")}
			</button>
		</div>
	);
});

/**
 * <DietaryForm/> — sous-composant qui énumère les 10 allergènes supportés
 * sous forme de checkboxes. Les labels sont traduits via qwik-speak.
 */
export const DietaryForm = component$(() => {
	const t = inlineTranslate();
	const search = useContext(AllergiesContext);

	// Liste des allergènes proposés à l'utilisateur.
	const items: AllergieItem[] = [
		{ label: "allergies.gluten", value: "gluten" },
		{ label: "allergies.lactose", value: "lactose" },
		{ label: "allergies.arachide", value: "arachide" },
		{ label: "allergies.fruitsÀCoque", value: "fruits à coque" },
		{ label: "allergies.soja", value: "soja" },
		{ label: "allergies.poisson", value: "poisson" },
		{ label: "allergies.crustacés", value: "crustacés" },
		{ label: "allergies.moutarde", value: "moutarde" },
		{ label: "allergies.sésame", value: "sésame" },
		{ label: "allergies.sulfites", value: "sulfites" },
	] as const;

	const toggleAllergie = $((value: Allergie, isChecked: boolean) => {
		if (isChecked) {
			if (!search.value.includes(value)) {
				search.value = [...search.value, value];
			}
		} else {
			search.value = search.value.filter((v) => v !== value);
		}
	});

	return (
		<div>
			<h2 class="text-xl font-bold mb-4">{t("allergies.title")}</h2>
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
							onChange$={(_, currentTarget) => {
								toggleAllergie(item.value, currentTarget.checked);
							}}
							class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
						/>
						<span>{t(item.label)}</span>
					</label>
				))}
			</div>

			<div class="mt-6 p-4 bg-gray-100 rounded">
				<p class="font-medium">{t("allergies.excludedTitle")}</p>
				<p class="text-sm text-gray-700">
					{search.value.length > 0 
						? search.value.map(v => t(`allergies.${v}`)).join(", ")
						: t("allergies.none")
					}
				</p>
			</div>
		</div>)
	});


