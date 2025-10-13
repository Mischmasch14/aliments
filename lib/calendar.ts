import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";

export function monthGrid(date: Date, weekStartsOn: 0|1 = 1) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}
