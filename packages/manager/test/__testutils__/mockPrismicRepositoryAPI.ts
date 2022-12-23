import { TestContext } from "vitest";
import { rest } from "msw";

type MockPrismicAuthAPIConfig = {
	endpoint?: string;
	existsEndpoint?: {
		isSuccessful?: boolean;
		expectedAuthenticationToken: string;
		expectedCookies: string[];
		domain: string;
		exists: boolean;
	};
	newEndpoint?: {
		isSuccessful?: boolean;
		expectedAuthenticationToken: string;
		expectedCookies: string[];
		domain: string;
		framework?: string;
	};
	deleteEndpoint?: {
		isSuccessful?: boolean;
		expectedAuthenticationToken: string;
		expectedCookies: string[];
		domain: string;
		password: string;
	};
	starterDocumentsEndpoint?: {
		isSuccessful?: boolean;
		failureReason?: string;
		expectedAuthenticationToken: string;
		expectedCookies: string[];
		domain: string;
		signature: string;
		documents: Record<string, unknown>;
	};
};

export const mockPrismicRepositoryAPI = (
	ctx: TestContext,
	config: MockPrismicAuthAPIConfig,
): void => {
	const endpoint = config.endpoint ?? "https://prismic.io/";

	if (config.existsEndpoint) {
		ctx.msw.use(
			rest.get(
				new URL(
					`./app/dashboard/repositories/${config.existsEndpoint.domain}/exists`,
					endpoint,
				).toString(),
				(req, res, ctx) => {
					if (
						(config.existsEndpoint?.isSuccessful ?? true) &&
						req.headers.get("Authorization") ===
							`Bearer ${config.existsEndpoint?.expectedAuthenticationToken}` &&
						req.headers.get("Cookie") ===
							config.existsEndpoint?.expectedCookies.join("; ") &&
						req.headers.get("User-Agent") === "slice-machine"
					) {
						// The real API returns "false" if the
						// repository exists (i.e. it is the
						// opposite of what you might expect).

						if (config.existsEndpoint?.exists) {
							return res(ctx.text("false"));
						} else {
							return res(ctx.text("true"));
						}
					} else {
						return res(ctx.status(500));
					}
				},
			),
		);
	}

	if (config.newEndpoint) {
		ctx.msw.use(
			rest.post(
				new URL("./authentication/newrepository", endpoint).toString(),
				async (req, res, ctx) => {
					if (req.url.searchParams.get("app") !== "slicemachine") {
						return res(ctx.text(""), ctx.status(500));
					}

					if (config.newEndpoint?.isSuccessful ?? true) {
						const body = await req.json();

						const isExpectedBody =
							body.plan === "personal" &&
							body.isAnnual === "false" &&
							body.role === "developer" &&
							body.domain === config.newEndpoint?.domain &&
							(config.newEndpoint?.framework
								? body.framework === config.newEndpoint?.framework
								: true);

						if (
							isExpectedBody &&
							req.headers.get("Authorization") ===
								`Bearer ${config.newEndpoint?.expectedAuthenticationToken}` &&
							req.headers.get("Cookie") ===
								config.newEndpoint?.expectedCookies.join("; ") &&
							req.headers.get("User-Agent") === "prismic-cli/sm"
						) {
							return res(
								ctx.text(config.newEndpoint?.domain || ""),
								ctx.status(200),
							);
						} else {
							return res(ctx.text(""), ctx.status(500));
						}
					} else {
						return res(ctx.text(""), ctx.status(500));
					}
				},
			),
		);
	}

	if (config.deleteEndpoint) {
		const endpointWithDomain = new URL(endpoint);
		endpointWithDomain.hostname = `${config.deleteEndpoint.domain}.${endpointWithDomain.hostname}`;

		ctx.msw.use(
			rest.post(
				new URL("./app/settings/delete", endpointWithDomain).toString(),
				async (req, res, ctx) => {
					if (
						req.url.searchParams.get("_") !==
						config.deleteEndpoint?.expectedCookies.find(
							(cookie) => cookie.split("=")[0] === "X_XSRF",
						)?.[1]
					) {
						return res(ctx.status(500));
					}

					if (config.deleteEndpoint?.isSuccessful ?? true) {
						const body = await req.json();

						const isExpectedBody =
							body.confirm === config.deleteEndpoint?.domain &&
							body.password === config.deleteEndpoint?.password;

						if (
							isExpectedBody &&
							req.headers.get("Authorization") ===
								`Bearer ${config.deleteEndpoint?.expectedAuthenticationToken}` &&
							req.headers.get("Cookie") ===
								config.deleteEndpoint?.expectedCookies.join("; ") &&
							req.headers.get("User-Agent") === "prismic-cli/0"
						) {
							return res();
						} else {
							return res(ctx.status(500));
						}
					} else {
						return res(ctx.status(500));
					}
				},
			),
		);
	}

	if (config.starterDocumentsEndpoint) {
		const endpointWithDomain = new URL(endpoint);
		endpointWithDomain.hostname = `${config.starterDocumentsEndpoint.domain}.${endpointWithDomain.hostname}`;

		ctx.msw.use(
			rest.post(
				new URL("./starter/documents", endpointWithDomain).toString(),
				async (req, res, ctx) => {
					if (config.starterDocumentsEndpoint?.isSuccessful ?? true) {
						const body = await req.json();

						const isExpectedBody =
							body.signature === config.starterDocumentsEndpoint?.signature &&
							body.documents ===
								JSON.stringify(config.starterDocumentsEndpoint?.documents);

						if (
							isExpectedBody &&
							req.headers.get("Authorization") ===
								`Bearer ${config.starterDocumentsEndpoint?.expectedAuthenticationToken}` &&
							req.headers.get("Cookie") ===
								config.starterDocumentsEndpoint?.expectedCookies.join("; ") &&
							req.headers.get("User-Agent") === "prismic-cli/0"
						) {
							return res();
						} else {
							return res(ctx.status(500));
						}
					} else {
						return res(
							ctx.text(config.starterDocumentsEndpoint?.failureReason || ""),
							ctx.status(500),
						);
					}
				},
			),
		);
	}
};
