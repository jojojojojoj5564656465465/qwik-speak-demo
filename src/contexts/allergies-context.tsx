import { createContextId, type Signal } from "@builder.io/qwik";
import type { Allergie } from "~/data/newmenu";

export const AllergiesContext = createContextId<Signal<Allergie[]>>(
	"app.allergies-context",
);
console.log("Context créé côté module:", AllergiesContext);