class Menu {
  changesNumber(options = {}) {
    return cy.get("[data-testid=changes-number]", options);
  }

  /**
   * @param {"Custom Types" | "Slices" | "Changes"} label - The menu item to click
   */
  navigateTo(label) {
    return cy.get("nav").contains(label).click();
  }
}

export const menu = new Menu();
