import { format } from "date-fns";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CalendarHeaderProps = {
	weekOffset: number;
	onWeekChange: (offset: number) => void;
	dates: Date[];
};

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
	weekOffset,
	onWeekChange,
	dates,
}) => (
	<div className="flex items-center justify-between px-2 sm:px-0 sm:ml-[30%] sm:mr-[30%] m-4 sm:m-12 sticky top-0 z-50 backdrop-blur-sm py-2 sm:py-0 !pt-[20px]">
		<Button
			variant="ghost"
			size="icon"
			onClick={() => onWeekChange(weekOffset - 1)}
			aria-label="Предыдущая неделя"
			className="cursor-pointer text-muted-foreground hover:text-primary touch-manipulation p-1 -ml-1"
		>
			<CircleChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
		</Button>
		<div className="font-medium text-zinc-300 text-sm sm:text-base px-2 text-center">
			{format(dates[0], "dd MMM")} – {format(dates[6], "dd MMM yyyy")}
		</div>
		<Button
			variant="ghost"
			size="icon"
			onClick={() => onWeekChange(weekOffset + 1)}
			aria-label="Следующая неделя"
			className="cursor-pointer text-muted-foreground hover:text-primary touch-manipulation p-1 -mr-1"
		>
			<CircleChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
		</Button>
	</div>
);
