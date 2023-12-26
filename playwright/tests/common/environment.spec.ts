import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { environments } from "../../mocks";

test.describe("Environment", () => {
  test.run()(
    "I can click on the text to log in",
    async ({ sliceMachinePage }) => {
      await sliceMachinePage.gotoDefaultPage();
      await sliceMachinePage.menu.environmentSelector.loginTextButton.click();
      await expect(sliceMachinePage.loginDialog.submitButton).toBeVisible();
    },
  );

  test.run()(
    "I can click on the icon to log in",
    async ({ sliceMachinePage }) => {
      await sliceMachinePage.gotoDefaultPage();
      await sliceMachinePage.menu.environmentSelector.loginIconButton.click();
      await expect(sliceMachinePage.loginDialog.submitButton).toBeVisible();
    },
  );

  test.run()(
    'I can see "Production" environment when no environments exist',
    async ({ sliceMachinePage, procedures }) => {
      procedures.mock(
        "prismicRepository.fetchEnvironments",
        () => ({ environments: environments.slice(0, 1) }),
        { execute: false },
      );

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.menu.environmentSelector.environmentName,
      ).toHaveText("Production");
    },
  );

  test.run()(
    'I can see "Production" environment when an invalid environment is set',
    async ({ sliceMachinePage, procedures }) => {
      procedures.mock(
        "prismicRepository.fetchEnvironments",
        () => ({ environments }),
        { execute: false },
      );
      procedures.mock(
        "project.fetchActiveEnvironment",
        () => {
          const error = new Error();
          error.name = "SMInvalidActiveEnvironmentError";
          throw error;
        },
        { execute: false, times: 1 },
      );

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.menu.environmentSelector.environmentName,
      ).toHaveText("Production");
    },
  );

  test.run()(
    "I can see my current environment if I have one selected",
    async ({ sliceMachinePage, procedures }) => {
      procedures.mock(
        "prismicRepository.fetchEnvironments",
        () => ({ environments }),
        { execute: false },
      );
      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[1] }),
        { execute: false },
      );

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.menu.environmentSelector.environmentName,
      ).toHaveText(environments[1].name);
    },
  );

  test.run()(
    "I can change my current environment",
    async ({ sliceMachinePage, procedures }) => {
      procedures.mock(
        "prismicRepository.fetchEnvironments",
        () => ({ environments }),
        { execute: false },
      );
      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[0] }),
        { execute: false },
      );

      await sliceMachinePage.gotoDefaultPage();

      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[1] }),
        { execute: false },
      );
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
      );
    },
  );

  test.run()(
    "I don't see login text or the select if I'm not authorized",
    async ({ sliceMachinePage, procedures }) => {
      procedures.mock(
        "prismicRepository.fetchEnvironments",
        () => {
          const error = new Error();
          error.name = "SMUnauthorizedError";
          throw error;
        },
        { execute: false },
      );

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.menu.environmentSelector.loginTextButton,
      ).not.toBeVisible();
      await expect(
        sliceMachinePage.menu.environmentSelector.loginIconButton,
      ).not.toBeVisible();
      await expect(
        sliceMachinePage.menu.environmentSelector.dropdownTrigger,
      ).not.toBeVisible();
    },
  );

  test.run()(
    "I can see the dot on the logo depending on the environment",
    async ({ sliceMachinePage, procedures }) => {
      procedures.mock(
        "prismicRepository.fetchEnvironments",
        () => ({ environments }),
        { execute: false },
      );

      await sliceMachinePage.gotoDefaultPage();

      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[0] }),
        { execute: false },
      );
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
        environments[0].kind,
      );

      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[1] }),
        { execute: false },
      );
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
        environments[1].kind,
      );

      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[2] }),
        { execute: false },
      );
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[2].name,
      );
      await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
        environments[2].kind,
      );
    },
  );

  test.run()(
    "I can see the window top border depending on the environment",
    async ({ sliceMachinePage, procedures }) => {
      procedures.mock(
        "prismicRepository.fetchEnvironments",
        () => ({ environments }),
        { execute: false },
      );
      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[0] }),
        { execute: false },
      );

      await sliceMachinePage.gotoDefaultPage();

      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await expect(sliceMachinePage.appLayout).toHaveCSS(
        "border-top-color",
        "rgb(109, 84, 207)",
      );

      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[1] }),
        { execute: false },
      );
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await expect(sliceMachinePage.appLayout).toHaveCSS(
        "border-top-color",
        "rgb(56, 91, 204)",
      );

      procedures.mock(
        "project.fetchActiveEnvironment",
        () => ({ activeEnvironment: environments[2] }),
        { execute: false },
      );
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[2].name,
      );
      await expect(sliceMachinePage.appLayout).toHaveCSS(
        "border-top-color",
        "rgb(255, 159, 26)",
      );
    },
  );
});
