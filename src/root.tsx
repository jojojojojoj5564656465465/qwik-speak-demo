import {
	component$,
	isDev,
	useSignal,
	useContextProvider,
} from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { useQwikSpeak } from "qwik-speak";
import { RouterHead } from "./components/router-head/router-head";
import { AllergiesContext } from "./contexts/allergies-context";
import type { Allergie } from "./data/newmenu";
import { config } from "./speak-config";
import { translationFn } from "./speak-functions";
import "./global.css";

export default component$(() => {
	useQwikSpeak({ config, translationFn });

	const allergies = useSignal<Allergie[]>([]);

	useContextProvider(AllergiesContext, allergies);

	return (
		<QwikCityProvider>
			<head>
				<meta charset="utf-8" />
				{!isDev && (
					<link
						rel="manifest"
						href={`${import.meta.env.BASE_URL}manifest.json`}
					/>
				)}
				<RouterHead />
			</head>
			<body>
				<RouterOutlet />
			</body>
		</QwikCityProvider>
	);
});