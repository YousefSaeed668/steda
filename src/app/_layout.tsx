import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { TypographyProvider } from "@/providers/TypographyProvider";
import { appThemeColors, appThemes } from "@/theme/app-theme";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { router, Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import {
  handleHabitReminderResponse,
  syncScheduledHabitNotifications,
} from "@/lib/notifications";
import "./global.css";

function ReminderNotificationObserver() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (Platform.OS === "web") return;

    const handleResponse = async (response: Notifications.NotificationResponse) => {
      const markedDone = await handleHabitReminderResponse(response);

      if (markedDone) {
        await queryClient.invalidateQueries();
      } else {
        const url = response.notification.request.content.data?.url;
        if (typeof url === "string") {
          router.push(url as never);
        }
      }

      Notifications.clearLastNotificationResponse();
    };

    void syncScheduledHabitNotifications();

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) void handleResponse(lastResponse);

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => void handleResponse(response),
    );

    return () => subscription.remove();
  }, [queryClient]);

  return null;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [queryClient] = useState(() => new QueryClient());

  const scheme = colorScheme ?? "light";

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
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
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <TypographyProvider>
          <DatabaseProvider>
            <ReminderNotificationObserver />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: appThemeColors[scheme].background,
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </DatabaseProvider>
        </TypographyProvider>
      </View>
    </QueryClientProvider>
  );
}
