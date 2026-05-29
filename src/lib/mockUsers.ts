export const MOCK_USER_COUNT = 6;

export const MOCK_USERS = Array.from({ length: MOCK_USER_COUNT }, (_, index) => {
	const n = index + 1;
	return {
		value: `user-${n}`,
		label: `User${n}`,
		sortOrder: n,
	};
});
