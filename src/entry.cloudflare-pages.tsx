import {
  createQwikCity,
  type PlatformCloudflarePages,
} from "@builder.io/qwik-city/middleware/cloudflare-pages";
import qwikCityPlan from "@qwik-city-plan";
import render from "./entry.ssr";

const fetch = createQwikCity({ render, qwikCityPlan });

export type { PlatformCloudflarePages };
export { fetch };
