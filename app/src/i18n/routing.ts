import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ta", "en"],
  defaultLocale: "ta",
});

export type Locale = (typeof routing.locales)[number];
