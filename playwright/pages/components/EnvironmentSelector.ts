import { expect, Locator, Page } from "@playwright/test";

export class EnvironmentSelector {
  readonly page: Page;
  readonly loginTextButton: Locator;
  readonly loginIconButton: Locator;
  readonly environmentName: Locator;
  readonly dropdownTrigger: Locator;
  readonly loadingIcon: Locator;

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
    this.loginIconButton = page.getByRole("button", {
      name: "Log in to enable environments",
      exact: true,
    });
    this.environmentName = page.getByTestId("active-environment-name");
    this.dropdownTrigger = page.getByRole("button", {
      name: "Select environment",
      exact: true,
    });
    this.loadingIcon = page.getByTestId("environment-dropdown-loading");
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
    await expect(
      this.environmentName.getByText(name, { exact: true }),
    ).toBeVisible();
  }

  /**
   * Assertions
   */
  // TODO(DT-1854): Type `kind` with `@slicemachine/manager`'s `Environment["kind"]`.
  async checkHasSelectedEnvironmentDotKind(kind: "prod" | "stage" | "dev") {
    const humanReadableKindMap = {
      prod: "Production",
      stage: "Staging",
      dev: "Development",
    } as const;

    await expect(this.page.getByTestId("active-environment-dot")).toBeVisible();
    await expect(this.page.getByTestId("active-environment-dot")).toHaveText(
      `${humanReadableKindMap[kind]} environment`,
    );
  }
}
