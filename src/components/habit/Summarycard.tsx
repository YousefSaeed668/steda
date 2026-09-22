import { Card } from "@/components/ui/card";
import { CalendarSync } from "lucide-react-native";
import { Text, View } from "react-native";

export const SummaryCard = ({
  title,
  primaryColor,
}: {
  title: string;
  primaryColor: string;
}) => {
  return (
    <Card variant="subtle" className="my-6 mb-20 flex-row gap-4 p-4">
      <View className="rounded-full h-12 w-12 bg-primary/15 items-center justify-center">
        <CalendarSync color={primaryColor} size={24} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-bold text-[16px] leading-tight mb-1">
          {title}
        </Text>
        <Text className="text-muted-foreground text-[14px]">
          You'll receive a quiet nudge to keep your streak unbroken. Small
          daily steps lead to lasting mastery.
        </Text>
      </View>
    </Card>
  );
};