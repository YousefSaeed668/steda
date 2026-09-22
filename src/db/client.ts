import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

import * as schema from "./schema";

const sqlite = SQLite.openDatabaseSync("habits.db", {
  enableChangeListener: true,
});

export const db = drizzle(sqlite, {
  schema,
});
