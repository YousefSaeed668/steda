import { ToggleGroup } from "@/components/ui/toggle-group";
import { CreateHabitInput } from "@/schemas/create-habit";
import {
  Book,
  Church,
  Droplets,
  Dumbbell,
  Languages,
  SportShoe,
} from "lucide-react-native";
import { Control, Controller } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { Tone } from "./Tone";

export const IconColorPicker = ({
  control,
}: {
  control: Control<CreateHabitInput>;
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row items-center py-1">
        <Controller
          control={control}
          name="icon"
          render={({ field: { onChange, value } }) => (
            <ToggleGroup
              value={value}
              onChange={onChange}
              itemClassName="h-14 w-14 rounded-2xl bg-muted"
              activeItemClassName="bg-primary"
              options={[
                {
                  value: "book",
                  icon: (active) => <Book color={active ? "white" : "gray"} />,
                },
                {
                  value: "water",
                  icon: (active) => (
                    <Droplets color={active ? "white" : "gray"} />
                  ),
                },
                {
                  value: "exercise",
                  icon: (active) => (
                    <SportShoe color={active ? "white" : "gray"} />
                  ),
                },
                {
                  value: "language",
                  icon: (active) => (
                    <Languages color={active ? "white" : "gray"} />
                  ),
                },
                {
                  value: "workout",
                  icon: (active) => (
                    <Dumbbell color={active ? "white" : "gray"} />
                  ),
                },
                {
                  value: "pray",
                  icon: (active) => (
                    <Church color={active ? "white" : "gray"} />
                  ),
                },
              ]}
            />
          )}
        />

        <View className="h-10 w-[1px] bg-input-border mx-4" />

        <Controller
          control={control}
          name="color"
          render={({ field: { onChange, value } }) => (
            <ToggleGroup
              value={value}
              onChange={onChange}
              itemClassName="rounded-full"
              activeItemClassName=""
              options={[
                {
                  value: "#2563eb", 
                  icon: (active) => (
                    <Tone colorClass="bg-blue-600" active={active} />
                  ),
                },
                {
                  value: "#10b981",
                  icon: (active) => (
                    <Tone colorClass="bg-emerald-500" active={active} />
                  ),
                },
                {
                  value: "#f43f5e",
                  icon: (active) => (
                    <Tone colorClass="bg-rose-500" active={active} />
                  ),
                },
                {
                  value: "#f97316",
                  icon: (active) => (
                    <Tone colorClass="bg-orange-500" active={active} />
                  ),
                },
                {
                  value: "#a855f7",
                  icon: (active) => (
                    <Tone colorClass="bg-purple-500" active={active} />
                  ),
                },
                {
                  value: "#facc15",
                  icon: (active) => (
                    <Tone colorClass="bg-yellow-400" active={active} />
                  ),
                },
              ]}
            />
          )}
        />
      </View>
    </ScrollView>
  );
};
