import SafeAreaScreen from "@/components/ui/safe-area-screen";
import { Link } from "expo-router";
import { Text } from "react-native";

const habits = () => {
  return (
    <SafeAreaScreen>
      <Link href="/habit/create">
        <Text>New Habit</Text>
      </Link>
    </SafeAreaScreen>
  );
};

export default habits;
