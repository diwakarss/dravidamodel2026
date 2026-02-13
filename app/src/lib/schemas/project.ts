import { z } from "zod";

// Bilingual text (required for name)
export const BilingualTextSchema = z.object({
  en: z.string(),
  ta: z.string(),
});

// Coordinates (optional)
export const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// Location
export const LocationSchema = z.object({
  district: z.string(),
  city: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
});

// Budget (optional, may be null entirely or have null fields)
export const BudgetSchema = z
  .object({
    crore: z.number().nullable(),
    notes: z.string().nullable().optional(),
  })
  .nullable();

// Timeline
export const TimelineSchema = z.object({
  startYear: z.number().min(1990).max(2030),
  completionYear: z.number().min(1990).max(2040).nullable(),
  completionNotes: z.string().nullable().optional(),
});

// Media
export const MediaSchema = z.object({
  photoUrl: z.string().nullable(),
  photoCaption: z.string().nullable(),
  cmPhotoInitiation: z.string().nullable(),
  cmPhotoCompletion: z.string().nullable(),
});

// Source
export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

// Project types (based on actual data)
export const ProjectTypeSchema = z.enum([
  "Public Transport",
  "Roads/Highways",
  "Water/Sanitation",
  "Education/Health",
  "Power/Utilities",
  "Other",
]);

// Project status
export const ProjectStatusSchema = z.enum(["Completed", "Ongoing", "Planned"]);

// Full Project Schema
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

// Projects collection
export const ProjectsDataSchema = z.object({
  version: z.string(),
  generated: z.string(),
  totalProjects: z.number(),
  checksum: z.string(),
  projects: z.array(ProjectSchema),
});

// Export types
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectsData = z.infer<typeof ProjectsDataSchema>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type BilingualText = z.infer<typeof BilingualTextSchema>;
