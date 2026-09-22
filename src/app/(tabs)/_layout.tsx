import { useAppThemeColor } from "@/theme/app-theme";
import { Tabs } from "expo-router";
import { ChartSpline, CircleCheck, Settings, Table } from "lucide-react-native";
const _layout = () => {
  const primary = useAppThemeColor("primary");

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: primary }}>
      <Tabs.Screen
        name="index"

        options={{
          title: "Today",
          headerShown: false,
          tabBarIcon: ({ color }) => <CircleCheck color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"

        options={{
          title: "Habits",
          headerShown: false,

          tabBarIcon: ({ color }) => <Table color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          headerShown: false,
          tabBarIcon: ({ color }) => <ChartSpline color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Setiisngs",
          headerShown: false,

          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  );
};

export default _layout;
