import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export interface ToggleGroupOption<T> {
  value: T;
  label?: string;
  icon?: (active: boolean) => ReactNode;
}

interface ToggleGroupProps<T> {
  options: ToggleGroupOption<T>[];
  value: T | T[] | undefined | null;
  onChange: (value: any) => void;
  multiple?: boolean;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  labelClassName?: string;
  activeLabelClassName?: string;
}

export function ToggleGroup<T>({
  options,
  value,
  onChange,
  multiple = false,
  className = "",
  itemClassName = "bg-muted",
  activeItemClassName = "bg-primary",
  labelClassName = "text-foreground",
  activeLabelClassName = "text-primary-foreground",
}: ToggleGroupProps<T>) {
  const isSelected = (val: T) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  const handlePress = (val: T) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(val)) {
        onChange(currentValues.filter((v) => v !== val));
      } else {
        onChange([...currentValues, val]);
      }
    } else {
      onChange(val);
    }
  };

  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {options.map((option, index) => {
        const active = isSelected(option.value);
        return (
          <Pressable
            key={index}
            onPress={() => handlePress(option.value)}
            className={`flex-row items-center justify-center ${itemClassName} ${
              active ? activeItemClassName : ""
            }`}
          >
            {option.icon && (
              <View className={option.label ? "mr-2" : ""}>
                {option.icon(active)}
              </View>
            )}
            {option.label && (
              <Text
                className={`${labelClassName} ${
                  active ? activeLabelClassName : ""
                }`}
              >
                {option.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
