import { InitClient } from "../../packages/init/src/utils/client";
import { ApplicationMode } from "../../packages/client/src/models/ApplicationMode";
import { PrismicSharedConfigManager } from "../../packages/core/src/prismic/SharedConfig";
import { Frameworks } from "../../packages/core/src/models/Framework";

// File called from the cypress setup in cypress-setup.sh

const appMode =
  process.env.CYPRESS_URL === "wroom.io"
    ? ApplicationMode.STAGE
    : process.env.CYPRESS_URL === "wroom.dev"
    ? ApplicationMode.DEV
    : ApplicationMode.PROD;

const client = new InitClient(
  appMode,
  null,
  PrismicSharedConfigManager.getAuth()
);

const DOMAIN_NAME = "repository-cypress";

const deleteAndCreate = async () => {
  await client
    .deleteRepository(
      DOMAIN_NAME,
      process.env.PASSWORD || "",
      PrismicSharedConfigManager.get().cookies
    )
    .catch(() => {});

  await client.createRepository(DOMAIN_NAME, Frameworks.next);

  return;
};

deleteAndCreate();
