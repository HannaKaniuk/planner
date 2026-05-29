import React from "react";
import { useCalendarView } from "@/store/CalendarViewStore";

type DayProps = {
  dates: Date[];
  children?: React.ReactNode;
};

type WithVisibleDays = {
  visibleDays: number[];
};

export const Day: React.FC<DayProps> = ({ children }) => {
  const { visibleDays } = useCalendarView();

  return (
    <div
      className="relative flex-1 min-w-[600px] sm:min-w-0"
      id="calendar-grid"
    >
      <div className="absolute inset-0 z-0">
        {visibleDays.map((day, i) => (
          <div
            key={day}
            className="absolute top-0 bottom-0 border-r border-indigo-300 dark:border-indigo-100"
            style={{ left: `${(i * 100) / visibleDays.length}%`, width: 0 }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-20">
        {React.Children.map(children, (child) =>
          React.isValidElement<WithVisibleDays>(child)
            ? React.cloneElement(child, { visibleDays })
            : child
        )}
      </div>
    </div>
  );
};
