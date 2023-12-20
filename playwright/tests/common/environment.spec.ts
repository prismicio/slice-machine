import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils";
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
        sliceMachinePage.menu.environmentSelector.environmentName,
      ).toHaveText("Production");
    },
  );

  test.run()(
    'I can see "Production" environment when an invalid environment is set',
    async ({ sliceMachinePage }) => {
      let didMockFetchActiveEnvironmentOnce = false;
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({
              environments,
            }),
            execute: false,
          },
          {
            path: "prismicRepository.fetchActiveEnvironment",
            data: (data) => {
              if (didMockFetchActiveEnvironmentOnce) {
                return data;
              }

              didMockFetchActiveEnvironmentOnce = true;

              const error = new Error();
              error.name = "SMInvalidActiveEnvironmentError";

              throw error;
            },
            execute: didMockFetchActiveEnvironmentOnce,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.menu.environmentSelector.environmentName,
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
            path: "project.fetchActiveEnvironment",
            data: () => ({ activeEnvironment: environments[1] }),
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await expect(
        sliceMachinePage.menu.environmentSelector.environmentName,
      ).toHaveText(environments[1].name);
    },
  );

  test.run()(
    "I can change my current environment",
    async ({ sliceMachinePage }) => {
      let activeEnvironmentDomain: string | undefined = undefined;
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({ environments }),
            execute: false,
          },
          {
            path: "project.updateEnvironment",
            data: (_data, args) => {
              activeEnvironmentDomain = (
                args[0] as { environment: string | undefined }
              ).environment;
            },
          },
          {
            path: "project.fetchActiveEnvironment",
            data: () => {
              return {
                activeEnvironment: environments.find((environment) =>
                  activeEnvironmentDomain === undefined
                    ? environment.kind === "prod"
                    : environment.domain === activeEnvironmentDomain,
                ),
              };
            },
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
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
            data: () => {
              const error = new Error();
              error.name = "SMUnauthorizedError";
              throw error;
            },
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();
      await expect(sliceMachinePage.menu.menu).toBeVisible();
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
    async ({ sliceMachinePage }) => {
      let activeEnvironmentDomain: string | undefined = undefined;
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({ environments }),
            execute: false,
          },
          {
            path: "project.updateEnvironment",
            data: (_data, args) => {
              activeEnvironmentDomain = (
                args[0] as { environment: string | undefined }
              ).environment;
            },
          },
          {
            path: "project.fetchActiveEnvironment",
            data: () => {
              return {
                activeEnvironment: environments.find((environment) =>
                  activeEnvironmentDomain === undefined
                    ? environment.kind === "prod"
                    : environment.domain === activeEnvironmentDomain,
                ),
              };
            },
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();

      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
        environments[0].kind,
      );

      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
        environments[1].kind,
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
    async ({ sliceMachinePage }) => {
      let activeEnvironmentDomain: string | undefined = undefined;
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "prismicRepository.fetchEnvironments",
            data: () => ({ environments }),
            execute: false,
          },
          {
            path: "project.updateEnvironment",
            data: (_data, args) => {
              activeEnvironmentDomain = (
                args[0] as { environment: string | undefined }
              ).environment;
            },
          },
          {
            path: "project.fetchActiveEnvironment",
            data: () => {
              return {
                activeEnvironment: environments.find((environment) =>
                  activeEnvironmentDomain === undefined
                    ? environment.kind === "prod"
                    : environment.domain === activeEnvironmentDomain,
                ),
              };
            },
            execute: false,
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();

      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(109, 84, 207)",
      );

      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(56, 91, 204)",
      );

      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[2].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(255, 159, 26)",
      );
    },
  );
});
