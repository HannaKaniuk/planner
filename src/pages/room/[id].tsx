import { useRouter } from "next/router";
import { useEffect } from "react";
import CalendarIndex from "@/Planner/calendar/Index";
import Layout from "@/Planner/layout";
import { useStore } from "@/store/store";

const RoomJoinPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const setRoomId = useStore((state) => state.setRoomId);

	useEffect(() => {
		if (!id || typeof id !== "string") return;
		setRoomId(id);
	}, [id, setRoomId]);

	if (!id || typeof id !== "string") {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-lg">Joining room...</p>
				</div>
			</div>
		);
	}

	return (
		<Layout>
			<div className="h-screen flex justify-start w-full">
				<CalendarIndex />
			</div>
		</Layout>
	);
};

export default RoomJoinPage;

