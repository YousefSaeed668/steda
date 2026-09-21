import { appThemeColors, appThemes } from "@/theme/app-theme";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";
import migrations from "../../drizzle/migrations";

const expoDb = openDatabaseSync("local.db");
export const db = drizzle(expoDb);

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? "light";
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        appThemes[scheme],
        {
          backgroundColor: appThemeColors[scheme].background,
          flex: 1,
        },
      ]}
    >
      <Stack />
    </View>
  );
}
