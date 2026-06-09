import { component$ } from "@builder.io/qwik";
import { Popover } from "./Popover"; // Ajustez le chemin d'import

export default component$(() => {
	return (
		<Popover triggerLabel="Cliquez-moi ! popover natif">
			{/* LE BOUTON FERMER (Intégré à l'intérieur du popover via le <Slot />) */}
		
			<h3>Mon Popover Natif</h3>
			<p>Ce contenu est injecté directement à la place du composant Slot.</p>
		</Popover>
	);
});