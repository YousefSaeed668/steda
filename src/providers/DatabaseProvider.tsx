import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import migrations from "../../drizzle/migrations";
import { db } from "@/db/client";

SplashScreen.preventAutoHideAsync();

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success || error) {
      SplashScreen.hideAsync();
    }
  }, [success, error]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Failed to initialize database.</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return null;
  }

  return children;
}
