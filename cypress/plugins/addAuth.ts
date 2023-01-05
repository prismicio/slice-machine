import { createSliceMachineManager } from "../../packages/manager";

const getApplicationMode = (apiEndpoint: string): string => {
  if (apiEndpoint.includes("prismic.io")) return "production";
  else if (apiEndpoint.includes("wroom.io")) return "staging";
  else if (apiEndpoint.includes("wroom.test")) return "development";
  else if (apiEndpoint.includes("wroom-qa.com")) return "development";
  else throw new Error(`Unknown application mode for ${apiEndpoint}`);
};

// File called from the cypress setup in cypress-setup.sh
const [, , EMAIL, PASSWORD, PRISMIC_URL] = process.argv;

const applicationMode = getApplicationMode(PRISMIC_URL);

// Set the global Slice Machine environment.
process.env.SM_ENV = applicationMode;

const main = async () => {
  const manager = createSliceMachineManager();

  const signInResponse = await fetch(
    new URL("./authentication/signin", PRISMIC_URL),
    {
      method: "post",
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    }
  );

  await manager.user.login({
    email: EMAIL,
    cookies: (signInResponse.headers.get("Set-Cookie") || "").split("; "),
  });
};

main();
