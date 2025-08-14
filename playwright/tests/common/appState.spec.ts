import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import {
  UnauthorizedError,
  InvalidActiveEnvironmentError,
} from "@slicemachine/manager/client";

test("Should not render the remaining app tree when the state is not correct", async ({
  procedures,
  page,
}) => {
  let fetchActiveEnvironmentCalled = false;
  // See _app.tsx AppStateValidator
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => {
      fetchActiveEnvironmentCalled = true;
      const error = new Error();
      error.name = new UnauthorizedError().name;
      throw error;
    },
    { execute: false },
  );

  // When the page is loaded already with an unauthorized state (e.g. reload),
  // what's below AppStateValidator (e.g. initial getState call) should not be
  // executed/rendered.
  let getStateCalled = false;
  procedures.mock("getState", ({ data }) => {
    getStateCalled = true;
    return data;
  });

  await page.goto("/");
  expect(fetchActiveEnvironmentCalled).toBe(true);
  expect(getStateCalled).toBe(false);
});

test("I see an error page if I'm not authorized", async ({
  procedures,
  page,
}) => {
  let fetchActiveEnvironmentCalled = false;
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => {
      fetchActiveEnvironmentCalled = true;
      const error = new Error();
      error.name = new UnauthorizedError().name;
      throw error;
    },
    { execute: false },
  );

  await page.goto("/");
  await expect(page.getByText("Failed to load Slice Machine")).toBeVisible();
  await expect(
    page.getByText("You don't have access to this repository."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();

  expect(fetchActiveEnvironmentCalled).toBe(true);
});

test("I see an error page if my active environment is invalid", async ({
  procedures,
  page,
}) => {
  let fetchActiveEnvironmentCalled = false;
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => {
      fetchActiveEnvironmentCalled = true;
      const error = new Error();
      error.name = new InvalidActiveEnvironmentError().name;
      throw error;
    },
    { execute: false },
  );

  await page.goto("/");
  await expect(page.getByText("Failed to load Slice Machine")).toBeVisible();
  await expect(
    page.getByText("Your current environment is invalid."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();

  expect(fetchActiveEnvironmentCalled).toBe(true);
});
