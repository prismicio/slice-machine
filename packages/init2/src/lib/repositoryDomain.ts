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

export const formatRepositoryDomain = (rawDomain: string): string => {
	// Lowercase anything
	let domain = rawDomain.toLowerCase();

	/** Replace whitespaces and underscores with hyphens */
	domain = domain.replaceAll(" ", "-").replaceAll("_", "-");

	/**
	 * Replace not allowed characters
	 *
	 * @see https://regex101.com/r/f2Hr0k/1
	 */
	domain = domain.replace(/[^a-z0-9-]/g, "");

	/**
	 * Trim leading and trailing hyphens
	 *
	 * @see https://regex101.com/r/ivngfc/1
	 */
	domain = domain.replace(/(^-+)|(-+$)/g, "");

	/**
	 * Replace multi hyphens
	 *
	 * @see https://regex101.com/r/t9qxh0/1
	 */
	domain.replace(/-{2,}/g, "-");

	return domain;
};

const isFormattedRepositoryDomain = (
	maybeFormattedRepositoryDomain: string
): boolean => {
	return (
		maybeFormattedRepositoryDomain ===
		formatRepositoryDomain(maybeFormattedRepositoryDomain)
	);
};

const assertFormattedRepositoryDomain = (
	maybeFormattedRepositoryDomain: string,
	caller: string
): void => {
	if (!isFormattedRepositoryDomain(maybeFormattedRepositoryDomain)) {
		throw new TypeError(
			`\`${caller}()\` can only validate formatted repository domains, use the \`formatRepositoryDomain()\` first.`
		);
	}
};

export const ValidationErrors = {
	LessThan4: "LessThan4",
	MoreThan30: "MoreThan30",
	AlreadyExists: "AlreadyExists",
} as const;
type ValidationErrors = typeof ValidationErrors[keyof typeof ValidationErrors];

type ValidateRepositoryDomainArgs = { domain: string };
type ValidateRepositoryDomainReturnType = Record<
	Exclude<ValidationErrors, "AlreadyExists"> | "hasErrors",
	boolean
>;
export const validateRepositoryDomain = (
	args: ValidateRepositoryDomainArgs
): ValidateRepositoryDomainReturnType => {
	assertFormattedRepositoryDomain(args.domain, "validateRepositoryDomain");

	const errors: Record<Exclude<ValidationErrors, "AlreadyExists">, boolean> = {
		/**
		 * Checks non [a-z] first character
		 *
		 * @see https://regex101.com/r/OBZ6UH/1
		 */
		[ValidationErrors.LessThan4]: args.domain.length < 4,
		[ValidationErrors.MoreThan30]: args.domain.length > 30,
	};

	return {
		...errors,
		hasErrors: Object.values(errors).some(Boolean),
	};
};

type ValidateRepositoryDomainAndAvailabilityArgs = {
	domain: string;
	existsFn: (domain: string) => boolean | Promise<boolean>;
};
type ValidateRepositoryDomainAndAvailabilityReturnType = Record<
	ValidationErrors | "hasErrors",
	boolean
>;
export const validateRepositoryDomainAndAvailability = async (
	args: ValidateRepositoryDomainAndAvailabilityArgs
): Promise<ValidateRepositoryDomainAndAvailabilityReturnType> => {
	assertFormattedRepositoryDomain(
		args.domain,
		"validateRepositoryDomainAndAvailability"
	);

	const errors = validateRepositoryDomain(args);

	if (!errors.hasErrors && (await args.existsFn(args.domain))) {
		return {
			...errors,
			[ValidationErrors.AlreadyExists]: true,
			hasErrors: true,
		};
	}

	return {
		...errors,
		[ValidationErrors.AlreadyExists]: false,
	};
};

type GetErrorMessageForRepositoryDomainValidationArgs = {
	validation:
		| ValidateRepositoryDomainReturnType
		| ValidateRepositoryDomainAndAvailabilityReturnType;
	displayDomain?: string;
};
export const getErrorMessageForRepositoryDomainValidation = (
	args: GetErrorMessageForRepositoryDomainValidationArgs
): string | null => {
	if (args.validation.hasErrors) {
		const formattedErrors: string[] = [];

		if (args.validation.LessThan4) {
			formattedErrors.push("must be 4 characters long or more");
		}
		if (args.validation.MoreThan30) {
			formattedErrors.push("must be 30 characters long or less");
		}
		if (
			ValidationErrors.AlreadyExists in args.validation &&
			args.validation.AlreadyExists
		) {
			formattedErrors.push("is already taken");
		}

		if (!formattedErrors.length) {
			formattedErrors.push(
				`has unhandled errors ${JSON.stringify(args.validation)}`
			);
		}

		return `Repository name${
			args.displayDomain ? ` ${args.displayDomain}` : ""
		} ${formattedErrors.join(" and ")}`;
	}

	return null;
};
