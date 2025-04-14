import { auth } from "../playwright.config";
import { expect, test as setup } from "../fixtures";

setup("authenticate admin", async ({ page: smPage }) => {
  await smPage.goto("/");
  await smPage.getByRole("button", { name: "Login required" }).click();

  const loginPagePromise = smPage.waitForEvent("popup");
  await smPage.getByRole("button", { name: "Log in to Prismic" }).click();
  const loginPage = await loginPagePromise;

  await loginPage.getByRole("button", { name: "LOG IN WITH MY EMAIL" }).click();

  await loginPage.getByRole("textbox", { name: "email" }).fill(auth.username);
  await loginPage
    .getByRole("textbox", { name: "password" })
    .fill(auth.password);
  await loginPage.getByRole("button", { name: "LOG IN" }).click();

  await expect(
    loginPage.getByRole("heading", { name: "Logged in" }),
  ).toBeVisible();

  await expect(
    smPage.getByRole("alert").filter({ hasText: "Logged in" }),
  ).toBeVisible();

  await loginPage.context().storageState({ path: auth.storageState });
});
