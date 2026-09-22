import { habitFrequencyValues } from "@/db/schema";
import { z } from "zod";

export const createHabitSchema = z
  .object({
    name: z
      .string()
      .min(1, "Habit name is required")
      .max(100, "Name is too long"),
    description: z
      .string()
      .max(500, "Description is too long")
      .optional()
      .nullable(),
    icon: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    category: z.string().optional().nullable(),

    frequency: z.enum(habitFrequencyValues),
    timesPerWeek: z.number().int().min(1).max(7).optional().nullable(),

    targetValue: z
      .number()
      .positive("Target value must be positive")
      .optional()
      .nullable(),
    targetUnit: z.string().optional().nullable(),

    scheduleDays: z.array(z.number().int().min(0).max(6)).optional(),

    reminderEnabled: z.boolean(),
    reminderTime: z.number().int().min(0).max(1439),
  })
  .refine(
    (data) => {
      if (data.frequency === "TIMES_PER_WEEK") {
        return data.timesPerWeek != null && data.timesPerWeek > 0;
      }
      return true;
    },
    {
      message: "Times per week is required ",
      path: ["timesPerWeek"],
    },
  )
  .refine(
    (data) => {
      if (data.frequency === "SPECIFIC_DAYS") {
        return data.scheduleDays != null && data.scheduleDays.length > 0;
      }
      return true;
    },
    {
      message:
        "At least one day must be selected ",
      path: ["scheduleDays"],
    },
  );

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
