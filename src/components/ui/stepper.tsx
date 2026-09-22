import { Minus, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  targetValue?: number;
  unit?: string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  className = "",
  targetValue,
  unit = "",
}: StepperProps) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    const maxValue = targetValue || max;

    if (value + step <= maxValue) {
      onChange(value + step);
    }
  };

  const isAtMin = value <= min;
  const isAtMax = value >= (targetValue || max);

  return (
    <View
      className={`flex-row items-center justify-between rounded-2xl bg-card p-2 border border-border/50 ${className}`}
    >
      <Pressable
        onPress={handleDecrement}
        disabled={isAtMin}
        className={`size-10 items-center justify-center rounded-xl bg-muted active:opacity-70 ${
          isAtMin ? "opacity-40" : ""
        }`}
      >
        <Minus
          size={20}
          className={` ${isAtMin ? "text-muted-foreground" : "text-foreground"}`}
        />
      </Pressable>

      <View className="flex-1 flex-row items-baseline justify-center px-2">
        <Text className="text-xl font-bold text-foreground">{value}</Text>

        {targetValue !== undefined && (
          <Text className="text-base text-muted-foreground ml-1 font-medium">
            / {targetValue} {unit}
          </Text>
        )}
      </View>

      <Pressable
        onPress={handleIncrement}
        disabled={isAtMax}
        className={`size-10 items-center justify-center rounded-xl bg-muted active:opacity-70 ${
          isAtMax ? "opacity-40" : ""
        }`}
      >
        <Plus
          size={20}
          className={` ${isAtMax ? "text-muted-foreground" : "text-foreground"}`}
        />
      </Pressable>
    </View>
  );
}
