"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SyncResponse } from "@/pages/api/integrations/clickup/vacations.types";
import { useStore } from "@/store/store";
import { useUsersStore } from "@/store/usersStore";

type ClickUpSyncButtonProps = {
	roomId?: string | null;
	autoSyncKey?: number;
};

export default function ClickUpSyncButton({
	roomId,
	autoSyncKey = 0,
}: ClickUpSyncButtonProps) {
	const [isImportingVacations, setIsImportingVacations] = useState(false);
	const prevAutoSyncKeyRef = useRef(autoSyncKey);

	const syncVacations = useCallback(
		async (options?: { silent?: boolean; force?: boolean }) => {
			setIsImportingVacations(true);
			try {
				const shouldForce = options?.force ?? true;
				const roomQuery = roomId?.trim()
					? `?roomId=${encodeURIComponent(roomId)}`
					: "";
				const forceQuery = shouldForce ? `${roomQuery ? "&" : "?"}force=1` : "";
				const response = await fetch(
					`/api/integrations/clickup/vacations${roomQuery}${forceQuery}`,
					{ credentials: "include" },
				);

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(
						errorText || "Не удалось загрузить отпуска из ClickUp",
					);
				}

				const data = (await response.json()) as SyncResponse;
				if (!data.synced) {
					await Promise.all([
						useUsersStore.getState().loadUsers(roomId || null),
						useStore.getState().loadEvents(roomId || null),
					]);
					if (!options?.silent && !shouldForce) {
						toast.info("Автообновление еще не требуется");
					}
					return;
				}

				await Promise.all([
					useUsersStore.getState().loadUsers(roomId || null),
					useStore.getState().loadEvents(roomId || null),
				]);

				if (!options?.silent) {
					toast.success("Отсутствия из ClickUp загружены", {
						description: `Событий: ${(data.events || []).length}`,
					});
				}
			} catch (error) {
				console.error(error);
				if (!options?.silent) {
					toast.error("Ошибка импорта ClickUp", {
						description:
							error instanceof Error
								? error.message
								: "Проверь CLICKUP_API_TOKEN",
					});
				}
			} finally {
				setIsImportingVacations(false);
			}
		},
		[roomId],
	);

	useEffect(() => {
		if (autoSyncKey <= 0) return;
		if (prevAutoSyncKeyRef.current === autoSyncKey) return;
		prevAutoSyncKeyRef.current = autoSyncKey;
		void syncVacations({ silent: true, force: false });
	}, [autoSyncKey, syncVacations]);

	return (
		<Button
			size="icon"
			className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
			onClick={() => void syncVacations({ force: true })}
			title="Обновить отсутствия из ClickUp"
			disabled={isImportingVacations}
		>
			<RefreshCw
				className={`h-4 w-4 sm:h-5 sm:w-5 ${
					isImportingVacations ? "animate-spin" : ""
				}`}
			/>
		</Button>
	);
}
