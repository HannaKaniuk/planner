export const MOCK_PROJECT_COUNT = 6;

export const MOCK_PROJECTS = Array.from(
	{ length: MOCK_PROJECT_COUNT },
	(_, index) => {
		const n = index + 1;
		return {
			value: `project-${n}`,
			label: `Project${n}`,
		};
	},
);
