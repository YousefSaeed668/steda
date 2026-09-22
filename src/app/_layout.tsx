import "./global.css";
import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { appThemeColors, appThemes } from "@/theme/app-theme";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { View } from "react-native";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? "light";

  return (
    <DatabaseProvider>
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
    </DatabaseProvider>
  );
}
