import { createSliceMachineManager } from "../../packages/manager";

const getApplicationMode = (apiEndpoint: string): string => {
  if (apiEndpoint.includes("prismic.io")) return "production";
  else if (apiEndpoint.includes("wroom.io")) return "staging";
  else if (apiEndpoint.includes("wroom.test")) return "development";
  else if (apiEndpoint.includes("wroom-qa.com")) return "development";
  else throw new Error(`Unknown application mode for ${apiEndpoint}`);
};

// File called from the cypress setup in cypress-setup.sh
const [, , DOMAIN_NAME, PASSWORD, PRISMIC_URL] = process.argv;

const applicationMode = getApplicationMode(PRISMIC_URL);

// Set the global Slice Machine environment.
process.env.SM_ENV = applicationMode;

const manager = createSliceMachineManager();

const deleteAndCreate = async () => {
  try {
    await manager.prismicRepository.delete({
      domain: DOMAIN_NAME,
      password: PASSWORD,
    });
  } catch {
    // noop
  }

  await manager.prismicRepository.create({
    domain: DOMAIN_NAME,
    framework: "next",
  });
};

deleteAndCreate();
