import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils";
import { environments } from "../../mocks";

function buildMockEnvironmentProcedures(args: {
  environments?: readonly (typeof environments)[number][];
  activeEnvironment?: (typeof environments)[number];
}) {
  const procedures = [];

  if (args.environments) {
    procedures.push({
      path: "prismicRepository.fetchEnvironments",
      data: () => ({ environments: args.environments }),
      execute: false,
    });
  }

  if (args.activeEnvironment) {
    procedures.push({
      path: "project.fetchActiveEnvironment",
      data: () => ({ activeEnvironment: args.activeEnvironment }),
      execute: false,
    });
  }

  return procedures;
}

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
        procedures: buildMockEnvironmentProcedures({
          environments: environments.slice(0, 1),
        }),
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
          ...buildMockEnvironmentProcedures({ environments }),
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
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[1],
        }),
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
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[0],
        }),
      });

      await sliceMachinePage.gotoDefaultPage();

      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[1],
        }),
      });
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
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({ environments }),
      });

      await sliceMachinePage.gotoDefaultPage();

      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[0],
        }),
      });
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
        environments[0].kind,
      );

      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[1],
        }),
      });
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
        environments[1].kind,
      );

      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[2],
        }),
      });
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
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({ environments }),
      });

      await sliceMachinePage.gotoDefaultPage();

      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[0],
        }),
      });
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[0].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(109, 84, 207)",
      );

      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[1],
        }),
      });
      await sliceMachinePage.menu.environmentSelector.selectEnvironment(
        environments[1].name,
      );
      await expect(sliceMachinePage.topBorder).toHaveCSS(
        "background-color",
        "rgb(56, 91, 204)",
      );

      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: buildMockEnvironmentProcedures({
          environments,
          activeEnvironment: environments[2],
        }),
      });
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
