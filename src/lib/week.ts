export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const weekdayInitials = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function getOrderedWeekdays(weekStartsOn: WeekStartsOn) {
  return Array.from({ length: 7 }, (_, index) => {
    const weekday = (weekStartsOn + index) % 7;

    return {
      initial: weekdayInitials[weekday],
      name: weekdayNames[weekday],
      weekday,
    };
  });
}

export function sortWeekdaysByWeekStart(
  weekdays: number[],
  weekStartsOn: WeekStartsOn,
) {
  return [...weekdays].sort(
    (left, right) =>
      (left - weekStartsOn + 7) % 7 -
      ((right - weekStartsOn + 7) % 7),
  );
}
