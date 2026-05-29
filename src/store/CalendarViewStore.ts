import { useStore } from "@/store/store";

export const useCalendarView = () => {
  const showWeekend = useStore((state) => state.showWeekend);
  const visibleDays = useStore((state) => state.visibleDays);
  const setShowWeekend = useStore((state) => state.setShowWeekend);
  const setVisibleDays = useStore((state) => state.setVisibleDays);

  return { showWeekend, visibleDays, setShowWeekend, setVisibleDays };
};
