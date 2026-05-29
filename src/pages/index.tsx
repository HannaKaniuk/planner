import type React from "react";
import CalendarIndex from "../Planner/calendar/Index";
import Layout from "../Planner/layout";

const Index: React.FC = () => {
	return (
		<Layout>
			<div className="h-screen flex justify-start w-full">
				<CalendarIndex />
			</div>
		</Layout>
	);
};

export default Index;
