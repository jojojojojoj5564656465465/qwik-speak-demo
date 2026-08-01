import { createContextId } from "@builder.io/qwik";
import type { AllergiesStore } from "~/types/allergies";

export const AllergiesContextStore = createContextId<AllergiesStore>(
	"app.allergies-context-store",
);
