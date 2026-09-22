import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { appThemeColors, appThemes } from "@/theme/app-theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { View } from "react-native";
import "./global.css";
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());

  const scheme = colorScheme ?? "light";

  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <View
          style={[
            appThemes[scheme],
            {
              backgroundColor: appThemeColors[scheme].background,
              flex: 1,
            },
          ]}
        >
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
