import PeopleSection from "@/Planner/sidebar/PeopleSection";
import ProjectSection from "@/Planner/sidebar/ProjectSection";

import { Sidebar, SidebarContent } from "./ui/sidebar";

const AppSidebar = () => {
	return (
		<Sidebar>
			<SidebarContent>
				<ProjectSection />
				<PeopleSection />
			</SidebarContent>
		</Sidebar>
	);
};

export default AppSidebar;
