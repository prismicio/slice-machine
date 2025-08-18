import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { environments } from "../../mocks";

test("I can click on the text to log in", async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => {
      const error = new Error();
      error.name = "SMUnauthenticatedError";
      throw error;
    },
    { execute: false },
  );

  await sliceMachinePage.gotoDefaultPage();
  await sliceMachinePage.menu.environmentSelector.loginTextButton.click();
  await expect(sliceMachinePage.loginDialog.submitButton).toBeVisible();
});

test("I can click on the icon to log in", async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => {
      const error = new Error();
      error.name = "SMUnauthenticatedError";
      throw error;
    },
    { execute: false },
  );

  await sliceMachinePage.gotoDefaultPage();
  await sliceMachinePage.menu.environmentSelector.loginIconButton.click();
  await expect(sliceMachinePage.loginDialog.submitButton).toBeVisible();
});

test('I can see "Production" environment when no environments exist', async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[0] }),
    { execute: false },
  );
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments: [] }),
    { execute: false },
  );

  await sliceMachinePage.gotoDefaultPage();
  await expect(
    sliceMachinePage.menu.environmentSelector.environmentName,
  ).toHaveText("Production");
});

test("I can see my current environment if I have one selected", async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments }),
    { execute: false },
  );
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[1] }),
    { execute: false },
  );

  await sliceMachinePage.gotoDefaultPage();
  await expect(
    sliceMachinePage.menu.environmentSelector.environmentName,
  ).toHaveText(environments[1].name);
});

test("I can change my current environment", async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments }),
    { execute: false },
  );
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[0] }),
    { execute: false },
  );

  await sliceMachinePage.gotoDefaultPage();

  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[1] }),
    { execute: false },
  );
  await sliceMachinePage.menu.environmentSelector.selectEnvironment(
    environments[1].name,
  );
});

test("I can see the dot on the logo depending on the environment", async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments }),
    { execute: false },
  );
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[0] }),
    { execute: false },
  );

  await sliceMachinePage.gotoDefaultPage();

  await sliceMachinePage.menu.environmentSelector.selectEnvironment(
    environments[0].name,
  );
  await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
    environments[0].kind,
  );

  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[1] }),
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
    () => ({ type: "ok", activeEnvironment: environments[2] }),
    { execute: false },
  );
  await sliceMachinePage.menu.environmentSelector.selectEnvironment(
    environments[2].name,
  );
  await sliceMachinePage.menu.environmentSelector.checkHasSelectedEnvironmentDotKind(
    environments[2].kind,
  );
});

test("I can see the window top border depending on the environment", async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments }),
    { execute: false },
  );
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[0] }),
    { execute: false },
  );

  await sliceMachinePage.gotoDefaultPage();

  await sliceMachinePage.menu.environmentSelector.selectEnvironment(
    environments[0].name,
  );
  await expect(
    sliceMachinePage.getPageLayoutByTopBorderColor("purple"),
  ).toBeVisible();

  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[1] }),
    { execute: false },
  );
  await sliceMachinePage.menu.environmentSelector.selectEnvironment(
    environments[1].name,
  );
  await expect(
    sliceMachinePage.getPageLayoutByTopBorderColor("indigo"),
  ).toBeVisible();

  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({ type: "ok", activeEnvironment: environments[2] }),
    { execute: false },
  );
  await sliceMachinePage.menu.environmentSelector.selectEnvironment(
    environments[2].name,
  );
  await expect(
    sliceMachinePage.getPageLayoutByTopBorderColor("amber"),
  ).toBeVisible();
});
