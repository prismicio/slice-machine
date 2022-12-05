const abc123 = `abcdefghijklmnopqrstuvwxyz0123456789`;

// 11 characters long or less adjectives
const ADJECTIVES = [
	"adorable",
	"beautiful",
	"charming",
	"cloudy",
	"delightful",
	"focused",
	"honest",
	"inspiring",
	"lovable",
	"melodious",
	"pleasant",
	"pretty",
	"shiny",
	"sugary",
	"tall",
	"valliant",
].filter((adjective) => adjective.length <= 11);

// 11 characters long or less bakeries
const BAKERIES = [
	"baguette",
	"briouat",
	"crepe",
	"croissant",
	"donut",
	"eclair",
	"flaons",
	"kolompeh",
	"macaron",
	"paste",
	"pretzel",
	"rustico",
	"semla",
	"strudel",
	"taiyaki",
	"toast",
].filter((bakery) => bakery.length <= 11);

const pickRandom = (arrOrString: string | string[]): string => {
	return arrOrString[Math.floor(Math.random() * arrOrString.length)];
};

const randomString = (length: number): string => {
	let result = "";

	for (let i = 0; i < length; i++) {
		result += pickRandom(abc123);
	}

	return result;
};

export const getRandomRepositoryDomain = (): string => {
	return formatRepositoryDomain(
		`${pickRandom(ADJECTIVES)}-${pickRandom(BAKERIES)}-${randomString(6)}`
	);
};

export const formatRepositoryDomain = (raw: string): string => {
	// Lowercase anything
	let result = raw.toLowerCase();

	/** Replace whitespaces and underscores with hyphens */
	result = result.replaceAll(" ", "-").replaceAll("_", "-");

	/**
	 * Replace not allowed characters
	 *
	 * @see https://regex101.com/r/HbxgfM/1
	 */
	result = result.replace(/[^a-z1-9-]/g, "");

	/**
	 * Trim leading and trailing hyphens
	 *
	 * @see https://regex101.com/r/ivngfc/1
	 */
	result = result.replace(/(^-+)|(-+$)/g, "");

	/**
	 * Replace multi hyphens
	 *
	 * @see https://regex101.com/r/t9qxh0/1
	 */
	result.replace(/-{2,}/g, "-");

	return result;
};

export const ValidationErrors = {
	NonLetterStart: "NonLetterStart",
	LessThan4: "LessThan4",
	MoreThan30: "MoreThan30",
} as const;
type ValidationErrors = typeof ValidationErrors[keyof typeof ValidationErrors];

export const validateRepositoryDomain = (
	raw: string
): Record<ValidationErrors | "hasErrors", boolean> => {
	const formatted = formatRepositoryDomain(raw);

	const errors: Record<ValidationErrors, boolean> = {
		/**
		 * Checks non [a-z] first character
		 *
		 * @see https://regex101.com/r/OBZ6UH/1
		 */
		[ValidationErrors.NonLetterStart]: !/^[a-z]/.test(formatted),
		[ValidationErrors.LessThan4]: formatted.length < 4,
		[ValidationErrors.MoreThan30]: formatted.length > 30,
	};

	return {
		...errors,
		hasErrors: Object.values(errors).some(Boolean),
	};
};
