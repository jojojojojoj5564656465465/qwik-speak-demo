import { $, component$, useComputed$, useContext } from "@builder.io/qwik";
import { inlineTranslate, type Translation } from "qwik-speak";
import { AllergiesContextStore } from "~/contexts/allergies-context";
import { $$Allergie, type Allergie } from "~/types/allergies";

type Props = {
	label: Allergie;
};

export default component$((props: Props) => {
	const t = inlineTranslate();
	const _allergiesTranslations = t<Translation>("allergies");

	const labelTranslated = useComputed$(() => {
		
		return _allergiesTranslations[props.label] 
	});
	const allergiesStor = useContext(AllergiesContextStore);

	const toggleAllergie = $((label: Allergie) => {
		if ($$Allergie.parseUnsafe(label)) {
			allergiesStor[label].active = false;
		}
	});

	// Le bouton ne s'affiche que si l'allergène est actif dans le store
	if (!allergiesStor[props.label].active) {
		return null;
	}

	return (
		<button
			type="button"
			onClick$={() => toggleAllergie(props.label)}
			class={[
				"group m-2 flex items-center gap-2 rounded-full px-4 py-2 cursor-pointer",
				"shadow-md transition-all duration-200 ease-in-out",
				"border bg-white border-red-200 hover:bg-red-50 hover:border-red-300",
			]}
		>
			<span class="text-xs font-medium text-red-400 transition-colors duration-200">
				{labelTranslated.value}
			</span>

			<span
				class={[
					"flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
					"bg-red-100 text-red-600 transition-colors duration-200",
					"group-hover:bg-red-200",
				]}
			>
				✕
			</span>
		</button>
	);
});
