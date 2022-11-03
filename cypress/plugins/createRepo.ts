import { InitClient } from "../../packages/init/src/utils/client";
import { ApplicationMode } from "../../packages/client/src/models/ApplicationMode";
import { PrismicSharedConfigManager } from "../../packages/core/src/prismic/SharedConfig";
import { Frameworks } from "../../packages/core/src/models/Framework";
import getApplicationMode from "../../packages/slice-machine/lib/env/getApplicationMode";

// File called from the cypress setup in cypress-setup.sh
const [, , DOMAIN_NAME, PASSWORD, PRISMIC_URL] = process.argv;

const applicationMode: ApplicationMode = getApplicationMode(PRISMIC_URL);

const client = new InitClient(
  applicationMode,
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
      `could not create repo: ${DOMAIN_NAME} in ${applicationMode}: ${e.status}: ${e.message}`
    );
    process.exit(1);
  });

  return;
};

deleteAndCreate();
