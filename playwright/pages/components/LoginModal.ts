import { Page } from "@playwright/test";

import { Modal } from "./Modal";

export class LoginModal extends Modal {
  constructor(page: Page) {
    super(page, "You're not connected", "Log in to Prismic");

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    // Handle static locators here
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async login() {
    await this.title.isVisible();
    await this.submitButton.click();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
