/**
 * Contexte Qwik partagé pour le FILTRE D'ALLERGÈNES.
 *
 * Pourquoi un contexte global plutôt qu'un signal local au composant CheckBox ?
 * Le filtre est défini dans <CheckBox/> (rendu dans layouts/[lang]/layout.tsx)
 * mais c'est la route [lang]/index.tsx qui CONSOMME la liste des allergènes
 * exclus pour filtrer le menu. Le contexte Qwik est le mécanisme officiel
 * pour partager un état réactif entre composants non-parent/enfant direct.
 *
 * Type porté : Signal<Allergie[]> — un Signal (et non un tableau simple) car :
 *   - permet la reactivité fine (Qwik re-exécute uniquement ce qui track ce signal)
 *   - compatible avec useContextProvider côté root.tsx et useContext côté enfants
 *
 * Le Provider est instancié une fois pour toutes dans src/root.tsx (#allergies = useSignal([]))
 * afin que l'état survive aux changements de route (layout.tsx ↔ index.tsx ↔ about.tsx).
 *
 * Documentation Qwik sur les contextes :
 * https://qwik.dev/docs/components/context/
 */
import { createContextId, type Signal } from "@builder.io/qwik";
import type { Allergie } from "~/data/newmenu";

export const AllergiesContext = createContextId<Signal<Allergie[]>>(
	"app.allergies-context",
);
