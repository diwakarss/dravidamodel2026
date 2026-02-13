import { z } from "zod";

export const SourceCategorySchema = z.enum([
  "government",
  "media",
  "reports",
  "other",
]);

export const SourceEntrySchema = z.object({
  id: z.string(),
  name: z.object({
    en: z.string(),
    ta: z.string(),
  }),
  url: z.string().url(),
  description: z.object({
    en: z.string(),
    ta: z.string(),
  }),
  category: SourceCategorySchema,
});

export const SourcesDataSchema = z.object({
  sources: z.array(SourceEntrySchema),
});

export type SourceCategory = z.infer<typeof SourceCategorySchema>;
export type SourceEntry = z.infer<typeof SourceEntrySchema>;
export type SourcesData = z.infer<typeof SourcesDataSchema>;
