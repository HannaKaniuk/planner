import { User } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUsers } from "./useUsers";

const PeopleSection = () => {
	const { users } = useUsers();

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="flex items-center justify-between">
				<span>People</span>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{users.map((user) => (
						<SidebarMenuItem key={user.value}>
							<SidebarMenuButton asChild className="flex-1">
								<div className="flex items-center">
									<User className="mr-2 h-4 w-4" />
									<span>{user.label}</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};

export default PeopleSection;
