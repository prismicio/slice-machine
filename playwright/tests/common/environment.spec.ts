import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils";
import { environments } from "../../mocks";

test.describe("Environment", () => {
  test.run()(
    "I can click on the text to log in",
    async ({ sliceMachinePage }) => {
      await sliceMachinePage.gotoDefaultPage();
      await sliceMachinePage.environmentSelector.loginTextButton.click();
      await expect(sliceMachinePage.loginDialog.submitButton).toBeVisible();
    },
  );

  test.run()(
    "I can click on the icon to log in",
    async ({ sliceMachinePage }) => {
      await sliceMachinePage.gotoDefaultPage();
      await sliceMachinePage.environmentSelector.loginIconButton.click();
      await expect(sliceMachinePage.loginDialog.submitButton).toBeVisible();
    },
  );

  test.run()(
    'I can see "Production" environment when no environments exist',
    async ({ sliceMachinePage }) => {
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({
              environments: environments.slice(0, 1),
            }),
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.environmentSelector.environmentName,
      ).toHaveText("Production");
    },
  );

  test.run()(
    "I can see my current environment if I have one selected",
    async ({ sliceMachinePage }) => {
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({ environments }),
            execute: false,
          },
          {
            path: "project.readEnvironment",
            data: () => ({ environment: environments[1].domain }),
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.environmentSelector.environmentName,
      ).toHaveText(environments[1].name);
    },
  );

  test.run()(
    "I can change my current environment",
    async ({ sliceMachinePage }) => {
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({ environments }),
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await sliceMachinePage.environmentSelector.selectEnvironment(
        environments[0].name,
      );
    },
  );

  test.run()(
    "I don't see login text or the select if I'm not authorized",
    async ({ sliceMachinePage }) => {
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({
              error: { name: "UnauthorizedError" },
            }),
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.environmentSelector.loginTextButton,
      ).not.toBeVisible();
      await expect(
        sliceMachinePage.environmentSelector.loginIconButton,
      ).not.toBeVisible();
      await expect(
        sliceMachinePage.environmentSelector.dropdownTrigger,
      ).not.toBeVisible();
    },
  );

  test.run()(
    "I can see the dot on the logo depending on the environment",
    async ({ sliceMachinePage }) => {
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({ environments }),
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();

      await sliceMachinePage.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await sliceMachinePage.environmentSelector.checkSelectedEnvironmentKind(
        environments[0].kind,
      );

      await sliceMachinePage.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await sliceMachinePage.environmentSelector.checkSelectedEnvironmentKind(
        environments[1].kind,
      );

      await sliceMachinePage.environmentSelector.selectEnvironment(
        environments[2].name,
      );
      await sliceMachinePage.environmentSelector.checkSelectedEnvironmentKind(
        environments[2].kind,
      );
    },
  );

  test.run()(
    "I can see the window top border depending on the environment",
    async ({ sliceMachinePage }) => {
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({ environments }),
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();

      await sliceMachinePage.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(109, 84, 207)",
      );

      await sliceMachinePage.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(56, 91, 204)",
      );

      await sliceMachinePage.environmentSelector.selectEnvironment(
        environments[2].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(255, 159, 26)",
      );
    },
  );
});
