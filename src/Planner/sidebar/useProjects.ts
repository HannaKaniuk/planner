import { useState } from "react";
import { useProjectsStore } from "@/store/projectsStore";

export type Project = { title: string; url: string };

export const useProjects = () => {
  const storeProjects = useProjectsStore((state) => state.projects);
  const addProjectStore = useProjectsStore((state) => state.addProject);
  const removeProjectStore = useProjectsStore((state) => state.removeProject);

  const projects = storeProjects.map((p) => ({
    title: p.label,
    url: "#",
  }));

  const [newProjectName, setNewProjectName] = useState("");
  const [open, setOpen] = useState(false);

  const addProject = async () => {
    if (!newProjectName.trim()) return;
    await addProjectStore(newProjectName);
    setNewProjectName("");
    setOpen(false);
  };

  const deleteProject = (title: string) => {
    const project = storeProjects.find((p) => p.label === title);
    if (project) {
      void removeProjectStore(project.value);
    }
  };

  return {
    projects,
    newProjectName,
    setNewProjectName,
    open,
    setOpen,
    addProject,
    deleteProject,
  };
};
