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
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
