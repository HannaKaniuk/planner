import { Home, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProjects } from "./useProjects";

const ProjectSection = () => {
	const {
		projects,
		newProjectName,
		setNewProjectName,
		open,
		setOpen,
		addProject,
		deleteProject,
	} = useProjects();

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="flex items-center justify-between">
				<span>Projects</span>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="sm">
							<Plus className="w-4 h-4" />
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Добавить проект</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<Label htmlFor="name">Название проекта</Label>
							<Input
								id="name"
								value={newProjectName}
								onChange={(e) => setNewProjectName(e.target.value)}
								placeholder="Введите название"
							/>
						</div>
						<DialogFooter>
							<Button onClick={addProject}>Добавить</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{projects.map((project) => (
						<SidebarMenuItem key={project.title}>
							<div className="flex items-center justify-between w-full">
								<SidebarMenuButton asChild className="flex-1">
									<a href={project.url} className="flex items-center">
										<Home className="mr-2 h-4 w-4" />
										<span>{project.title}</span>
									</a>
								</SidebarMenuButton>
								<Button
									onClick={() => deleteProject(project.title)}
									variant="ghost"
									size="icon"
									className="ml-2 hover:bg-muted transition-colors"
								>
									<X className="w-4 h-4" />
								</Button>
							</div>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};

export default ProjectSection;
