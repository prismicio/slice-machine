import { TestContext } from "vitest";
import { rest } from "msw";

type MockAWSACLAPIConfig = {
	endpoint?: string;
	expectedAuthenticationToken: string;
	expectedPrismicRepository: string;
	createEndpoint?: {
		uploadEndpoint?: string;
		requiredFormDataFields?: Record<string, string>;
		imgixEndpoint?: string;
	};
};

type MockAWSACLAPIReturnType = {
	createEndpoint: {
		uploadEndpoint: string;
		requiredFormDataFields: Record<string, string>;
		imgixEndpoint: string;
	};
};

export const mockAWSACLAPI = (
	ctx: TestContext,
	config?: MockAWSACLAPIConfig,
): MockAWSACLAPIReturnType => {
	const endpoint =
		config?.endpoint ??
		"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/";

	const createEndpointConfig = {
		uploadEndpoint: "https://s3.example.com/foo/",
		requiredFormDataFields: {
			foo: "bar",
			baz: "qux",
		},
		imgixEndpoint: "https://imgix.example.com/foo/",
		...config?.createEndpoint,
	};

	ctx.msw.use(
		rest.get(new URL("./create", endpoint).toString(), (req, res, ctx) => {
			if (
				req.headers.get("Authorization") ===
					`Bearer ${config?.expectedAuthenticationToken}` &&
				req.headers.get("User-Agent") === "slice-machine" &&
				req.headers.get("Repository") === config?.expectedPrismicRepository
			) {
				return res(
					ctx.json({
						values: {
							url: createEndpointConfig.uploadEndpoint,
							fields: createEndpointConfig.requiredFormDataFields,
						},
						imgixEndpoint: createEndpointConfig.imgixEndpoint,
					}),
				);
			} else {
				return res(
					ctx.json({
						message: "[MOCK ERROR MESSAGE]: Failed to generate ACL",
					}),
				);
			}
		}),
	);

	return {
		createEndpoint: {
			uploadEndpoint: createEndpointConfig.uploadEndpoint,
			requiredFormDataFields: createEndpointConfig.requiredFormDataFields,
			imgixEndpoint: createEndpointConfig.imgixEndpoint,
		},
	};
};
