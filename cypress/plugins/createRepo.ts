import { InitClient } from "../../packages/init/src/utils/client";
import { ApplicationMode } from "../../packages/client/src/models/ApplicationMode";
import { PrismicSharedConfigManager } from "../../packages/core/src/prismic/SharedConfig";
import { Frameworks } from "../../packages/core/src/models/Framework";

// File called from the cypress setup in cypress-setup.sh
const [
  ,
  ,
  DOMAIN_NAME = "repository-cypress",
  PASSWORD = process.env.PASSWORD || "",
  PRISMIC_URL = process.env.PRISMIC_URL,
  MODE = process.env.MODE,
] = process.argv;

const appMode =
  MODE === "STAGE"
    ? ApplicationMode.STAGE
    : MODE === "PROD"
    ? ApplicationMode.PROD
    : ApplicationMode.DEV;

const client = new InitClient(
  appMode,
  null,
  PrismicSharedConfigManager.getAuth()
);

const deleteAndCreate = async () => {
  await client
    .deleteRepository(
      DOMAIN_NAME,
      PASSWORD,
      PrismicSharedConfigManager.get().cookies
    )
    .catch((e) => {});

  await client.createRepository(DOMAIN_NAME, Frameworks.next).catch((e) => {
    console.warn(
      `could not create repo: ${DOMAIN_NAME} in ${appMode}: ${e.status}: ${e.message}`
    );
    process.exit(1);
  });

  return;
};

deleteAndCreate();
