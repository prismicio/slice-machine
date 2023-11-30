import { Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class LoginDialog extends Dialog {
  constructor(page: Page) {
    super(page, {
      title: "You're not connected",
      submitName: "Log in to Prismic",
    });

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
