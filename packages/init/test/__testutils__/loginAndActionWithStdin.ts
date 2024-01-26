import { PrismicAuthLoginResponse } from "./createPrismicAuthLoginResponse";

export async function loginAndFetchUserDataWithStdin(
	prismicAuthLoginResponse: PrismicAuthLoginResponse,
	action: () => Promise<void>,
) {
	const stdin = mockStdin();

	// @ts-expect-error - Accessing protected method
	const promise = initProcess.loginAndFetchUserData();

	await new Promise((res) => setTimeout(res, 50));

	stdin.send("o").restore();

	await new Promise((res) => setTimeout(res, 50));

	const port: number =
		spiedManager.user.getLoginSessionInfo.mock.results[0].value.port;

	const body = JSON.stringify(prismicAuthLoginResponse);

	// We use low-level `http` because node-fetch has some issue with 127.0.0.1 on CIs
	const request = http.request({
		host: "127.0.0.1",
		port: `${port}`,
		path: "/",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(body),
		},
	});
	request.write(body);
	request.end();

	return promise;
}
