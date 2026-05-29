"use client";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "../components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="w-[100%]">
				<div className="flex items-center gap-2 p-2 sm:p-2">
					<SidebarTrigger />
				</div>
				{children}
			</main>
			<Toaster
				richColors
				position="top-center"
				closeButton
				toastOptions={{
					style: {
						borderRadius: "12px",
						fontSize: "14px",
						fontWeight: 500,
						maxWidth: "calc(100vw - 2rem)",
					},
				}}
			/>
		</SidebarProvider>
	);
}
