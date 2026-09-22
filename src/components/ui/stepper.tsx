import { Minus, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  className = "",
}: StepperProps) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  return (
    <View
      className={`flex-row items-center rounded-2xl bg-input p-1 ${className}`}
    >
      <Pressable
        onPress={handleDecrement}
        className="size-10 items-center justify-center rounded-xl bg-white"
      >
        <Minus size={24} color="#000" />
      </Pressable>

      <View className="flex-1 items-center justify-center min-w-12">
        <Text className="text-xl font-bold text-foreground">{value}</Text>
      </View>

      <Pressable
        onPress={handleIncrement}
        className="size-10 items-center justify-center rounded-xl bg-white"
      >
        <Plus size={24} color="#000" />
      </Pressable>
    </View>
  );
}
