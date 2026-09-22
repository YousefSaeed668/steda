import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import * as Crypto from "expo-crypto";

export const habitFrequencyValues = [
  "DAILY",
  "SPECIFIC_DAYS",
  "TIMES_PER_WEEK",
] as const;
export type HabitFrequency = (typeof habitFrequencyValues)[number];

export const themeModeValues = ["SYSTEM", "LIGHT", "DARK"] as const;
export type ThemeMode = (typeof themeModeValues)[number];

export const habit = sqliteTable("Habit", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  category: text("category"),

  frequency: text("frequency", { enum: habitFrequencyValues })
    .notNull()
    .default("DAILY"),
  timesPerWeek: integer("timesPerWeek"),

  targetValue: real("targetValue"),
  targetUnit: text("targetUnit"),

  position: integer("position").notNull().default(0),
  archivedAt: integer("archivedAt", { mode: "timestamp_ms" }),

  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const habitScheduleDay = sqliteTable(
  "HabitScheduleDay",
  {
    habitId: text("habitId")
      .notNull()
      .references(() => habit.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(),
  },
  (table) => [primaryKey({ columns: [table.habitId, table.weekday] })],
);

export const habitEntry = sqliteTable(
  "HabitEntry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Crypto.randomUUID()),
    habitId: text("habitId")
      .notNull()
      .references(() => habit.id, { onDelete: "cascade" }),

    dateKey: text("dateKey").notNull(),

    value: real("value").notNull().default(0),

    completedAt: integer("completedAt", { mode: "timestamp_ms" }),
    note: text("note"),

    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("HabitEntry_habitId_dateKey_key").on(
      table.habitId,
      table.dateKey,
    ),
    index("HabitEntry_dateKey_idx").on(table.dateKey),
  ],
);

export const habitReminder = sqliteTable("HabitReminder", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  habitId: text("habitId")
    .notNull()
    .references(() => habit.id, { onDelete: "cascade" }),

  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),

  timeMinutes: integer("timeMinutes").notNull(),

  notificationId: text("notificationId"),
});

export const appSettings = sqliteTable("AppSettings", {
  id: integer("id").primaryKey().default(1),
  theme: text("theme", { enum: themeModeValues }).notNull().default("SYSTEM"),
  weekStartsOn: integer("weekStartsOn").notNull().default(1),
  notificationsEnabled: integer("notificationsEnabled", { mode: "boolean" })
    .notNull()
    .default(true),

  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const habitRelations = relations(habit, ({ many }) => ({
  scheduleDays: many(habitScheduleDay),
  entries: many(habitEntry),
  reminders: many(habitReminder),
}));

export const habitScheduleDayRelations = relations(
  habitScheduleDay,
  ({ one }) => ({
    habit: one(habit, {
      fields: [habitScheduleDay.habitId],
      references: [habit.id],
    }),
  }),
);

export const habitEntryRelations = relations(habitEntry, ({ one }) => ({
  habit: one(habit, {
    fields: [habitEntry.habitId],
    references: [habit.id],
  }),
}));

export const habitReminderRelations = relations(habitReminder, ({ one }) => ({
  habit: one(habit, {
    fields: [habitReminder.habitId],
    references: [habit.id],
  }),
}));
