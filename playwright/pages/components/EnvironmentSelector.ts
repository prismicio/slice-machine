import { expect, Locator, Page } from "@playwright/test";

export class EnvironmentSelector {
  readonly page: Page;
  readonly loginTextButton: Locator;
  readonly loginIconButton: Locator;
  readonly environmentName: Locator;
  readonly dropdownTrigger: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.loginTextButton = page.getByRole("button", {
      name: "Login required",
      exact: true,
    });
    // TODO: Replace with `getByRole` once `<IconButton>` supports labels.
    this.loginIconButton = page.getByTestId("environment-login-icon-button");
    this.environmentName = page.getByTestId("active-environment-name");
    // TODO: Replace with `getByRole` once `<IconButton>` supports labels.
    this.dropdownTrigger = page.getByTestId("environment-dropdown-button");
  }

  /**
   * Dynamic locators
   */
  getEnvironmentMenuItem(name: string): Locator {
    return this.page.getByRole("menuitem", { name, exact: true });
  }

  /**
   * Actions
   */
  async selectEnvironment(name: string) {
    await this.dropdownTrigger.click();
    await this.getEnvironmentMenuItem(name).click();
    await expect(this.environmentName).toHaveText(name);
  }

  /**
   * Assertions
   */
  // TODO: Type `kind` with `@slicemachine/manager`'s `Environment["kind"]`.
  async checkSelectedEnvironmentKind(kind: "prod" | "stage" | "dev") {
    const humanReadableKindMap = {
      prod: "Production",
      stage: "Staging",
      dev: "Development",
    } as const;

    await expect(this.page.getByRole("status")).toHaveText(
      `${humanReadableKindMap[kind]} environment`,
    );
  }
}
