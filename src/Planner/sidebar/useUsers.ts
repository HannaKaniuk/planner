import { useUsersStore } from "@/store/usersStore";

export const useUsers = () => {
	const users = useUsersStore((state) => state.users);

	return {
		users,
	};
};
