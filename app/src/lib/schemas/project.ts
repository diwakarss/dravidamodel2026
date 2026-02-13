import { z } from "zod";

// Helper to validate URLs with safe protocols only (http/https)
const safeUrlSchema = z
  .string()
  .url()
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "URL must use http or https protocol" }
  );

// Optional safe URL (null allowed)
const optionalSafeUrl = z
  .string()
  .nullable()
  .refine(
    (val) => {
      if (val === null) return true;
      try {
        const parsed = new URL(val);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "URL must use http or https protocol" }
  );

export const BilingualTextSchema = z.object({
  en: z.string(),
  ta: z.string(),
});

export const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const LocationSchema = z.object({
  district: z.string(),
  city: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
});

// Budget may be null entirely or have null fields
export const BudgetSchema = z
  .object({
    crore: z.number().nullable(),
    notes: z.string().nullable().optional(),
  })
  .nullable();

export const TimelineSchema = z.object({
  startYear: z.number().min(1990).max(2030),
  completionYear: z.number().min(1990).max(2040).nullable(),
  completionNotes: z.string().nullable().optional(),
});

export const MediaSchema = z.object({
  photoUrl: optionalSafeUrl,
  photoCaption: z.string().nullable(),
  cmPhotoInitiation: optionalSafeUrl,
  cmPhotoCompletion: optionalSafeUrl,
});

export const SourceSchema = z.object({
  title: z.string(),
  url: safeUrlSchema,
});

export const ProjectTypeSchema = z.enum([
  "Public Transport",
  "Roads/Highways",
  "Water/Sanitation",
  "Education/Health",
  "Power/Utilities",
  "Other",
]);

export const ProjectStatusSchema = z.enum(["Completed", "Ongoing", "Planned"]);

export const ProjectSchema = z.object({
  id: z.string(),
  name: BilingualTextSchema,
  location: LocationSchema,
  type: ProjectTypeSchema,
  status: ProjectStatusSchema,
  budget: BudgetSchema,
  timeline: TimelineSchema,
  media: MediaSchema,
  sources: z.array(SourceSchema).min(1),
  notes: z.string().nullable().optional(),
});

export const ProjectsDataSchema = z.object({
  version: z.string(),
  generated: z.string(),
  totalProjects: z.number(),
  checksum: z.string(),
  projects: z.array(ProjectSchema),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectsData = z.infer<typeof ProjectsDataSchema>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type BilingualText = z.infer<typeof BilingualTextSchema>;
