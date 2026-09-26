import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { appThemeColors, appThemes } from "@/theme/app-theme";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
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
  const [queryClient] = useState(() => new QueryClient());

  const scheme = colorScheme ?? "light";

  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <ReminderNotificationObserver />
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
